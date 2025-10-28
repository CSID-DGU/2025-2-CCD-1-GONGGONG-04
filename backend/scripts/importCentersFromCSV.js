/**
 * CSV 데이터 삽입 스크립트
 * - 전국 건강증진센터 표준 데이터를 MySQL 데이터베이스에 삽입합니다.
 * - UTF-8 인코딩을 보장하여 한국어가 정상적으로 저장되도록 합니다.
 *
 * 실행 방법: node backend/scripts/importCentersFromCSV.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// CSV 파싱 유틸리티 함수
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 이스케이프된 따옴표
        current += '"';
        i++;
      } else {
        // 따옴표 토글
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 필드 구분자
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// 휴무일 정보 파싱 함수
function parseHolidayInfo(holidayText) {
  if (!holidayText) return { closedDays: [], hasPublicHoliday: false };

  const closedDays = [];
  const text = holidayText.toLowerCase();

  // 요일 매핑
  const dayMap = {
    '일요일': 0, '일': 0, 'sunday': 0,
    '월요일': 1, '월': 1, 'monday': 1,
    '화요일': 2, '화': 2, 'tuesday': 2,
    '수요일': 3, '수': 3, 'wednesday': 3,
    '목요일': 4, '목': 4, 'thursday': 4,
    '금요일': 5, '금': 5, 'friday': 5,
    '토요일': 6, '토': 6, 'saturday': 6
  };

  for (const [key, value] of Object.entries(dayMap)) {
    if (text.includes(key)) {
      closedDays.push(value);
    }
  }

  const hasPublicHoliday = text.includes('공휴일') || text.includes('국경일');

  return { closedDays: [...new Set(closedDays)], hasPublicHoliday };
}

// 시간 문자열을 TIME 형식으로 변환
function formatTime(timeStr) {
  if (!timeStr || timeStr.trim() === '') return null;

  // "9:00", "09:00", "9시" 등의 형식 지원
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?/);
  if (match) {
    const hour = match[1].padStart(2, '0');
    const minute = match[2] || '00';
    return `${hour}:${minute}:00`;
  }
  return null;
}

// 메인 실행 함수
async function main() {
  let connection;

  try {
    // MySQL 연결 (UTF-8 보장)
    console.log('📡 MySQL 연결 중...');
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'mindconnect_user',
      password: 'mindconnect_pass',
      database: 'mindconnect',
      charset: 'utf8mb4',
      multipleStatements: true
    });

    // 명시적으로 UTF-8 설정
    await connection.query('SET NAMES utf8mb4');
    await connection.query('SET CHARACTER SET utf8mb4');
    await connection.query('SET character_set_connection=utf8mb4');

    console.log('✅ MySQL 연결 성공');

    // CSV 파일 읽기
    console.log('📄 CSV 파일 읽는 중...');
    const csvPath = path.join(__dirname, '..', '..', 'context', '전국건강증진센터표준데이터.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    console.log(`📊 총 ${lines.length - 1}개 레코드 발견 (헤더 제외)`);

    // 헤더 제거
    const headers = parseCSVLine(lines[0]);
    const dataLines = lines.slice(1);

    // 트랜잭션 시작
    await connection.beginTransaction();
    console.log('🔄 트랜잭션 시작');

    let insertedCenters = 0;
    let insertedHours = 0;
    let insertedStaff = 0;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue;

      const fields = parseCSVLine(line);

      // CSV 칼럼 매핑
      const centerName = fields[0] || '';
      const centerType = fields[1] || '';
      const centerTypeOriginal = fields[2] || null;
      const roadAddress = fields[3] || '';
      const jibunAddress = fields[4] || null;
      const latitude = parseFloat(fields[5]) || null;
      const longitude = parseFloat(fields[6]) || null;
      const businessContent = fields[7] || null;
      const openTime = formatTime(fields[8]);
      const closeTime = formatTime(fields[9]);
      const holidayInfo = fields[10] || '';
      const buildingArea = parseFloat(fields[11]) || null;
      const doctorCount = parseInt(fields[12]) || 0;
      const nurseCount = parseInt(fields[13]) || 0;
      const socialWorkerCount = parseInt(fields[14]) || 0;
      const nutritionistCount = parseInt(fields[15]) || 0;
      const otherStaff = fields[16] || null;
      const otherInfo = fields[17] || null;
      const operatingOrgPhone = fields[18] || null;
      const operatingOrgName = fields[19] || null;
      const managingOrgPhone = fields[20] || null;
      const managingOrgName = fields[21] || null;
      const dataReferenceDate = fields[22] || null;
      const providerCode = fields[23] || null;
      const providerName = fields[24] || null;

      // 1. centers 테이블에 삽입
      const rawHoursText = `운영시간: ${fields[8] || ''}-${fields[9] || ''}, 휴무: ${holidayInfo}`;
      const externalId = `MOHW_${String(i + 1).padStart(4, '0')}`;

      const [centerResult] = await connection.query(
        `INSERT INTO centers (
          center_name, center_type, center_type_original,
          road_address, jibun_address, latitude, longitude,
          business_content, building_area, phone_number,
          operating_org_name, managing_org_name, managing_org_phone,
          provider_code, provider_name, other_info,
          data_reference_date, source, external_id, raw_hours_text,
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          centerName, centerType, centerTypeOriginal,
          roadAddress, jibunAddress, latitude, longitude,
          businessContent, buildingArea, operatingOrgPhone,
          operatingOrgName, managingOrgName, managingOrgPhone,
          providerCode, providerName, otherInfo,
          dataReferenceDate, 'MOHW_표준데이터', externalId, rawHoursText,
          true
        ]
      );

      const centerId = centerResult.insertId;
      insertedCenters++;

      // 2. center_operating_hours 테이블에 삽입
      const { closedDays } = parseHolidayInfo(holidayInfo);

      for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
        const isOpen = !closedDays.includes(dayOfWeek);

        await connection.query(
          `INSERT INTO center_operating_hours (
            center_id, day_of_week, open_time, close_time, is_open
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            centerId,
            dayOfWeek,
            isOpen ? openTime : null,
            isOpen ? closeTime : null,
            isOpen
          ]
        );
        insertedHours++;
      }

      // 3. center_staff 테이블에 삽입
      const staffData = [
        { type: '의사', count: doctorCount },
        { type: '간호사', count: nurseCount },
        { type: '사회복지사', count: socialWorkerCount },
        { type: '영양사', count: nutritionistCount }
      ];

      for (const staff of staffData) {
        if (staff.count > 0) {
          await connection.query(
            `INSERT INTO center_staff (center_id, staff_type, staff_count)
             VALUES (?, ?, ?)`,
            [centerId, staff.type, staff.count]
          );
          insertedStaff++;
        }
      }

      // 기타 인력 현황
      if (otherStaff && otherStaff.trim() !== '') {
        await connection.query(
          `INSERT INTO center_staff (center_id, staff_type, staff_count, description)
           VALUES (?, ?, ?, ?)`,
          [centerId, '기타', 0, otherStaff]
        );
        insertedStaff++;
      }

      // 진행 상황 출력
      if ((i + 1) % 100 === 0) {
        console.log(`✔️  ${i + 1}/${dataLines.length} 레코드 처리 완료`);
      }
    }

    // 트랜잭션 커밋
    await connection.commit();
    console.log('✅ 트랜잭션 커밋 완료');

    // 결과 출력
    console.log('\n📊 삽입 결과:');
    console.log(`  - centers: ${insertedCenters}개`);
    console.log(`  - center_operating_hours: ${insertedHours}개`);
    console.log(`  - center_staff: ${insertedStaff}개`);

    // 검증 쿼리
    console.log('\n🔍 데이터 검증 중...');
    const [centers] = await connection.query(
      'SELECT center_name, center_type, road_address FROM centers LIMIT 5'
    );

    console.log('\n✅ 한국어 인코딩 확인 (처음 5개 센터):');
    centers.forEach((center, idx) => {
      console.log(`  ${idx + 1}. ${center.center_name} (${center.center_type})`);
    });

  } catch (error) {
    // 롤백
    if (connection) {
      await connection.rollback();
      console.log('❌ 트랜잭션 롤백');
    }
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  } finally {
    // 연결 종료
    if (connection) {
      await connection.end();
      console.log('\n👋 MySQL 연결 종료');
    }
  }
}

// 스크립트 실행
main();
