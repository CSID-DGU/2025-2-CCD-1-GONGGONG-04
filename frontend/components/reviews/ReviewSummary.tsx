/**
 * ReviewSummary Component
 *
 * Sprint 4: Review and Rating System
 * Displays aggregate rating statistics with visual rating distribution
 */

import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface ReviewSummaryProps {
  avgRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export function ReviewSummary({ avgRating, totalReviews, ratingDistribution }: ReviewSummaryProps) {
  // Calculate percentage for each star rating
  const getRatingPercentage = (rating: number): number => {
    if (totalReviews === 0) return 0;
    return ((ratingDistribution[rating] || 0) / totalReviews) * 100;
  };

  return (
    <Card className="rounded-card shadow-soft">
      <CardHeader>
        <CardTitle className="text-h2">리뷰 요약</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-[auto_1fr] gap-6">
          {/* Left: Average Rating */}
          <div className="flex flex-col items-center justify-center md:border-r md:pr-6">
            <div className="text-4xl font-bold text-neutral-900 mb-2">
              {avgRating.toFixed(1)}
            </div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(avgRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-neutral-200 text-neutral-200'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="text-small text-neutral-600">
              {totalReviews}개의 리뷰
            </p>
          </div>

          {/* Right: Rating Distribution */}
          <div className="flex flex-col justify-center space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-small text-neutral-700">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                </div>
                <Progress
                  value={getRatingPercentage(rating)}
                  className="h-2 flex-1"
                  aria-label={`별점 ${rating}점: ${ratingDistribution[rating] || 0}개 (${getRatingPercentage(rating).toFixed(0)}%)`}
                />
                <span className="text-small text-neutral-600 w-12 text-right">
                  {ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
