/**
 * usePagination Hook - Unit Tests
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 페이지네이션 훅 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePagination } from '../usePagination';

/**
 * Mock 데이터 (50개 아이템)
 */
const mockItems = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

describe('usePagination', () => {
  it('첫 페이지 데이터를 올바르게 반환한다', () => {
    const { result } = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 1,
        itemsPerPage: 20,
      })
    );

    expect(result.current.paginatedItems).toHaveLength(20);
    expect(result.current.paginatedItems[0].id).toBe(1);
    expect(result.current.paginatedItems[19].id).toBe(20);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(3);
  });

  it('중간 페이지 데이터를 올바르게 반환한다', () => {
    const { result } = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 2,
        itemsPerPage: 20,
      })
    );

    expect(result.current.paginatedItems).toHaveLength(20);
    expect(result.current.paginatedItems[0].id).toBe(21);
    expect(result.current.paginatedItems[19].id).toBe(40);
    expect(result.current.currentPage).toBe(2);
  });

  it('마지막 페이지 데이터를 올바르게 반환한다', () => {
    const { result } = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 3,
        itemsPerPage: 20,
      })
    );

    expect(result.current.paginatedItems).toHaveLength(10); // 50 - 40 = 10
    expect(result.current.paginatedItems[0].id).toBe(41);
    expect(result.current.paginatedItems[9].id).toBe(50);
  });

  it('페이지 번호 목록을 올바르게 반환한다', () => {
    const { result } = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 2,
        itemsPerPage: 20,
      })
    );

    expect(result.current.pageNumbers).toEqual([1, 2, 3]);
  });

  it('페이지 정보 텍스트를 올바르게 반환한다', () => {
    const page1 = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 1,
        itemsPerPage: 20,
      })
    );
    expect(page1.result.current.pageInfo).toBe('1-20 of 50');

    const page2 = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 2,
        itemsPerPage: 20,
      })
    );
    expect(page2.result.current.pageInfo).toBe('21-40 of 50');

    const page3 = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 3,
        itemsPerPage: 20,
      })
    );
    expect(page3.result.current.pageInfo).toBe('41-50 of 50');
  });

  it('hasPrevPage와 hasNextPage를 올바르게 설정한다', () => {
    const firstPage = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 1,
        itemsPerPage: 20,
      })
    );
    expect(firstPage.result.current.hasPrevPage).toBe(false);
    expect(firstPage.result.current.hasNextPage).toBe(true);

    const middlePage = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 2,
        itemsPerPage: 20,
      })
    );
    expect(middlePage.result.current.hasPrevPage).toBe(true);
    expect(middlePage.result.current.hasNextPage).toBe(true);

    const lastPage = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 3,
        itemsPerPage: 20,
      })
    );
    expect(lastPage.result.current.hasPrevPage).toBe(true);
    expect(lastPage.result.current.hasNextPage).toBe(false);
  });

  it('startIndex와 endIndex를 올바르게 계산한다', () => {
    const page1 = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 1,
        itemsPerPage: 20,
      })
    );
    expect(page1.result.current.startIndex).toBe(0);
    expect(page1.result.current.endIndex).toBe(20);

    const page2 = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 2,
        itemsPerPage: 20,
      })
    );
    expect(page2.result.current.startIndex).toBe(20);
    expect(page2.result.current.endIndex).toBe(40);
  });

  it('totalItems와 totalPages를 올바르게 반환한다', () => {
    const { result } = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 1,
        itemsPerPage: 20,
      })
    );

    expect(result.current.totalItems).toBe(50);
    expect(result.current.totalPages).toBe(3);
  });

  it('빈 배열을 처리한다', () => {
    const { result } = renderHook(() =>
      usePagination({
        items: [],
        currentPage: 1,
        itemsPerPage: 20,
      })
    );

    expect(result.current.paginatedItems).toEqual([]);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.pageInfo).toBe('0-0 of 0');
    expect(result.current.pageNumbers).toEqual([1]);
  });

  it('기본 itemsPerPage 값(20)을 사용한다', () => {
    const { result } = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 1,
      })
    );

    expect(result.current.itemsPerPage).toBe(20);
    expect(result.current.paginatedItems).toHaveLength(20);
  });

  it('기본 maxVisiblePages 값(5)을 사용한다', () => {
    const longList = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }));

    const { result } = renderHook(() =>
      usePagination({
        items: longList,
        currentPage: 5,
        itemsPerPage: 20,
      })
    );

    expect(result.current.pageNumbers).toHaveLength(5);
    expect(result.current.pageNumbers).toEqual([3, 4, 5, 6, 7]);
  });

  it('커스텀 maxVisiblePages를 사용한다', () => {
    const longList = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }));

    const { result } = renderHook(() =>
      usePagination({
        items: longList,
        currentPage: 5,
        itemsPerPage: 20,
        maxVisiblePages: 3,
      })
    );

    expect(result.current.pageNumbers).toHaveLength(3);
    expect(result.current.pageNumbers).toEqual([4, 5, 6]);
  });

  it('props 변경 시 페이지네이션 결과가 업데이트된다', () => {
    const { result, rerender } = renderHook(
      ({ items, currentPage }) =>
        usePagination({
          items,
          currentPage,
          itemsPerPage: 20,
        }),
      {
        initialProps: {
          items: mockItems,
          currentPage: 1,
        },
      }
    );

    // 초기 상태: 페이지 1
    expect(result.current.paginatedItems[0].id).toBe(1);
    expect(result.current.currentPage).toBe(1);

    // 페이지 변경
    rerender({
      items: mockItems,
      currentPage: 2,
    });

    // 업데이트된 결과
    expect(result.current.paginatedItems[0].id).toBe(21);
    expect(result.current.currentPage).toBe(2);
    expect(result.current.pageInfo).toBe('21-40 of 50');
  });

  it('items 변경 시 페이지네이션 결과가 업데이트된다', () => {
    const { result, rerender } = renderHook(
      ({ items }) =>
        usePagination({
          items,
          currentPage: 1,
          itemsPerPage: 20,
        }),
      {
        initialProps: {
          items: mockItems,
        },
      }
    );

    // 초기 상태: 50개 아이템
    expect(result.current.totalItems).toBe(50);
    expect(result.current.totalPages).toBe(3);

    // 아이템 변경 (30개로 축소)
    const shorterList = mockItems.slice(0, 30);
    rerender({
      items: shorterList,
    });

    // 업데이트된 결과
    expect(result.current.totalItems).toBe(30);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.pageInfo).toBe('1-20 of 30');
  });

  it('다양한 itemsPerPage 값을 처리한다', () => {
    const page10 = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 1,
        itemsPerPage: 10,
      })
    );
    expect(page10.result.current.paginatedItems).toHaveLength(10);
    expect(page10.result.current.totalPages).toBe(5);

    const page25 = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 1,
        itemsPerPage: 25,
      })
    );
    expect(page25.result.current.paginatedItems).toHaveLength(25);
    expect(page25.result.current.totalPages).toBe(2);
  });

  it('범위를 벗어난 페이지 번호를 보정한다', () => {
    const tooHigh = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 999,
        itemsPerPage: 20,
      })
    );
    expect(tooHigh.result.current.currentPage).toBe(3); // 최대 페이지로 보정
    expect(tooHigh.result.current.paginatedItems[0].id).toBe(41);
  });

  it('모든 필수 속성을 반환한다', () => {
    const { result } = renderHook(() =>
      usePagination({
        items: mockItems,
        currentPage: 1,
        itemsPerPage: 20,
      })
    );

    // PaginationResult 속성
    expect(result.current).toHaveProperty('paginatedItems');
    expect(result.current).toHaveProperty('totalPages');
    expect(result.current).toHaveProperty('currentPage');
    expect(result.current).toHaveProperty('totalItems');
    expect(result.current).toHaveProperty('itemsPerPage');
    expect(result.current).toHaveProperty('hasPrevPage');
    expect(result.current).toHaveProperty('hasNextPage');
    expect(result.current).toHaveProperty('startIndex');
    expect(result.current).toHaveProperty('endIndex');

    // UsePaginationReturn 추가 속성
    expect(result.current).toHaveProperty('pageNumbers');
    expect(result.current).toHaveProperty('pageInfo');
  });
});
