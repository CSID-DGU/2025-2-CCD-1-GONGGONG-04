'use client';

/**
 * Center Reviews Section - Client Component
 * Sprint 4: Review and Rating System integration
 *
 * This is a client component wrapper to handle client-side state
 * for the ReviewList component while being integrated into
 * the server-side rendered center detail page.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewSummary, ReviewList } from '@/components/reviews';
import { Star } from 'lucide-react';
import type { SortOption, ReactionType } from '@/types/review';

interface CenterReviewsSectionProps {
  centerId: number;
  avgRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export function CenterReviewsSection({
  centerId,
  avgRating,
  totalReviews,
  ratingDistribution,
}: CenterReviewsSectionProps) {
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  const handleReactionClick = (reviewId: number, reaction: ReactionType) => {
    // TODO: Implement in Week 2
    console.log('Reaction clicked:', { reviewId, reaction });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-h3 flex items-center gap-2">
            <Star className="w-5 h-5" aria-hidden="true" />
            이용 후기
          </CardTitle>
          <span className="text-small text-neutral-500">{totalReviews}개의 리뷰</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Review Summary */}
        <ReviewSummary
          avgRating={avgRating}
          totalReviews={totalReviews}
          ratingDistribution={ratingDistribution}
        />

        {/* Review List */}
        <ReviewList
          centerId={centerId}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onReactionClick={handleReactionClick}
        />
      </CardContent>
    </Card>
  );
}
