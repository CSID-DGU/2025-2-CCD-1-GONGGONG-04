/**
 * useCenterPrograms Hook
 * 센터 프로그램 목록 조회 훅
 */

import { useQuery } from '@tanstack/react-query';
import { getCenterPrograms } from '@/lib/api/centers';

/**
 * 센터 프로그램 목록 조회 훅
 * @param centerId - 센터 ID (null일 경우 쿼리 비활성화)
 * @param filters - 필터 옵션
 * @returns TanStack Query 결과
 */
export function useCenterPrograms(
  centerId: number | null,
  filters?: {
    target_group?: string;
    is_online?: boolean;
    is_free?: boolean;
  }
) {
  return useQuery({
    queryKey: ['center', centerId, 'programs', filters],
    queryFn: () => {
      if (!centerId) {
        throw new Error('Center ID is required');
      }
      return getCenterPrograms(centerId, filters);
    },
    enabled: !!centerId,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
