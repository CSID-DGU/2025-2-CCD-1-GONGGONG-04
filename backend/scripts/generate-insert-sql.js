/**
 * centers_test.csv 데이터를 SQL INSERT 문으로 변환하는 스크립트
 */

const fs = require('fs');
const path = require('path');

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
 * SQL 문자열 이스케이프
 */
function escapeSQLString(value) {
  if (!value || value === '') return 'NULL';
  return `'${value.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

/**
 * 숫자 변환 (빈 문자열이면 NULL)
 */
function parseDecimal(value) {
  if (!value || value === '') return 'NULL';
  const num = parseFloat(value);
  return isNaN(num) ? 'NULL' : num;
}

/**
 * 좌표 유효성 검증 (latitude: -90~90, longitude: -180~180)
 */
function isValidCoordinate(lat, lng) {
  if (!lat || !lng) return false;
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) return false;
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;

  return true;
}

/**
 * 날짜 변환 (YYYY-MM-DD 형식)
 */
function parseDate(value) {
  if (!value || value === '') return 'NULL';
  return `'${value}'`;
}

function generateInsertSQL() {
  try {
    console.log('📂 CSV 파일 읽기 시작...');

    const csvPath = path.join(__dirname, '../data/centers_test.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    console.log(`📄 총 ${lines.length}개 라인 발견`);

    // 헤더 제외
    const dataLines = lines.slice(1);

    // SQL 파일 생성
    let sqlContent = '-- Centers Test Data Import\n';
    sqlContent += '-- Generated from centers_test.csv\n';
    sqlContent += '-- Encoding: UTF-8\n\n';
    sqlContent += 'SET NAMES utf8mb4;\n';
    sqlContent += 'SET CHARACTER SET utf8mb4;\n\n';

    let insertCount = 0;
    const processedExternalIds = new Set(); // 중복 체크를 위한 Set

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue;

      const values = parseCSVLine(line);

      // CSV 컬럼 매핑
      const centerName = values[0] || '';
      const centerType = values[1] || '정신건강복지센터';
      const roadAddress = values[2] || '';
      const jibunAddress = values[3] || '';
      const latitude = values[4] || '';
      const longitude = values[5] || '';
      const phoneNumber = values[6] || '';
      const businessContent = values[7] || '';
      const buildingArea = values[8] || '';
      const operatingOrgName = values[9] || '';
      const managingOrgName = values[10] || '';
      const managingOrgPhone = values[11] || '';
      const providerCode = values[12] || '';
      const providerName = values[13] || '';
      const otherInfo = values[14] || '';
      const dataReferenceDate = values[15] || '';
      const source = values[16] || '공공데이터포털';
      const externalId = values[17] || '';
      const rawHoursText = values[18] || '';

      // 필수 필드 검증 (centerName, roadAddress는 필수)
      if (!centerName) {
        console.log(`⚠️  라인 ${i + 2}: centerName이 비어있어 스킵합니다.`);
        continue;
      }

      if (!roadAddress) {
        console.log(`⚠️  라인 ${i + 2}: roadAddress가 비어있어 스킵합니다 (${centerName}).`);
        continue;
      }

      // 좌표 유효성 검증
      if (latitude && longitude && !isValidCoordinate(latitude, longitude)) {
        console.log(`⚠️  라인 ${i + 2}: 잘못된 좌표 (lat: ${latitude}, lng: ${longitude}) - 스킵합니다 (${centerName}).`);
        continue;
      }

      // 중복 external_id 체크
      const uniqueKey = `${source}-${externalId}`;
      if (externalId && processedExternalIds.has(uniqueKey)) {
        console.log(`⚠️  라인 ${i + 2}: 중복된 external_id (${externalId}) - 스킵합니다 (${centerName}).`);
        continue;
      }

      if (externalId) {
        processedExternalIds.add(uniqueKey);
      }

      // INSERT 문 생성
      sqlContent += `-- 라인 ${i + 2}: ${centerName}\n`;
      sqlContent += `INSERT INTO centers (\n`;
      sqlContent += `  center_name, center_type, road_address, jibun_address,\n`;
      sqlContent += `  latitude, longitude, phone_number, business_content,\n`;
      sqlContent += `  building_area, operating_org_name, managing_org_name,\n`;
      sqlContent += `  managing_org_phone, provider_code, provider_name,\n`;
      sqlContent += `  other_info, data_reference_date, source, external_id,\n`;
      sqlContent += `  raw_hours_text, is_active, created_at, updated_at\n`;
      sqlContent += `) VALUES (\n`;
      sqlContent += `  ${escapeSQLString(centerName)},\n`;
      sqlContent += `  ${escapeSQLString(centerType)},\n`;
      sqlContent += `  ${escapeSQLString(roadAddress)},\n`;
      sqlContent += `  ${escapeSQLString(jibunAddress)},\n`;
      sqlContent += `  ${parseDecimal(latitude)},\n`;
      sqlContent += `  ${parseDecimal(longitude)},\n`;
      sqlContent += `  ${escapeSQLString(phoneNumber)},\n`;
      sqlContent += `  ${escapeSQLString(businessContent)},\n`;
      sqlContent += `  ${parseDecimal(buildingArea)},\n`;
      sqlContent += `  ${escapeSQLString(operatingOrgName)},\n`;
      sqlContent += `  ${escapeSQLString(managingOrgName)},\n`;
      sqlContent += `  ${escapeSQLString(managingOrgPhone)},\n`;
      sqlContent += `  ${escapeSQLString(providerCode)},\n`;
      sqlContent += `  ${escapeSQLString(providerName)},\n`;
      sqlContent += `  ${escapeSQLString(otherInfo)},\n`;
      sqlContent += `  ${parseDate(dataReferenceDate)},\n`;
      sqlContent += `  ${escapeSQLString(source)},\n`;
      sqlContent += `  ${escapeSQLString(externalId)},\n`;
      sqlContent += `  ${escapeSQLString(rawHoursText)},\n`;
      sqlContent += `  1,\n`;
      sqlContent += `  NOW(),\n`;
      sqlContent += `  NOW()\n`;
      sqlContent += `);\n\n`;

      insertCount++;
      console.log(`✅ 라인 ${i + 2}: ${centerName} - SQL 생성 완료`);
    }

    // SQL 파일 저장
    const outputPath = path.join(__dirname, '../data/insert-centers-test-data.sql');
    fs.writeFileSync(outputPath, sqlContent, 'utf-8');

    console.log('\n📊 SQL 생성 결과:');
    console.log(`   ✅ INSERT 문 생성: ${insertCount}개`);
    console.log(`   📁 저장 경로: ${outputPath}`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  }
}

// 스크립트 실행
generateInsertSQL();
