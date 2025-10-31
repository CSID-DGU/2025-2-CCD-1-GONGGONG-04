/**
 * Distance Service
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.1: Distance Service 구현
 *
 * 기능:
 * 1. Haversine 공식을 사용한 두 GPS 좌표 간 거리 계산
 * 2. 거리 기반 점수 계산 (0-100점, 35% 가중치)
 * 3. 최대 거리 내 센터 필터링
 */

/**
 * Haversine 공식을 사용한 두 GPS 좌표 간 거리 계산
 *
 * @param {number} lat1 - 첫 번째 지점의 위도 (degrees)
 * @param {number} lng1 - 첫 번째 지점의 경도 (degrees)
 * @param {number} lat2 - 두 번째 지점의 위도 (degrees)
 * @param {number} lng2 - 두 번째 지점의 경도 (degrees)
 * @returns {number} - 두 지점 간의 거리 (km)
 *
 * @example
 * // 서울시청 → 강남역 거리 계산
 * const distance = calculateDistance(37.5665, 126.9780, 37.4979, 127.0276);
 * console.log(distance); // ~9.5km
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  // 입력 검증
  if (
    typeof lat1 !== 'number' ||
    typeof lng1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lng2 !== 'number'
  ) {
    throw new TypeError('All coordinates must be numbers');
  }

  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) {
    throw new RangeError('Latitude must be between -90 and 90 degrees');
  }

  if (lng1 < -180 || lng1 > 180 || lng2 < -180 || lng2 > 180) {
    throw new RangeError('Longitude must be between -180 and 180 degrees');
  }

  // 지구 반지름 (km)
  const EARTH_RADIUS_KM = 6371;

  // degrees → radians 변환
  const toRadians = degrees => (degrees * Math.PI) / 180;

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const deltaLatRad = toRadians(lat2 - lat1);
  const deltaLngRad = toRadians(lng2 - lng1);

  // Haversine 공식
  // a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlng/2)
  // c = 2 * atan2(√a, √(1−a))
  // distance = R * c
  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = EARTH_RADIUS_KM * c;

  // 소수점 2자리까지 반올림
  return Math.round(distanceKm * 100) / 100;
}

/**
 * 거리 기반 점수 계산
 *
 * 점수 계산 로직:
 * - 0-5km: 100점 (가장 가까움)
 * - 5-10km: 80점
 * - 10-20km: 60점
 * - 20-30km: 40점
 * - 30-50km: 20점
 * - 50km 이상: 0점
 *
 * @param {number} distance - 거리 (km)
 * @returns {number} - 거리 점수 (0-100)
 *
 * @example
 * calculateDistanceScore(3.5);  // 100
 * calculateDistanceScore(15.0); // 60
 * calculateDistanceScore(55.0); // 0
 */
function calculateDistanceScore(distance) {
  // 입력 검증
  if (typeof distance !== 'number') {
    throw new TypeError('Distance must be a number');
  }

  if (distance < 0) {
    throw new RangeError('Distance must be non-negative');
  }

  // 거리 기반 점수 구간
  if (distance <= 5) {
    return 100;
  }
  if (distance <= 10) {
    return 80;
  }
  if (distance <= 20) {
    return 60;
  }
  if (distance <= 30) {
    return 40;
  }
  if (distance <= 50) {
    return 20;
  }
  return 0;
}

/**
 * 최대 거리 내 센터 필터링 및 거리 점수 추가
 *
 * @param {Array<Object>} centers - 센터 배열
 * @param {Object} userLocation - 사용자 위치 { latitude, longitude }
 * @param {number} maxDistance - 최대 거리 (km, 기본값: 50km)
 * @returns {Array<Object>} - 필터링된 센터 배열 (distance, distanceScore 필드 추가)
 *
 * @example
 * const centers = [
 *   { id: 1, centerName: '서울센터', latitude: 37.5665, longitude: 126.9780 },
 *   { id: 2, centerName: '부산센터', latitude: 35.1796, longitude: 129.0756 }
 * ];
 * const userLocation = { latitude: 37.4979, longitude: 127.0276 }; // 강남역
 * const nearby = filterCentersByDistance(centers, userLocation, 50);
 * console.log(nearby);
 * // [
 * //   { id: 1, centerName: '서울센터', latitude: 37.5665, longitude: 126.9780,
 * //     distance: 9.5, distanceScore: 80 }
 * // ]
 */
function filterCentersByDistance(centers, userLocation, maxDistance = 50) {
  // 입력 검증
  if (!Array.isArray(centers)) {
    throw new TypeError('Centers must be an array');
  }

  if (
    !userLocation ||
    typeof userLocation.latitude !== 'number' ||
    typeof userLocation.longitude !== 'number'
  ) {
    throw new TypeError('User location must have latitude and longitude numbers');
  }

  if (typeof maxDistance !== 'number' || maxDistance <= 0) {
    throw new RangeError('Max distance must be a positive number');
  }

  const { latitude: userLat, longitude: userLng } = userLocation;

  // 각 센터에 대해 거리 계산 및 필터링
  const centersWithDistance = centers
    .map(center => {
      // 센터 좌표 검증
      if (typeof center.latitude !== 'number' || typeof center.longitude !== 'number') {
        console.warn(`Center ${center.id || 'unknown'} has invalid coordinates, skipping`);
        return null;
      }

      // 거리 계산
      const distance = calculateDistance(userLat, userLng, center.latitude, center.longitude);

      // 최대 거리 필터링
      if (distance > maxDistance) {
        return null;
      }

      // 거리 점수 계산
      const distanceScore = calculateDistanceScore(distance);

      return {
        ...center,
        distance,
        distanceScore,
      };
    })
    .filter(center => center !== null); // null 제거

  // 거리순 정렬 (가까운 순)
  centersWithDistance.sort((a, b) => a.distance - b.distance);

  return centersWithDistance;
}

/**
 * 가장 가까운 N개 센터 조회
 *
 * @param {Array<Object>} centers - 센터 배열
 * @param {Object} userLocation - 사용자 위치 { latitude, longitude }
 * @param {number} limit - 반환할 센터 개수 (기본값: 10)
 * @returns {Array<Object>} - 가장 가까운 센터 배열
 *
 * @example
 * const nearest = getNearestCenters(centers, userLocation, 5);
 * console.log(nearest); // 가장 가까운 5개 센터
 */
function getNearestCenters(centers, userLocation, limit = 10) {
  if (typeof limit !== 'number' || limit <= 0) {
    throw new RangeError('Limit must be a positive number');
  }

  // 전체 센터에 대해 거리 계산 (maxDistance 제한 없음)
  const centersWithDistance = filterCentersByDistance(centers, userLocation, Infinity);

  // 상위 N개 반환
  return centersWithDistance.slice(0, limit);
}

module.exports = {
  calculateDistance,
  calculateDistanceScore,
  filterCentersByDistance,
  getNearestCenters,
};
