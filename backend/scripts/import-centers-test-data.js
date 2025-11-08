/**
 * centers_test.csv 데이터를 centers 테이블에 삽입하는 스크립트
 * UTF-8 인코딩으로 한국어 처리
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * CSV 라인을 파싱하는 함수
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

/**
 * 빈 문자열을 null로 변환
 */
function emptyToNull(value) {
  return value === '' ? null : value;
}

/**
 * 숫자 변환 (빈 문자열이면 null)
 */
function parseDecimal(value) {
  if (!value || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

/**
 * 날짜 변환 (YYYY-MM-DD 형식)
 */
function parseDate(value) {
  if (!value || value === '') return null;
  return new Date(value);
}

async function importCentersData() {
  try {
    console.log('📂 CSV 파일 읽기 시작...');

    const csvPath = path.join(__dirname, '../data/centers_test.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    console.log(`📄 총 ${lines.length}개 라인 발견`);

    // 헤더 파싱
    const headers = parseCSVLine(lines[0]);
    console.log('📋 헤더:', headers);

    // 데이터 파싱 및 삽입
    const dataLines = lines.slice(1); // 헤더 제외
    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue;

      const values = parseCSVLine(line);

      // CSV 컬럼 매핑
      const centerData = {
        centerName: emptyToNull(values[0]),
        centerType: emptyToNull(values[1]) || '정신건강복지센터',
        roadAddress: emptyToNull(values[2]),
        jibunAddress: emptyToNull(values[3]),
        latitude: parseDecimal(values[4]),
        longitude: parseDecimal(values[5]),
        phoneNumber: emptyToNull(values[6]),
        businessContent: emptyToNull(values[7]),
        buildingArea: parseDecimal(values[8]),
        operatingOrgName: emptyToNull(values[9]),
        managingOrgName: emptyToNull(values[10]),
        managingOrgPhone: emptyToNull(values[11]),
        providerCode: emptyToNull(values[12]),
        providerName: emptyToNull(values[13]),
        otherInfo: emptyToNull(values[14]),
        dataReferenceDate: parseDate(values[15]),
        source: emptyToNull(values[16]) || '공공데이터포털',
        externalId: emptyToNull(values[17]),
        rawHoursText: emptyToNull(values[18]),
      };

      // 필수 필드 검증 (centerName이 없으면 스킵)
      if (!centerData.centerName) {
        console.log(`⚠️  라인 ${i + 2}: centerName이 비어있어 스킵합니다.`);
        skipCount++;
        continue;
      }

      // 중복 검사 (source + externalId)
      if (centerData.source && centerData.externalId) {
        const existing = await prisma.center.findFirst({
          where: {
            source: centerData.source,
            externalId: centerData.externalId,
          },
        });

        if (existing) {
          console.log(`⚠️  라인 ${i + 2}: 중복 데이터 (${centerData.centerName}) - 스킵`);
          skipCount++;
          continue;
        }
      }

      try {
        // 데이터 삽입
        await prisma.center.create({
          data: centerData,
        });

        successCount++;
        console.log(`✅ 라인 ${i + 2}: ${centerData.centerName} 삽입 성공`);
      } catch (error) {
        console.error(`❌ 라인 ${i + 2}: 삽입 실패 -`, error.message);
        console.error('   데이터:', centerData);
        skipCount++;
      }
    }

    console.log('\n📊 삽입 결과:');
    console.log(`   ✅ 성공: ${successCount}개`);
    console.log(`   ⚠️  스킵: ${skipCount}개`);
    console.log(`   📝 총: ${dataLines.length}개`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
importCentersData()
  .then(() => {
    console.log('\n✨ 데이터 삽입 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 데이터 삽입 실패:', error);
    process.exit(1);
  });
