/**
 * useCenterData Hook
 * TanStack Query를 사용한 센터 데이터 패칭 훅
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getCenters, CentersListResponse, CenterApiError } from '@/lib/api/centers';

/**
 * 센터 데이터 훅 파라미터
 */
export interface UseCenterDataParams {
  lat: number;
  lng: number;
  radius?: number;
}

/**
 * 지도 중심 좌표 기준으로 주변 센터 데이터를 가져오는 훅
 *
 * @param params - 검색 파라미터 (위도, 경도, 반경)
 * @param options - TanStack Query 옵션
 * @returns 센터 데이터와 로딩/에러 상태
 *
 * @example
 * const { data, isLoading, error } = useCenterData({
 *   lat: 37.5665,
 *   lng: 126.978,
 *   radius: 5
 * });
 */
export function useCenterData(
  params: UseCenterDataParams
): UseQueryResult<CentersListResponse, CenterApiError> {
  return useQuery<CentersListResponse, CenterApiError>({
    queryKey: ['centers', params.lat, params.lng, params.radius || 5],
    queryFn: async () => {
      return await getCenters({
        lat: params.lat,
        lng: params.lng,
        radius: params.radius || 5,
      });
    },
    staleTime: 5 * 60 * 1000, // 5분 - 지도 데이터는 자주 변경되지 않음
    gcTime: 10 * 60 * 1000, // 10분 (formerly cacheTime)
    refetchOnWindowFocus: true, // 윈도우 포커스 시 최신 데이터 가져오기
    retry: 1, // 실패 시 1번 재시도
    enabled: !!(params.lat && params.lng), // lat, lng가 있을 때만 실행
  });
}

/**
 * 센터 데이터 훅 (좌표 변경 시 자동 업데이트)
 *
 * @param lat - 위도
 * @param lng - 경도
 * @param radius - 검색 반경 (km, 기본값: 5)
 * @returns 센터 데이터와 로딩/에러 상태
 *
 * @example
 * const { data, isLoading, error, refetch } = useCentersQuery(37.5665, 126.978, 5);
 */
export function useCentersQuery(
  lat: number,
  lng: number,
  radius: number = 5
): UseQueryResult<CentersListResponse, CenterApiError> {
  return useCenterData({ lat, lng, radius });
}
