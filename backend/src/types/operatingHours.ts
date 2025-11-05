/**
 * Operating Hours Type Definitions
 *
 * 운영 시간 및 휴무일 관련 타입 정의
 * Sprint 2 - Task 3.2.1: Operating Hours Data Model Verification
 *
 * @module types/operatingHours
 * @created 2025-01-27
 */

/**
 * 요일 타입 (1-7: 월요일-일요일)
 *
 * MySQL dayOfWeek 컬럼과 매칭:
 * - 1: 월요일 (Monday)
 * - 2: 화요일 (Tuesday)
 * - 3: 수요일 (Wednesday)
 * - 4: 목요일 (Thursday)
 * - 5: 금요일 (Friday)
 * - 6: 토요일 (Saturday)
 * - 7: 일요일 (Sunday)
 *
 * @note JavaScript Date.getDay()는 0(일요일)-6(토요일)을 반환하므로 변환 필요
 */
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * 휴무일 타입
 *
 * - PUBLIC: 공휴일 (국경일, 법정 공휴일)
 * - REGULAR: 정기 휴무일 (매주 특정 요일)
 * - TEMPORARY: 임시 휴무일 (특별 휴무, 단기 휴무)
 *
 * @note 현재 Prisma schema에는 isRegular (boolean) 필드 사용 중
 * @todo Schema migration 필요: isRegular → type enum으로 변경
 */
export type HolidayType = 'PUBLIC' | 'REGULAR' | 'TEMPORARY';

/**
 * 운영 시간 인터페이스
 *
 * Prisma CenterOperatingHour 모델과 매칭
 */
export interface OperatingHour {
  /** 운영 시간 ID */
  id: bigint;

  /** 센터 ID (외래키) */
  centerId: bigint;

  /** 요일 (1-7: 월-일) */
  dayOfWeek: DayOfWeek;

  /** 오픈 시간 (HH:mm:ss 형식) */
  openTime: Date | null;

  /** 마감 시간 (HH:mm:ss 형식) */
  closeTime: Date | null;

  /** 휴무일 여부 */
  isHoliday: boolean;

  /** 운영 여부 */
  isOpen: boolean;
}

/**
 * 휴무일 인터페이스
 *
 * Prisma CenterHoliday 모델과 매칭
 */
export interface Holiday {
  /** 휴무일 ID */
  id: bigint;

  /** 센터 ID (외래키) */
  centerId: bigint;

  /** 휴무일 날짜 */
  holidayDate: Date | null;

  /** 휴무일 이름 (예: 설날, 추석) */
  holidayName: string | null;

  /** 정기 휴무 여부 */
  isRegular: boolean;
}

/**
 * 운영 상태 enum
 *
 * 센터의 현재 운영 상태를 나타냄
 */
export enum OperatingStatus {
  /** 현재 운영 중 */
  OPEN = 'OPEN',

  /** 마감 임박 (1시간 이내) */
  CLOSING_SOON = 'CLOSING_SOON',

  /** 운영 시간 외 */
  CLOSED = 'CLOSED',

  /** 휴무일 */
  HOLIDAY = 'HOLIDAY',

  /** 임시 휴무 */
  TEMPORARY_CLOSED = 'TEMPORARY_CLOSED',

  /** 운영 정보 없음 */
  NO_INFORMATION = 'NO_INFORMATION',
}

/**
 * 운영 시간 점수 계산 결과 인터페이스
 */
export interface OperatingScoreResult {
  /** 운영 시간 점수 (0-100) */
  score: number;

  /** 현재 운영 상태 */
  status: OperatingStatus;

  /** 다음 운영 시작 시간 (운영 중이 아닐 경우) */
  nextOpenTime?: Date;

  /** 마감까지 남은 분 (운영 중일 경우) */
  minutesUntilClose?: number;

  /** 점수 산출 이유 */
  reason: string;
}

/**
 * 시간 문자열 파싱 결과 인터페이스
 */
export interface ParsedTime {
  /** 시 (0-23) */
  hours: number;

  /** 분 (0-59) */
  minutes: number;

  /** 초 (0-59) */
  seconds: number;
}

/**
 * JavaScript Date.getDay() (0-6) → DayOfWeek (1-7) 변환
 *
 * @param jsDay - JavaScript Date.getDay() 값 (0=일요일, 6=토요일)
 * @returns DayOfWeek (1=월요일, 7=일요일)
 *
 * @example
 * ```typescript
 * const today = new Date();
 * const dayOfWeek = convertJsDayToDayOfWeek(today.getDay());
 * console.log(dayOfWeek); // 1-7
 * ```
 */
export function convertJsDayToDayOfWeek(jsDay: number): DayOfWeek {
  // JavaScript: 0(일) 1(월) 2(화) 3(수) 4(목) 5(금) 6(토)
  // DayOfWeek: 1(월) 2(화) 3(수) 4(목) 5(금) 6(토) 7(일)

  if (jsDay === 0) {
    return 7; // 일요일
  }

  return jsDay as DayOfWeek;
}

/**
 * DayOfWeek (1-7) → JavaScript Date.getDay() (0-6) 변환
 *
 * @param dayOfWeek - DayOfWeek 값 (1=월요일, 7=일요일)
 * @returns JavaScript Date.getDay() 값 (0=일요일, 6=토요일)
 *
 * @example
 * ```typescript
 * const jsDay = convertDayOfWeekToJsDay(1); // 월요일
 * console.log(jsDay); // 1
 * ```
 */
export function convertDayOfWeekToJsDay(dayOfWeek: DayOfWeek): number {
  // DayOfWeek: 1(월) 2(화) 3(수) 4(목) 5(금) 6(토) 7(일)
  // JavaScript: 0(일) 1(월) 2(화) 3(수) 4(목) 5(금) 6(토)

  if (dayOfWeek === 7) {
    return 0; // 일요일
  }

  return dayOfWeek;
}

/**
 * 요일 이름 가져오기 (한국어)
 *
 * @param dayOfWeek - DayOfWeek 값 (1-7)
 * @returns 한국어 요일 이름
 *
 * @example
 * ```typescript
 * console.log(getDayName(1)); // "월요일"
 * console.log(getDayName(7)); // "일요일"
 * ```
 */
export function getDayName(dayOfWeek: DayOfWeek): string {
  const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
  return dayNames[dayOfWeek - 1];
}

/**
 * 요일 약어 가져오기 (한국어)
 *
 * @param dayOfWeek - DayOfWeek 값 (1-7)
 * @returns 한국어 요일 약어
 *
 * @example
 * ```typescript
 * console.log(getDayShortName(1)); // "월"
 * console.log(getDayShortName(7)); // "일"
 * ```
 */
export function getDayShortName(dayOfWeek: DayOfWeek): string {
  const dayShortNames = ['월', '화', '수', '목', '금', '토', '일'];
  return dayShortNames[dayOfWeek - 1];
}

/**
 * 현재 요일 가져오기 (DayOfWeek 타입)
 *
 * @returns 현재 요일 (1-7)
 *
 * @example
 * ```typescript
 * const today = getCurrentDayOfWeek();
 * console.log(getDayName(today)); // "금요일"
 * ```
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  const now = new Date();
  return convertJsDayToDayOfWeek(now.getDay());
}
