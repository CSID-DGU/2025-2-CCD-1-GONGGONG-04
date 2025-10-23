/**
 * useReviewMutation Hooks
 *
 * Sprint 4: Review and Rating System
 * Custom React Query hooks for review create, update, delete mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview, updateReview, deleteReview } from '@/lib/api/reviews';
import { useToast } from '@/components/ui/use-toast';
import type { Review, ReviewFormData } from '@/types/review';

/**
 * Get JWT token from session storage or cookies
 * TODO: Replace with actual auth implementation
 */
function getAuthToken(): string {
  // Placeholder - replace with actual auth token retrieval
  return typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : '';
}

/**
 * Hook for creating a new review
 * @param centerId - Center ID to review
 */
export function useCreateReview(centerId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ReviewFormData) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('로그인이 필요합니다');
      }
      return createReview(centerId, data, token);
    },
    onSuccess: (newReview: Review) => {
      // Invalidate queries to refetch review list
      queryClient.invalidateQueries({ queryKey: ['reviews', centerId] });

      toast({
        title: '리뷰 작성 완료',
        description: '리뷰가 성공적으로 작성되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '리뷰 작성 실패',
        description: error.message || '리뷰 작성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for updating an existing review
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: number;
      data: Partial<ReviewFormData>;
    }) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('로그인이 필요합니다');
      }
      return updateReview(reviewId, data, token);
    },
    onSuccess: (updatedReview: Review) => {
      // Invalidate all review queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });

      toast({
        title: '리뷰 수정 완료',
        description: '리뷰가 성공적으로 수정되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '리뷰 수정 실패',
        description: error.message || '리뷰 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for deleting a review
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (reviewId: number) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('로그인이 필요합니다');
      }
      return deleteReview(reviewId, token);
    },
    onSuccess: () => {
      // Invalidate all review queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });

      toast({
        title: '리뷰 삭제 완료',
        description: '리뷰가 성공적으로 삭제되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '리뷰 삭제 실패',
        description: error.message || '리뷰 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
}
