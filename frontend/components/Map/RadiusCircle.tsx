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

import { useEffect, useRef } from 'react';
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
  const circleRef = useRef<kakao.maps.Circle | null>(null);

  // 원 생성 및 업데이트
  useEffect(() => {
    if (!map || !showCircle) {
      // 원 제거
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      return;
    }

    const latLng = new kakao.maps.LatLng(center.lat, center.lng);
    const radiusMeters = getRadiusInMeters(radius);

    console.log(`반경원 업데이트: 중심(${center.lat}, ${center.lng}), 반경: ${radius}km (${radiusMeters}m)`);

    if (circleRef.current) {
      // 기존 원 업데이트
      console.log('기존 원 업데이트');
      circleRef.current.setPosition(latLng);
      circleRef.current.setRadius(radiusMeters);
    } else {
      // 새 원 생성
      console.log('새 원 생성');
      const newCircle = new kakao.maps.Circle({
        center: latLng,
        radius: radiusMeters,
        strokeWeight: 3, // 더 두껍게
        strokeColor: '#A855F7', // lavender-500
        strokeOpacity: 1, // 더 진하게
        strokeStyle: 'solid',
        fillColor: '#A855F7',
        fillOpacity: 0.15, // 조금 더 진하게
        zIndex: 50, // 마커보다 아래
      });

      newCircle.setMap(map);
      circleRef.current = newCircle;
    }
  }, [map, center.lat, center.lng, radius, showCircle]);

  // 컴포넌트 언마운트 시에만 정리
  useEffect(() => {
    return () => {
      console.log('RadiusCircle 언마운트: 원 제거');
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, []);

  return null; // 렌더링 없음 (지도 Overlay만)
}
