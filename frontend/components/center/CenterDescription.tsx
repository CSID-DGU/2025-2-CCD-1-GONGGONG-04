'use client';

/**
 * CenterDescription Component
 * 센터의 소개 및 통계 정보를 표시하는 컴포넌트
 * - 센터 소개 (business_content)
 * - 조회수, 즐겨찾기 수
 * - 빈 상태 처리
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart } from 'lucide-react';

export interface CenterDescriptionProps {
  businessContent: string | null;
  viewCount: number;
  favoriteCount: number;
}

export function CenterDescription({
  businessContent,
  viewCount,
  favoriteCount,
}: CenterDescriptionProps) {
  // 숫자 포맷팅 (1000 단위 콤마)
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">센터 소개</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 센터 소개 내용 */}
        {businessContent ? (
          <p className="text-body text-neutral-700 whitespace-pre-line leading-relaxed">
            {businessContent}
          </p>
        ) : (
          <div className="py-8 text-center">
            <p className="text-body text-neutral-500">
              센터 소개가 등록되지 않았습니다
            </p>
            <p className="text-small text-neutral-400 mt-2">
              센터에 직접 문의하여 자세한 정보를 확인해주세요
            </p>
          </div>
        )}

        {/* 구분선 */}
        <div className="border-t border-neutral-200" />

        {/* 통계 정보 */}
        <div className="flex items-center gap-6 text-small text-neutral-600">
          {/* 조회수 */}
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">조회수</span>
            <span aria-label={`조회수 ${formatNumber(viewCount)}회`}>
              조회 {formatNumber(viewCount)}
            </span>
          </div>

          {/* 세로 구분선 */}
          <div className="w-px h-4 bg-neutral-200" aria-hidden="true" />

          {/* 즐겨찾기 수 */}
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">즐겨찾기 수</span>
            <span aria-label={`즐겨찾기 ${formatNumber(favoriteCount)}개`}>
              즐겨찾기 {formatNumber(favoriteCount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
