/**
 * MapPageClient 컴포넌트
 *
 * Sprint 2: GPS 위치, 반경 필터, 주소 검색, 센터 리스트 통합
 *
 * 지도 페이지의 클라이언트 사이드 로직을 담당합니다
 * - Kakao Map 초기화
 * - 센터 데이터 패칭 및 마커 표시
 * - GPS 위치 기반 검색
 * - 반경 필터 및 주소 검색
 * - 센터 리스트 뷰 및 무한 스크롤
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
import { AddressSearchBar } from '@/components/Map/AddressSearchBar';
import { RadiusSelector } from '@/components/Map/RadiusSelector';
import { RadiusCircle } from '@/components/Map/RadiusCircle';
import { CenterList } from '@/components/Map/CenterList';
import { CurrentLocationMarker } from '@/components/Map/CurrentLocationMarker';
import { useCenterData } from '@/hooks/useCenterData';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMapStore } from '@/store/mapStore';
import { CenterMarkerData } from '@/lib/api/centers';
import type { Address } from '@/types/address';
import { createRoot, Root } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { MapPin, List, Map as MapIcon } from 'lucide-react';

/**
 * 서울시청 기본 좌표
 */
const SEOUL_CITY_HALL = {
  lat: 37.5665,
  lng: 126.978,
};

/**
 * 기본 줌 레벨
 */
const DEFAULT_ZOOM_LEVEL = 12;

export function MapPageClient() {
  const router = useRouter();

  // Map 상태
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState(SEOUL_CITY_HALL);
  const [selectedCenter, setSelectedCenter] = useState<CenterMarkerData | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // 모바일 뷰 토글 (지도/리스트)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // CustomOverlay 관리를 위한 ref
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const overlayRootRef = useRef<Root | null>(null);

  // Zustand 상태 관리 (반경)
  const { radius } = useMapStore();

  // GPS 위치 훅
  const { position, error: gpsError, loading: gpsLoading, requestLocation } = useGeolocation();

  /**
   * 센터 데이터 패칭 (반경 필터 적용)
   */
  const { data, isLoading, isError, error } = useCenterData({
    lat: mapCenter.lat,
    lng: mapCenter.lng,
    radius: radius, // string 그대로 전달 ('1', '3', '5', '10', 'all')
  });

  /**
   * 지도 로드 완료 핸들러
   */
  const handleMapLoad = useCallback((loadedMap: kakao.maps.Map) => {
    setMap(loadedMap);
    console.log('지도 로드 완료:', loadedMap);

    // 지도 이동/줌 이벤트 리스너 등록
    window.kakao.maps.event.addListener(loadedMap, 'idle', () => {
      const center = loadedMap.getCenter();
      const newLat = center.getLat();
      const newLng = center.getLng();

      // 지도 중심이 변경되면 상태 업데이트
      setMapCenter({
        lat: newLat,
        lng: newLng,
      });

      console.log(`지도 중심 업데이트: lat=${newLat}, lng=${newLng}`);
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
   * GPS 버튼 클릭 핸들러
   */
  const handleGpsClick = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  /**
   * GPS 위치가 확보되면 지도 중심 이동
   */
  useEffect(() => {
    if (position && map) {
      const newCenter = { lat: position.coords.latitude, lng: position.coords.longitude };
      setMapCenter(newCenter);
      map.setCenter(new window.kakao.maps.LatLng(position.coords.latitude, position.coords.longitude));
      map.setLevel(5); // GPS 위치 확보 시 적절한 줌 레벨
      console.log('GPS 위치로 지도 이동:', position);
    }
  }, [position, map]);

  /**
   * 주소 검색 선택 핸들러
   */
  const handleAddressSelect = useCallback((address: Address) => {
    if (!map) return;

    const newCenter = { lat: address.y, lng: address.x };
    setMapCenter(newCenter);
    map.setCenter(new window.kakao.maps.LatLng(address.y, address.x));
    map.setLevel(5); // 주소 선택 시 적절한 줌 레벨
    console.log('주소 선택으로 지도 이동:', address);
  }, [map]);

  /**
   * 센터 리스트 아이템 클릭 핸들러
   */
  const handleCenterListItemClick = useCallback((center: CenterMarkerData) => {
    if (!map) return;

    // 지도 중심을 센터 위치로 이동
    const position = new window.kakao.maps.LatLng(center.latitude, center.longitude);
    map.setCenter(position);
    map.setLevel(3); // 센터 상세 보기에 적합한 줌 레벨

    // 마커 클릭과 동일한 동작 (팝업 열기)
    handleMarkerClick(center);

    // 모바일에서는 자동으로 지도 뷰로 전환
    if (viewMode === 'list') {
      setViewMode('map');
    }
  }, [map, handleMarkerClick, viewMode]);

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
      console.log(`센터 ${data.total}개 로드 완료 (반경 ${data.radius}):`, data.centers);
    }
  }, [data, radius]);

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

    // Native 이벤트 차단 (Kakao Map 이벤트 시스템으로의 전파 방지)
    // 클릭뿐 아니라 pointer/mouse/touch 시작 이벤트도 캡처 단계에서 차단
    const stop = (e: Event) => {
      e.stopPropagation();
    };
    container.addEventListener('click', stop, true);
    container.addEventListener('pointerdown', stop, true);
    container.addEventListener('mousedown', stop, true);
    container.addEventListener('touchstart', stop, true);

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

    // 지도 클릭 시 팝업 닫기 (팝업 내부 클릭은 제외)
    const handleMapClick = (mouseEvent: any) => {
      const target = mouseEvent.domEvent?.target as HTMLElement | null;
      if (target && typeof (target as any).closest === 'function' && target.closest('[role="dialog"]')) {
        return; // 팝업 내부 클릭은 무시
      }
      handleClosePopup();
    };
    window.kakao.maps.event.addListener(map, 'click', handleMapClick);

    // cleanup
    return () => {
      if (window.kakao?.maps?.event && map) {
        window.kakao.maps.event.removeListener(map, 'click', handleMapClick);
      }
      handleClosePopup();
    };
  }, [map, selectedCenter, isPopupOpen, handleClosePopup, handleNavigate]);

  return (
    <MapLayout>
      {/* 지도 컨테이너 */}
      <div className="relative w-full h-full">
        <KakaoMapView
          center={SEOUL_CITY_HALL}
          level={DEFAULT_ZOOM_LEVEL}
          onMapLoad={handleMapLoad}
        />

        {/* Sprint 2: UI 컨트롤 레이어 */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-3 md:flex-row md:items-start">
          {/* 주소 검색 바 */}
          <div className="flex-1">
            <AddressSearchBar onSelect={handleAddressSelect} />
          </div>

          {/* 반경 선택기 (데스크탑) */}
          <div className="hidden md:block">
            <RadiusSelector />
          </div>

          {/* GPS 버튼 */}
          <Button
            variant="lavender"
            size="icon"
            onClick={handleGpsClick}
            disabled={gpsLoading}
            className="shrink-0"
            aria-label="내 위치로 이동"
          >
            <MapPin className={gpsLoading ? 'animate-pulse' : ''} />
          </Button>
        </div>

        {/* 반경 선택기 (모바일) */}
        <div className="absolute top-20 left-4 z-10 md:hidden">
          <RadiusSelector />
        </div>

        {/* 반경 원 표시 */}
        {map && (
          <RadiusCircle
            map={map}
            center={mapCenter}
          />
        )}

        {/* 현재 위치 마커 */}
        {map && position && (
          <CurrentLocationMarker
            map={map}
            position={position}
          />
        )}

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

        {/* 모바일 뷰 토글 버튼 */}
        <div className="absolute bottom-20 right-4 z-10 flex flex-col gap-2 md:hidden">
          <Button
            variant={viewMode === 'map' ? 'lavender' : 'outline'}
            size="icon"
            onClick={() => setViewMode('map')}
            aria-label="지도 보기"
          >
            <MapIcon />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'lavender' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            aria-label="리스트 보기"
          >
            <List />
          </Button>
        </div>

        {/* GPS 에러 토스트 */}
        {gpsError && (
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-20 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            GPS 위치를 가져올 수 없습니다: {gpsError}
          </div>
        )}
      </div>

      {/* 센터 리스트 패널 (데스크탑: 사이드 패널, 모바일: 전체 화면 토글) */}
      <div className={`
        fixed md:relative
        inset-0 md:inset-auto
        z-20 md:z-0
        bg-white md:bg-transparent
        transition-transform duration-300
        ${viewMode === 'list' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        md:w-96 md:h-full
      `}>
        <CenterList
          centers={data?.centers || []}
          isLoading={isLoading}
          error={error?.message}
          onSelectCenter={handleCenterListItemClick}
          selectedCenterId={selectedCenter?.id || null}
          hasNextPage={data?.hasMore || false}
          isFetchingNextPage={false}
          onLoadMore={() => {
            console.log('Load more centers...');
          }}
        />
      </div>
    </MapLayout>
  );
}
