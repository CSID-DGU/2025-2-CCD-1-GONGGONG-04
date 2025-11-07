/**
 * CenterMarker 컴포넌트
 *
 * Kakao Map에 센터 마커를 표시하는 컴포넌트
 * - 운영 상태별 커스텀 아이콘
 * - 클릭 이벤트 처리
 * - 마커 생명주기 관리
 *
 * @component
 */

'use client';

import { useEffect, useRef } from 'react';
import { CenterMarkerData } from '@/lib/api/centers';
import { getMarkerImageOptions } from './markerIcons';

/**
 * CenterMarker Props
 */
export interface CenterMarkerProps {
  /**
   * Kakao Map 인스턴스
   */
  map: kakao.maps.Map;

  /**
   * 센터 데이터
   */
  center: CenterMarkerData;

  /**
   * 마커 클릭 시 호출되는 콜백
   */
  onClick?: (center: CenterMarkerData) => void;

  /**
   * 마커 호버 시 호출되는 콜백
   */
  onMouseOver?: (center: CenterMarkerData) => void;

  /**
   * 마커 호버 해제 시 호출되는 콜백
   */
  onMouseOut?: (center: CenterMarkerData) => void;
}

/**
 * 센터 마커 컴포넌트
 *
 * Kakao Maps API를 사용하여 지도에 마커를 추가합니다
 * 컴포넌트 언마운트 시 자동으로 마커를 제거합니다
 *
 * @example
 * <CenterMarker
 *   map={mapInstance}
 *   center={centerData}
 *   onClick={(center) => console.log('Clicked:', center)}
 * />
 */
export function CenterMarker({
  map,
  center,
  onClick,
  onMouseOver,
  onMouseOut,
}: CenterMarkerProps) {
  const markerRef = useRef<kakao.maps.Marker | null>(null);

  useEffect(() => {
    // 지도 인스턴스나 센터 데이터가 없으면 실행하지 않음
    if (!map || !center || !window.kakao) {
      return;
    }

    // 마커 위치 설정
    const position = new window.kakao.maps.LatLng(
      center.latitude,
      center.longitude
    );

    // 커스텀 마커 이미지 생성
    const imageOptions = getMarkerImageOptions(center.operatingStatus);
    const markerImage = new window.kakao.maps.MarkerImage(
      imageOptions.src,
      imageOptions.size,
      imageOptions.options
    );

    // 마커 생성
    const marker = new window.kakao.maps.Marker({
      position: position,
      image: markerImage,
      title: center.name,
      clickable: true,
      zIndex: center.operatingStatus === 'OPEN' ? 10 : 5, // 운영중인 센터를 우선 표시
    });

    // 마커를 지도에 표시
    marker.setMap(map);

    // 마커 참조 저장
    markerRef.current = marker;

    // 클릭 이벤트 리스너
    if (onClick) {
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onClick(center);
      });
    }

    // 마우스 오버 이벤트 리스너
    if (onMouseOver) {
      window.kakao.maps.event.addListener(marker, 'mouseover', () => {
        onMouseOver(center);
      });
    }

    // 마우스 아웃 이벤트 리스너
    if (onMouseOut) {
      window.kakao.maps.event.addListener(marker, 'mouseout', () => {
        onMouseOut(center);
      });
    }

    // 컴포넌트 언마운트 시 마커 제거
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [map, center, onClick, onMouseOver, onMouseOut]);

  // 이 컴포넌트는 직접 DOM을 렌더링하지 않습니다
  // Kakao Maps API를 통해 마커를 지도에 추가합니다
  return null;
}
