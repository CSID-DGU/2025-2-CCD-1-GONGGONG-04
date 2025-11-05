/**
 * Test Data Factory
 *
 * 테스트용 Mock 데이터 생성 팩토리
 * Sprint 2 - Task 3.3.3: Test Data Factory
 *
 * @module tests/fixtures/factories
 * @created 2025-01-27
 */

import { faker } from '@faker-js/faker';
import { DayOfWeek } from '../../src/types/operatingHours';

// ============================================
// 센터 관련 Factories
// ============================================

/**
 * 센터 기본 정보 생성
 */
export interface MockCenter {
  id: bigint;
  centerName: string;
  centerType: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  isActive: boolean;
  avgRating: number;
  reviewCount: number;
  operatingHours?: MockOperatingHour[];
  holidays?: MockHoliday[];
  staff?: MockStaff[];
  programs?: MockProgram[];
}

/**
 * 센터 Mock 데이터 생성
 *
 * @param overrides - 기본값을 덮어쓸 속성
 * @returns Mock 센터 데이터
 */
export function createCenter(overrides?: Partial<MockCenter>): MockCenter {
  return {
    id: BigInt(faker.number.int({ min: 1, max: 10000 })),
    centerName: `${faker.location.city()} 정신건강센터`,
    centerType: faker.helpers.arrayElement([
      '정신건강의학과',
      '정신건강복지센터',
      '상담센터',
      '심리상담센터',
    ]),
    roadAddress: faker.location.streetAddress(),
    latitude: faker.location.latitude({ max: 38, min: 33 }), // 한국 위도
    longitude: faker.location.longitude({ max: 132, min: 124 }), // 한국 경도
    phoneNumber: '02-' + faker.string.numeric(4) + '-' + faker.string.numeric(4),
    isActive: true,
    avgRating: parseFloat(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }).toFixed(1)),
    reviewCount: faker.number.int({ min: 0, max: 500 }),
    ...overrides,
  };
}

// ============================================
// 운영 시간 관련 Factories
// ============================================

export interface MockOperatingHour {
  id: bigint;
  centerId: bigint;
  dayOfWeek: DayOfWeek;
  openTime: Date | null;
  closeTime: Date | null;
  isHoliday: boolean;
  isOpen: boolean;
}

/**
 * 운영 시간 Mock 데이터 생성
 *
 * @param dayOfWeek - 요일 (1-7)
 * @param openHour - 오픈 시간 (기본값: 9)
 * @param closeHour - 마감 시간 (기본값: 18)
 * @param overrides - 기본값을 덮어쓸 속성
 * @returns Mock 운영 시간 데이터
 */
export function createOperatingHour(
  dayOfWeek: DayOfWeek,
  openHour: number = 9,
  closeHour: number = 18,
  overrides?: Partial<MockOperatingHour>
): MockOperatingHour {
  return {
    id: BigInt(faker.number.int({ min: 1, max: 10000 })),
    centerId: BigInt(100),
    dayOfWeek,
    openTime: new Date(`1970-01-01T${String(openHour).padStart(2, '0')}:00:00`),
    closeTime: new Date(`1970-01-01T${String(closeHour).padStart(2, '0')}:00:00`),
    isHoliday: false,
    isOpen: true,
    ...overrides,
  };
}

/**
 * 평일 운영 시간 생성 (월-금)
 *
 * @param openHour - 오픈 시간 (기본값: 9)
 * @param closeHour - 마감 시간 (기본값: 18)
 * @returns 평일 운영 시간 배열
 */
export function createWeekdayHours(
  openHour: number = 9,
  closeHour: number = 18
): MockOperatingHour[] {
  return [1, 2, 3, 4, 5].map((day) =>
    createOperatingHour(day as DayOfWeek, openHour, closeHour)
  );
}

/**
 * 전체 주간 운영 시간 생성 (월-일)
 *
 * @param includeWeekend - 주말 포함 여부 (기본값: true)
 * @returns 전체 주간 운영 시간 배열
 */
export function createFullWeekHours(includeWeekend: boolean = true): MockOperatingHour[] {
  const weekdayHours = createWeekdayHours();

  if (!includeWeekend) {
    return weekdayHours;
  }

  return [
    ...weekdayHours,
    createOperatingHour(6, 10, 15), // 토요일 (10:00-15:00)
    createOperatingHour(7, 9, 18, { isOpen: false }), // 일요일 휴무
  ];
}

// ============================================
// 휴무일 관련 Factories
// ============================================

export interface MockHoliday {
  id: bigint;
  centerId: bigint;
  holidayDate: Date | null;
  holidayName: string | null;
  isRegular: boolean;
}

/**
 * 휴무일 Mock 데이터 생성
 *
 * @param date - 휴무일 날짜 (YYYY-MM-DD 형식)
 * @param isRegular - 정기 휴무 여부 (기본값: true)
 * @param overrides - 기본값을 덮어쓸 속성
 * @returns Mock 휴무일 데이터
 */
export function createHoliday(
  date: string,
  isRegular: boolean = true,
  overrides?: Partial<MockHoliday>
): MockHoliday {
  const holidayNames = isRegular
    ? ['정기 휴무', '공휴일', '설날', '추석', '광복절']
    : ['임시 휴무', '특별 휴무', '시설 점검'];

  return {
    id: BigInt(faker.number.int({ min: 1, max: 10000 })),
    centerId: BigInt(100),
    holidayDate: new Date(date),
    holidayName: faker.helpers.arrayElement(holidayNames),
    isRegular,
    ...overrides,
  };
}

/**
 * 주요 공휴일 생성 (2025년 기준)
 *
 * @returns 주요 공휴일 배열
 */
export function createPublicHolidays2025(): MockHoliday[] {
  return [
    createHoliday('2025-01-01', true, { holidayName: '신정' }),
    createHoliday('2025-01-28', true, { holidayName: '설날 전날' }),
    createHoliday('2025-01-29', true, { holidayName: '설날' }),
    createHoliday('2025-01-30', true, { holidayName: '설날 다음날' }),
    createHoliday('2025-03-01', true, { holidayName: '삼일절' }),
    createHoliday('2025-05-05', true, { holidayName: '어린이날' }),
    createHoliday('2025-06-06', true, { holidayName: '현충일' }),
    createHoliday('2025-08-15', true, { holidayName: '광복절' }),
    createHoliday('2025-10-03', true, { holidayName: '개천절' }),
    createHoliday('2025-10-09', true, { holidayName: '한글날' }),
    createHoliday('2025-12-25', true, { holidayName: '크리스마스' }),
  ];
}

// ============================================
// 직원 관련 Factories
// ============================================

export interface MockStaff {
  id: bigint;
  centerId: bigint;
  staffType: string;
  staffCount: number;
  description: string | null;
}

/**
 * 직원 Mock 데이터 생성
 *
 * @param staffType - 직원 유형/자격증
 * @param staffCount - 직원 수 (기본값: 1)
 * @param overrides - 기본값을 덮어쓸 속성
 * @returns Mock 직원 데이터
 */
export function createStaff(
  staffType: string,
  staffCount: number = 1,
  overrides?: Partial<MockStaff>
): MockStaff {
  return {
    id: BigInt(faker.number.int({ min: 1, max: 10000 })),
    centerId: BigInt(100),
    staffType,
    staffCount,
    description: null,
    ...overrides,
  };
}

/**
 * 다양한 전문 인력 구성 생성
 *
 * @param level - 전문성 수준 ('high' | 'medium' | 'low')
 * @returns 직원 배열
 */
export function createStaffComposition(level: 'high' | 'medium' | 'low' = 'medium'): MockStaff[] {
  if (level === 'high') {
    // 고급 전문 인력 (종합병원 수준)
    return [
      createStaff('정신건강의학과 전문의', 2),
      createStaff('정신건강전문요원 1급', 3),
      createStaff('임상심리사 1급', 4),
      createStaff('사회복지사 1급', 2),
    ];
  }

  if (level === 'medium') {
    // 중급 전문 인력 (정신건강복지센터 수준)
    return [
      createStaff('정신건강전문요원 2급', 2),
      createStaff('임상심리사 2급', 3),
      createStaff('사회복지사 1급', 3),
    ];
  }

  // 일반 인력 (상담센터 수준)
  return [
    createStaff('상담심리사 1급', 1),
    createStaff('상담심리사 2급', 2),
  ];
}

// ============================================
// 프로그램 관련 Factories
// ============================================

export interface MockProgram {
  id: bigint;
  centerId: bigint;
  programName: string;
  programType: string | null;
  targetGroup: string | null;
  description: string | null;
  isOnlineAvailable: boolean;
  isFree: boolean;
  feeAmount: number | null;
  isActive: boolean;
}

/**
 * 프로그램 Mock 데이터 생성
 *
 * @param overrides - 기본값을 덮어쓸 속성
 * @returns Mock 프로그램 데이터
 */
export function createProgram(overrides?: Partial<MockProgram>): MockProgram {
  const programTypes = [
    '개인상담',
    '집단상담',
    '심리검사',
    '정신건강교육',
    '인지행동치료',
    '미술치료',
    '음악치료',
  ];

  const targetGroups = ['성인', '청소년', '아동', '노인', '직장인', '대학생', '부모'];

  return {
    id: BigInt(faker.number.int({ min: 1, max: 10000 })),
    centerId: BigInt(100),
    programName: faker.helpers.arrayElement(programTypes),
    programType: faker.helpers.arrayElement(programTypes),
    targetGroup: faker.helpers.arrayElement(targetGroups),
    description: faker.lorem.sentence(),
    isOnlineAvailable: faker.datatype.boolean(),
    isFree: faker.datatype.boolean(),
    feeAmount: faker.datatype.boolean()
      ? null
      : faker.number.int({ min: 10000, max: 100000, multipleOf: 10000 }),
    isActive: true,
    ...overrides,
  };
}

/**
 * 다양한 프로그램 세트 생성
 *
 * @param count - 프로그램 개수 (기본값: 5)
 * @returns 프로그램 배열
 */
export function createProgramSet(count: number = 5): MockProgram[] {
  return Array.from({ length: count }, () => createProgram());
}

// ============================================
// 복합 데이터 Factories
// ============================================

/**
 * 완전한 센터 데이터 생성 (운영시간, 휴무일, 직원, 프로그램 포함)
 *
 * @param options - 센터 구성 옵션
 * @returns 완전한 센터 Mock 데이터
 */
export function createFullCenter(options?: {
  includeOperatingHours?: boolean;
  includeHolidays?: boolean;
  includeStaff?: boolean;
  includePrograms?: boolean;
  staffLevel?: 'high' | 'medium' | 'low';
  programCount?: number;
}): MockCenter {
  const {
    includeOperatingHours = true,
    includeHolidays = true,
    includeStaff = true,
    includePrograms = true,
    staffLevel = 'medium',
    programCount = 5,
  } = options || {};

  const center = createCenter();

  if (includeOperatingHours) {
    center.operatingHours = createFullWeekHours();
  }

  if (includeHolidays) {
    center.holidays = createPublicHolidays2025().slice(0, 3); // 최근 공휴일 3개
  }

  if (includeStaff) {
    center.staff = createStaffComposition(staffLevel);
  }

  if (includePrograms) {
    center.programs = createProgramSet(programCount);
  }

  return center;
}

/**
 * 특정 유형의 센터 생성
 *
 * @param type - 센터 유형
 * @returns 유형별 특성을 가진 센터 데이터
 */
export function createCenterByType(
  type: '종합병원' | '정신건강복지센터' | '상담센터'
): MockCenter {
  if (type === '종합병원') {
    return createFullCenter({
      staffLevel: 'high',
      programCount: 10,
    });
  }

  if (type === '정신건강복지센터') {
    return createFullCenter({
      staffLevel: 'medium',
      programCount: 7,
    });
  }

  // 상담센터
  return createFullCenter({
    staffLevel: 'low',
    programCount: 3,
  });
}

/**
 * 다수의 센터 데이터 생성
 *
 * @param count - 센터 개수
 * @param options - 센터 구성 옵션
 * @returns 센터 배열
 */
export function createMultipleCenters(
  count: number,
  options?: {
    includeOperatingHours?: boolean;
    includeStaff?: boolean;
    includePrograms?: boolean;
  }
): MockCenter[] {
  return Array.from({ length: count }, () => createFullCenter(options));
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 랜덤 날짜 생성 (특정 범위 내)
 *
 * @param start - 시작 날짜
 * @param end - 종료 날짜
 * @returns 랜덤 날짜
 */
export function randomDateBetween(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * 센터 ID 생성
 *
 * @returns 랜덤 센터 ID
 */
export function generateCenterId(): bigint {
  return BigInt(faker.number.int({ min: 1, max: 100000 }));
}

/**
 * 서울 좌표 생성
 *
 * @returns 서울 지역 위도/경도
 */
export function generateSeoulCoordinates(): { latitude: number; longitude: number } {
  return {
    latitude: parseFloat(faker.number.float({ min: 37.4, max: 37.7, fractionDigits: 6 }).toFixed(6)),
    longitude: parseFloat(faker.number.float({ min: 126.8, max: 127.2, fractionDigits: 6 }).toFixed(6)),
  };
}
