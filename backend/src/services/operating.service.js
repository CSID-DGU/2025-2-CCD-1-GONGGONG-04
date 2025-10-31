/**
 * Operating Service
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.2: Operating Service 구현
 *
 * 기능:
 * 1. 현재 운영 중인지 확인 (운영시간, 휴무일 고려)
 * 2. 다음 오픈 시간 계산
 * 3. 운영시간 기반 점수 계산 (0-100점, 25% 가중치)
 */

/**
 * 현재 운영 중인지 확인
 *
 * @param {Array<Object>} centerHours - 센터 운영시간 배열
 *   [ { dayOfWeek: 0-6, openTime: 'HH:mm', closeTime: 'HH:mm' }, ... ]
 * @param {Date|string|number} currentTime - 현재 시간 (기본값: now)
 * @param {Array<Object>} holidays - 휴무일 배열 (기본값: [])
 *   [ { holidayDate: 'YYYY-MM-DD', holidayType: 'public|regular|temp' }, ... ]
 * @returns {boolean} - 운영 중 여부
 *
 * @example
 * const hours = [
 *   { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00' } // 월요일
 * ];
 * const holidays = [
 *   { holidayDate: '2025-01-01', holidayType: 'public' }
 * ];
 * isCurrentlyOpen(hours, new Date('2025-01-20 10:30'), holidays); // true (월요일 10:30)
 * isCurrentlyOpen(hours, new Date('2025-01-20 19:00'), holidays); // false (마감 후)
 * isCurrentlyOpen(hours, new Date('2025-01-01 10:00'), holidays); // false (공휴일)
 */
function isCurrentlyOpen(centerHours, currentTime = new Date(), holidays = []) {
  // 입력 검증
  if (!Array.isArray(centerHours)) {
    throw new TypeError('centerHours must be an array');
  }

  if (!Array.isArray(holidays)) {
    throw new TypeError('holidays must be an array');
  }

  // 현재 시간 파싱
  const now = new Date(currentTime);
  if (isNaN(now.getTime())) {
    throw new TypeError('currentTime must be a valid date');
  }

  // 오늘 날짜 (YYYY-MM-DD)
  const todayDate = now.toISOString().split('T')[0];

  // 휴무일 확인
  const isHoliday = holidays.some(holiday => holiday.holidayDate === todayDate);
  if (isHoliday) {
    return false;
  }

  // 요일 (0: Sunday, 1: Monday, ..., 6: Saturday)
  const dayOfWeek = now.getDay();

  // 오늘의 운영시간 조회
  const todayHours = centerHours.find(hours => hours.dayOfWeek === dayOfWeek);

  // 운영시간 정보 없음 → 휴무
  if (!todayHours || !todayHours.openTime || !todayHours.closeTime) {
    return false;
  }

  // 현재 시간 (HH:mm 형식)
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 시간 비교 (문자열 비교로 충분 - 'HH:mm' 형식이므로)
  const isOpen = currentHHMM >= todayHours.openTime && currentHHMM < todayHours.closeTime;

  return isOpen;
}

/**
 * 다음 오픈 시간 계산
 *
 * @param {Array<Object>} centerHours - 센터 운영시간 배열
 * @param {Date|string|number} currentTime - 현재 시간 (기본값: now)
 * @param {Array<Object>} holidays - 휴무일 배열 (기본값: [])
 * @param {number} maxDaysAhead - 최대 조회 일수 (기본값: 14일)
 * @returns {Date|null} - 다음 오픈 시간 (14일 내 오픈 예정 없으면 null)
 *
 * @example
 * const hours = [
 *   { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00' }, // 월
 *   { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00' }, // 화
 * ];
 * getNextOpenTime(hours, new Date('2025-01-20 19:00')); // 2025-01-21 09:00 (다음 날 오픈)
 * getNextOpenTime(hours, new Date('2025-01-18 10:00')); // 2025-01-20 09:00 (주말 제외)
 */
function getNextOpenTime(centerHours, currentTime = new Date(), holidays = [], maxDaysAhead = 14) {
  // 입력 검증
  if (!Array.isArray(centerHours)) {
    throw new TypeError('centerHours must be an array');
  }

  if (!Array.isArray(holidays)) {
    throw new TypeError('holidays must be an array');
  }

  const now = new Date(currentTime);
  if (isNaN(now.getTime())) {
    throw new TypeError('currentTime must be a valid date');
  }

  if (typeof maxDaysAhead !== 'number' || maxDaysAhead <= 0) {
    throw new RangeError('maxDaysAhead must be a positive number');
  }

  // 최대 14일 앞까지 조회
  for (let daysAhead = 0; daysAhead <= maxDaysAhead; daysAhead++) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() + daysAhead);

    const checkDateStr = checkDate.toISOString().split('T')[0];
    const dayOfWeek = checkDate.getDay();

    // 휴무일 체크
    const isHoliday = holidays.some(holiday => holiday.holidayDate === checkDateStr);
    if (isHoliday) {
      continue;
    }

    // 운영시간 조회
    const hoursForDay = centerHours.find(h => h.dayOfWeek === dayOfWeek);
    if (!hoursForDay || !hoursForDay.openTime || !hoursForDay.closeTime) {
      continue;
    }

    // 오늘인 경우 → 현재 시간 이후 오픈만 유효
    if (daysAhead === 0) {
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // 아직 오픈 전이면 오늘의 오픈 시간 반환
      if (currentHHMM < hoursForDay.openTime) {
        const [openHour, openMin] = hoursForDay.openTime.split(':').map(Number);
        const openDate = new Date(checkDate);
        openDate.setHours(openHour, openMin, 0, 0);
        return openDate;
      }

      // 이미 마감했거나 운영 중이면 다음 날로
      continue;
    }

    // 미래 날짜 → 해당 날짜의 오픈 시간 반환
    const [openHour, openMin] = hoursForDay.openTime.split(':').map(Number);
    const openDate = new Date(checkDate);
    openDate.setHours(openHour, openMin, 0, 0);
    return openDate;
  }

  // 14일 내 오픈 예정 없음
  return null;
}

/**
 * 운영시간 기반 점수 계산
 *
 * 점수 계산 로직:
 * - 현재 운영 중: 100점
 * - 1시간 이내 오픈 예정: 80점
 * - 3시간 이내 오픈 예정: 60점
 * - 6시간 이내 오픈 예정: 40점
 * - 24시간 이내 오픈 예정: 20점
 * - 그 외: 0점
 *
 * @param {Array<Object>} centerHours - 센터 운영시간 배열
 * @param {Date|string|number} currentTime - 현재 시간 (기본값: now)
 * @param {Array<Object>} holidays - 휴무일 배열 (기본값: [])
 * @returns {number} - 운영시간 점수 (0-100)
 *
 * @example
 * const hours = [
 *   { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00' }
 * ];
 * calculateOperatingScore(hours, new Date('2025-01-20 10:00')); // 100 (운영중)
 * calculateOperatingScore(hours, new Date('2025-01-20 08:30')); // 80 (30분 후 오픈)
 * calculateOperatingScore(hours, new Date('2025-01-20 19:00')); // 20 (다음날 14시간 후)
 */
function calculateOperatingScore(centerHours, currentTime = new Date(), holidays = []) {
  // 입력 검증
  if (!Array.isArray(centerHours)) {
    throw new TypeError('centerHours must be an array');
  }

  if (!Array.isArray(holidays)) {
    throw new TypeError('holidays must be an array');
  }

  const now = new Date(currentTime);
  if (isNaN(now.getTime())) {
    throw new TypeError('currentTime must be a valid date');
  }

  // 현재 운영 중이면 100점
  if (isCurrentlyOpen(centerHours, now, holidays)) {
    return 100;
  }

  // 다음 오픈 시간 조회
  const nextOpenTime = getNextOpenTime(centerHours, now, holidays);

  if (!nextOpenTime) {
    // 14일 내 오픈 예정 없음 → 0점
    return 0;
  }

  // 다음 오픈까지 남은 시간 (밀리초)
  const timeUntilOpen = nextOpenTime.getTime() - now.getTime();

  // 시간 기반 점수 (밀리초 → 시간)
  const hoursUntilOpen = timeUntilOpen / (1000 * 60 * 60);

  if (hoursUntilOpen <= 1) {
    return 80;
  } // 1시간 이내
  if (hoursUntilOpen <= 3) {
    return 60;
  } // 3시간 이내
  if (hoursUntilOpen <= 6) {
    return 40;
  } // 6시간 이내
  if (hoursUntilOpen <= 24) {
    return 20;
  } // 24시간 이내
  return 0; // 그 외
}

module.exports = {
  isCurrentlyOpen,
  getNextOpenTime,
  calculateOperatingScore,
};
