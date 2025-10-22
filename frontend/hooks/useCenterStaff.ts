/**
 * useCenterStaff Hook
 * 센터 의료진 현황 조회 훅
 */

import { useQuery } from '@tanstack/react-query';
import { getCenterStaff } from '@/lib/api/centers';

/**
 * 센터 의료진 현황 조회 훅
 * @param centerId - 센터 ID (null일 경우 쿼리 비활성화)
 * @returns TanStack Query 결과
 */
export function useCenterStaff(centerId: number | null) {
  return useQuery({
    queryKey: ['center', centerId, 'staff'],
    queryFn: () => {
      if (!centerId) {
        throw new Error('Center ID is required');
      }
      return getCenterStaff(centerId);
    },
    enabled: !!centerId,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
