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

/**
 * Sprint 2 - Day 10: Operating status type (enhanced)
 */
export type OperatingStatusType =
  | 'OPEN'
  | 'CLOSING_SOON'
  | 'CLOSED'
  | 'HOLIDAY'
  | 'TEMP_CLOSED'
  | 'NO_INFO';

/**
 * Sprint 2 - Day 10: Center search data interface
 */
export interface CenterSearchData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  walkTime: string;
  operatingStatus: OperatingStatusType;
  closingTime?: string;
  nextOpenDate?: string;
  avgRating: number;
  reviewCount: number;
  centerType: string;
  roadAddress: string;
  phoneNumber?: string;
}

/**
 * Sprint 2 - Day 10: Center search API response
 */
export interface CenterSearchResponse {
  centers: CenterSearchData[];
  total: number;
  radius?: string;
  userLocation?: {
    lat: number;
    lng: number;
  };
  hasMore?: boolean;
  nextOffset?: number | null;
}

/**
 * Sprint 2 - Day 10: CenterListItem Props
 */
export interface CenterListItemProps {
  center: CenterSearchData;
  onSelect?: (center: CenterSearchData) => void;
  isHighlighted?: boolean;
  className?: string;
}

/**
 * Sprint 2 - Day 10: CenterList Props
 */
export interface CenterListProps {
  centers: CenterSearchData[];
  onSelectCenter?: (center: CenterSearchData) => void;
  selectedCenterId?: number | null;
  isLoading?: boolean;
  error?: string;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  className?: string;
}
