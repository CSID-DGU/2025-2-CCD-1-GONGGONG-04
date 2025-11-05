/**
 * Distance Service Unit Tests
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.1: Distance Service 단위 테스트
 *
 * 검증: 15개 테스트 통과
 */

const {
  calculateDistance,
  calculateDistanceScore,
  filterCentersByDistance,
  getNearestCenters,
} = require('../../../src/services/distance.service');

describe('Distance Service', () => {
  describe('calculateDistance', () => {
    // Test 1: 서울시청 → 강남역 거리 계산
    test('should calculate distance between Seoul City Hall and Gangnam Station', () => {
      const distance = calculateDistance(37.5665, 126.978, 37.4979, 127.0276);
      expect(distance).toBeCloseTo(8.79, 1); // ~8.8km
    });

    // Test 2: 동일한 위치 (거리 0)
    test('should return 0 for identical locations', () => {
      const distance = calculateDistance(37.5665, 126.978, 37.5665, 126.978);
      expect(distance).toBe(0);
    });

    // Test 3: 서울 → 부산 거리 계산
    test('should calculate long distance (Seoul to Busan)', () => {
      const distance = calculateDistance(37.5665, 126.978, 35.1796, 129.0756);
      expect(distance).toBeCloseTo(325, 0); // ~325km
    });

    // Test 4: TypeError - 숫자가 아닌 입력
    test('should throw TypeError for non-number inputs', () => {
      expect(() => calculateDistance('37.5', 126.978, 37.4979, 127.0276)).toThrow(TypeError);
      expect(() => calculateDistance(37.5, '126.978', 37.4979, 127.0276)).toThrow(TypeError);
    });

    // Test 5: RangeError - 잘못된 위도 범위
    test('should throw RangeError for invalid latitude', () => {
      expect(() => calculateDistance(-91, 126.978, 37.4979, 127.0276)).toThrow(RangeError);
      expect(() => calculateDistance(91, 126.978, 37.4979, 127.0276)).toThrow(RangeError);
    });

    // Test 6: RangeError - 잘못된 경도 범위
    test('should throw RangeError for invalid longitude', () => {
      expect(() => calculateDistance(37.5665, -181, 37.4979, 127.0276)).toThrow(RangeError);
      expect(() => calculateDistance(37.5665, 181, 37.4979, 127.0276)).toThrow(RangeError);
    });
  });

  describe('calculateDistanceScore', () => {
    // Test 7: 0-5km 구간 (100점)
    test('should return 100 for distance 0-5km', () => {
      expect(calculateDistanceScore(0)).toBe(100);
      expect(calculateDistanceScore(2.5)).toBe(100);
      expect(calculateDistanceScore(5)).toBe(100);
    });

    // Test 8: 5-10km 구간 (80점)
    test('should return 80 for distance 5-10km', () => {
      expect(calculateDistanceScore(5.1)).toBe(80);
      expect(calculateDistanceScore(7.5)).toBe(80);
      expect(calculateDistanceScore(10)).toBe(80);
    });

    // Test 9: 10-20km 구간 (60점)
    test('should return 60 for distance 10-20km', () => {
      expect(calculateDistanceScore(10.1)).toBe(60);
      expect(calculateDistanceScore(15)).toBe(60);
      expect(calculateDistanceScore(20)).toBe(60);
    });

    // Test 10: 30-50km 구간 (20점)
    test('should return 20 for distance 30-50km', () => {
      expect(calculateDistanceScore(30.1)).toBe(20);
      expect(calculateDistanceScore(40)).toBe(20);
      expect(calculateDistanceScore(50)).toBe(20);
    });

    // Test 11: 50km 이상 (0점)
    test('should return 0 for distance > 50km', () => {
      expect(calculateDistanceScore(50.1)).toBe(0);
      expect(calculateDistanceScore(100)).toBe(0);
    });

    // Test 12: TypeError - 숫자가 아닌 입력
    test('should throw TypeError for non-number input', () => {
      expect(() => calculateDistanceScore('10')).toThrow(TypeError);
    });

    // Test 13: RangeError - 음수 거리
    test('should throw RangeError for negative distance', () => {
      expect(() => calculateDistanceScore(-5)).toThrow(RangeError);
    });
  });

  describe('filterCentersByDistance', () => {
    const mockCenters = [
      {
        id: 1,
        centerName: '서울센터',
        latitude: 37.5665,
        longitude: 126.978,
      },
      {
        id: 2,
        centerName: '강남센터',
        latitude: 37.4979,
        longitude: 127.0276,
      },
      {
        id: 3,
        centerName: '부산센터',
        latitude: 35.1796,
        longitude: 129.0756,
      },
      {
        id: 4,
        centerName: '잘못된센터',
        latitude: null,
        longitude: 127.0,
      },
    ];

    const userLocation = { latitude: 37.5665, longitude: 126.978 }; // 서울시청

    // Test 14: 최대 거리 내 센터 필터링
    test('should filter centers within max distance', () => {
      const result = filterCentersByDistance(mockCenters, userLocation, 50);

      expect(result).toHaveLength(2); // 서울센터, 강남센터만
      expect(result[0].id).toBe(1); // 서울센터 (0km)
      expect(result[1].id).toBe(2); // 강남센터 (~9.5km)

      expect(result[0].distance).toBe(0);
      expect(result[0].distanceScore).toBe(100);

      expect(result[1].distance).toBeCloseTo(8.79, 1);
      expect(result[1].distanceScore).toBe(80);
    });

    // Test 15: 가까운 순으로 정렬 확인
    test('should sort centers by distance (ascending)', () => {
      const result = filterCentersByDistance(mockCenters, userLocation, 500);

      expect(result[0].distance).toBeLessThanOrEqual(result[1].distance);
      if (result[2]) {
        expect(result[1].distance).toBeLessThanOrEqual(result[2].distance);
      }
    });

    // Test 16: TypeError - 센터가 배열이 아닌 경우
    test('should throw TypeError if centers is not an array', () => {
      expect(() => filterCentersByDistance({}, userLocation, 50)).toThrow(TypeError);
    });

    // Test 17: TypeError - 사용자 위치가 잘못된 경우
    test('should throw TypeError for invalid user location', () => {
      expect(() => filterCentersByDistance(mockCenters, null, 50)).toThrow(TypeError);
      expect(() => filterCentersByDistance(mockCenters, { latitude: '37.5' }, 50)).toThrow(
        TypeError
      );
    });

    // Test 18: 잘못된 좌표를 가진 센터 건너뛰기
    test('should skip centers with invalid coordinates', () => {
      const result = filterCentersByDistance(mockCenters, userLocation, 500);

      // 잘못된센터(id=4)는 결과에 포함되지 않아야 함
      expect(result.find(c => c.id === 4)).toBeUndefined();
    });
  });

  describe('getNearestCenters', () => {
    const mockCenters = [
      { id: 1, centerName: 'A', latitude: 37.5665, longitude: 126.978 },
      { id: 2, centerName: 'B', latitude: 37.4979, longitude: 127.0276 },
      { id: 3, centerName: 'C', latitude: 37.52, longitude: 127.0 },
    ];

    const userLocation = { latitude: 37.5665, longitude: 126.978 };

    // Test 19: 가장 가까운 N개 센터 반환
    test('should return N nearest centers', () => {
      const result = getNearestCenters(mockCenters, userLocation, 2);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1); // 가장 가까운 센터
    });

    // Test 20: RangeError - 잘못된 limit
    test('should throw RangeError for invalid limit', () => {
      expect(() => getNearestCenters(mockCenters, userLocation, 0)).toThrow(RangeError);
      expect(() => getNearestCenters(mockCenters, userLocation, -5)).toThrow(RangeError);
    });
  });
});
