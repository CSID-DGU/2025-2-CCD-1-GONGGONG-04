/**
 * useCenters Hook
 * TanStack Query를 사용한 전체 센터 목록 패칭 훅 (Sprint 2)
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getAllCenters, CentersListResponse, CenterApiError } from '@/lib/api/centers';

/**
 * 전체 센터 목록을 가져오는 훅
 *
 * @returns 센터 데이터와 로딩/에러 상태
 *
 * @example
 * const { data, isLoading, error, refetch } = useCenters();
 */
export function useCenters(): UseQueryResult<CentersListResponse, CenterApiError> {
  return useQuery<CentersListResponse, CenterApiError>({
    queryKey: ['centers', 'all'],
    queryFn: async () => {
      return await getAllCenters();
    },
    staleTime: 3 * 60 * 1000, // 3min - fresh data period
    gcTime: 5 * 60 * 1000, // 5min - cache time (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus (data doesn't change often)
    retry: 2, // Retry twice on failure
  });
}
