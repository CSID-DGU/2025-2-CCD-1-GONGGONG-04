/**
 * Geolocation API 훅
 *
 * 브라우저의 Geolocation API를 사용하여 사용자의 현재 위치를 가져옵니다.
 * GPS 권한 요청, 로딩 상태, 에러 처리를 제공합니다.
 *
 * @returns {UseGeolocationReturn} 위치 정보 및 제어 함수
 *
 * @example
 * const { position, error, loading, requestLocation } = useGeolocation();
 *
 * // 위치 요청
 * requestLocation();
 *
 * // 에러 처리
 * if (error?.code === 1) {
 *   // PERMISSION_DENIED 처리
 *   console.log('위치 권한이 거부되었습니다');
 * }
 *
 * // 좌표 사용
 * if (position) {
 *   const { latitude, longitude, accuracy } = position.coords;
 *   console.log(`위치: ${latitude}, ${longitude} (±${accuracy}m)`);
 * }
 */

import { useState, useCallback } from 'react';

/**
 * useGeolocation 훅 반환 타입
 */
export interface UseGeolocationReturn {
  /**
   * 현재 위치 정보 (성공 시)
   */
  position: GeolocationPosition | null;

  /**
   * 위치 획득 에러 (실패 시)
   */
  error: GeolocationPositionError | null;

  /**
   * 위치 요청 중 로딩 상태
   */
  loading: boolean;

  /**
   * 위치 권한 요청 및 좌표 획득 함수
   */
  requestLocation: () => void;
}

/**
 * Geolocation API 훅
 *
 * 브라우저의 현재 위치를 가져오고 상태를 관리합니다.
 */
export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 위치 권한 요청 및 좌표 획득
   */
  const requestLocation = useCallback(() => {
    // 1. Geolocation API 지원 확인
    if (!navigator.geolocation) {
      const unsupportedError = {
        code: 2,
        message: 'Geolocation이 지원되지 않는 브라우저입니다.',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError;

      setError(unsupportedError);
      setLoading(false);
      console.error('Geolocation API를 지원하지 않는 브라우저입니다.');
      return;
    }

    // 2. 로딩 시작
    setLoading(true);
    setError(null);

    // 3. GPS 좌표 요청
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // 성공 핸들러
        setPosition(pos);
        setLoading(false);
        console.log(
          `위치 획득 성공: ${pos.coords.latitude}, ${pos.coords.longitude} (±${Math.round(pos.coords.accuracy)}m)`
        );
      },
      (err) => {
        // 에러 핸들러
        setError(err);
        setLoading(false);
        console.error('위치 획득 실패:', err.message, `(code: ${err.code})`);
      },
      {
        // Geolocation 옵션
        enableHighAccuracy: true, // GPS 사용 (WiFi/Cell보다 정확)
        timeout: 10000, // 10초 타임아웃
        maximumAge: 300000, // 5분 캐시 허용
      }
    );
  }, []);

  return {
    position,
    error,
    loading,
    requestLocation,
  };
}
