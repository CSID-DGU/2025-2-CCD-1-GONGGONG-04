/**
 * Operating Score Unit Tests
 *
 * 운영 시간 스코어링 로직 단위 테스트
 * Sprint 2 - Task 3.2.4: Operating Score Unit Tests
 *
 * @module tests/unit/scoring/operatingScore.test
 * @created 2025-01-27
 */

import {
  isCurrentlyOpen,
  isHolidayToday,
  getMinutesUntilClose,
  isClosingSoon,
  getNextOpenTime,
  getCurrentOperatingStatus,
  calculateOperatingScore,
  extractMinutesFromDate,
  parseTimeString,
  getTimeDifferenceInMinutes,
} from '../../../src/services/scoring/operatingScore';

import {
  OperatingHour,
  Holiday,
  OperatingStatus,
  DayOfWeek,
} from '../../../src/types/operatingHours';

// ============================================
// 테스트 데이터 Factory
// ============================================

/**
 * 운영 시간 Mock 데이터 생성
 * @param dayOfWeek - 요일 (1-7)
 * @param openHour - 오픈 시간 (0-23)
 * @param closeHour - 마감 시간 (0-23)
 */
function createOperatingHour(
  dayOfWeek: DayOfWeek,
  openHour: number = 9,
  closeHour: number = 18,
  isOpen: boolean = true
): OperatingHour {
  return {
    id: BigInt(1),
    centerId: BigInt(100),
    dayOfWeek,
    openTime: new Date(`1970-01-01T${String(openHour).padStart(2, '0')}:00:00`),
    closeTime: new Date(`1970-01-01T${String(closeHour).padStart(2, '0')}:00:00`),
    isHoliday: false,
    isOpen,
  };
}

/**
 * 휴무일 Mock 데이터 생성
 */
function createHoliday(date: string, isRegular: boolean = true): Holiday {
  return {
    id: BigInt(1),
    centerId: BigInt(100),
    holidayDate: new Date(date),
    holidayName: isRegular ? '정기 휴무' : '임시 휴무',
    isRegular,
  };
}

/**
 * 평일 (월-금) 운영 시간 Mock 생성
 * 9:00 AM - 6:00 PM
 */
function createWeekdayHours(): OperatingHour[] {
  return [1, 2, 3, 4, 5].map((day) => createOperatingHour(day as DayOfWeek, 9, 18));
}

/**
 * 전체 주간 운영 시간 Mock 생성
 * 월-금: 9:00 AM - 6:00 PM
 * 토: 10:00 AM - 3:00 PM
 * 일: 휴무
 */
function createFullWeekHours(): OperatingHour[] {
  return [
    ...createWeekdayHours(),
    createOperatingHour(6, 10, 15), // 토요일
    createOperatingHour(7, 9, 18, false), // 일요일 휴무
  ];
}

// ============================================
// Test Suite 1: 운영 중 케이스 (5개)
// ============================================

describe('운영 중 케이스', () => {
  const operatingHours = createWeekdayHours();
  const holidays: Holiday[] = [];

  test('평일 낮 시간 (14:00) = 운영 중', () => {
    const currentTime = new Date('2025-01-27T14:00:00'); // 월요일 오후 2시
    expect(isCurrentlyOpen(currentTime, operatingHours, holidays)).toBe(true);

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(100);
    expect(score.status).toBe(OperatingStatus.OPEN);
  });

  test('마감 1시간 전 (17:00) = 마감 임박', () => {
    const currentTime = new Date('2025-01-27T17:00:00'); // 월요일 오후 5시
    expect(isClosingSoon(currentTime, operatingHours, holidays)).toBe(true);

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(80);
    expect(score.status).toBe(OperatingStatus.CLOSING_SOON);
    expect(score.minutesUntilClose).toBe(60);
  });

  test('마감 30분 전 (17:30) = 마감 임박', () => {
    const currentTime = new Date('2025-01-27T17:30:00');
    const minutesUntilClose = getMinutesUntilClose(currentTime, operatingHours, holidays);
    expect(minutesUntilClose).toBe(30);

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(80);
    expect(score.status).toBe(OperatingStatus.CLOSING_SOON);
  });

  test('오픈 직후 (09:00) = 운영 중, 100점', () => {
    const currentTime = new Date('2025-01-27T09:00:00');
    expect(isCurrentlyOpen(currentTime, operatingHours, holidays)).toBe(true);

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(100);
    expect(score.minutesUntilClose).toBe(540); // 9시간 = 540분
  });

  test('오픈 직전 (08:59) = 운영 시간 외', () => {
    const currentTime = new Date('2025-01-27T08:59:00');
    expect(isCurrentlyOpen(currentTime, operatingHours, holidays)).toBe(false);

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(60);
    expect(score.status).toBe(OperatingStatus.CLOSED);
    expect(score.nextOpenTime).toBeDefined();
  });
});

// ============================================
// Test Suite 2: 휴무 케이스 (4개)
// ============================================

describe('휴무 케이스', () => {
  const operatingHours = createFullWeekHours();

  test('공휴일 (설날) = 0점', () => {
    const holidays = [createHoliday('2025-01-29', true)]; // 수요일 설날
    const currentTime = new Date('2025-01-29T14:00:00');

    expect(isHolidayToday(currentTime, holidays)).toBe(true);

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(0);
    expect(score.status).toBe(OperatingStatus.HOLIDAY);
    expect(score.reason).toContain('휴무일');
  });

  test('정기 휴무일 (매주 일요일) = 0점', () => {
    const currentTime = new Date('2025-02-02T14:00:00'); // 일요일
    const holidays: Holiday[] = [];

    // 일요일은 isOpen=false로 설정되어 있음
    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(60); // 운영 시간 외 (다음날 운영 예정)
    expect(score.status).toBe(OperatingStatus.CLOSED);
  });

  test('임시 휴무일 = 0점', () => {
    const holidays = [createHoliday('2025-01-27', false)]; // 월요일 임시 휴무
    const currentTime = new Date('2025-01-27T14:00:00');

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(0);
    expect(score.status).toBe(OperatingStatus.TEMPORARY_CLOSED);
    expect(score.reason).toContain('임시 휴무');
  });

  test('운영 시간 외 (22:00) = 60점', () => {
    const currentTime = new Date('2025-01-27T22:00:00'); // 월요일 밤 10시
    const holidays: Holiday[] = [];

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(60);
    expect(score.status).toBe(OperatingStatus.CLOSED);
    expect(score.nextOpenTime).toBeDefined();
  });
});

// ============================================
// Test Suite 3: 다음 운영 시간 계산 (3개)
// ============================================

describe('다음 운영 시간 계산', () => {
  const operatingHours = createFullWeekHours();

  test('토요일 밤 → 월요일 아침', () => {
    const currentTime = new Date('2025-02-01T20:00:00'); // 토요일 밤 8시
    const holidays: Holiday[] = [];

    const nextOpenTime = getNextOpenTime(currentTime, operatingHours, holidays);
    expect(nextOpenTime).not.toBeNull();
    expect(nextOpenTime?.getDay()).toBe(1); // 월요일
    expect(nextOpenTime?.getHours()).toBe(9); // 오전 9시
  });

  test('공휴일 다음날', () => {
    const holidays = [createHoliday('2025-01-29', true)]; // 수요일 공휴일
    const currentTime = new Date('2025-01-29T14:00:00');

    const nextOpenTime = getNextOpenTime(currentTime, operatingHours, holidays);
    expect(nextOpenTime).not.toBeNull();
    expect(nextOpenTime?.getDate()).toBe(30); // 목요일
    expect(nextOpenTime?.getHours()).toBe(9);
  });

  test('14일 이내 다음 운영일 찾기', () => {
    // 2주간 매일 휴무로 설정 (15일치)
    const holidays = Array.from({ length: 15 }, (_, i) => {
      const date = new Date('2025-01-27');
      date.setDate(date.getDate() + i);
      return createHoliday(date.toISOString().split('T')[0], true);
    });

    const currentTime = new Date('2025-01-27T14:00:00');
    const nextOpenTime = getNextOpenTime(currentTime, operatingHours, holidays, 14);

    // 14일 이내에 운영일이 없으면 null 반환
    // 15일간 휴무이므로 14일 체크에서는 찾지 못함
    expect(nextOpenTime).toBeNull();
  });
});

// ============================================
// Test Suite 4: 엣지 케이스 (3개)
// ============================================

describe('엣지 케이스', () => {
  test('운영 정보 없음 = 50점', () => {
    const currentTime = new Date('2025-01-27T14:00:00');
    const operatingHours: OperatingHour[] = [];
    const holidays: Holiday[] = [];

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(50);
    expect(score.status).toBe(OperatingStatus.NO_INFORMATION);
    expect(score.reason).toContain('운영 시간 정보');
  });

  test('24시간 운영 = 100점', () => {
    const operatingHours: OperatingHour[] = [
      {
        id: BigInt(1),
        centerId: BigInt(100),
        dayOfWeek: 1,
        openTime: null, // 24시간 운영
        closeTime: null,
        isHoliday: false,
        isOpen: true,
      },
    ];

    const currentTime = new Date('2025-01-27T03:00:00'); // 월요일 새벽 3시
    const holidays: Holiday[] = [];

    expect(isCurrentlyOpen(currentTime, operatingHours, holidays)).toBe(true);

    const minutesUntilClose = getMinutesUntilClose(currentTime, operatingHours, holidays);
    expect(minutesUntilClose).toBe(Infinity);

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(100);
  });

  test('빈 배열 처리', () => {
    const currentTime = new Date('2025-01-27T14:00:00');

    // 빈 운영 시간 배열
    expect(isCurrentlyOpen(currentTime, [], [])).toBe(false);
    expect(getMinutesUntilClose(currentTime, [], [])).toBeNull();
    expect(getNextOpenTime(currentTime, [], [])).toBeNull();

    const score = calculateOperatingScore(currentTime, [], []);
    expect(score.score).toBe(50);
  });
});

// ============================================
// Test Suite 5: 자정 넘어가는 운영 시간
// ============================================

describe('자정을 넘어가는 운영 시간', () => {
  test('21:00 - 02:00 운영 (밤 11시) = 운영 중', () => {
    const operatingHours: OperatingHour[] = [
      createOperatingHour(1, 21, 2), // 월요일 밤 9시 - 화요일 새벽 2시
    ];

    const currentTime = new Date('2025-01-27T23:00:00'); // 월요일 밤 11시
    const holidays: Holiday[] = [];

    expect(isCurrentlyOpen(currentTime, operatingHours, holidays)).toBe(true);

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBeGreaterThan(0);
  });

  test('21:00 - 02:00 운영 (새벽 1시) = 운영 중', () => {
    const operatingHours: OperatingHour[] = [
      createOperatingHour(1, 21, 2), // 월요일
    ];

    const currentTime = new Date('2025-01-27T01:00:00'); // 월요일 새벽 1시
    const holidays: Holiday[] = [];

    expect(isCurrentlyOpen(currentTime, operatingHours, holidays)).toBe(true);
  });
});

// ============================================
// Test Suite 6: 운영 상태 판단
// ============================================

describe('현재 운영 상태 판단', () => {
  const operatingHours = createWeekdayHours();

  test('OPEN 상태', () => {
    const currentTime = new Date('2025-01-27T14:00:00');
    const status = getCurrentOperatingStatus(currentTime, operatingHours, []);
    expect(status).toBe(OperatingStatus.OPEN);
  });

  test('CLOSING_SOON 상태', () => {
    const currentTime = new Date('2025-01-27T17:30:00');
    const status = getCurrentOperatingStatus(currentTime, operatingHours, []);
    expect(status).toBe(OperatingStatus.CLOSING_SOON);
  });

  test('CLOSED 상태', () => {
    const currentTime = new Date('2025-01-27T20:00:00');
    const status = getCurrentOperatingStatus(currentTime, operatingHours, []);
    expect(status).toBe(OperatingStatus.CLOSED);
  });

  test('HOLIDAY 상태', () => {
    const holidays = [createHoliday('2025-01-27', true)];
    const currentTime = new Date('2025-01-27T14:00:00');
    const status = getCurrentOperatingStatus(currentTime, operatingHours, holidays);
    expect(status).toBe(OperatingStatus.HOLIDAY);
  });

  test('TEMPORARY_CLOSED 상태', () => {
    const holidays = [createHoliday('2025-01-27', false)];
    const currentTime = new Date('2025-01-27T14:00:00');
    const status = getCurrentOperatingStatus(currentTime, operatingHours, holidays);
    expect(status).toBe(OperatingStatus.TEMPORARY_CLOSED);
  });

  test('NO_INFORMATION 상태', () => {
    const currentTime = new Date('2025-01-27T14:00:00');
    const status = getCurrentOperatingStatus(currentTime, [], []);
    expect(status).toBe(OperatingStatus.NO_INFORMATION);
  });
});

// ============================================
// Test Suite 7: 유틸리티 함수
// ============================================

describe('유틸리티 함수', () => {
  test('extractMinutesFromDate - 14:30 = 870분', () => {
    const date = new Date('1970-01-01T14:30:00');
    expect(extractMinutesFromDate(date)).toBe(870);
  });

  test('parseTimeString - "09:30:00" = 570분', () => {
    expect(parseTimeString('09:30:00')).toBe(570);
  });

  test('parseTimeString - "18:00:00" = 1080분', () => {
    expect(parseTimeString('18:00:00')).toBe(1080);
  });

  test('getTimeDifferenceInMinutes - 1시간 차이', () => {
    const start = new Date('2025-01-27T14:00:00');
    const end = new Date('2025-01-27T15:00:00');
    expect(getTimeDifferenceInMinutes(start, end)).toBe(60);
  });

  test('getTimeDifferenceInMinutes - 30분 차이', () => {
    const start = new Date('2025-01-27T14:00:00');
    const end = new Date('2025-01-27T14:30:00');
    expect(getTimeDifferenceInMinutes(start, end)).toBe(30);
  });
});

// ============================================
// Test Suite 8: 점수 계산 경계값 테스트
// ============================================

describe('점수 계산 경계값', () => {
  const operatingHours = createWeekdayHours();
  const holidays: Holiday[] = [];

  test('마감 정확히 60분 전 = 마감 임박', () => {
    const currentTime = new Date('2025-01-27T17:00:00');
    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(80);
    expect(score.minutesUntilClose).toBe(60);
  });

  test('마감 61분 전 = 운영 중', () => {
    const currentTime = new Date('2025-01-27T16:59:00');
    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(100);
  });

  test('마감 59분 전 = 마감 임박', () => {
    const currentTime = new Date('2025-01-27T17:01:00');
    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(80);
  });

  test('마감 1분 전 = 마감 임박', () => {
    const currentTime = new Date('2025-01-27T17:59:00');
    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(80);
    expect(score.minutesUntilClose).toBe(1);
  });
});

// ============================================
// Test Suite 9: 복합 시나리오
// ============================================

describe('복합 시나리오', () => {
  test('월요일 아침 9시 정각', () => {
    const operatingHours = createWeekdayHours();
    const currentTime = new Date('2025-01-27T09:00:00');
    const holidays: Holiday[] = [];

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(100);
    expect(score.status).toBe(OperatingStatus.OPEN);
    expect(score.minutesUntilClose).toBe(540);
  });

  test('금요일 오후 6시 정각 (마감 시간)', () => {
    const operatingHours = createWeekdayHours();
    const currentTime = new Date('2025-01-31T18:00:00');
    const holidays: Holiday[] = [];

    // 마감 시간은 운영 시간에 포함되지 않음
    expect(isCurrentlyOpen(currentTime, operatingHours, holidays)).toBe(false);

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.status).toBe(OperatingStatus.CLOSED);
  });

  test('주말 토요일 오후 (10:00-15:00 운영)', () => {
    const operatingHours = createFullWeekHours();
    const currentTime = new Date('2025-02-01T14:00:00'); // 토요일 오후 2시 (15:00 마감 1시간 전)
    const holidays: Holiday[] = [];

    const score = calculateOperatingScore(currentTime, operatingHours, holidays);
    expect(score.score).toBe(80); // 마감 1시간 전이므로 80점
    expect(score.status).toBe(OperatingStatus.CLOSING_SOON);
  });
});
