/**
 * 카카오 API를 사용하여 CSV 파일의 주소에서 위경도를 추출하는 스크립트
 *
 * 사용법:
 * node scripts/extractCoordinates.js <input.csv> <output.csv>
 *
 * 예시:
 * node scripts/extractCoordinates.js ../context/전국건강증진센터표준데이터.csv output_with_coords.csv
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 카카오 API 설정
const KAKAO_API_KEY = '5171d4402446ac3ce053e047c8b5c0f7';
const KAKAO_API_URL = 'https://dapi.kakao.com/v2/local/search/address.json';

// 딜레이 함수 (API Rate Limit 방지)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 카카오 API를 사용하여 주소로부터 위경도 조회
 * @param {string} address - 검색할 주소
 * @returns {Promise<{lat: number, lng: number, success: boolean, error?: string}>}
 */
async function getCoordinates(address) {
  return new Promise((resolve) => {
    if (!address || address.trim() === '') {
      resolve({ lat: null, lng: null, success: false, error: '주소 없음' });
      return;
    }

    const encodedAddress = encodeURIComponent(address.trim());
    const url = `${KAKAO_API_URL}?query=${encodedAddress}`;

    const options = {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_API_KEY}`
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);

          if (result.documents && result.documents.length > 0) {
            const location = result.documents[0];
            resolve({
              lat: parseFloat(location.y),
              lng: parseFloat(location.x),
              success: true,
              addressName: location.address_name || address
            });
          } else {
            resolve({
              lat: null,
              lng: null,
              success: false,
              error: '검색 결과 없음'
            });
          }
        } catch (error) {
          resolve({
            lat: null,
            lng: null,
            success: false,
            error: `파싱 에러: ${error.message}`
          });
        }
      });
    }).on('error', (error) => {
      resolve({
        lat: null,
        lng: null,
        success: false,
        error: `API 요청 에러: ${error.message}`
      });
    });
  });
}

/**
 * CSV 파일을 파싱하여 배열로 변환
 * @param {string} filePath - CSV 파일 경로
 * @returns {Array<Object>} 파싱된 데이터 배열
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');

  if (lines.length === 0) {
    throw new Error('CSV 파일이 비어있습니다.');
  }

  // BOM 제거
  const header = lines[0].replace(/^\uFEFF/, '').split(',');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};

    header.forEach((key, index) => {
      row[key] = values[index] || '';
    });

    data.push(row);
  }

  return { header, data };
}

/**
 * 배열 데이터를 CSV 파일로 저장
 * @param {string} filePath - 저장할 파일 경로
 * @param {Array<string>} header - 헤더 배열
 * @param {Array<Object>} data - 데이터 배열
 */
function saveCSV(filePath, header, data) {
  const rows = [header.join(',')];

  data.forEach(row => {
    const values = header.map(key => {
      const value = row[key] !== undefined && row[key] !== null ? String(row[key]) : '';
      // 쉼표나 따옴표가 포함된 경우 따옴표로 감싸기
      if (value.includes(',') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    rows.push(values.join(','));
  });

  fs.writeFileSync(filePath, '\uFEFF' + rows.join('\n'), 'utf-8');
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('사용법: node extractCoordinates.js <input.csv> <output.csv>');
    console.error('예시: node extractCoordinates.js input.csv output.csv');
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const outputPath = path.resolve(args[1]);

  if (!fs.existsSync(inputPath)) {
    console.error(`입력 파일을 찾을 수 없습니다: ${inputPath}`);
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('카카오 API 위경도 추출 스크립트');
  console.log('='.repeat(60));
  console.log(`입력 파일: ${inputPath}`);
  console.log(`출력 파일: ${outputPath}`);
  console.log('='.repeat(60));

  try {
    // CSV 파일 읽기
    console.log('\n[1/4] CSV 파일 읽기 중...');
    const { header, data } = parseCSV(inputPath);
    console.log(`✓ 총 ${data.length}개 행 읽기 완료`);

    // 위경도 추출
    console.log('\n[2/4] 카카오 API로 위경도 추출 중...');
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // 기존 위경도 값 확인
      const existingLat = row['위도'] || '';
      const existingLng = row['경도'] || '';

      // 위경도가 이미 있으면 건너뛰기
      if (existingLat && existingLng && existingLat.trim() !== '' && existingLng.trim() !== '') {
        process.stdout.write(`\r진행: ${i + 1}/${data.length} (성공: ${successCount}, 실패: ${failCount}, 건너뜀: ${skipCount + 1})`);
        skipCount++;
        continue;
      }

      const roadAddress = row['소재지도로명주소'] || '';
      const jibunAddress = row['소재지지번주소'] || '';

      // 도로명 주소 우선, 없으면 지번 주소 사용
      const address = roadAddress || jibunAddress;

      process.stdout.write(`\r진행: ${i + 1}/${data.length} (성공: ${successCount}, 실패: ${failCount}, 건너뜀: ${skipCount})`);

      if (!address || address.trim() === '') {
        failCount++;
        continue;
      }

      // API 호출
      const result = await getCoordinates(address);

      if (result.success) {
        row['위도'] = result.lat;
        row['경도'] = result.lng;
        successCount++;
      } else {
        failCount++;
      }

      // API Rate Limit 방지 (초당 10회 제한)
      await delay(150);
    }

    console.log('\n✓ 위경도 추출 완료');

    // CSV 파일 저장
    console.log('\n[3/4] 결과 저장 중...');
    saveCSV(outputPath, header, data);
    console.log(`✓ 결과 파일 저장 완료: ${outputPath}`);

    // 결과 요약
    console.log('\n[4/4] 작업 요약');
    console.log('='.repeat(60));
    console.log(`총 데이터: ${data.length}개`);
    console.log(`기존 데이터 (건너뜀): ${skipCount}개 (${((skipCount / data.length) * 100).toFixed(1)}%)`);
    console.log(`API 호출 대상: ${data.length - skipCount}개`);
    console.log(`  ㄴ 성공: ${successCount}개 (${data.length - skipCount > 0 ? ((successCount / (data.length - skipCount)) * 100).toFixed(1) : 0}%)`);
    console.log(`  ㄴ 실패: ${failCount}개 (${data.length - skipCount > 0 ? ((failCount / (data.length - skipCount)) * 100).toFixed(1) : 0}%)`);
    console.log('='.repeat(60));
    console.log('\n✅ 작업 완료!');

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { getCoordinates, parseCSV, saveCSV };
