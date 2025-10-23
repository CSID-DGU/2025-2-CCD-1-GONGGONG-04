/**
 * useReviewReaction Hook
 *
 * Sprint 4: Review and Rating System
 * Custom React Query hook for review reactions with optimistic updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addReaction } from '@/lib/api/reviews';
import { useToast } from '@/components/ui/use-toast';
import type { ReactionType, ReviewsResponse, Review } from '@/types/review';

/**
 * Get JWT token from session storage or cookies
 * TODO: Replace with actual auth implementation
 */
function getAuthToken(): string {
  return typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : '';
}

/**
 * Hook for adding/updating/removing reactions with optimistic updates
 */
export function useReviewReaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      reviewId,
      reaction,
    }: {
      reviewId: number;
      reaction: ReactionType | null;
    }) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('로그인이 필요합니다');
      }
      return addReaction(reviewId, reaction, token);
    },

    // Optimistic update - immediately update UI before server response
    onMutate: async ({ reviewId, reaction }) => {
      // Cancel any ongoing queries
      await queryClient.cancelQueries({ queryKey: ['reviews'] });

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueriesData({ queryKey: ['reviews'] });

      // Optimistically update all review queries
      queryClient.setQueriesData<{ pages: ReviewsResponse[] }>({ queryKey: ['reviews'] }, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            reviews: page.reviews.map((review) => {
              if (review.id !== reviewId) return review;

              // Calculate new counts based on previous and new reaction
              let helpfulCount = review.helpful_count;
              let unhelpfulCount = review.unhelpful_count;
              const prevReaction = review.my_reaction;

              // Remove previous reaction count
              if (prevReaction === 'helpful') {
                helpfulCount -= 1;
              } else if (prevReaction === 'unhelpful') {
                unhelpfulCount -= 1;
              }

              // Add new reaction count
              if (reaction === 'helpful') {
                helpfulCount += 1;
              } else if (reaction === 'unhelpful') {
                unhelpfulCount += 1;
              }

              return {
                ...review,
                helpful_count: helpfulCount,
                unhelpful_count: unhelpfulCount,
                my_reaction: reaction,
              };
            }),
          })),
        };
      });

      // Return context for rollback
      return { previousData };
    },

    // Rollback on error
    onError: (error: Error, variables, context) => {
      // Restore previous data
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast({
        title: '반응 등록 실패',
        description: error.message || '반응 등록 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },

    // Re-validate from server after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
