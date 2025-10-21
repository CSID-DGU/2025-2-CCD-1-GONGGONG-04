/**
 * Centers API Client
 * 센터 관련 API 클라이언트
 */

import { CenterDetail, ApiError, UserLocation } from '@/types/center';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

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
    const data: CenterDetail = await response.json();
    return data;

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
 * 센터 목록 조회 (추후 확장용)
 * @param params - 검색 파라미터
 */
export async function getCenters(params?: {
  keyword?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}) {
  // 추후 구현
  throw new Error('Not implemented yet');
}
