/**
 * CenterMarkers 컴포넌트
 *
 * 여러 센터 마커들을 관리하는 컨테이너 컴포넌트
 * - 로딩 상태 처리
 * - 에러 상태 처리
 * - 마커 클릭 이벤트 관리
 *
 * @component
 */

'use client';

import { CenterMarkerData } from '@/lib/api/centers';
import { CenterMarker } from './CenterMarker';

/**
 * CenterMarkers Props
 */
export interface CenterMarkersProps {
  /**
   * Kakao Map 인스턴스
   */
  map: kakao.maps.Map | null;

  /**
   * 센터 데이터 배열
   */
  centers: CenterMarkerData[];

  /**
   * 마커 클릭 시 호출되는 콜백
   */
  onMarkerClick?: (center: CenterMarkerData) => void;

  /**
   * 마커 호버 시 호출되는 콜백
   */
  onMarkerHover?: (center: CenterMarkerData) => void;

  /**
   * 마커 호버 해제 시 호출되는 콜백
   */
  onMarkerLeave?: () => void;
}

/**
 * 센터 마커들을 관리하는 컨테이너 컴포넌트
 *
 * @example
 * <CenterMarkers
 *   map={mapInstance}
 *   centers={centersData}
 *   onMarkerClick={(center) => console.log('Clicked:', center)}
 * />
 */
export function CenterMarkers({
  map,
  centers,
  onMarkerClick,
  onMarkerHover,
  onMarkerLeave,
}: CenterMarkersProps) {
  // 지도 인스턴스가 없으면 아무것도 렌더링하지 않음
  if (!map) {
    return null;
  }

  // 센터 데이터가 없으면 아무것도 렌더링하지 않음
  if (!centers || centers.length === 0) {
    return null;
  }

  return (
    <>
      {centers.map((center) => (
        <CenterMarker
          key={center.id}
          map={map}
          center={center}
          onClick={onMarkerClick}
          onMouseOver={onMarkerHover}
          onMouseOut={onMarkerLeave}
        />
      ))}
    </>
  );
}
