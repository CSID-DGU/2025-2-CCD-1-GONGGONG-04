/**
 * Map Store
 * 지도 UI 상태 관리
 *
 * Sprint 2 - Day 8
 *
 * @description
 * Zustand 기반 지도 상태 관리
 * - 반경 선택 상태 (radius)
 * - 지도 인스턴스 저장 (map)
 * - 현재 위치 추적 (currentLocation)
 * - localStorage persistence (일부 상태만)
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ============================================
// 타입 정의
// ============================================

/**
 * 반경 타입 (백엔드 API와 일치)
 */
export type RadiusType = '1' | '3' | '5' | '10' | 'all';

/**
 * 위치 좌표
 */
export interface LocationCoords {
  lat: number;
  lng: number;
}

/**
 * 지도 스토어 상태
 */
interface MapState {
  // ========== 반경 상태 (persist) ==========
  /** 검색 반경 */
  radius: RadiusType;

  // ========== 위치 상태 (persist) ==========
  /** 현재 위치 (GPS 또는 주소 검색) */
  currentLocation: LocationCoords | null;

  // ========== 지도 인스턴스 (persist 제외) ==========
  /** Kakao Map 인스턴스 */
  map: kakao.maps.Map | null;

  // ========== UI 상태 (persist 제외) ==========
  /** 모바일 뷰 모드 */
  view: 'map' | 'list';

  /** 반경 원 표시 여부 */
  showCircle: boolean;

  // ========== 액션 ==========
  /**
   * 반경 설정
   * @param radius - 새 반경 값
   */
  setRadius: (radius: RadiusType) => void;

  /**
   * 현재 위치 설정
   * @param location - 위치 좌표
   */
  setCurrentLocation: (location: LocationCoords | null) => void;

  /**
   * 지도 인스턴스 설정
   * @param map - Kakao Map 인스턴스
   */
  setMap: (map: kakao.maps.Map | null) => void;

  /**
   * 뷰 모드 설정 (모바일)
   * @param view - 뷰 모드
   */
  setView: (view: 'map' | 'list') => void;

  /**
   * 반경 원 표시 토글
   */
  toggleCircle: () => void;

  /**
   * 상태 초기화
   */
  reset: () => void;
}

// ============================================
// 초기 상태
// ============================================

const initialState = {
  radius: '5' as RadiusType,
  currentLocation: null,
  map: null,
  view: 'map' as const,
  showCircle: true,
};

// ============================================
// Zustand Store
// ============================================

/**
 * Map Store
 *
 * @example
 * const { radius, setRadius, map, setMap } = useMapStore();
 *
 * setRadius('10');
 * setMap(mapInstance);
 */
export const useMapStore = create<MapState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setRadius: (radius) => set({ radius }, false, 'setRadius'),

        setCurrentLocation: (currentLocation) =>
          set({ currentLocation }, false, 'setCurrentLocation'),

        setMap: (map) => set({ map }, false, 'setMap'),

        setView: (view) => set({ view }, false, 'setView'),

        toggleCircle: () =>
          set((state) => ({ showCircle: !state.showCircle }), false, 'toggleCircle'),

        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'map-storage',
        // map 인스턴스는 persist 제외 (직렬화 불가)
        partialize: (state) => ({
          radius: state.radius,
          currentLocation: state.currentLocation,
          showCircle: state.showCircle,
        }),
      }
    ),
    {
      name: 'MapStore',
    }
  )
);
