/**
 * 좌표 보정 스크립트 (Kakao Map Geocoding API)
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 1.9: Kakao Map API 좌표 보정 스크립트
 *
 * 기능:
 * 1. 좌표 누락 센터 필터링
 * 2. Kakao Map API로 주소 → 좌표 변환 (Geocoding)
 * 3. Rate Limit 고려 (0.5초 지연)
 * 4. 결과 JSON 업데이트
 *
 * 사용법:
 *   node scripts/correctCoordinates.js <input.json> <output.json>
 *   node scripts/correctCoordinates.js data/centers_cleaned.json data/centers_with_coords.json
 *
 * 환경변수:
 *   KAKAO_API_KEY - Kakao REST API 키 (필수)
 */

const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// Kakao Geocoding API 설정
const KAKAO_API_URL = 'https://dapi.kakao.com/v2/local/search/address.json';
const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
const RATE_LIMIT_DELAY = 500; // 0.5초 (밀리초)

// 통계 객체
const stats = {
  total: 0,
  missing: 0,
  corrected: 0,
  failed: 0,
  apiCalls: 0,
};

/**
 * 좌표 유효성 검증
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {boolean} - 유효 여부
 */
function isValidCoordinate(lat, lng) {
  // 한국 위도 범위: 약 33°~39°
  // 한국 경도 범위: 약 124°~132°
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= 33 &&
    lat <= 39 &&
    lng >= 124 &&
    lng <= 132
  );
}

/**
 * Kakao Geocoding API로 주소 → 좌표 변환
 * @param {string} address - 주소
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
async function getCoordinatesFromAddress(address) {
  if (!KAKAO_API_KEY) {
    throw new Error('KAKAO_API_KEY is not set in environment variables');
  }

  try {
    stats.apiCalls++;

    const response = await axios.get(KAKAO_API_URL, {
      params: { query: address },
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
      timeout: 10000, // 10초 타임아웃
    });

    const documents = response.data.documents;

    if (!documents || documents.length === 0) {
      console.log(`   ⚠️  No coordinates found for: ${address}`);
      return null;
    }

    // 첫 번째 결과 사용 (정확도 높은 순)
    const result = documents[0];
    const latitude = parseFloat(result.y);
    const longitude = parseFloat(result.x);

    if (!isValidCoordinate(latitude, longitude)) {
      console.log(
        `   ⚠️  Invalid coordinates (${latitude}, ${longitude}) for: ${address}`
      );
      return null;
    }

    console.log(
      `   ✅ Found coordinates (${latitude.toFixed(6)}, ${longitude.toFixed(6)}) for: ${address}`
    );

    return { latitude, longitude };
  } catch (error) {
    if (error.response) {
      // API 에러 응답
      console.error(
        `   ❌ API Error (${error.response.status}): ${error.response.data.message || 'Unknown error'}`
      );
    } else if (error.request) {
      // 네트워크 에러
      console.error(`   ❌ Network Error: ${error.message}`);
    } else {
      // 기타 에러
      console.error(`   ❌ Error: ${error.message}`);
    }
    return null;
  }
}

/**
 * Rate Limit 지연
 * @param {number} ms - 대기 시간 (밀리초)
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 좌표 보정 메인 함수
 * @param {string} inputPath - 입력 JSON 파일 경로
 * @param {string} outputPath - 출력 JSON 파일 경로
 * @param {number} maxCorrections - 최대 보정 개수 (테스트용, 0=무제한)
 */
async function correctCoordinates(inputPath, outputPath, maxCorrections = 0) {
  console.log('🗺️  Starting coordinate correction process...\n');
  console.log(`📂 Input:  ${inputPath}`);
  console.log(`📂 Output: ${outputPath}\n`);

  if (!KAKAO_API_KEY) {
    console.error('❌ Error: KAKAO_API_KEY environment variable is not set');
    console.log('\nPlease set KAKAO_API_KEY in your .env file:');
    console.log('KAKAO_API_KEY=your_kakao_rest_api_key_here\n');
    process.exit(1);
  }

  // 입력 파일 읽기
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  let centers;
  try {
    const data = fs.readFileSync(inputPath, 'utf-8');
    centers = JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error reading input file: ${error.message}`);
    process.exit(1);
  }

  stats.total = centers.length;

  // 좌표 누락 센터 필터링
  const missingCoords = centers.filter(
    center => !isValidCoordinate(center.latitude, center.longitude)
  );

  stats.missing = missingCoords.length;

  console.log(`📊 Total centers: ${stats.total}`);
  console.log(`❌ Missing/Invalid coordinates: ${stats.missing}`);
  console.log(`✅ Valid coordinates: ${stats.total - stats.missing}\n`);

  if (stats.missing === 0) {
    console.log('✅ All centers already have valid coordinates. No correction needed.\n');
    fs.writeFileSync(outputPath, JSON.stringify(centers, null, 2), 'utf-8');
    console.log(`💾 Output saved to: ${outputPath}`);
    return centers;
  }

  // 보정할 센터 수 제한 (테스트용)
  const centersToCorrect = maxCorrections > 0
    ? missingCoords.slice(0, maxCorrections)
    : missingCoords;

  console.log(`🔧 Correcting ${centersToCorrect.length} center(s)...\n`);

  // 좌표 보정 진행
  for (let i = 0; i < centersToCorrect.length; i++) {
    const center = centersToCorrect[i];

    console.log(
      `[${i + 1}/${centersToCorrect.length}] Processing: ${center.centerName}`
    );

    // 주소로 좌표 검색
    const coords = await getCoordinatesFromAddress(center.roadAddress);

    if (coords) {
      // 좌표 업데이트
      center.latitude = coords.latitude;
      center.longitude = coords.longitude;
      stats.corrected++;
    } else {
      stats.failed++;
    }

    // Rate Limit 대기 (마지막 요청 제외)
    if (i < centersToCorrect.length - 1) {
      await delay(RATE_LIMIT_DELAY);
    }
  }

  // 결과 저장
  fs.writeFileSync(outputPath, JSON.stringify(centers, null, 2), 'utf-8');

  // 최종 통계 출력
  console.log('\n✅ Coordinate correction completed!\n');
  console.log('📊 Final Statistics:');
  console.log(`   Total centers:           ${stats.total}`);
  console.log(`   Missing coordinates:     ${stats.missing}`);
  console.log(`   Successfully corrected:  ${stats.corrected} (${((stats.corrected / stats.missing) * 100).toFixed(2)}%)`);
  console.log(`   Failed to correct:       ${stats.failed}`);
  console.log(`   API calls made:          ${stats.apiCalls}\n`);

  if (maxCorrections > 0 && stats.missing > maxCorrections) {
    console.log(
      `ℹ️  Note: Only ${maxCorrections} out of ${stats.missing} missing coordinates were processed (test mode)`
    );
  }

  console.log(`💾 Output saved to: ${outputPath}`);

  return centers;
}

// CLI 실행
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node scripts/correctCoordinates.js <input.json> <output.json> [maxCorrections]');
    console.log('');
    console.log('Examples:');
    console.log('  # Correct all missing coordinates');
    console.log('  node scripts/correctCoordinates.js data/centers_cleaned.json data/centers_with_coords.json');
    console.log('');
    console.log('  # Test with first 10 centers only');
    console.log('  node scripts/correctCoordinates.js data/centers_cleaned.json data/centers_test.json 10');
    console.log('');
    console.log('Environment Variables:');
    console.log('  KAKAO_API_KEY - Kakao REST API key (required)');
    process.exit(1);
  }

  const [inputPath, outputPath, maxCorrections] = args;
  const maxCorrectionNum = maxCorrections ? parseInt(maxCorrections, 10) : 0;

  correctCoordinates(inputPath, outputPath, maxCorrectionNum)
    .then(() => {
      console.log('\n🎉 Process completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Process failed:', error.message);
      process.exit(1);
    });
}

module.exports = { correctCoordinates, getCoordinatesFromAddress };
