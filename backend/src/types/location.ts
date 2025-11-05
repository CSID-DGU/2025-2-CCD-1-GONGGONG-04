/**
 * Location TypeScript Interfaces
 *
 * 위치 정보 관련 타입 정의
 * Sprint 2: 규칙 기반 추천 시스템 - 거리 계산 모듈
 */

/**
 * 위치 정보 인터페이스
 *
 * @property latitude - 위도 (Decimal 10,8)
 * @property longitude - 경도 (Decimal 11,8)
 */
export interface Location {
  /**
   * 위도 (Decimal 10,8)
   * 범위: 33.0 ~ 43.0 (한국 영역)
   */
  latitude: number;

  /**
   * 경도 (Decimal 11,8)
   * 범위: 124.0 ~ 132.0 (한국 영역)
   */
  longitude: number;
}

/**
 * 지역 유형 (도로 거리 보정용)
 */
export type RegionType = 'SEOUL_DOWNTOWN' | 'SUBURBAN' | 'DEFAULT';

/**
 * 거리 정보 인터페이스
 */
export interface DistanceInfo {
  /**
   * 직선 거리 (미터)
   */
  straightDistanceMeters: number;

  /**
   * 도로 거리 보정 후 거리 (미터)
   */
  adjustedDistanceMeters: number;

  /**
   * 거리 점수 (0-100)
   */
  score: number;

  /**
   * 거리 텍스트 ("750m" 또는 "2.3km")
   */
  distanceText: string;

  /**
   * 도보 시간 ("도보 10분")
   * 80m/분 기준
   */
  walkTime: string;
}
