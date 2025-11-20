/**
 * Center Filtering Utilities
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 센터 목록 필터링 유틸리티 함수
 * - 센터 유형 필터 (OR 로직)
 * - 지역 필터 (AND 로직)
 * - 운영 상태 필터
 * - 검색어 필터 (센터명, 주소)
 */

import type { CenterMarkerData } from '@/lib/api/centers';

/**
 * 필터 옵션 타입
 */
export interface CenterFilters {
  /** 센터 유형 (다중 선택, OR 로직) */
  centerTypes?: string[];
  /** 지역 필터 (시/도, 시/군/구) */
  region?: {
    /** 시/도 (예: "서울특별시") */
    province?: string;
    /** 시/군/구 (예: "강남구") */
    district?: string;
  };
  /** 운영 상태 (단일 선택) */
  operatingStatus?: CenterMarkerData['operatingStatus'];
  /** 검색어 (센터명, 주소) */
  searchQuery?: string;
}

/**
 * 검색어 매칭 (센터명 + 주소)
 */
function matchesSearchQuery(
  center: CenterMarkerData,
  query: string
): boolean {
  if (!query || query.trim() === '') {
    return true;
  }

  const normalizedQuery = query.toLowerCase().trim();

  // 센터명 매칭
  const nameMatch = center.name.toLowerCase().includes(normalizedQuery);

  // 주소 매칭
  const addressMatch = center.roadAddress.toLowerCase().includes(normalizedQuery);

  return nameMatch || addressMatch;
}

/**
 * 센터 유형 필터 (OR 로직)
 */
function matchesCenterType(
  center: CenterMarkerData,
  types: string[]
): boolean {
  if (!types || types.length === 0) {
    return true; // 필터 없으면 모두 통과
  }

  return types.includes(center.centerType);
}

/**
 * 지역 필터 (AND 로직)
 */
function matchesRegion(
  center: CenterMarkerData,
  region?: { province?: string; district?: string }
): boolean {
  if (!region) {
    return true; // 필터 없으면 모두 통과
  }

  const { province, district } = region;

  // 시/도 필터
  if (province && !center.roadAddress.includes(province)) {
    return false;
  }

  // 시/군/구 필터
  if (district && !center.roadAddress.includes(district)) {
    return false;
  }

  return true;
}

/**
 * 운영 상태 필터
 */
function matchesOperatingStatus(
  center: CenterMarkerData,
  status?: CenterMarkerData['operatingStatus']
): boolean {
  if (!status) {
    return true; // 필터 없으면 모두 통과
  }

  return center.operatingStatus === status;
}

/**
 * 센터 목록에 필터 적용
 *
 * @param centers - 필터링할 센터 목록
 * @param filters - 적용할 필터 조건
 * @returns 필터링된 센터 목록
 *
 * @example
 * ```typescript
 * const filtered = applyFilters(centers, {
 *   centerTypes: ['정신건강복지센터', '중독관리통합지원센터'],
 *   region: { province: '서울특별시', district: '강남구' },
 *   operatingStatus: 'OPEN',
 *   searchQuery: '강남',
 * });
 * ```
 */
export function applyFilters(
  centers: CenterMarkerData[],
  filters: CenterFilters
): CenterMarkerData[] {
  return centers.filter((center) => {
    // 검색어 필터
    if (!matchesSearchQuery(center, filters.searchQuery || '')) {
      return false;
    }

    // 센터 유형 필터 (OR 로직)
    if (!matchesCenterType(center, filters.centerTypes || [])) {
      return false;
    }

    // 지역 필터 (AND 로직)
    if (!matchesRegion(center, filters.region)) {
      return false;
    }

    // 운영 상태 필터
    if (!matchesOperatingStatus(center, filters.operatingStatus)) {
      return false;
    }

    return true; // 모든 필터 통과
  });
}

/**
 * 센터 유형 목록 추출 (중복 제거)
 *
 * @param centers - 센터 목록
 * @returns 고유한 센터 유형 목록
 *
 * @example
 * ```typescript
 * const types = extractCenterTypes(centers);
 * // ["정신건강복지센터", "중독관리통합지원센터", ...]
 * ```
 */
export function extractCenterTypes(centers: CenterMarkerData[]): string[] {
  const types = new Set(centers.map((center) => center.centerType));
  return Array.from(types).sort();
}

/**
 * 지역 목록 추출 (중복 제거)
 *
 * @param centers - 센터 목록
 * @returns 고유한 시/도 및 시/군/구 목록
 *
 * @example
 * ```typescript
 * const regions = extractRegions(centers);
 * // { provinces: ["서울특별시", ...], districts: { "서울특별시": ["강남구", ...] } }
 * ```
 */
export function extractRegions(centers: CenterMarkerData[]): {
  provinces: string[];
  districts: Record<string, string[]>;
} {
  const provinces = new Set<string>();
  const districtsByProvince: Record<string, Set<string>> = {};

  centers.forEach((center) => {
    // 주소에서 시/도 추출 (첫 번째 공백 또는 특별시/광역시/도까지)
    const provinceMatch = center.roadAddress.match(
      /^(.*?(?:특별시|광역시|특별자치시|도|특별자치도))/
    );

    if (provinceMatch) {
      const province = provinceMatch[1];
      provinces.add(province);

      // 시/군/구 추출 (시/도 다음 부분)
      const districtMatch = center.roadAddress
        .substring(province.length)
        .trim()
        .match(/^(.*?(?:시|군|구))/);

      if (districtMatch) {
        const district = districtMatch[1].trim();

        if (!districtsByProvince[province]) {
          districtsByProvince[province] = new Set();
        }

        districtsByProvince[province].add(district);
      }
    }
  });

  // Set을 배열로 변환하고 정렬
  const result: { provinces: string[]; districts: Record<string, string[]> } = {
    provinces: Array.from(provinces).sort(),
    districts: {},
  };

  Object.keys(districtsByProvince).forEach((province) => {
    result.districts[province] = Array.from(districtsByProvince[province]).sort();
  });

  return result;
}

/**
 * 활성 필터 개수 계산
 *
 * @param filters - 필터 조건
 * @returns 활성화된 필터의 개수
 *
 * @example
 * ```typescript
 * const count = countActiveFilters({
 *   centerTypes: ['정신건강복지센터'],
 *   region: { province: '서울특별시' },
 * });
 * // count === 2
 * ```
 */
export function countActiveFilters(filters: CenterFilters): number {
  let count = 0;

  if (filters.centerTypes && filters.centerTypes.length > 0) {
    count += filters.centerTypes.length;
  }

  if (filters.region?.province) {
    count += 1;
  }

  if (filters.region?.district) {
    count += 1;
  }

  if (filters.operatingStatus) {
    count += 1;
  }

  return count;
}
