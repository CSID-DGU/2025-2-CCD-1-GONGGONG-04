/**
 * CurrentLocationMarker Component
 *
 * 현재 위치 마커 컴포넌트
 *
 * 지도에 사용자의 현재 위치를 파란색 점으로 표시하고,
 * GPS 정확도에 따라 원형 범위를 시각화합니다.
 *
 * @example
 * const { position } = useGeolocation();
 *
 * {position && (
 *   <CurrentLocationMarker
 *     map={map}
 *     position={position}
 *     showAccuracyFeedback
 *   />
 * )}
 */

'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export interface CurrentLocationMarkerProps {
  /**
   * Kakao Map 인스턴스
   */
  map: kakao.maps.Map;

  /**
   * Geolocation Position
   */
  position: GeolocationPosition;

  /**
   * 정확도 피드백 표시 여부 (optional)
   */
  showAccuracyFeedback?: boolean;
}

/**
 * 현재 위치 마커 컴포넌트
 */
export function CurrentLocationMarker({
  map,
  position,
  showAccuracyFeedback = true,
}: CurrentLocationMarkerProps) {
  const [marker, setMarker] = useState<kakao.maps.Marker | null>(null);
  const [circle, setCircle] = useState<kakao.maps.Circle | null>(null);

  useEffect(() => {
    if (!map || !position) return;

    const { latitude, longitude, accuracy } = position.coords;
    const latLng = new kakao.maps.LatLng(latitude, longitude);

    // 1. 현재 위치 마커 생성 (파란색 점)
    const currentMarker = new kakao.maps.Marker({
      position: latLng,
      image: new kakao.maps.MarkerImage(
        createBlueDotSVG(),
        new kakao.maps.Size(16, 16),
        {
          offset: new kakao.maps.Point(8, 8),
        }
      ),
      zIndex: 100, // 다른 마커보다 위에 표시
    });
    currentMarker.setMap(map);
    setMarker(currentMarker);

    // 2. 정확도 원 생성
    const accuracyCircle = new kakao.maps.Circle({
      center: latLng,
      radius: accuracy, // meters
      strokeWeight: 1,
      strokeColor: '#3B82F6', // blue-500
      strokeOpacity: 0.5,
      strokeStyle: 'solid',
      fillColor: '#3B82F6',
      fillOpacity: 0.1,
    });
    accuracyCircle.setMap(map);
    setCircle(accuracyCircle);

    // 3. 지도 중심 이동
    map.panTo(latLng);

    console.log(
      `현재 위치 마커 생성: ${latitude}, ${longitude} (정확도: ±${Math.round(accuracy)}m)`
    );

    // 4. 클린업 (메모리 누수 방지)
    return () => {
      if (currentMarker) {
        currentMarker.setMap(null);
      }
      if (accuracyCircle) {
        accuracyCircle.setMap(null);
      }
      console.log('현재 위치 마커 제거');
    };
  }, [map, position]);

  /**
   * 정확도 피드백 UI 렌더링
   */
  const getAccuracyFeedback = () => {
    if (!showAccuracyFeedback || !position) return null;

    const accuracy = position.coords.accuracy;

    // 정확도 높음 (<50m)
    if (accuracy < 50) {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
          <AlertDescription className="text-sm text-green-700">
            위치가 정확합니다 (오차 ±{Math.round(accuracy)}m)
          </AlertDescription>
        </Alert>
      );
    }

    // 정확도 보통 (50-200m)
    if (accuracy < 200) {
      return (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" aria-hidden="true" />
          <AlertDescription className="text-sm text-yellow-700">
            위치 정확도 보통 (오차 ±{Math.round(accuracy)}m)
          </AlertDescription>
        </Alert>
      );
    }

    // 정확도 낮음 (>200m)
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
        <AlertDescription className="text-sm text-red-700">
          위치 정확도가 낮습니다 (오차 ±{Math.round(accuracy)}m). 주소 검색을 권장합니다.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="absolute top-20 left-4 z-10 max-w-xs">
      {getAccuracyFeedback()}
    </div>
  );
}

/**
 * 파란색 점 SVG 생성 (Data URL)
 *
 * 현재 위치를 나타내는 파란색 점 마커 이미지를 생성합니다.
 * 펄스 애니메이션 효과가 포함되어 있습니다.
 *
 * @returns Data URL 형식의 SVG 문자열
 */
function createBlueDotSVG(): string {
  const svg = `
    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <!-- 외곽 하얀색 원 -->
      <circle cx="8" cy="8" r="8" fill="white" opacity="0.8"/>
      <!-- 파란색 점 -->
      <circle cx="8" cy="8" r="6" fill="#3B82F6"/>
      <!-- 펄스 애니메이션 -->
      <circle cx="8" cy="8" r="6" fill="#3B82F6" opacity="0.3">
        <animate attributeName="r" from="6" to="12" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  `;

  // SVG를 Base64로 인코딩하여 Data URL로 변환
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
