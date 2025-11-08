/**
 * RadiusChangeHandler Component
 *
 * Sprint 2 - Day 8
 *
 * 반경 변경 시 지도 줌 조정 및 API 재호출을 처리
 * (렌더링 없는 로직 컴포넌트)
 *
 * @example
 * const { refetch } = useCenterData();
 *
 * <RadiusChangeHandler
 *   map={mapInstance}
 *   onRadiusChange={refetch}
 * />
 */

'use client';

import { useEffect } from 'react';
import { useMapStore } from '@/store/mapStore';
import { adjustZoomForRadius } from '@/lib/map/utils';

interface RadiusChangeHandlerProps {
  /**
   * Kakao Map 인스턴스
   */
  map: kakao.maps.Map | null;

  /**
   * API 재호출 함수 (optional)
   */
  onRadiusChange?: () => void;
}

/**
 * 반경 변경 핸들러
 */
export function RadiusChangeHandler({ map, onRadiusChange }: RadiusChangeHandlerProps) {
  const { radius } = useMapStore();

  useEffect(() => {
    if (!map) return;

    // 1. 지도 줌 자동 조정
    adjustZoomForRadius(map, radius);

    // 2. API 재호출 (optional)
    if (onRadiusChange) {
      // 디바운싱 (500ms)
      const timer = setTimeout(() => {
        onRadiusChange();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [map, radius, onRadiusChange]);

  return null; // 렌더링 없음
}
