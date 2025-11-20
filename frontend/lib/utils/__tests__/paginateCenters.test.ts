/**
 * Pagination Utilities - Unit Tests
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 페이지네이션 유틸리티 함수 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  paginateCenters,
  getPageRange,
  getPageInfo,
  type PaginationResult,
} from '../paginateCenters';

/**
 * Mock 데이터 (50개 아이템)
 */
const mockItems = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

describe('paginateCenters', () => {
  it('첫 페이지 아이템을 정확히 반환한다', () => {
    const result = paginateCenters(mockItems, 1, 20);

    expect(result.paginatedItems).toHaveLength(20);
    expect(result.paginatedItems[0].id).toBe(1);
    expect(result.paginatedItems[19].id).toBe(20);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(3);
  });

  it('중간 페이지 아이템을 정확히 반환한다', () => {
    const result = paginateCenters(mockItems, 2, 20);

    expect(result.paginatedItems).toHaveLength(20);
    expect(result.paginatedItems[0].id).toBe(21);
    expect(result.paginatedItems[19].id).toBe(40);
    expect(result.currentPage).toBe(2);
  });

  it('마지막 페이지 아이템을 정확히 반환한다 (불완전한 페이지)', () => {
    const result = paginateCenters(mockItems, 3, 20);

    expect(result.paginatedItems).toHaveLength(10); // 50 - 40 = 10
    expect(result.paginatedItems[0].id).toBe(41);
    expect(result.paginatedItems[9].id).toBe(50);
    expect(result.currentPage).toBe(3);
  });

  it('전체 페이지 수를 정확히 계산한다', () => {
    const result1 = paginateCenters(mockItems, 1, 20);
    expect(result1.totalPages).toBe(3); // 50 / 20 = 2.5 => 3

    const result2 = paginateCenters(mockItems, 1, 10);
    expect(result2.totalPages).toBe(5); // 50 / 10 = 5

    const result3 = paginateCenters(mockItems, 1, 25);
    expect(result3.totalPages).toBe(2); // 50 / 25 = 2
  });

  it('hasPrevPage와 hasNextPage를 정확히 설정한다', () => {
    const firstPage = paginateCenters(mockItems, 1, 20);
    expect(firstPage.hasPrevPage).toBe(false);
    expect(firstPage.hasNextPage).toBe(true);

    const middlePage = paginateCenters(mockItems, 2, 20);
    expect(middlePage.hasPrevPage).toBe(true);
    expect(middlePage.hasNextPage).toBe(true);

    const lastPage = paginateCenters(mockItems, 3, 20);
    expect(lastPage.hasPrevPage).toBe(true);
    expect(lastPage.hasNextPage).toBe(false);
  });

  it('startIndex와 endIndex를 정확히 계산한다', () => {
    const page1 = paginateCenters(mockItems, 1, 20);
    expect(page1.startIndex).toBe(0);
    expect(page1.endIndex).toBe(20);

    const page2 = paginateCenters(mockItems, 2, 20);
    expect(page2.startIndex).toBe(20);
    expect(page2.endIndex).toBe(40);

    const page3 = paginateCenters(mockItems, 3, 20);
    expect(page3.startIndex).toBe(40);
    expect(page3.endIndex).toBe(50);
  });

  it('범위를 벗어난 페이지 번호를 보정한다', () => {
    const tooLow = paginateCenters(mockItems, 0, 20);
    expect(tooLow.currentPage).toBe(1);

    const tooHigh = paginateCenters(mockItems, 999, 20);
    expect(tooHigh.currentPage).toBe(3); // 최대 페이지로 보정
  });

  it('음수 페이지 번호를 1로 보정한다', () => {
    const result = paginateCenters(mockItems, -5, 20);
    expect(result.currentPage).toBe(1);
    expect(result.paginatedItems[0].id).toBe(1);
  });

  it('빈 배열을 처리한다', () => {
    const result = paginateCenters([], 1, 20);

    expect(result.paginatedItems).toEqual([]);
    expect(result.totalPages).toBe(1); // 최소 1페이지
    expect(result.totalItems).toBe(0);
    expect(result.hasPrevPage).toBe(false);
    expect(result.hasNextPage).toBe(false);
  });

  it('페이지당 아이템 수가 전체보다 많을 때 모두 반환한다', () => {
    const smallArray = mockItems.slice(0, 5);
    const result = paginateCenters(smallArray, 1, 20);

    expect(result.paginatedItems).toHaveLength(5);
    expect(result.totalPages).toBe(1);
    expect(result.hasNextPage).toBe(false);
  });

  it('기본 itemsPerPage 값(20)을 사용한다', () => {
    const result = paginateCenters(mockItems, 1);
    expect(result.itemsPerPage).toBe(20);
    expect(result.paginatedItems).toHaveLength(20);
  });

  it('totalItems 값이 정확하다', () => {
    const result = paginateCenters(mockItems, 1, 20);
    expect(result.totalItems).toBe(50);
  });
});

describe('getPageRange', () => {
  it('전체 페이지가 maxVisible보다 작으면 모든 페이지를 반환한다', () => {
    const result = getPageRange(1, 3, 5);
    expect(result).toEqual([1, 2, 3]);
  });

  it('현재 페이지를 중앙에 배치한다', () => {
    const result = getPageRange(5, 10, 5);
    expect(result).toEqual([3, 4, 5, 6, 7]);
  });

  it('첫 페이지 근처에서 범위를 조정한다', () => {
    const result = getPageRange(2, 10, 5);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('마지막 페이지 근처에서 범위를 조정한다', () => {
    const result = getPageRange(9, 10, 5);
    expect(result).toEqual([6, 7, 8, 9, 10]);
  });

  it('페이지가 정확히 maxVisible일 때 모두 반환한다', () => {
    const result = getPageRange(3, 5, 5);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('단일 페이지를 처리한다', () => {
    const result = getPageRange(1, 1, 5);
    expect(result).toEqual([1]);
  });

  it('maxVisible이 1일 때 현재 페이지만 반환한다', () => {
    const result = getPageRange(5, 10, 1);
    expect(result).toEqual([5]);
  });

  it('기본 maxVisible 값(5)을 사용한다', () => {
    const result = getPageRange(5, 10);
    expect(result).toEqual([3, 4, 5, 6, 7]);
  });

  it('연속된 페이지 번호를 반환한다', () => {
    const result = getPageRange(7, 15, 7);
    expect(result).toEqual([4, 5, 6, 7, 8, 9, 10]);
  });

  it('마지막 페이지에서 정확한 범위를 반환한다', () => {
    const result = getPageRange(10, 10, 5);
    expect(result).toEqual([6, 7, 8, 9, 10]);
  });
});

describe('getPageInfo', () => {
  it('첫 페이지 정보를 올바르게 생성한다', () => {
    const result = getPageInfo(1, 47, 20);
    expect(result).toBe('1-20 of 47');
  });

  it('중간 페이지 정보를 올바르게 생성한다', () => {
    const result = getPageInfo(2, 47, 20);
    expect(result).toBe('21-40 of 47');
  });

  it('마지막 페이지 정보를 올바르게 생성한다 (불완전한 페이지)', () => {
    const result = getPageInfo(3, 47, 20);
    expect(result).toBe('41-47 of 47');
  });

  it('빈 목록을 처리한다', () => {
    const result = getPageInfo(1, 0, 20);
    expect(result).toBe('0-0 of 0');
  });

  it('단일 아이템 페이지를 처리한다', () => {
    const result = getPageInfo(1, 1, 20);
    expect(result).toBe('1-1 of 1');
  });

  it('페이지당 아이템 수가 전체보다 많을 때 올바르게 처리한다', () => {
    const result = getPageInfo(1, 5, 20);
    expect(result).toBe('1-5 of 5');
  });

  it('정확히 페이지당 아이템 수만큼 있을 때 올바르게 처리한다', () => {
    const result = getPageInfo(1, 20, 20);
    expect(result).toBe('1-20 of 20');
  });

  it('두 번째 페이지에서 정확한 범위를 표시한다', () => {
    const result = getPageInfo(2, 100, 20);
    expect(result).toBe('21-40 of 100');
  });

  it('다양한 itemsPerPage 값을 처리한다', () => {
    const result1 = getPageInfo(1, 50, 10);
    expect(result1).toBe('1-10 of 50');

    const result2 = getPageInfo(3, 50, 10);
    expect(result2).toBe('21-30 of 50');
  });
});
