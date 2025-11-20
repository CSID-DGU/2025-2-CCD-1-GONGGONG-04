/**
 * useFilteredCenters Hook - Unit Tests
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 센터 필터링 훅 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { CenterMarkerData } from '@/lib/api/centers';
import { useFilteredCenters } from '../useFilteredCenters';

/**
 * Mock 센터 데이터
 */
const mockCenters: CenterMarkerData[] = [
  {
    id: 1,
    name: '서울시 강남구 정신건강복지센터',
    latitude: 37.5172,
    longitude: 127.0473,
    distance: 500,
    walkTime: '5분',
    operatingStatus: 'OPEN',
    closingTime: '18:00',
    nextOpenDate: null,
    avgRating: 4.5,
    reviewCount: 120,
    centerType: '정신건강복지센터',
    roadAddress: '서울특별시 강남구 선릉로 123',
    phoneNumber: '02-1234-5678',
  },
  {
    id: 2,
    name: '서울시 서초구 중독관리통합지원센터',
    latitude: 37.4837,
    longitude: 127.0324,
    distance: 1200,
    walkTime: '15분',
    operatingStatus: 'CLOSED',
    closingTime: null,
    nextOpenDate: '2025-01-20',
    avgRating: 4.2,
    reviewCount: 85,
    centerType: '중독관리통합지원센터',
    roadAddress: '서울특별시 서초구 반포대로 456',
    phoneNumber: '02-2345-6789',
  },
  {
    id: 3,
    name: '부산광역시 해운대구 정신건강복지센터',
    latitude: 35.1631,
    longitude: 129.1639,
    distance: 50000,
    walkTime: '도보 불가',
    operatingStatus: 'HOLIDAY',
    closingTime: null,
    nextOpenDate: '2025-01-21',
    avgRating: 4.8,
    reviewCount: 200,
    centerType: '정신건강복지센터',
    roadAddress: '부산광역시 해운대구 해운대로 789',
    phoneNumber: '051-1234-5678',
  },
  {
    id: 4,
    name: '서울시 강남구 자살예방센터',
    latitude: 37.5172,
    longitude: 127.0473,
    distance: 800,
    walkTime: '10분',
    operatingStatus: 'CLOSING_SOON',
    closingTime: '17:30',
    nextOpenDate: null,
    avgRating: 4.0,
    reviewCount: 50,
    centerType: '자살예방센터',
    roadAddress: '서울특별시 강남구 테헤란로 101',
    phoneNumber: '02-3456-7890',
  },
  {
    id: 5,
    name: '경기도 성남시 정신건강복지센터',
    latitude: 37.4201,
    longitude: 127.1266,
    distance: 5000,
    walkTime: '60분',
    operatingStatus: 'TEMP_CLOSED',
    closingTime: null,
    nextOpenDate: '2025-02-01',
    avgRating: 3.8,
    reviewCount: 30,
    centerType: '정신건강복지센터',
    roadAddress: '경기도 성남시 분당구 정자로 202',
    phoneNumber: '031-1234-5678',
  },
];

describe('useFilteredCenters', () => {
  it('필터가 없을 때 모든 센터를 반환한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
      })
    );

    expect(result.current.filteredCenters).toEqual(mockCenters);
    expect(result.current.totalCount).toBe(5);
    expect(result.current.filteredCount).toBe(5);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('빈 검색어와 빈 필터로 모든 센터를 반환한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
        searchQuery: '',
        filters: {},
      })
    );

    expect(result.current.filteredCenters).toHaveLength(5);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('검색어로 센터를 필터링한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
        searchQuery: '강남',
      })
    );

    expect(result.current.filteredCenters).toHaveLength(2);
    expect(result.current.filteredCount).toBe(2);
    expect(result.current.totalCount).toBe(5);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('공백만 있는 검색어는 필터가 활성화되지 않는다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
        searchQuery: '   ',
      })
    );

    expect(result.current.filteredCenters).toHaveLength(5);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('센터 유형으로 필터링한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
        filters: {
          centerTypes: ['정신건강복지센터'],
        },
      })
    );

    expect(result.current.filteredCenters).toHaveLength(3);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('여러 센터 유형으로 필터링한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
        filters: {
          centerTypes: ['정신건강복지센터', '중독관리통합지원센터'],
        },
      })
    );

    expect(result.current.filteredCenters).toHaveLength(4);
    expect(result.current.filteredCount).toBe(4);
  });

  it('빈 센터 유형 배열은 필터가 활성화되지 않는다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
        filters: {
          centerTypes: [],
        },
      })
    );

    expect(result.current.filteredCenters).toHaveLength(5);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('지역 필터 (시/도)로 필터링한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
        filters: {
          region: { province: '서울특별시' },
        },
      })
    );

    expect(result.current.filteredCenters).toHaveLength(3);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('지역 필터 (시/군/구)로 필터링한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
        filters: {
          region: { district: '강남구' },
        },
      })
    );

    expect(result.current.filteredCenters).toHaveLength(2);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('시/도와 시/군/구로 동시 필터링한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
        filters: {
          region: { province: '서울특별시', district: '강남구' },
        },
      })
    );

    expect(result.current.filteredCenters).toHaveLength(2);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('운영 상태로 필터링한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
        filters: {
          operatingStatus: 'OPEN',
        },
      })
    );

    expect(result.current.filteredCenters).toHaveLength(1);
    expect(result.current.filteredCenters[0].operatingStatus).toBe('OPEN');
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('검색어와 필터를 동시에 적용한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
        searchQuery: '서울',
        filters: {
          centerTypes: ['정신건강복지센터'],
          region: { province: '서울특별시' },
          operatingStatus: 'OPEN',
        },
      })
    );

    expect(result.current.filteredCenters).toHaveLength(1);
    expect(result.current.filteredCenters[0].id).toBe(1);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('필터 결과가 없으면 빈 배열을 반환한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: mockCenters,
        searchQuery: '존재하지 않는 센터',
      })
    );

    expect(result.current.filteredCenters).toHaveLength(0);
    expect(result.current.filteredCount).toBe(0);
    expect(result.current.totalCount).toBe(5);
  });

  it('빈 센터 목록을 처리한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: [],
      })
    );

    expect(result.current.filteredCenters).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.filteredCount).toBe(0);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('빈 센터 목록에서 필터를 적용해도 빈 배열을 반환한다', () => {
    const { result } = renderHook(() =>
      useFilteredCenters({
        centers: [],
        searchQuery: '강남',
        filters: {
          centerTypes: ['정신건강복지센터'],
        },
      })
    );

    expect(result.current.filteredCenters).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.filteredCount).toBe(0);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('props 변경 시 필터링 결과가 업데이트된다', () => {
    const { result, rerender } = renderHook(
      ({ centers, searchQuery }) =>
        useFilteredCenters({
          centers,
          searchQuery,
        }),
      {
        initialProps: {
          centers: mockCenters,
          searchQuery: '',
        },
      }
    );

    // 초기 상태: 모든 센터
    expect(result.current.filteredCenters).toHaveLength(5);

    // 검색어 변경
    rerender({
      centers: mockCenters,
      searchQuery: '강남',
    });

    // 필터링된 결과
    expect(result.current.filteredCenters).toHaveLength(2);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('센터 목록 변경 시 필터링 결과가 업데이트된다', () => {
    const { result, rerender } = renderHook(
      ({ centers }) =>
        useFilteredCenters({
          centers,
          searchQuery: '정신건강',
        }),
      {
        initialProps: {
          centers: mockCenters,
        },
      }
    );

    // 초기 상태: 3개 센터
    expect(result.current.filteredCenters).toHaveLength(3);

    // 센터 목록 변경 (첫 2개만)
    rerender({
      centers: mockCenters.slice(0, 2),
    });

    // 업데이트된 결과
    expect(result.current.filteredCenters).toHaveLength(1);
    expect(result.current.totalCount).toBe(2);
  });

  it('필터 변경 시 필터링 결과가 업데이트된다', () => {
    const { result, rerender } = renderHook(
      ({ filters }) =>
        useFilteredCenters({
          centers: mockCenters,
          filters,
        }),
      {
        initialProps: {
          filters: { centerTypes: ['정신건강복지센터'] },
        },
      }
    );

    // 초기 상태
    expect(result.current.filteredCenters).toHaveLength(3);

    // 필터 변경
    rerender({
      filters: { centerTypes: ['자살예방센터'] },
    });

    // 업데이트된 결과
    expect(result.current.filteredCenters).toHaveLength(1);
    expect(result.current.filteredCenters[0].centerType).toBe('자살예방센터');
  });
});
