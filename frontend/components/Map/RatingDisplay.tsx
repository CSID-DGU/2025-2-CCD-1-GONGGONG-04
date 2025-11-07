/**
 * RatingDisplay 컴포넌트
 *
 * 센터의 평균 별점과 리뷰 개수를 표시합니다
 * - 시각적 별 아이콘 표시
 * - 숫자 평점 + 리뷰 개수
 * - 3가지 크기 옵션 (sm, md, lg)
 * - 접근성: role="img", aria-label
 *
 * @component
 */

import * as React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * 크기 옵션
 */
export type RatingSize = 'sm' | 'md' | 'lg';

/**
 * RatingDisplay Props
 */
export interface RatingDisplayProps {
  /** 평균 별점 (0-5) */
  rating: number;
  /** 리뷰 개수 */
  reviewCount: number;
  /** 크기 */
  size?: RatingSize;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 크기별 스타일 설정
 */
const SIZE_CONFIG = {
  sm: {
    starSize: 'h-3.5 w-3.5',
    textSize: 'text-xs',
    gap: 'gap-1',
  },
  md: {
    starSize: 'h-4 w-4',
    textSize: 'text-sm',
    gap: 'gap-1.5',
  },
  lg: {
    starSize: 'h-5 w-5',
    textSize: 'text-base',
    gap: 'gap-2',
  },
} as const;

/**
 * RatingDisplay 컴포넌트
 *
 * @example
 * ```tsx
 * <RatingDisplay rating={4.5} reviewCount={42} size="md" />
 * <RatingDisplay rating={3.8} reviewCount={127} />
 * ```
 */
export function RatingDisplay({
  rating,
  reviewCount,
  size = 'md',
  className,
}: RatingDisplayProps) {
  const config = SIZE_CONFIG[size];

  /**
   * 평점 포맷팅 (소수점 1자리)
   */
  const formattedRating = rating.toFixed(1);

  /**
   * 스크린 리더용 텍스트
   */
  const ariaLabel = `별점 ${formattedRating}점, ${reviewCount}개의 리뷰`;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('inline-flex items-center', config.gap, className)}
    >
      {/* 별 아이콘 */}
      <Star
        className={cn(
          config.starSize,
          'fill-yellow-400 text-yellow-400'
        )}
        aria-hidden="true"
      />

      {/* 평점 텍스트 */}
      <span className={cn('font-medium text-neutral-900', config.textSize)}>
        {formattedRating}
      </span>

      {/* 리뷰 개수 배지 */}
      <Badge
        variant="outline"
        className={cn(
          'ml-0.5 px-1.5 py-0.5 text-neutral-600 bg-neutral-50 border-neutral-200',
          config.textSize
        )}
      >
        {reviewCount}개 리뷰
      </Badge>
    </div>
  );
}
