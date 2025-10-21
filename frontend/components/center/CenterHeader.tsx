'use client';

/**
 * CenterHeader Component
 * 센터 상세 페이지의 헤더 정보를 표시하는 컴포넌트
 * - 센터명, 센터 유형, 평점, 리뷰 수
 * - 공유하기, 즐겨찾기 버튼
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Star } from 'lucide-react';

export interface CenterHeaderProps {
  centerName: string;
  centerType: string;
  avgRating: number;
  reviewCount: number;
  onShare?: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
}

export function CenterHeader({
  centerName,
  centerType,
  avgRating,
  reviewCount,
  onShare,
  onFavorite,
  isFavorited = false,
}: CenterHeaderProps) {
  const formattedRating = avgRating.toFixed(1);

  return (
    <div className="space-y-3">
      {/* 상단: 센터 유형 + 액션 버튼 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Badge variant="default" className="mb-2">
            {centerType}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* 공유하기 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            aria-label="공유하기"
            className="focus-ring touch-target"
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">공유하기</span>
          </Button>

          {/* 즐겨찾기 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={onFavorite}
            aria-label={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            className="focus-ring touch-target"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorited
                  ? 'fill-lavender-500 text-lavender-500'
                  : 'text-neutral-400'
              }`}
              aria-hidden="true"
            />
            <span className="sr-only">
              {isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            </span>
          </Button>
        </div>
      </div>

      {/* 센터명 */}
      <h1 className="text-h2 text-neutral-900 font-semibold leading-tight">
        {centerName}
      </h1>

      {/* 평점 및 리뷰 수 */}
      {reviewCount > 0 && (
        <div className="flex items-center gap-1.5">
          <Star
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
            aria-hidden="true"
          />
          <span className="text-body font-semibold text-neutral-900">
            {formattedRating}
          </span>
          <span className="text-small text-neutral-500">
            ({reviewCount.toLocaleString()}개 리뷰)
          </span>
        </div>
      )}

      {/* 리뷰 없는 경우 */}
      {reviewCount === 0 && (
        <p className="text-small text-neutral-500">아직 리뷰가 없습니다</p>
      )}
    </div>
  );
}
