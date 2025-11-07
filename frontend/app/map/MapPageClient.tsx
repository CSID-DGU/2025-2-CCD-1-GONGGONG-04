/**
 * MapPageClient 컴포넌트
 *
 * 지도 페이지의 클라이언트 사이드 로직을 담당합니다
 * - Kakao Map 초기화
 * - 센터 데이터 패칭 및 마커 표시
 * - 사용자 인터랙션 처리
 * - 상태 관리
 *
 * @component
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { KakaoMapView } from '@/components/Map/KakaoMapView';
import { MapLayout } from '@/components/Map/MapLayout';
import { CenterMarkers } from '@/components/Map/CenterMarkers';
import { MarkerInfoPopup } from '@/components/Map/MarkerInfoPopup';
import { useCenterData } from '@/hooks/useCenterData';
import { CenterMarkerData } from '@/lib/api/centers';
import { createRoot, Root } from 'react-dom/client';

/**
 * 서울시청 기본 좌표
 */
const SEOUL_CITY_HALL = {
  lat: 37.5665,
  lng: 126.978,
};

/**
 * 기본 검색 반경 (km)
 */
const DEFAULT_RADIUS = 5;

export function MapPageClient() {
  const router = useRouter();
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState(SEOUL_CITY_HALL);
  const [selectedCenter, setSelectedCenter] = useState<CenterMarkerData | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // CustomOverlay 관리를 위한 ref
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const overlayRootRef = useRef<Root | null>(null);

  /**
   * 센터 데이터 패칭
   */
  const { data, isLoading, isError, error } = useCenterData({
    lat: mapCenter.lat,
    lng: mapCenter.lng,
    radius: DEFAULT_RADIUS,
  });

  /**
   * 지도 로드 완료 핸들러
   */
  const handleMapLoad = useCallback((loadedMap: kakao.maps.Map) => {
    setMap(loadedMap);
    console.log('지도 로드 완료:', loadedMap);

    // 지도 이동 이벤트 리스너 등록 (지도 이동 시 센터 데이터 재요청)
    window.kakao.maps.event.addListener(loadedMap, 'idle', () => {
      const center = loadedMap.getCenter();
      const newLat = center.getLat();
      const newLng = center.getLng();

      // 지도 중심이 변경되면 상태 업데이트
      setMapCenter({
        lat: newLat,
        lng: newLng,
      });
    });
  }, []);

  /**
   * 팝업 닫기 핸들러
   */
  const handleClosePopup = useCallback(() => {
    setSelectedCenter(null);
    setIsPopupOpen(false);

    // CustomOverlay 정리
    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }

    // React root 정리
    if (overlayRootRef.current) {
      overlayRootRef.current.unmount();
      overlayRootRef.current = null;
    }
  }, []);

  /**
   * 상세보기 핸들러
   */
  const handleNavigate = useCallback((centerId: number) => {
    router.push(`/centers/${centerId}`);
  }, [router]);

  /**
   * 마커 클릭 핸들러
   */
  const handleMarkerClick = useCallback((center: CenterMarkerData) => {
    console.log('센터 클릭:', center);

    // 이전 팝업 닫기
    handleClosePopup();

    // 선택된 센터 설정
    setSelectedCenter(center);
    setIsPopupOpen(true);

    // 지도 중심을 클릭한 센터로 이동
    if (map) {
      const position = new window.kakao.maps.LatLng(
        center.latitude,
        center.longitude
      );
      map.panTo(position);
    }
  }, [map, handleClosePopup]);

  /**
   * 마커 호버 핸들러
   */
  const handleMarkerHover = useCallback((center: CenterMarkerData) => {
    console.log('센터 호버:', center.name);
    // TODO: 간단한 툴팁 표시
  }, []);

  /**
   * 마커 호버 해제 핸들러
   */
  const handleMarkerLeave = useCallback(() => {
    // TODO: 툴팁 숨기기
  }, []);

  /**
   * 로딩 상태 표시
   */
  useEffect(() => {
    if (isLoading) {
      console.log('센터 데이터 로딩 중...');
    }
  }, [isLoading]);

  /**
   * 에러 상태 표시
   */
  useEffect(() => {
    if (isError) {
      console.error('센터 데이터 로딩 실패:', error);
      // TODO: 에러 토스트 표시
    }
  }, [isError, error]);

  /**
   * 데이터 로드 완료 로깅
   */
  useEffect(() => {
    if (data) {
      console.log(`센터 ${data.total}개 로드 완료:`, data.centers);
    }
  }, [data]);

  /**
   * CustomOverlay 생성 및 관리
   */
  useEffect(() => {
    if (!map || !selectedCenter || !isPopupOpen) {
      return;
    }

    // 팝업을 렌더링할 컨테이너 생성
    const container = document.createElement('div');
    container.style.cssText = 'z-index: 1000;';

    // React root 생성 및 렌더링
    const root = createRoot(container);
    overlayRootRef.current = root;

    root.render(
      <MarkerInfoPopup
        center={selectedCenter}
        onClose={handleClosePopup}
        onNavigate={handleNavigate}
      />
    );

    // CustomOverlay 생성
    const position = new window.kakao.maps.LatLng(
      selectedCenter.latitude,
      selectedCenter.longitude
    );

    const overlay = new window.kakao.maps.CustomOverlay({
      position: position,
      content: container,
      yAnchor: 1.2, // 마커 위에 표시
      xAnchor: 0.5,
      zIndex: 1000,
    });

    overlayRef.current = overlay;
    overlay.setMap(map);

    // 지도 클릭 시 팝업 닫기
    const mapClickListener = window.kakao.maps.event.addListener(
      map,
      'click',
      () => {
        handleClosePopup();
      }
    );

    // cleanup
    return () => {
      window.kakao.maps.event.removeListener(mapClickListener);
      handleClosePopup();
    };
  }, [map, selectedCenter, isPopupOpen, handleClosePopup, handleNavigate]);

  return (
    <MapLayout>
      <KakaoMapView
        center={SEOUL_CITY_HALL}
        level={12}
        onMapLoad={handleMapLoad}
      />

      {/* 센터 마커 표시 */}
      {map && data && (
        <CenterMarkers
          map={map}
          centers={data.centers}
          onMarkerClick={handleMarkerClick}
          onMarkerHover={handleMarkerHover}
          onMarkerLeave={handleMarkerLeave}
        />
      )}
    </MapLayout>
  );
}
