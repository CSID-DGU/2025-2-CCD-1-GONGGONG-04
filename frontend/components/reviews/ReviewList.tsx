/**
 * ReviewList Component
 *
 * Sprint 4: Review and Rating System
 * Displays a list of reviews with sorting, infinite scroll, and loading states
 */

'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewCard } from './ReviewCard';
import { EmptyReviews } from './EmptyReviews';
import { useReviews } from '@/hooks/useReviews';
import type { Review, ReactionType, SortOption, ReviewsResponse } from '@/types/review';

export interface ReviewListProps {
  centerId: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onReactionClick?: (reviewId: number, reaction: ReactionType) => void;
  onEditReview?: (review: Review) => void;
  onDeleteReview?: (reviewId: number) => void;
}

export function ReviewList({
  centerId,
  sortBy,
  onSortChange,
  onReactionClick,
  onEditReview,
  onDeleteReview,
}: ReviewListProps) {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useReviews(
    centerId,
    sortBy
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <ReviewListSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-body text-neutral-600 mb-4">리뷰를 불러오는데 실패했습니다</p>
        <p className="text-small text-neutral-500">잠시 후 다시 시도해주세요</p>
      </div>
    );
  }

  // Get all reviews from pages
  const allReviews = data?.pages.flatMap((page: ReviewsResponse) => page.reviews) || [];

  // Empty state
  if (allReviews.length === 0) {
    return <EmptyReviews />;
  }

  return (
    <div className="space-y-4">
      {/* Sort Selector */}
      <div className="flex justify-between items-center">
        <p className="text-body text-neutral-600">
          총 <span className="font-semibold">{data?.pages[0]?.pagination.total_count || 0}</span>개의 리뷰
        </p>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px]" aria-label="정렬 옵션">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">최신순</SelectItem>
            <SelectItem value="helpful">도움순</SelectItem>
            <SelectItem value="rating_desc">평점 높은순</SelectItem>
            <SelectItem value="rating_asc">평점 낮은순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {allReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onReactionClick={onReactionClick}
            onEdit={onEditReview}
            onDelete={onDeleteReview}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            aria-label="더 많은 리뷰 불러오기"
          >
            {isFetchingNextPage ? '불러오는 중...' : '더보기'}
          </Button>
        </div>
      )}

      {/* Loading next page */}
      {isFetchingNextPage && (
        <div className="space-y-4 pt-4">
          <ReviewCardSkeleton />
        </div>
      )}
    </div>
  );
}

// Loading skeleton for initial load
function ReviewListSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </>
  );
}

// Individual review card skeleton
function ReviewCardSkeleton() {
  return (
    <div className="rounded-card border p-6 space-y-4">
      {/* Author info */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Stars */}
      <Skeleton className="h-4 w-32" />

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Reactions */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}
