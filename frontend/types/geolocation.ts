/**
 * Geolocation API 타입 확장
 *
 * 브라우저 Geolocation API의 타입 정의 및 유틸리티 함수를 제공합니다.
 */

/**
 * GPS 정확도 레벨
 */
export interface GeolocationAccuracyLevel {
  /**
   * 정확도 등급 (high: <50m, medium: 50-200m, low: >200m)
   */
  level: 'high' | 'medium' | 'low';

  /**
   * 사용자에게 표시할 메시지
   */
  message: string;

  /**
   * UI 색상 테마 (Tailwind CSS)
   */
  color: 'green' | 'yellow' | 'red';
}

/**
 * GPS 정확도에 따른 레벨 분류
 *
 * @param accuracy - GPS 정확도 (meters)
 * @returns 정확도 레벨 정보
 *
 * @example
 * const level = getAccuracyLevel(45);
 * console.log(level); // { level: 'high', message: '위치가 정확합니다', color: 'green' }
 */
export function getAccuracyLevel(accuracy: number): GeolocationAccuracyLevel {
  if (accuracy < 50) {
    return {
      level: 'high',
      message: '위치가 정확합니다',
      color: 'green',
    };
  } else if (accuracy < 200) {
    return {
      level: 'medium',
      message: '위치 정확도 보통',
      color: 'yellow',
    };
  } else {
    return {
      level: 'low',
      message: '위치 정확도가 낮습니다',
      color: 'red',
    };
  }
}

/**
 * Geolocation 에러 코드 유틸리티
 */
export const GeolocationErrorCode = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as const;

/**
 * Geolocation 에러 메시지 매핑
 */
export function getGeolocationErrorMessage(
  code: number
): string {
  switch (code) {
    case GeolocationErrorCode.PERMISSION_DENIED:
      return '위치 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.';
    case GeolocationErrorCode.POSITION_UNAVAILABLE:
      return '위치 정보를 가져올 수 없습니다. GPS 신호를 확인해주세요.';
    case GeolocationErrorCode.TIMEOUT:
      return '위치 요청 시간이 초과되었습니다. 다시 시도해주세요.';
    default:
      return '알 수 없는 위치 오류가 발생했습니다.';
  }
}
