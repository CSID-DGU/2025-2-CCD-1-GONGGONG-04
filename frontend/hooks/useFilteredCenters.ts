/**
 * useFilteredCenters Hook
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 센터 목록 필터링 훅
 * - 검색어, 센터 유형, 지역, 운영 상태로 필터링
 * - useMemo로 성능 최적화
 * - 필터링 결과 캐싱
 */

import { useMemo } from 'react';
import type { CenterMarkerData } from '@/lib/api/centers';
import { applyFilters, type CenterFilters } from '@/lib/utils/filterCenters';

/**
 * useFilteredCenters Hook Props
 */
export interface UseFilteredCentersParams {
  /** 전체 센터 목록 */
  centers: CenterMarkerData[];
  /** 검색어 */
  searchQuery?: string;
  /** 필터 조건 */
  filters?: CenterFilters;
}

/**
 * useFilteredCenters Hook Return Type
 */
export interface UseFilteredCentersReturn {
  /** 필터링된 센터 목록 */
  filteredCenters: CenterMarkerData[];
  /** 전체 센터 개수 */
  totalCount: number;
  /** 필터링된 센터 개수 */
  filteredCount: number;
  /** 필터가 적용되었는지 여부 */
  hasActiveFilters: boolean;
}

/**
 * 센터 목록 필터링 훅
 *
 * @param params - 센터 목록과 필터 조건
 * @returns 필터링된 센터 목록 및 통계
 *
 * @example
 * ```typescript
 * const { filteredCenters, filteredCount, hasActiveFilters } = useFilteredCenters({
 *   centers: allCenters,
 *   searchQuery: '강남',
 *   filters: {
 *     centerTypes: ['정신건강복지센터'],
 *     region: { province: '서울특별시' },
 *     operatingStatus: 'OPEN',
 *   },
 * });
 * ```
 */
export function useFilteredCenters({
  centers,
  searchQuery = '',
  filters = {},
}: UseFilteredCentersParams): UseFilteredCentersReturn {
  /**
   * 필터링된 센터 목록
   * useMemo로 성능 최적화 및 참조 안정성 보장
   */
  const filteredCenters = useMemo(() => {
    // 필터 조건이 없으면 전체 목록 반환
    if (!searchQuery && Object.keys(filters).length === 0) {
      return centers;
    }

    // 필터 조건 생성 (검색어 포함)
    const filterConditions: CenterFilters = {
      ...filters,
      searchQuery: searchQuery || undefined,
    };

    // 필터 적용
    return applyFilters(centers, filterConditions);
  }, [centers, searchQuery, filters]);

  /**
   * 활성 필터 여부 확인
   */
  const hasActiveFilters = useMemo(() => {
    // 검색어가 있으면 필터 활성
    if (searchQuery && searchQuery.trim() !== '') {
      return true;
    }

    // 센터 유형 필터
    if (filters.centerTypes && filters.centerTypes.length > 0) {
      return true;
    }

    // 지역 필터
    if (filters.region?.province || filters.region?.district) {
      return true;
    }

    // 운영 상태 필터
    if (filters.operatingStatus) {
      return true;
    }

    return false;
  }, [searchQuery, filters]);

  return {
    filteredCenters,
    totalCount: centers.length,
    filteredCount: filteredCenters.length,
    hasActiveFilters,
  };
}
