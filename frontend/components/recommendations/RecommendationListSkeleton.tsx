/**
 * RecommendationListSkeleton Component
 *
 * Sprint 3 - Task 3.5.1: 진단 기반 추천 페이지
 *
 * 추천 센터 목록 로딩 스켈레톤
 * - 카드 레이아웃 스켈레톤 (5개)
 * - 반응형 그리드
 */

'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface RecommendationListSkeletonProps {
  /** 스켈레톤 카드 개수 (기본: 5) */
  count?: number;
}

/**
 * 단일 추천 카드 스켈레톤
 */
function RecommendationCardSkeleton() {
  return (
    <Card className="rounded-card shadow-soft">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          {/* 순위 + 센터명 */}
          <div className="flex items-center gap-3 flex-1">
            {/* 순위 배지 */}
            <Skeleton className="h-10 w-10 rounded-full" />

            {/* 센터명 */}
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-full max-w-[240px]" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* 총점 배지 */}
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 추천 이유 */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-1.5 pl-5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-neutral-200" />

        {/* 센터 정보 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* 세부 점수 버튼 */}
        <Skeleton className="h-8 w-32" />
      </CardContent>

      <CardFooter className="pt-4 gap-2">
        {/* 상세 정보 버튼 */}
        <Skeleton className="h-10 flex-1" />

        {/* 즐겨찾기 버튼 */}
        <Skeleton className="h-10 w-10" />
      </CardFooter>
    </Card>
  );
}

/**
 * 추천 목록 스켈레톤 (그리드)
 */
export function RecommendationListSkeleton({ count = 5 }: RecommendationListSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* 제목 스켈레톤 */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <RecommendationCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
