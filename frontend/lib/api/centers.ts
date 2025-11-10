/**
 * Centers API Client
 * 센터 관련 API 클라이언트
 */

import { CenterDetail, ApiError, UserLocation, StaffResponse, ProgramResponse } from '@/types/center';
import { OperatingStatusResponse } from '@/types/operatingStatus';

/**
 * API Base URL 결정
 * - 개발 환경: 항상 localhost 사용
 * - 프로덕션 (Docker): 서버 사이드는 내부 네트워크(backend:8080), 클라이언트는 브라우저용 URL
 */
const getApiBaseUrl = (): string => {
  const isServer = typeof window === 'undefined';
  const isDevelopment = process.env.NODE_ENV === 'development';

  const envBaseUrl = (
    (isServer ? process.env.API_BASE_URL : undefined) ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL
  );

  if (envBaseUrl) {
    return envBaseUrl.replace(/\/$/, '');
  }

  if (isServer) {
    return isDevelopment
      ? 'http://localhost:8080/api/v1'
      : 'http://backend:8080/api/v1';
  }

  return 'http://localhost:8080/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * API 에러 클래스
 */
export class CenterApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'CenterApiError';
    this.statusCode = statusCode;
  }
}

/**
 * 센터 상세 정보 조회
 * @param id - 센터 ID
 * @param userLocation - 사용자 위치 (선택)
 * @returns 센터 상세 정보
 * @throws CenterApiError
 */
export async function getCenterDetail(
  id: number,
  userLocation?: UserLocation
): Promise<CenterDetail> {
  try {
    // URL 구성
    const url = new URL(`${API_BASE_URL}/centers/${id}`);

    // 사용자 위치 쿼리 파라미터 추가
    if (userLocation) {
      url.searchParams.append('userLat', userLocation.lat.toString());
      url.searchParams.append('userLng', userLocation.lng.toString());
    }

    // API 요청
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Next.js 캐싱 설정 (SSR에서는 캐시 안 함)
      cache: 'no-store',
    });

    // 에러 처리
    if (!response.ok) {
      if (response.status === 404) {
        throw new CenterApiError('센터를 찾을 수 없습니다', 404);
      }

      if (response.status >= 500) {
        throw new CenterApiError('서버 오류가 발생했습니다', response.status);
      }

      // 기타 에러
      const errorData: ApiError = await response.json().catch(() => ({
        error: '알 수 없는 오류가 발생했습니다',
      }));

      throw new CenterApiError(
        errorData.message || errorData.error,
        response.status
      );
    }

    // 성공 응답 파싱
    const responseBody = await response.json();

    // 백엔드 응답 형식: { success: true, data: {...} }
    return responseBody.data;

  } catch (error) {
    // CenterApiError는 그대로 throw
    if (error instanceof CenterApiError) {
      throw error;
    }

    // 네트워크 에러 처리
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CenterApiError(
        '네트워크 연결을 확인해주세요',
        0
      );
    }

    // 기타 예상치 못한 에러
    throw new CenterApiError(
      '일시적인 오류가 발생했습니다',
      500
    );
  }
}

/**
 * 센터 운영 상태 조회
 * @param centerId - 센터 ID
 * @param date - 조회 날짜 (ISO 8601 형식, 선택)
 * @returns 운영 상태 정보
 * @throws CenterApiError
 */
export async function fetchOperatingStatus(
  centerId: number,
  date?: Date
): Promise<OperatingStatusResponse> {
  try {
    // URL 구성
    const url = new URL(`${API_BASE_URL}/centers/${centerId}/operating-status`);

    // 날짜 쿼리 파라미터 추가
    if (date) {
      url.searchParams.append('date', date.toISOString());
    }

    // API 요청
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 실시간 데이터이므로 캐싱 비활성화
      cache: 'no-store',
    });

    // 에러 처리
    if (!response.ok) {
      if (response.status === 404) {
        throw new CenterApiError('센터를 찾을 수 없습니다', 404);
      }

      if (response.status === 400) {
        throw new CenterApiError('잘못된 요청입니다', 400);
      }

      if (response.status >= 500) {
        throw new CenterApiError('서버 오류가 발생했습니다', response.status);
      }

      // 기타 에러
      const errorData: ApiError = await response.json().catch(() => ({
        error: '알 수 없는 오류가 발생했습니다',
      }));

      throw new CenterApiError(
        errorData.message || errorData.error,
        response.status
      );
    }

    // 성공 응답 파싱
    const responseBody = await response.json();
    const apiData = responseBody.data;

    // snake_case를 camelCase로 변환 (API 응답 형식 변환)
    const transformedData: OperatingStatusResponse = {
      center_id: apiData.center_id,
      center_name: apiData.center_name,
      current_status: apiData.current_status,
      current_time: apiData.current_time,
      next_open: apiData.next_open,
      weekly_hours: apiData.weekly_hours?.map((hour: any) => ({
        dayOfWeek: hour.day_of_week,
        dayName: hour.day_name,
        openTime: hour.open_time,
        closeTime: hour.close_time,
        isOpen: hour.is_open,
      })) || [],
      upcoming_holidays: apiData.upcoming_holidays?.map((holiday: any) => ({
        date: holiday.date,
        name: holiday.name,
        type: holiday.type,
      })) || [],
    };

    return transformedData;

  } catch (error) {
    // CenterApiError는 그대로 throw
    if (error instanceof CenterApiError) {
      throw error;
    }

    // 네트워크 에러 처리
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CenterApiError(
        '네트워크 연결을 확인해주세요',
        0
      );
    }

    // 기타 예상치 못한 에러
    throw new CenterApiError(
      '운영 상태를 불러오는데 실패했습니다',
      500
    );
  }
}

/**
 * 센터 의료진 현황 조회
 * @param centerId - 센터 ID
 * @returns 의료진 현황 정보
 * @throws CenterApiError
 */
export async function getCenterStaff(centerId: number): Promise<StaffResponse> {
  try {
    const url = `${API_BASE_URL}/centers/${centerId}/staff`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new CenterApiError('센터를 찾을 수 없습니다', 404);
      }

      if (response.status >= 500) {
        throw new CenterApiError('서버 오류가 발생했습니다', response.status);
      }

      const errorData: ApiError = await response.json().catch(() => ({
        error: '알 수 없는 오류가 발생했습니다',
      }));

      throw new CenterApiError(
        errorData.message || errorData.error,
        response.status
      );
    }

    const responseBody = await response.json();
    return responseBody.data;

  } catch (error) {
    if (error instanceof CenterApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CenterApiError(
        '네트워크 연결을 확인해주세요',
        0
      );
    }

    throw new CenterApiError(
      '의료진 정보를 불러오는데 실패했습니다',
      500
    );
  }
}

/**
 * 센터 프로그램 목록 조회
 * @param centerId - 센터 ID
 * @param filters - 필터 옵션
 * @returns 프로그램 목록 정보
 * @throws CenterApiError
 */
export async function getCenterPrograms(
  centerId: number,
  filters?: {
    target_group?: string;
    is_online?: boolean;
    is_free?: boolean;
  }
): Promise<ProgramResponse> {
  try {
    const url = new URL(`${API_BASE_URL}/centers/${centerId}/programs`);

    // 필터 쿼리 파라미터 추가
    if (filters?.target_group) {
      url.searchParams.append('target_group', filters.target_group);
    }

    if (filters?.is_online !== undefined) {
      url.searchParams.append('is_online', String(filters.is_online));
    }

    if (filters?.is_free !== undefined) {
      url.searchParams.append('is_free', String(filters.is_free));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new CenterApiError('센터를 찾을 수 없습니다', 404);
      }

      if (response.status >= 500) {
        throw new CenterApiError('서버 오류가 발생했습니다', response.status);
      }

      const errorData: ApiError = await response.json().catch(() => ({
        error: '알 수 없는 오류가 발생했습니다',
      }));

      throw new CenterApiError(
        errorData.message || errorData.error,
        response.status
      );
    }

    const responseBody = await response.json();
    return responseBody.data;

  } catch (error) {
    if (error instanceof CenterApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CenterApiError(
        '네트워크 연결을 확인해주세요',
        0
      );
    }

    throw new CenterApiError(
      '프로그램 정보를 불러오는데 실패했습니다',
      500
    );
  }
}

/**
 * 센터 데이터 타입 (지도 마커용)
 */
export interface CenterMarkerData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance: number; // meters
  walkTime: string; // "16분"
  operatingStatus: 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'HOLIDAY' | 'TEMP_CLOSED' | 'NO_INFO';
  closingTime?: string | null; // "18:00"
  nextOpenDate?: string | null; // "2025-01-16"
  avgRating: number;
  reviewCount: number;
  centerType: string;
  roadAddress: string;
  phoneNumber?: string | null;
}

/**
 * Centers API 응답 타입
 */
export interface CentersListResponse {
  centers: CenterMarkerData[];
  total: number;
}

/**
 * 지도 중심 좌표 기준으로 주변 센터 검색
 *
 * @param params - 검색 파라미터 { lat, lng, radius }
 * @returns 센터 목록과 총 개수
 * @throws CenterApiError
 *
 * @example
 * const result = await getCenters({ lat: 37.5665, lng: 126.978, radius: 5 });
 */
export async function getCenters(params: {
  lat: number;
  lng: number;
  radius?: number;
}): Promise<CentersListResponse> {
  try {
    // URL 구성
    const url = new URL(`${API_BASE_URL}/centers`);
    url.searchParams.append('lat', params.lat.toString());
    url.searchParams.append('lng', params.lng.toString());

    if (params.radius) {
      url.searchParams.append('radius', params.radius.toString());
    }

    // API 요청
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 지도 데이터는 실시간 업데이트가 필요하므로 캐시 비활성화
      cache: 'no-store',
    });

    // 에러 처리
    if (!response.ok) {
      if (response.status === 400) {
        throw new CenterApiError('잘못된 검색 파라미터입니다', 400);
      }

      if (response.status >= 500) {
        throw new CenterApiError('서버 오류가 발생했습니다', response.status);
      }

      // 기타 에러
      const errorData: ApiError = await response.json().catch(() => ({
        error: '알 수 없는 오류가 발생했습니다',
      }));

      throw new CenterApiError(
        errorData.message || errorData.error,
        response.status
      );
    }

    // 성공 응답 파싱
    const responseBody = await response.json();

    // 백엔드 응답 형식: { success: true, data: { centers: [...], total: N } }
    return responseBody.data;

  } catch (error) {
    // CenterApiError는 그대로 throw
    if (error instanceof CenterApiError) {
      throw error;
    }

    // 네트워크 에러 처리
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CenterApiError(
        '네트워크 연결을 확인해주세요',
        0
      );
    }

    // 기타 예상치 못한 에러
    throw new CenterApiError(
      '센터 목록을 불러오는데 실패했습니다',
      500
    );
  }
}
