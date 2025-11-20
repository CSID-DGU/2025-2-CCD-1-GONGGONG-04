/**
 * FilterTags Component
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 적용된 필터를 태그 형태로 표시하는 컴포넌트
 * - 센터 유형, 지역, 운영 상태 필터 태그 표시
 * - X 버튼으로 개별 제거
 * - 접근성 준수
 *
 * Features:
 * - Display active filters as removable badges
 * - Individual tag removal
 * - Accessibility: WCAG AA compliant
 * - Keyboard navigation support
 */

'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CenterFilters } from '@/lib/utils/filterCenters';
import type { CenterMarkerData } from '@/lib/api/centers';
import { cn } from '@/lib/utils';

/**
 * FilterTags Props
 */
export interface FilterTagsProps {
  /** 현재 적용된 필터 */
  filters: CenterFilters;
  /** 필터 제거 콜백 */
  onRemoveFilter: (filterType: 'centerType' | 'province' | 'district' | 'operatingStatus', value?: string) => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 운영 상태 레이블 매핑
 */
const OPERATING_STATUS_LABELS: Record<CenterMarkerData['operatingStatus'], string> = {
  OPEN: '운영 중',
  CLOSING_SOON: '마감 임박',
  CLOSED: '마감',
  HOLIDAY: '휴무',
  TEMP_CLOSED: '임시 휴무',
  NO_INFO: '정보 없음',
};

/**
 * FilterTags 컴포넌트
 *
 * @example
 * ```tsx
 * <FilterTags
 *   filters={{
 *     centerTypes: ['정신건강복지센터'],
 *     region: { province: '서울특별시', district: '강남구' },
 *     operatingStatus: 'OPEN',
 *   }}
 *   onRemoveFilter={(type, value) => {
 *     // Handle filter removal
 *   }}
 * />
 * ```
 */
export function FilterTags({
  filters,
  onRemoveFilter,
  className,
}: FilterTagsProps) {
  /**
   * 활성 필터가 있는지 확인
   */
  const hasActiveFilters =
    (filters.centerTypes && filters.centerTypes.length > 0) ||
    filters.region?.province ||
    filters.region?.district ||
    filters.operatingStatus;

  /**
   * 활성 필터가 없으면 아무것도 렌더링하지 않음
   */
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="group" aria-label="적용된 필터">
      {/* 센터 유형 태그 */}
      {filters.centerTypes?.map((type) => (
        <Badge
          key={type}
          variant="secondary"
          className="flex items-center gap-1 pr-1 text-small"
        >
          <span>{type}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter('centerType', type)}
            className={cn(
              'ml-1 rounded-sm p-0.5',
              'hover:bg-neutral-300 dark:hover:bg-neutral-700',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500',
            )}
            aria-label={`${type} 필터 제거`}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </Badge>
      ))}

      {/* 시/도 태그 */}
      {filters.region?.province && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 pr-1 text-small"
        >
          <span>{filters.region.province}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter('province')}
            className={cn(
              'ml-1 rounded-sm p-0.5',
              'hover:bg-neutral-300 dark:hover:bg-neutral-700',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500',
            )}
            aria-label={`${filters.region.province} 필터 제거`}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </Badge>
      )}

      {/* 시/군/구 태그 */}
      {filters.region?.district && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 pr-1 text-small"
        >
          <span>{filters.region.district}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter('district')}
            className={cn(
              'ml-1 rounded-sm p-0.5',
              'hover:bg-neutral-300 dark:hover:bg-neutral-700',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500',
            )}
            aria-label={`${filters.region.district} 필터 제거`}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </Badge>
      )}

      {/* 운영 상태 태그 */}
      {filters.operatingStatus && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 pr-1 text-small"
        >
          <span>{OPERATING_STATUS_LABELS[filters.operatingStatus]}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter('operatingStatus')}
            className={cn(
              'ml-1 rounded-sm p-0.5',
              'hover:bg-neutral-300 dark:hover:bg-neutral-700',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500',
            )}
            aria-label={`${OPERATING_STATUS_LABELS[filters.operatingStatus]} 필터 제거`}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </Badge>
      )}
    </div>
  );
}
