/**
 * 센터 데이터 정제 스크립트
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 1.8: 데이터 정제 스크립트 작성
 *
 * 기능:
 * 1. CSV 파일 읽기 (csv-parser)
 * 2. 필수 필드 검증 (name, address, phone, latitude, longitude)
 * 3. 중복 제거 (name + address 기준)
 * 4. 결과 JSON 파일 출력
 *
 * 사용법:
 *   node scripts/cleanCenterData.js <input.csv> <output.json>
 *   node scripts/cleanCenterData.js data/centers_raw.csv data/centers_cleaned.json
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// 필수 필드 정의
const REQUIRED_FIELDS = {
  name: 'center_name',
  address: 'road_address',
  phone: 'phone_number',
  latitude: 'latitude',
  longitude: 'longitude',
};

// 통계 객체
const stats = {
  total: 0,
  valid: 0,
  duplicates: 0,
  missingFields: {
    name: 0,
    address: 0,
    phone: 0,
    latitude: 0,
    longitude: 0,
  },
};

/**
 * 필수 필드 검증
 * @param {Object} row - CSV 행 데이터
 * @returns {Object} - { isValid: boolean, missingFields: string[] }
 */
function validateRequiredFields(row) {
  const missingFields = [];

  // 센터명 검증
  if (!row[REQUIRED_FIELDS.name] || row[REQUIRED_FIELDS.name].trim() === '') {
    missingFields.push('name');
    stats.missingFields.name++;
  }

  // 주소 검증
  if (!row[REQUIRED_FIELDS.address] || row[REQUIRED_FIELDS.address].trim() === '') {
    missingFields.push('address');
    stats.missingFields.address++;
  }

  // 전화번호 검증
  if (!row[REQUIRED_FIELDS.phone] || row[REQUIRED_FIELDS.phone].trim() === '') {
    missingFields.push('phone');
    stats.missingFields.phone++;
  }

  // 위도 검증
  const lat = parseFloat(row[REQUIRED_FIELDS.latitude]);
  if (isNaN(lat) || lat < 33 || lat > 39) {
    // 한국 위도 범위: 약 33°~39°
    missingFields.push('latitude');
    stats.missingFields.latitude++;
  }

  // 경도 검증
  const lng = parseFloat(row[REQUIRED_FIELDS.longitude]);
  if (isNaN(lng) || lng < 124 || lng > 132) {
    // 한국 경도 범위: 약 124°~132°
    missingFields.push('longitude');
    stats.missingFields.longitude++;
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * 데이터 정규화
 * @param {Object} row - CSV 행 데이터
 * @returns {Object} - 정규화된 데이터
 */
function normalizeData(row) {
  return {
    centerName: row[REQUIRED_FIELDS.name]?.trim() || '',
    centerType: row.center_type?.trim() || '',
    roadAddress: row[REQUIRED_FIELDS.address]?.trim() || '',
    jibunAddress: row.jibun_address?.trim() || null,
    latitude: parseFloat(row[REQUIRED_FIELDS.latitude]),
    longitude: parseFloat(row[REQUIRED_FIELDS.longitude]),
    phoneNumber: row[REQUIRED_FIELDS.phone]?.trim() || '',
    businessContent: row.business_content?.trim() || null,
    buildingArea: row.building_area ? parseFloat(row.building_area) : null,
    operatingOrgName: row.operating_org_name?.trim() || null,
    managingOrgName: row.managing_org_name?.trim() || null,
    managingOrgPhone: row.managing_org_phone?.trim() || null,
    providerCode: row.provider_code?.trim() || null,
    providerName: row.provider_name?.trim() || null,
    otherInfo: row.other_info?.trim() || null,
    dataReferenceDate: row.data_reference_date?.trim() || null,
    source: row.source?.trim() || 'unknown',
    externalId: row.external_id?.trim() || null,
    rawHoursText: row.raw_hours_text?.trim() || null,
  };
}

/**
 * 중복 키 생성 (name + address)
 * @param {Object} data - 센터 데이터
 * @returns {string} - 중복 확인용 키
 */
function getDuplicateKey(data) {
  return `${data.centerName.toLowerCase()}|${data.roadAddress.toLowerCase()}`;
}

/**
 * CSV 파일 읽기 및 정제
 * @param {string} inputPath - 입력 CSV 파일 경로
 * @param {string} outputPath - 출력 JSON 파일 경로
 */
async function cleanCenterData(inputPath, outputPath) {
  console.log('🧹 Starting data cleaning process...\n');
  console.log(`📂 Input:  ${inputPath}`);
  console.log(`📂 Output: ${outputPath}\n`);

  // 입력 파일 존재 확인
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const centers = [];
  const duplicateKeys = new Set();

  return new Promise((resolve, reject) => {
    fs.createReadStream(inputPath)
      .pipe(csv())
      .on('data', row => {
        stats.total++;

        // 필수 필드 검증
        const validation = validateRequiredFields(row);
        if (!validation.isValid) {
          console.log(
            `⚠️  Row ${stats.total}: Missing fields [${validation.missingFields.join(', ')}]`
          );
          return;
        }

        // 데이터 정규화
        const normalizedData = normalizeData(row);

        // 중복 확인
        const duplicateKey = getDuplicateKey(normalizedData);
        if (duplicateKeys.has(duplicateKey)) {
          stats.duplicates++;
          console.log(
            `🔄 Row ${stats.total}: Duplicate - ${normalizedData.centerName}`
          );
          return;
        }

        // 유효한 데이터 추가
        duplicateKeys.add(duplicateKey);
        centers.push(normalizedData);
        stats.valid++;
      })
      .on('end', () => {
        // 결과 JSON 파일 저장
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(centers, null, 2), 'utf-8');

        // 통계 출력
        console.log('\n✅ Data cleaning completed!\n');
        console.log('📊 Statistics:');
        console.log(`   Total rows:       ${stats.total}`);
        console.log(`   Valid centers:    ${stats.valid} (${((stats.valid / stats.total) * 100).toFixed(2)}%)`);
        console.log(`   Duplicates:       ${stats.duplicates}`);
        console.log(`   Invalid:          ${stats.total - stats.valid - stats.duplicates}\n`);

        console.log('❌ Missing field breakdown:');
        console.log(`   Name:             ${stats.missingFields.name}`);
        console.log(`   Address:          ${stats.missingFields.address}`);
        console.log(`   Phone:            ${stats.missingFields.phone}`);
        console.log(`   Latitude:         ${stats.missingFields.latitude}`);
        console.log(`   Longitude:        ${stats.missingFields.longitude}\n`);

        const missingRate =
          ((stats.total - stats.valid) / stats.total) * 100;
        console.log(`📉 Missing field rate: ${missingRate.toFixed(2)}%`);

        if (missingRate < 5) {
          console.log('✅ Missing field rate is below 5% threshold');
        } else {
          console.log('⚠️  Warning: Missing field rate exceeds 5% threshold');
        }

        console.log(`\n💾 Output saved to: ${outputPath}`);
        resolve(centers);
      })
      .on('error', error => {
        console.error('❌ Error reading CSV file:', error);
        reject(error);
      });
  });
}

// CLI 실행
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node scripts/cleanCenterData.js <input.csv> <output.json>');
    console.log('Example: node scripts/cleanCenterData.js data/centers_raw.csv data/centers_cleaned.json');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;

  cleanCenterData(inputPath, outputPath)
    .then(() => {
      console.log('\n🎉 Process completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Process failed:', error.message);
      process.exit(1);
    });
}

module.exports = { cleanCenterData, validateRequiredFields, normalizeData };
