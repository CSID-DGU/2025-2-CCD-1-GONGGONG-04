/**
 * Center Filtering Utilities - Unit Tests
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 센터 필터링 유틸리티 함수 단위 테스트
 * - 목표 커버리지: >90%
 */

import { describe, it, expect } from 'vitest';
import type { CenterMarkerData } from '@/lib/api/centers';
import {
  applyFilters,
  extractCenterTypes,
  extractRegions,
  countActiveFilters,
  type CenterFilters,
} from '../filterCenters';

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

describe('applyFilters', () => {
  it('필터가 없을 때 모든 센터를 반환한다', () => {
    const result = applyFilters(mockCenters, {});
    expect(result).toEqual(mockCenters);
    expect(result).toHaveLength(5);
  });

  it('검색어로 센터명을 필터링한다', () => {
    const result = applyFilters(mockCenters, { searchQuery: '강남' });
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.name.includes('강남'))).toBe(true);
  });

  it('검색어로 주소를 필터링한다', () => {
    const result = applyFilters(mockCenters, { searchQuery: '서초구' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('검색어 대소문자를 무시한다', () => {
    const result = applyFilters(mockCenters, { searchQuery: '부산' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it('빈 검색어는 모든 센터를 반환한다', () => {
    const result = applyFilters(mockCenters, { searchQuery: '' });
    expect(result).toHaveLength(5);
  });

  it('공백만 있는 검색어는 모든 센터를 반환한다', () => {
    const result = applyFilters(mockCenters, { searchQuery: '   ' });
    expect(result).toHaveLength(5);
  });

  it('센터 유형으로 필터링한다 (OR 로직)', () => {
    const result = applyFilters(mockCenters, {
      centerTypes: ['정신건강복지센터'],
    });
    expect(result).toHaveLength(3);
    expect(result.every((c) => c.centerType === '정신건강복지센터')).toBe(true);
  });

  it('여러 센터 유형으로 필터링한다 (OR 로직)', () => {
    const result = applyFilters(mockCenters, {
      centerTypes: ['정신건강복지센터', '중독관리통합지원센터'],
    });
    expect(result).toHaveLength(4);
  });

  it('빈 센터 유형 배열은 모든 센터를 반환한다', () => {
    const result = applyFilters(mockCenters, { centerTypes: [] });
    expect(result).toHaveLength(5);
  });

  it('시/도로 필터링한다', () => {
    const result = applyFilters(mockCenters, {
      region: { province: '서울특별시' },
    });
    expect(result).toHaveLength(3);
    expect(result.every((c) => c.roadAddress.includes('서울특별시'))).toBe(true);
  });

  it('시/군/구로 필터링한다', () => {
    const result = applyFilters(mockCenters, {
      region: { district: '강남구' },
    });
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.roadAddress.includes('강남구'))).toBe(true);
  });

  it('시/도와 시/군/구로 동시 필터링한다 (AND 로직)', () => {
    const result = applyFilters(mockCenters, {
      region: { province: '서울특별시', district: '강남구' },
    });
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.roadAddress.includes('서울특별시'))).toBe(true);
    expect(result.every((c) => c.roadAddress.includes('강남구'))).toBe(true);
  });

  it('일치하지 않는 지역 필터는 빈 배열을 반환한다', () => {
    const result = applyFilters(mockCenters, {
      region: { province: '제주특별자치도' },
    });
    expect(result).toHaveLength(0);
  });

  it('운영 상태로 필터링한다', () => {
    const result = applyFilters(mockCenters, { operatingStatus: 'OPEN' });
    expect(result).toHaveLength(1);
    expect(result[0].operatingStatus).toBe('OPEN');
  });

  it('CLOSED 상태로 필터링한다', () => {
    const result = applyFilters(mockCenters, { operatingStatus: 'CLOSED' });
    expect(result).toHaveLength(1);
    expect(result[0].operatingStatus).toBe('CLOSED');
  });

  it('여러 필터를 동시에 적용한다', () => {
    const result = applyFilters(mockCenters, {
      searchQuery: '서울',
      centerTypes: ['정신건강복지센터'],
      region: { province: '서울특별시', district: '강남구' },
      operatingStatus: 'OPEN',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('모든 필터를 통과하지 못하면 빈 배열을 반환한다', () => {
    const result = applyFilters(mockCenters, {
      searchQuery: '존재하지 않는 센터',
      centerTypes: ['존재하지 않는 유형'],
      region: { province: '존재하지 않는 지역' },
    });
    expect(result).toHaveLength(0);
  });
});

describe('extractCenterTypes', () => {
  it('고유한 센터 유형 목록을 추출한다', () => {
    const result = extractCenterTypes(mockCenters);
    expect(result).toHaveLength(3);
    expect(result).toContain('정신건강복지센터');
    expect(result).toContain('중독관리통합지원센터');
    expect(result).toContain('자살예방센터');
  });

  it('센터 유형을 정렬하여 반환한다', () => {
    const result = extractCenterTypes(mockCenters);
    expect(result).toEqual([
      '자살예방센터',
      '정신건강복지센터',
      '중독관리통합지원센터',
    ]);
  });

  it('빈 배열을 입력하면 빈 배열을 반환한다', () => {
    const result = extractCenterTypes([]);
    expect(result).toEqual([]);
  });

  it('중복된 센터 유형을 제거한다', () => {
    const duplicateCenters = [
      ...mockCenters,
      { ...mockCenters[0], id: 100 }, // 중복
    ];
    const result = extractCenterTypes(duplicateCenters);
    expect(result).toHaveLength(3);
  });
});

describe('extractRegions', () => {
  it('고유한 시/도 목록을 추출한다', () => {
    const result = extractRegions(mockCenters);
    expect(result.provinces).toHaveLength(3);
    expect(result.provinces).toContain('서울특별시');
    expect(result.provinces).toContain('부산광역시');
    expect(result.provinces).toContain('경기도');
  });

  it('시/도를 정렬하여 반환한다', () => {
    const result = extractRegions(mockCenters);
    expect(result.provinces).toEqual(['경기도', '부산광역시', '서울특별시']);
  });

  it('시/도별 시/군/구 목록을 추출한다', () => {
    const result = extractRegions(mockCenters);
    expect(result.districts['서울특별시']).toContain('강남구');
    expect(result.districts['서울특별시']).toContain('서초구');
    expect(result.districts['부산광역시']).toContain('해운대구');
    expect(result.districts['경기도']).toContain('성남시');
  });

  it('시/군/구를 정렬하여 반환한다', () => {
    const result = extractRegions(mockCenters);
    expect(result.districts['서울특별시']).toEqual(['강남구', '서초구']);
  });

  it('빈 배열을 입력하면 빈 결과를 반환한다', () => {
    const result = extractRegions([]);
    expect(result.provinces).toEqual([]);
    expect(result.districts).toEqual({});
  });

  it('중복된 지역을 제거한다', () => {
    const duplicateCenters = [
      ...mockCenters,
      { ...mockCenters[0], id: 100 }, // 강남구 중복
    ];
    const result = extractRegions(duplicateCenters);
    expect(result.districts['서울특별시']).toEqual(['강남구', '서초구']);
  });
});

describe('countActiveFilters', () => {
  it('필터가 없을 때 0을 반환한다', () => {
    const result = countActiveFilters({});
    expect(result).toBe(0);
  });

  it('센터 유형 필터 개수를 계산한다', () => {
    const result = countActiveFilters({
      centerTypes: ['정신건강복지센터', '중독관리통합지원센터'],
    });
    expect(result).toBe(2);
  });

  it('빈 센터 유형 배열은 카운트하지 않는다', () => {
    const result = countActiveFilters({ centerTypes: [] });
    expect(result).toBe(0);
  });

  it('시/도 필터를 카운트한다', () => {
    const result = countActiveFilters({
      region: { province: '서울특별시' },
    });
    expect(result).toBe(1);
  });

  it('시/군/구 필터를 카운트한다', () => {
    const result = countActiveFilters({
      region: { district: '강남구' },
    });
    expect(result).toBe(1);
  });

  it('시/도와 시/군/구 필터를 각각 카운트한다', () => {
    const result = countActiveFilters({
      region: { province: '서울특별시', district: '강남구' },
    });
    expect(result).toBe(2);
  });

  it('운영 상태 필터를 카운트한다', () => {
    const result = countActiveFilters({ operatingStatus: 'OPEN' });
    expect(result).toBe(1);
  });

  it('모든 필터를 카운트한다', () => {
    const result = countActiveFilters({
      centerTypes: ['정신건강복지센터', '중독관리통합지원센터'],
      region: { province: '서울특별시', district: '강남구' },
      operatingStatus: 'OPEN',
    });
    expect(result).toBe(5); // 2 (centerTypes) + 1 (province) + 1 (district) + 1 (operatingStatus)
  });

  it('검색어는 카운트에 포함되지 않는다', () => {
    const result = countActiveFilters({ searchQuery: '강남' });
    expect(result).toBe(0);
  });
});
