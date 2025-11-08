/**
 * Map Utilities
 *
 * Sprint 2 - Day 8
 *
 * 지도 관련 유틸리티 함수
 */

import type { RadiusType } from '@/store/mapStore';

/**
 * 반경 값을 미터로 변환
 *
 * @param radius - 반경 타입
 * @returns 미터 단위 반경
 */
export function getRadiusInMeters(radius: RadiusType): number {
  const radiusMap: Record<RadiusType, number> = {
    '1': 1000,
    '3': 3000,
    '5': 5000,
    '10': 10000,
    'all': 50000, // 50km (전체 검색용)
  };

  return radiusMap[radius];
}

/**
 * 반경별 적절한 지도 줌 레벨 반환
 *
 * Kakao Map 줌 레벨:
 * - 1: 가장 확대 (20m)
 * - 14: 가장 축소 (약 64km)
 * - 기본: 3 (약 500m)
 *
 * @param radius - 반경 타입
 * @returns Kakao Map 줌 레벨 (1-14)
 */
export function getZoomLevelForRadius(radius: RadiusType): number {
  const zoomMap: Record<RadiusType, number> = {
    '1': 7, // 1km - 매우 확대
    '3': 9, // 3km - 확대
    '5': 10, // 5km - 기본
    '10': 11, // 10km - 축소
    'all': 12, // 전체 - 매우 축소
  };

  return zoomMap[radius];
}

/**
 * 지도 줌 레벨을 부드럽게 조정
 *
 * @param map - Kakao Map 인스턴스
 * @param radius - 반경 타입
 */
export function adjustZoomForRadius(map: kakao.maps.Map, radius: RadiusType): void {
  const targetLevel = getZoomLevelForRadius(radius);

  // 부드러운 애니메이션 (300ms)
  map.setLevel(targetLevel, {
    animate: {
      duration: 300,
    },
  });
}

/**
 * 반경 표시 문자열 반환
 *
 * @param radius - 반경 타입
 * @returns 사용자 표시 문자열
 */
export function getRadiusDisplay(radius: RadiusType): string {
  const displayMap: Record<RadiusType, string> = {
    '1': '1km',
    '3': '3km',
    '5': '5km',
    '10': '10km',
    'all': '전체',
  };

  return displayMap[radius];
}
