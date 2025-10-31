/**
 * useReviews Hook
 *
 * Sprint 4: Review and Rating System
 * Custom React Query hook for fetching reviews with infinite scroll pagination
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchReviews } from '@/lib/api/reviews';
import type { SortOption } from '@/types/review';

export function useReviews(centerId: number, sortBy: SortOption = 'latest', limit: number = 10) {
  return useInfiniteQuery({
    queryKey: ['reviews', centerId, sortBy, limit],
    queryFn: ({ pageParam = 1 }) => fetchReviews(centerId, sortBy, pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
