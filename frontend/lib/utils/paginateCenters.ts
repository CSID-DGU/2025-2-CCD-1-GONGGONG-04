/**
 * Pagination Utilities
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 센터 목록 페이지네이션 유틸리티 함수
 * - 페이지별 아이템 분할
 * - 전체 페이지 수 계산
 * - 페이지 범위 검증
 */

import type { CenterMarkerData } from '@/lib/api/centers';

/**
 * 페이지네이션 결과 타입
 */
export interface PaginationResult<T> {
  /** 현재 페이지의 아이템 목록 */
  paginatedItems: T[];
  /** 전체 페이지 수 */
  totalPages: number;
  /** 현재 페이지 번호 */
  currentPage: number;
  /** 전체 아이템 수 */
  totalItems: number;
  /** 페이지당 아이템 수 */
  itemsPerPage: number;
  /** 이전 페이지 존재 여부 */
  hasPrevPage: boolean;
  /** 다음 페이지 존재 여부 */
  hasNextPage: boolean;
  /** 시작 인덱스 (0-based) */
  startIndex: number;
  /** 종료 인덱스 (0-based, exclusive) */
  endIndex: number;
}

/**
 * 센터 목록 페이지네이션
 *
 * @param centers - 전체 센터 목록
 * @param page - 현재 페이지 번호 (1-based)
 * @param itemsPerPage - 페이지당 아이템 수 (기본값: 20)
 * @returns 페이지네이션 결과
 *
 * @example
 * ```typescript
 * const result = paginateCenters(centers, 1, 20);
 * // result.paginatedItems: 1-20번째 센터
 * // result.totalPages: 전체 페이지 수
 * // result.hasNextPage: true
 * ```
 */
export function paginateCenters<T = CenterMarkerData>(
  centers: T[],
  page: number,
  itemsPerPage: number = 20
): PaginationResult<T> {
  const totalItems = centers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // 페이지 번호 검증 및 보정
  const validatedPage = Math.max(1, Math.min(page, totalPages || 1));

  // 시작/종료 인덱스 계산
  const startIndex = (validatedPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // 페이지 아이템 추출
  const paginatedItems = centers.slice(startIndex, endIndex);

  return {
    paginatedItems,
    totalPages: totalPages || 1, // 최소 1페이지
    currentPage: validatedPage,
    totalItems,
    itemsPerPage,
    hasPrevPage: validatedPage > 1,
    hasNextPage: validatedPage < totalPages,
    startIndex,
    endIndex,
  };
}

/**
 * 페이지 범위 계산 (페이지 번호 목록 생성)
 *
 * @param currentPage - 현재 페이지
 * @param totalPages - 전체 페이지 수
 * @param maxVisible - 최대 표시 페이지 수 (기본값: 5)
 * @returns 표시할 페이지 번호 배열
 *
 * @example
 * ```typescript
 * getPageRange(5, 10, 5);
 * // Returns: [3, 4, 5, 6, 7]
 *
 * getPageRange(2, 10, 5);
 * // Returns: [1, 2, 3, 4, 5]
 *
 * getPageRange(9, 10, 5);
 * // Returns: [6, 7, 8, 9, 10]
 * ```
 */
export function getPageRange(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] {
  if (totalPages <= maxVisible) {
    // 전체 페이지가 maxVisible보다 작으면 모두 표시
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // 중앙 정렬 계산
  const halfVisible = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - halfVisible);
  const end = Math.min(totalPages, start + maxVisible - 1);

  // 끝에 도달했을 때 시작점 조정
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * 페이지 정보 텍스트 생성
 *
 * @param currentPage - 현재 페이지
 * @param totalItems - 전체 아이템 수
 * @param itemsPerPage - 페이지당 아이템 수
 * @returns 페이지 정보 텍스트 (예: "1-20 of 47")
 *
 * @example
 * ```typescript
 * getPageInfo(1, 47, 20);
 * // Returns: "1-20 of 47"
 *
 * getPageInfo(3, 47, 20);
 * // Returns: "41-47 of 47"
 * ```
 */
export function getPageInfo(
  currentPage: number,
  totalItems: number,
  itemsPerPage: number
): string {
  if (totalItems === 0) {
    return '0-0 of 0';
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return `${startIndex}-${endIndex} of ${totalItems}`;
}
