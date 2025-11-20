/**
 * CenterListSkeleton Component
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 센터 목록 페이지 전체 로딩 스켈레톤
 * - 헤더, 검색바, 필터, 카드 그리드 포함
 * - 실제 레이아웃과 동일한 구조
 * - 0.3초 이후 표시 (깜빡임 방지)
 *
 * @see context/only-read-frontend/공통_UI_UX_가이드라인.md (6.1)
 */

import React from 'react';
import { CenterCardSkeleton } from './CenterCard';
import { cn } from '@/lib/utils';

export interface CenterListSkeletonProps {
  /** 표시할 카드 수 (기본값: 6) */
  cardCount?: number;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * CenterListSkeleton Component
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <CenterListSkeleton />
 *
 * // 커스텀 카드 수
 * <CenterListSkeleton cardCount={9} />
 * ```
 */
export function CenterListSkeleton({
  cardCount = 6,
  className,
}: CenterListSkeletonProps) {
  return (
    <div
      className={cn('container mx-auto px-4 py-6 space-y-6', className)}
      role="status"
      aria-label="센터 목록 로딩 중"
    >
      {/* Header Skeleton */}
      <div className="space-y-2 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-48" />
        <div className="h-5 bg-neutral-200 rounded w-32" />
      </div>

      {/* Search Bar and Filter Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 animate-pulse">
        <div className="flex-1 h-11 bg-neutral-200 rounded-lg" />
        <div className="h-11 w-20 bg-neutral-200 rounded-lg" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cardCount }).map((_, index) => (
          <CenterCardSkeleton key={index} variant="list" />
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex flex-col items-center gap-4 pt-4 animate-pulse">
        <div className="h-5 bg-neutral-200 rounded w-24" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 w-10 bg-neutral-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Lightweight Search Bar Skeleton
 *
 * 검색바만 필요한 경우 사용
 */
export function SearchBarSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-11 bg-neutral-200 rounded-lg animate-pulse', className)}
      role="status"
      aria-label="검색바 로딩 중"
    />
  );
}

/**
 * Lightweight Filter Button Skeleton
 *
 * 필터 버튼만 필요한 경우 사용
 */
export function FilterButtonSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-11 w-20 bg-neutral-200 rounded-lg animate-pulse', className)}
      role="status"
      aria-label="필터 버튼 로딩 중"
    />
  );
}
