/**
 * KakaoMapView 컴포넌트
 *
 * Kakao Maps API를 사용하여 지도를 표시하는 메인 컴포넌트
 * - SDK 로딩 관리
 * - 지도 초기화 및 제어
 * - 에러 처리 및 로딩 상태 표시
 *
 * @component
 * @example
 * <KakaoMapView
 *   onMapLoad={(map) => console.log('지도 로드 완료', map)}
 *   className="w-full h-[600px]"
 * />
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useKakaoMapSDK } from '@/hooks/useKakaoMapSDK';
import { MapSkeleton } from './MapSkeleton';
import { cn } from '@/lib/utils';

/**
 * KakaoMapView Props
 */
export interface KakaoMapViewProps {
  /**
   * 지도 로드 완료 시 호출되는 콜백
   * 지도 객체를 인자로 받아 마커, 이벤트 등을 추가할 수 있습니다
   */
  onMapLoad?: (map: kakao.maps.Map) => void;

  /**
   * 추가 CSS 클래스
   */
  className?: string;

  /**
   * 지도 초기 중심 좌표 (기본값: 서울시청)
   */
  center?: {
    lat: number;
    lng: number;
  };

  /**
   * 지도 초기 확대/축소 레벨 (1-14, 작을수록 확대)
   * 기본값: 12
   */
  level?: number;
}

/**
 * 기본 지도 설정
 */
const DEFAULT_CENTER = {
  lat: 37.5665, // 서울시청 위도
  lng: 126.978, // 서울시청 경도
};

const DEFAULT_LEVEL = 12;

export function KakaoMapView({
  onMapLoad,
  className,
  center = DEFAULT_CENTER,
  level = DEFAULT_LEVEL,
}: KakaoMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const { isLoaded, isError, error } = useKakaoMapSDK();

  /**
   * 지도 초기화
   */
  useEffect(() => {
    // SDK가 로드되지 않았거나, 컨테이너가 없으면 초기화하지 않음
    if (!isLoaded || !mapContainerRef.current) {
      return;
    }

    // 이미 지도가 초기화되어 있으면 재초기화하지 않음
    if (mapInstanceRef.current) {
      return;
    }

    try {
      // 지도 중심 좌표 설정
      const mapCenter = new window.kakao.maps.LatLng(center.lat, center.lng);

      // 지도 생성 옵션
      const mapOptions: kakao.maps.MapOptions = {
        center: mapCenter,
        level: level,
        draggable: true, // 마우스 드래그 이동 가능
        scrollwheel: true, // 마우스 휠 확대/축소 가능
        disableDoubleClickZoom: false, // 더블클릭 확대 가능
      };

      // 지도 생성
      const map = new window.kakao.maps.Map(
        mapContainerRef.current,
        mapOptions
      );

      // 지도 객체 저장
      mapInstanceRef.current = map;

      // 지도 준비 완료
      setIsMapReady(true);

      // 지도 로드 완료 콜백 호출
      if (onMapLoad) {
        onMapLoad(map);
      }

      console.log('Kakao Map 초기화 완료', {
        center,
        level,
      });
    } catch (err) {
      console.error('Kakao Map 초기화 실패:', err);
    }
  }, [isLoaded, center.lat, center.lng, level, onMapLoad]);

  /**
   * 윈도우 리사이즈 시 지도 크기 재조정
   */
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) {
      return;
    }

    const handleResize = () => {
      // 지도 크기 재조정
      mapInstanceRef.current?.relayout();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMapReady]);

  /**
   * 컴포넌트 언마운트 시 클린업
   */
  useEffect(() => {
    return () => {
      // 지도 인스턴스 제거
      mapInstanceRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  /**
   * 에러 상태 렌더링
   */
  if (isError) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center w-full h-full bg-neutral-50 rounded-lg border border-neutral-200',
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <div className="text-center space-y-4 p-8">
          {/* 에러 아이콘 */}
          <div className="w-16 h-16 mx-auto bg-status-emergency/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-status-emergency"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* 에러 메시지 */}
          <div className="space-y-2">
            <h3 className="text-h3 text-neutral-900">
              지도를 불러올 수 없습니다
            </h3>
            <p className="text-small text-neutral-600">
              {error?.message ||
                '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
            </p>
          </div>

          {/* 재시도 버튼 */}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-lavender-500 hover:bg-lavender-600 text-white rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  /**
   * 로딩 상태 렌더링
   */
  if (!isLoaded) {
    return <MapSkeleton className={className} />;
  }

  /**
   * 지도 렌더링
   */
  return (
    <div
      ref={mapContainerRef}
      className={cn('w-full h-full rounded-lg', className)}
      role="application"
      aria-label="Kakao 지도"
    >
      {/* 지도는 ref를 통해 Kakao Maps API가 직접 렌더링합니다 */}
    </div>
  );
}
