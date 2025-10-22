/**
 * Center Types
 * 센터 관련 타입 정의
 */

/**
 * 센터 상세 정보 인터페이스
 */
export interface CenterDetail {
  id: number;
  center_name: string;
  center_type: string;
  contact: {
    phone: string | null;
    road_address: string;
    jibun_address: string | null;
  };
  location: {
    latitude: number;
    longitude: number;
    distance?: number;
  };
  business_content: string | null;
  stats: {
    avg_rating: number;
    review_count: number;
    favorite_count: number;
    view_count: number;
  };
}

/**
 * API 에러 응답 타입
 */
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * 센터 운영 상태
 */
export type OperatingStatus = 'operating' | 'closed' | 'unknown';

/**
 * 사용자 위치 타입
 */
export interface UserLocation {
  lat: number;
  lng: number;
}

/**
 * Sprint 3: 의료진 정보
 */
export interface Staff {
  staff_type: string;
  staff_count: number;
  description: string | null;
}

/**
 * Sprint 3: 의료진 정보 API 응답
 */
export interface StaffResponse {
  center_id: number;
  staff: Staff[];
  total_staff: number;
  has_data: boolean;
}

/**
 * Sprint 3: 프로그램 정보
 */
export interface Program {
  id: number;
  program_name: string;
  program_type: string;
  target_group: string;
  description: string | null;
  is_online_available: boolean;
  is_free: boolean;
  fee_amount: number | null;
  capacity: number | null;
  duration_minutes: number | null;
}

/**
 * Sprint 3: 프로그램 정보 API 응답
 */
export interface ProgramResponse {
  center_id: number;
  programs: Program[];
  total_count: number;
  has_data: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
