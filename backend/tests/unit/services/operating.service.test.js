/**
 * Operating Service Unit Tests
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.2: Operating Service 단위 테스트
 *
 * 검증: 20개 테스트 통과
 */

const {
  isCurrentlyOpen,
  getNextOpenTime,
  calculateOperatingScore,
} = require('../../../src/services/operating.service');

describe('Operating Service', () => {
  // 공통 테스트 데이터
  const weekdayHours = [
    { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00' }, // 월요일
    { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00' }, // 화요일
    { dayOfWeek: 3, openTime: '09:00', closeTime: '18:00' }, // 수요일
    { dayOfWeek: 4, openTime: '09:00', closeTime: '18:00' }, // 목요일
    { dayOfWeek: 5, openTime: '09:00', closeTime: '18:00' }, // 금요일
  ];

  const extendedHours = [
    ...weekdayHours,
    { dayOfWeek: 6, openTime: '10:00', closeTime: '14:00' }, // 토요일 (단축)
  ];

  const holidays = [
    { holidayDate: '2025-01-01', holidayType: 'public' }, // 신정
    { holidayDate: '2025-01-27', holidayType: 'public' }, // 설날
  ];

  describe('isCurrentlyOpen', () => {
    // Test 1: 운영시간 내 (월요일 10:00)
    test('should return true when center is currently open', () => {
      const currentTime = new Date('2025-01-20 10:00:00'); // 월요일 10:00
      const result = isCurrentlyOpen(weekdayHours, currentTime);
      expect(result).toBe(true);
    });

    // Test 2: 오픈 전 (월요일 08:30)
    test('should return false before opening time', () => {
      const currentTime = new Date('2025-01-20 08:30:00');
      const result = isCurrentlyOpen(weekdayHours, currentTime);
      expect(result).toBe(false);
    });

    // Test 3: 마감 후 (월요일 19:00)
    test('should return false after closing time', () => {
      const currentTime = new Date('2025-01-20 19:00:00');
      const result = isCurrentlyOpen(weekdayHours, currentTime);
      expect(result).toBe(false);
    });

    // Test 4: 공휴일 (2025-01-01 10:00)
    test('should return false on holidays', () => {
      const currentTime = new Date('2025-01-01 10:00:00'); // 신정
      const result = isCurrentlyOpen(weekdayHours, currentTime, holidays);
      expect(result).toBe(false);
    });

    // Test 5: 운영시간 정보 없는 요일 (일요일)
    test('should return false when no operating hours for the day', () => {
      const currentTime = new Date('2025-01-19 10:00:00'); // 일요일
      const result = isCurrentlyOpen(weekdayHours, currentTime);
      expect(result).toBe(false);
    });

    // Test 6: 마감 시간 정확히 (18:00) → 마감으로 간주
    test('should return false at exact closing time', () => {
      const currentTime = new Date('2025-01-20 18:00:00');
      const result = isCurrentlyOpen(weekdayHours, currentTime);
      expect(result).toBe(false);
    });

    // Test 7: TypeError - centerHours가 배열이 아닌 경우
    test('should throw TypeError if centerHours is not an array', () => {
      expect(() => isCurrentlyOpen({}, new Date())).toThrow(TypeError);
    });

    // Test 8: TypeError - currentTime이 잘못된 경우
    test('should throw TypeError for invalid currentTime', () => {
      expect(() => isCurrentlyOpen(weekdayHours, 'invalid-date')).toThrow(
        TypeError
      );
    });
  });

  describe('getNextOpenTime', () => {
    // Test 9: 오픈 전 → 오늘의 오픈 시간 반환
    test('should return today open time when before opening', () => {
      const currentTime = new Date('2025-01-20 08:00:00'); // 월요일 08:00
      const result = getNextOpenTime(weekdayHours, currentTime);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(9);
      expect(result.getMinutes()).toBe(0);
      expect(result.getDate()).toBe(20); // 오늘
    });

    // Test 10: 마감 후 → 다음 날 오픈 시간 반환
    test('should return next day open time when after closing', () => {
      const currentTime = new Date('2025-01-20 19:00:00'); // 월요일 19:00
      const result = getNextOpenTime(weekdayHours, currentTime);

      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(9);
      expect(result.getDate()).toBe(21); // 다음 날 (화요일)
    });

    // Test 11: 금요일 마감 후 → 다음 월요일 (주말 제외)
    test('should skip weekend and return next Monday', () => {
      const currentTime = new Date('2025-01-24 19:00:00'); // 금요일 19:00
      const result = getNextOpenTime(weekdayHours, currentTime);

      expect(result).toBeInstanceOf(Date);
      expect(result.getDay()).toBe(1); // 월요일
      expect(result.getDate()).toBe(27); // 2025-01-27
    });

    // Test 12: 공휴일 건너뛰기 (설날 연휴)
    test('should skip holidays and return next open day', () => {
      const currentTime = new Date('2025-01-26 19:00:00'); // 일요일 19:00
      const result = getNextOpenTime(weekdayHours, currentTime, holidays);

      // 2025-01-27(월, 설날 공휴일) 제외 → 2025-01-28(화) 오픈
      expect(result).toBeInstanceOf(Date);
      expect(result.getDate()).toBe(28); // 화요일
    });

    // Test 13: 14일 내 오픈 없음 → null 반환
    test('should return null when no opening within maxDaysAhead', () => {
      const emptyHours = []; // 운영시간 없음
      const currentTime = new Date('2025-01-20 10:00:00');
      const result = getNextOpenTime(emptyHours, currentTime, [], 14);

      expect(result).toBeNull();
    });

    // Test 14: TypeError - centerHours가 배열이 아닌 경우
    test('should throw TypeError if centerHours is not an array', () => {
      expect(() => getNextOpenTime({}, new Date())).toThrow(TypeError);
    });

    // Test 15: RangeError - maxDaysAhead가 양수가 아닌 경우
    test('should throw RangeError for invalid maxDaysAhead', () => {
      expect(() => getNextOpenTime(weekdayHours, new Date(), [], 0)).toThrow(
        RangeError
      );
      expect(() => getNextOpenTime(weekdayHours, new Date(), [], -5)).toThrow(
        RangeError
      );
    });
  });

  describe('calculateOperatingScore', () => {
    // Test 16: 현재 운영 중 → 100점
    test('should return 100 for currently open center', () => {
      const currentTime = new Date('2025-01-20 10:00:00'); // 월요일 10:00
      const score = calculateOperatingScore(weekdayHours, currentTime);
      expect(score).toBe(100);
    });

    // Test 17: 1시간 이내 오픈 → 80점
    test('should return 80 for opening within 1 hour', () => {
      const currentTime = new Date('2025-01-20 08:30:00'); // 30분 후 오픈
      const score = calculateOperatingScore(weekdayHours, currentTime);
      expect(score).toBe(80);
    });

    // Test 18: 3시간 이내 오픈 → 60점
    test('should return 60 for opening within 3 hours', () => {
      const currentTime = new Date('2025-01-20 06:30:00'); // 2.5시간 후 오픈
      const score = calculateOperatingScore(weekdayHours, currentTime);
      expect(score).toBe(60);
    });

    // Test 19: 6시간 이내 오픈 → 40점
    test('should return 40 for opening within 6 hours', () => {
      const currentTime = new Date('2025-01-20 04:00:00'); // 5시간 후 오픈
      const score = calculateOperatingScore(weekdayHours, currentTime);
      expect(score).toBe(40);
    });

    // Test 20: 24시간 이내 오픈 → 20점
    test('should return 20 for opening within 24 hours', () => {
      const currentTime = new Date('2025-01-20 19:00:00'); // 다음날 14시간 후 오픈
      const score = calculateOperatingScore(weekdayHours, currentTime);
      expect(score).toBe(20);
    });

    // Test 21: 14일 내 오픈 없음 → 0점
    test('should return 0 when no opening within 14 days', () => {
      const emptyHours = [];
      const currentTime = new Date('2025-01-20 10:00:00');
      const score = calculateOperatingScore(emptyHours, currentTime);
      expect(score).toBe(0);
    });

    // Test 22: TypeError - centerHours가 배열이 아닌 경우
    test('should throw TypeError if centerHours is not an array', () => {
      expect(() => calculateOperatingScore({}, new Date())).toThrow(TypeError);
    });

    // Test 23: TypeError - currentTime이 잘못된 경우
    test('should throw TypeError for invalid currentTime', () => {
      expect(() => calculateOperatingScore(weekdayHours, 'invalid')).toThrow(
        TypeError
      );
    });
  });
});
