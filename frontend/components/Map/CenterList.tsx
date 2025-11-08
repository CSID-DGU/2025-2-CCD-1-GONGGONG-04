/**
 * CenterList Component
 *
 * Sprint 2 - Day 10: 센터 리스트 뷰
 *
 * @description
 * 센터 목록 표시 컴포넌트
 *
 * Features:
 * - 센터 목록 렌더링
 * - 무한 스크롤 (Intersection Observer)
 * - 로딩/에러 상태 처리
 * - 빈 상태 UI
 * - 선택된 센터 하이라이트
 */

'use client';

import React from 'react';
import { Loader2, MapPinOff, AlertCircle } from 'lucide-react';
import { CenterListItem, CenterListItemSkeleton } from './CenterListItem';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { CenterListProps } from '@/types/center';
import { cn } from '@/lib/utils';

/**
 * 센터 리스트 컴포넌트
 *
 * @example
 * ```tsx
 * <CenterList
 *   centers={centers}
 *   onSelectCenter={(center) => {
 *     map.panTo(new kakao.maps.LatLng(center.latitude, center.longitude));
 *   }}
 *   selectedCenterId={selectedId}
 *   hasNextPage={hasNextPage}
 *   onLoadMore={fetchNextPage}
 *   isFetchingNextPage={isFetchingNextPage}
 * />
 * ```
 */
export function CenterList({
  centers,
  onSelectCenter,
  selectedCenterId = null,
  isLoading = false,
  error,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  className,
}: CenterListProps) {
  // Intersection Observer 훅 (무한 스크롤)
  const { ref: loadMoreRef } = useInfiniteScroll({
    onIntersect: onLoadMore,
    enabled: hasNextPage && !isFetchingNextPage,
    threshold: 0.5,
    rootMargin: '100px', // 100px 전에 미리 로드
  });

  // 초기 로딩 상태
  if (isLoading && centers.length === 0) {
    return (
      <div className={cn('h-full bg-white', className)}>
        <CenterListHeader count={0} isLoading />
        <div>
          {Array.from({ length: 5 }).map((_, index) => (
            <CenterListItemSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={cn('h-full bg-white', className)}>
        <CenterListHeader count={0} />
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <p className="text-h4 text-gray-900 mb-2">검색 중 오류가 발생했습니다</p>
          <p className="text-sm text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  // 빈 상태
  if (centers.length === 0) {
    return (
      <div className={cn('h-full bg-white', className)}>
        <CenterListHeader count={0} />
        <EmptyCenterList />
      </div>
    );
  }

  // 센터 목록 렌더링
  return (
    <div className={cn('h-full overflow-y-auto bg-white', className)}>
      <CenterListHeader count={centers.length} />

      {/* 센터 목록 */}
      <div>
        {centers.map((center) => (
          <CenterListItem
            key={center.id}
            center={center}
            onSelect={onSelectCenter}
            isHighlighted={selectedCenterId === center.id}
          />
        ))}
      </div>

      {/* 무한 스크롤 트리거 */}
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-4"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>더 많은 센터 불러오는 중...</span>
            </div>
          )}
        </div>
      )}

      {/* 마지막 페이지 메시지 */}
      {!hasNextPage && centers.length > 0 && (
        <div className="py-6 text-center text-sm text-gray-500">
          모든 센터를 불러왔습니다 ({centers.length}개)
        </div>
      )}
    </div>
  );
}

/**
 * 센터 리스트 헤더 (개수 표시)
 */
interface CenterListHeaderProps {
  count: number;
  isLoading?: boolean;
}

function CenterListHeader({ count, isLoading = false }: CenterListHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <h2 className="text-h3 text-gray-900">
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-lavender-500" />
            <span>센터 검색 중...</span>
          </span>
        ) : (
          <>
            주변 센터 <span className="text-lavender-600">{count.toLocaleString()}</span>개
          </>
        )}
      </h2>
    </div>
  );
}

/**
 * 빈 센터 리스트 UI
 */
function EmptyCenterList() {
  return (
    <div className="flex flex-col items-center justify-center h-64 px-4">
      <MapPinOff className="w-16 h-16 text-gray-400 mb-4" />
      <p className="text-h4 text-gray-900 mb-2">주변 센터가 없습니다</p>
      <p className="text-sm text-gray-600 text-center">
        검색 반경을 늘리거나
        <br />
        다른 위치에서 검색해보세요
      </p>
    </div>
  );
}
