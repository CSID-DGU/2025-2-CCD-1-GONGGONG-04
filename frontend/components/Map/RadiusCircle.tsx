/**
 * RadiusCircle Component
 *
 * Sprint 2 - Day 8
 *
 * 선택한 반경을 지도에 원으로 표시
 *
 * @example
 * const { currentLocation } = useMapStore();
 *
 * {currentLocation && (
 *   <RadiusCircle
 *     map={mapInstance}
 *     center={currentLocation}
 *   />
 * )}
 */

'use client';

import { useEffect, useState } from 'react';
import { useMapStore } from '@/store/mapStore';
import { getRadiusInMeters } from '@/lib/map/utils';

interface RadiusCircleProps {
  /**
   * Kakao Map 인스턴스
   */
  map: kakao.maps.Map;

  /**
   * 원의 중심 좌표
   */
  center: {
    lat: number;
    lng: number;
  };
}

/**
 * 반경 원 컴포넌트
 */
export function RadiusCircle({ map, center }: RadiusCircleProps) {
  const { radius, showCircle } = useMapStore();
  const [circle, setCircle] = useState<kakao.maps.Circle | null>(null);

  useEffect(() => {
    if (!map || !showCircle) {
      // 원 제거
      if (circle) {
        circle.setMap(null);
        setCircle(null);
      }
      return;
    }

    const latLng = new kakao.maps.LatLng(center.lat, center.lng);
    const radiusMeters = getRadiusInMeters(radius);

    if (circle) {
      // 기존 원 업데이트
      circle.setPosition(latLng);
      circle.setRadius(radiusMeters);
    } else {
      // 새 원 생성
      const newCircle = new kakao.maps.Circle({
        center: latLng,
        radius: radiusMeters,
        strokeWeight: 2,
        strokeColor: '#A855F7', // lavender-500
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
        fillColor: '#A855F7',
        fillOpacity: 0.1,
        zIndex: 50, // 마커보다 아래
      });

      newCircle.setMap(map);
      setCircle(newCircle);
    }

    // 클린업
    return () => {
      if (circle) {
        circle.setMap(null);
      }
    };
  }, [map, center, radius, showCircle, circle]);

  return null; // 렌더링 없음 (지도 Overlay만)
}
