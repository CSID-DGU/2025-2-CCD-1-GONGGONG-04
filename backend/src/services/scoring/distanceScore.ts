/**
 * Distance Scoring Module
 *
 * 거리 기반 점수 계산 모듈
 * Sprint 2: 규칙 기반 추천 시스템 - 거리 스코어링
 *
 * @module services/scoring/distanceScore
 */

import { Location, RegionType, DistanceInfo } from '../../types/location';

/**
 * 지구 반지름 (미터)
 * Haversine 공식에 사용되는 상수
 */
const EARTH_RADIUS_METERS = 6371000;

/**
 * 도보 속도 (미터/분)
 * 일반적인 도보 속도 기준
 */
const WALKING_SPEED_METERS_PER_MINUTE = 80;

/**
 * 도로 거리 보정 계수
 * 직선 거리 대비 실제 도로 거리 비율
 */
const ROAD_DISTANCE_CORRECTION = {
  SEOUL_DOWNTOWN: 1.4, // 서울 시내 (복잡한 도로망)
  SUBURBAN: 1.2, // 교외 지역
  DEFAULT: 1.3, // 기본값
} as const;

/**
 * 도(degree)를 라디안(radian)으로 변환
 *
 * @param degrees - 변환할 각도 (도 단위)
 * @returns 라디안 값
 *
 * @example
 * ```typescript
 * degreesToRadians(180) // Math.PI
 * degreesToRadians(90)  // Math.PI / 2
 * ```
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Haversine 공식을 사용한 두 지점 간 직선 거리 계산
 *
 * 지구를 완전한 구체로 가정하여 두 지점 간의 최단 거리를 계산합니다.
 * Haversine 공식은 구면 삼각법을 사용하여 높은 정확도를 제공합니다.
 *
 * @param lat1 - 시작점 위도 (Decimal 10,8)
 * @param lng1 - 시작점 경도 (Decimal 11,8)
 * @param lat2 - 종료점 위도 (Decimal 10,8)
 * @param lng2 - 종료점 경도 (Decimal 11,8)
 * @returns 거리 (미터 단위, 정수 반올림)
 *
 * @throws {Error} 위도/경도가 유효하지 않을 경우
 *
 * @example
 * ```typescript
 * // 서울시청 → 강남역
 * const distance = calculateHaversineDistance(
 *   37.5665, 126.9780, // 서울시청
 *   37.4979, 127.0276  // 강남역
 * );
 * console.log(distance); // 약 10750 (미터)
 * ```
 *
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  // 입력 검증
  if (!isValidLatitude(lat1) || !isValidLatitude(lat2)) {
    throw new Error(
      `Invalid latitude: lat1=${lat1}, lat2=${lat2}. Must be between -90 and 90.`,
    );
  }

  if (!isValidLongitude(lng1) || !isValidLongitude(lng2)) {
    throw new Error(
      `Invalid longitude: lng1=${lng1}, lng2=${lng2}. Must be between -180 and 180.`,
    );
  }

  // 1. 위도/경도를 라디안으로 변환
  const lat1Rad = degreesToRadians(lat1);
  const lat2Rad = degreesToRadians(lat2);
  const deltaLatRad = degreesToRadians(lat2 - lat1);
  const deltaLngRad = degreesToRadians(lng2 - lng1);

  // 2. Haversine 공식 적용
  // a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlng/2)
  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLngRad / 2) *
      Math.sin(deltaLngRad / 2);

  // 3. 중심각 계산
  // c = 2 * atan2(√a, √(1-a))
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // 4. 거리 계산 (미터 단위)
  // distance = R * c
  const distanceMeters = EARTH_RADIUS_METERS * c;

  // 5. 정수 반올림 후 반환
  return Math.round(distanceMeters);
}

/**
 * 도로 거리 보정 적용
 *
 * 직선 거리를 실제 도로 거리로 변환합니다.
 * 지역에 따라 다른 보정 계수를 적용합니다.
 *
 * @param distanceMeters - 직선 거리 (미터)
 * @param region - 지역 유형 (기본값: DEFAULT)
 * @returns 보정된 거리 (미터 단위, 정수 반올림)
 *
 * @example
 * ```typescript
 * // 서울 시내 (복잡한 도로망)
 * applyRoadDistanceCorrection(1000, 'SEOUL_DOWNTOWN') // 1400
 *
 * // 교외 지역
 * applyRoadDistanceCorrection(1000, 'SUBURBAN') // 1200
 *
 * // 기본값
 * applyRoadDistanceCorrection(1000) // 1300
 * ```
 */
export function applyRoadDistanceCorrection(
  distanceMeters: number,
  region: RegionType = 'DEFAULT',
): number {
  // 음수 거리 처리
  if (distanceMeters < 0) {
    distanceMeters = 0;
  }

  const correctionFactor = ROAD_DISTANCE_CORRECTION[region];
  return Math.round(distanceMeters * correctionFactor);
}

/**
 * 거리 기반 점수 계산
 *
 * 거리에 따라 0-100점 사이의 점수를 계산합니다.
 * 선형 감소 방식을 사용합니다.
 *
 * @param distanceMeters - 거리 (미터 단위)
 * @returns 거리 점수 (0-100)
 *
 * @example
 * ```typescript
 * calculateDistanceScore(0)      // 100 (0km)
 * calculateDistanceScore(2500)   // 75  (2.5km)
 * calculateDistanceScore(5000)   // 50  (5km)
 * calculateDistanceScore(7500)   // 25  (7.5km)
 * calculateDistanceScore(10000)  // 0   (10km)
 * calculateDistanceScore(15000)  // 0   (10km 이상)
 * calculateDistanceScore(-100)   // 100 (음수는 0으로 처리)
 * ```
 *
 * 점수 계산 로직:
 * - 0km = 100점
 * - 5km = 50점
 * - 10km 이상 = 0점
 * - 선형 감소: 100 - (distance / 10000) * 100
 */
export function calculateDistanceScore(distanceMeters: number): number {
  // 1. 음수 거리 처리 (음수는 0으로 간주)
  if (distanceMeters < 0) {
    return 100;
  }

  // 2. 10km 이상은 0점
  if (distanceMeters >= 10000) {
    return 0;
  }

  // 3. 선형 감소 계산
  // 공식: 100 - (distance / 10000) * 100
  const score = 100 - (distanceMeters / 10000) * 100;

  // 4. 소수점 반올림 후 반환
  return Math.round(score);
}

/**
 * 거리를 사람이 읽기 쉬운 텍스트로 변환
 *
 * @param distanceMeters - 거리 (미터)
 * @returns 거리 텍스트 ("750m" 또는 "2.3km")
 *
 * @example
 * ```typescript
 * formatDistance(750)   // "750m"
 * formatDistance(1000)  // "1.0km"
 * formatDistance(2345)  // "2.3km"
 * formatDistance(10500) // "10.5km"
 * ```
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)}m`;
  }

  const kilometers = distanceMeters / 1000;
  return `${kilometers.toFixed(1)}km`;
}

/**
 * 도보 시간 계산
 *
 * @param distanceMeters - 거리 (미터)
 * @returns 도보 시간 텍스트 ("도보 10분")
 *
 * @example
 * ```typescript
 * calculateWalkTime(800)  // "도보 10분"
 * calculateWalkTime(1600) // "도보 20분"
 * calculateWalkTime(80)   // "도보 1분"
 * calculateWalkTime(0)    // "도보 1분" (최소 1분)
 * ```
 */
export function calculateWalkTime(distanceMeters: number): string {
  const minutes = Math.ceil(distanceMeters / WALKING_SPEED_METERS_PER_MINUTE);
  const displayMinutes = Math.max(minutes, 1); // 최소 1분
  return `도보 ${displayMinutes}분`;
}

/**
 * 전체 거리 정보 계산 (통합 함수)
 *
 * @param userLocation - 사용자 위치
 * @param centerLocation - 센터 위치
 * @param region - 지역 유형 (선택)
 * @returns 거리 정보 객체
 *
 * @example
 * ```typescript
 * const info = calculateDistanceInfo(
 *   { latitude: 37.5665, longitude: 126.9780 }, // 서울시청
 *   { latitude: 37.4979, longitude: 127.0276 }, // 강남역
 *   'SEOUL_DOWNTOWN'
 * );
 *
 * console.log(info);
 * // {
 * //   straightDistanceMeters: 10750,
 * //   adjustedDistanceMeters: 15050,
 * //   score: 0,
 * //   distanceText: "15.1km",
 * //   walkTime: "도보 189분"
 * // }
 * ```
 */
export function calculateDistanceInfo(
  userLocation: Location,
  centerLocation: Location,
  region: RegionType = 'DEFAULT',
): DistanceInfo {
  // 1. 직선 거리 계산
  const straightDistanceMeters = calculateHaversineDistance(
    userLocation.latitude,
    userLocation.longitude,
    centerLocation.latitude,
    centerLocation.longitude,
  );

  // 2. 도로 거리 보정
  const adjustedDistanceMeters = applyRoadDistanceCorrection(
    straightDistanceMeters,
    region,
  );

  // 3. 거리 점수 계산
  const score = calculateDistanceScore(adjustedDistanceMeters);

  // 4. 거리 텍스트 생성
  const distanceText = formatDistance(adjustedDistanceMeters);

  // 5. 도보 시간 계산
  const walkTime = calculateWalkTime(adjustedDistanceMeters);

  return {
    straightDistanceMeters,
    adjustedDistanceMeters,
    score,
    distanceText,
    walkTime,
  };
}

/**
 * 위도 유효성 검증
 *
 * @param latitude - 검증할 위도
 * @returns 유효 여부
 */
function isValidLatitude(latitude: number): boolean {
  return latitude >= -90 && latitude <= 90;
}

/**
 * 경도 유효성 검증
 *
 * @param longitude - 검증할 경도
 * @returns 유효 여부
 */
function isValidLongitude(longitude: number): boolean {
  return longitude >= -180 && longitude <= 180;
}

/**
 * 한국 영역 위도 검증
 *
 * @param latitude - 검증할 위도
 * @returns 유효 여부 (33.0 ~ 43.0)
 */
export function isKoreanLatitude(latitude: number): boolean {
  return latitude >= 33.0 && latitude <= 43.0;
}

/**
 * 한국 영역 경도 검증
 *
 * @param longitude - 검증할 경도
 * @returns 유효 여부 (124.0 ~ 132.0)
 */
export function isKoreanLongitude(longitude: number): boolean {
  return longitude >= 124.0 && longitude <= 132.0;
}
