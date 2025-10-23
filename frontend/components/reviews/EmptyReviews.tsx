/**
 * EmptyReviews Component
 *
 * Sprint 4: Review and Rating System
 * Displays an empty state when there are no reviews available
 */

import { Card, CardContent } from '@/components/ui/card';

export function EmptyReviews() {
  return (
    <Card className="rounded-card shadow-soft">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="text-6xl mb-4" role="img" aria-label="리뷰 없음">
          📝
        </div>
        <h3 className="text-h3 text-neutral-900 mb-2">아직 리뷰가 없습니다</h3>
        <p className="text-body text-neutral-600">첫 번째 리뷰를 작성해보세요</p>
      </CardContent>
    </Card>
  );
}
