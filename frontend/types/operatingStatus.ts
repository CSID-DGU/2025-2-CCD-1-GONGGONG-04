/**
 * 마음이음 - 운영 상태 타입 정의
 *
 * Sprint 2: 통합 정보 제공 - 실시간 운영 상태 표시
 *
 * @description 센터의 운영 상태 관련 타입 정의
 */

/**
 * 운영 상태 타입
 */
export type OperatingStatus =
  | 'NO_INFO'       // 운영 정보 없음
  | 'TEMP_CLOSED'   // 임시 휴무
  | 'HOLIDAY'       // 휴무일
  | 'OPEN'          // 운영 중
  | 'CLOSING_SOON'  // 곧 마감
  | 'CLOSED';       // 마감

/**
 * 운영 상태 API 응답
 */
export interface OperatingStatusResponse {
  center_id: number;
  center_name: string;
  current_status: {
    status: OperatingStatus;
    message: string;
  };
  current_time: string;
  next_open: {
    date: string;
    day_name: string;
    open_time: string | null;
  } | null;
  weekly_hours: OperatingHour[];
  upcoming_holidays: Holiday[];
}

/**
 * 요일별 운영시간
 */
export interface OperatingHour {
  dayOfWeek: number;     // 0 (일요일) ~ 6 (토요일)
  dayName: string;       // 예: "월요일", "화요일"
  openTime: string;      // HH:mm 형식 (예: "09:00")
  closeTime: string;     // HH:mm 형식 (예: "18:00")
  isOpen: boolean;       // 운영 여부
}

/**
 * 휴무일 정보
 */
export interface Holiday {
  date: string;          // ISO 8601 형식 (예: "2025-01-01")
  name: string;          // 휴무일 이름 (예: "신정")
  type: 'public' | 'regular' | 'temporary';
}

/**
 * 운영 상태 배지 크기
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * 휴무일 타입 한글 변환
 */
export const holidayTypeLabels: Record<Holiday['type'], string> = {
  public: '공휴일',
  regular: '정기휴무',
  temporary: '임시휴무',
};

/**
 * 운영 상태 한글 레이블
 */
export const operatingStatusLabels: Record<OperatingStatus, string> = {
  NO_INFO: '정보 없음',
  TEMP_CLOSED: '임시 휴무',
  HOLIDAY: '휴무일',
  OPEN: '운영 중',
  CLOSING_SOON: '곧 마감',
  CLOSED: '마감',
};
