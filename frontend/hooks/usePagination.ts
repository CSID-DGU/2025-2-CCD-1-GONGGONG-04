/**
 * usePagination Hook
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 페이지네이션 상태 관리 훅
 * - 페이지네이션 결과 캐싱
 * - 페이지 변경 핸들러
 * - 페이지 번호 범위 계산
 */

import { useMemo } from 'react';
import {
  paginateCenters,
  getPageRange,
  getPageInfo,
  type PaginationResult,
} from '@/lib/utils/paginateCenters';

/**
 * usePagination Hook Params
 */
export interface UsePaginationParams<T> {
  /** 전체 아이템 목록 */
  items: T[];
  /** 현재 페이지 번호 (1-based) */
  currentPage: number;
  /** 페이지당 아이템 수 (기본값: 20) */
  itemsPerPage?: number;
  /** 최대 표시 페이지 수 (기본값: 5) */
  maxVisiblePages?: number;
}

/**
 * usePagination Hook Return Type
 */
export interface UsePaginationReturn<T> extends PaginationResult<T> {
  /** 표시할 페이지 번호 배열 */
  pageNumbers: number[];
  /** 페이지 정보 텍스트 (예: "1-20 of 47") */
  pageInfo: string;
}

/**
 * 페이지네이션 훅
 *
 * @param params - 페이지네이션 파라미터
 * @returns 페이지네이션 결과 및 페이지 번호 목록
 *
 * @example
 * ```typescript
 * const {
 *   paginatedItems,
 *   totalPages,
 *   currentPage,
 *   hasPrevPage,
 *   hasNextPage,
 *   pageNumbers,
 *   pageInfo,
 * } = usePagination({
 *   items: centers,
 *   currentPage: 1,
 *   itemsPerPage: 20,
 * });
 * ```
 */
export function usePagination<T>({
  items,
  currentPage,
  itemsPerPage = 20,
  maxVisiblePages = 5,
}: UsePaginationParams<T>): UsePaginationReturn<T> {
  /**
   * 페이지네이션 결과
   * useMemo로 성능 최적화 및 참조 안정성 보장
   */
  const paginationResult = useMemo(
    () => paginateCenters(items, currentPage, itemsPerPage),
    [items, currentPage, itemsPerPage]
  );

  /**
   * 표시할 페이지 번호 목록
   */
  const pageNumbers = useMemo(
    () =>
      getPageRange(
        paginationResult.currentPage,
        paginationResult.totalPages,
        maxVisiblePages
      ),
    [paginationResult.currentPage, paginationResult.totalPages, maxVisiblePages]
  );

  /**
   * 페이지 정보 텍스트
   */
  const pageInfo = useMemo(
    () =>
      getPageInfo(
        paginationResult.currentPage,
        paginationResult.totalItems,
        paginationResult.itemsPerPage
      ),
    [paginationResult.currentPage, paginationResult.totalItems, paginationResult.itemsPerPage]
  );

  return {
    ...paginationResult,
    pageNumbers,
    pageInfo,
  };
}
