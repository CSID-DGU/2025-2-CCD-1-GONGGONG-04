/**
 * Unit Tests for Distance Scoring Module
 *
 * Sprint 2: 규칙 기반 추천 시스템 - 거리 스코어링 테스트
 *
 * @module tests/unit/scoring/distanceScore
 */

import {
  calculateHaversineDistance,
  applyRoadDistanceCorrection,
  calculateDistanceScore,
  formatDistance,
  calculateWalkTime,
  calculateDistanceInfo,
  isKoreanLatitude,
  isKoreanLongitude,
} from '../../../src/services/scoring/distanceScore';
import { Location } from '../../../src/types/location';

describe('calculateHaversineDistance', () => {
  describe('정확한 거리 계산', () => {
    it('서울시청 → 강남역 거리 정확성 (약 8.8km, 오차 0.5% 이내)', () => {
      // 서울시청: 37.5665, 126.9780
      // 강남역: 37.4979, 127.0276
      const distance = calculateHaversineDistance(
        37.5665,
        126.978,
        37.4979,
        127.0276,
      );

      // 실제 거리: 약 8,793m (직선 거리)
      const expectedDistance = 8793;
      const tolerance = expectedDistance * 0.005; // 0.5% 오차

      expect(distance).toBeGreaterThan(expectedDistance - tolerance);
      expect(distance).toBeLessThan(expectedDistance + tolerance);
    });

    it('서울시청 → 광화문 거리 정확성 (약 500m)', () => {
      // 서울시청: 37.5665, 126.9780
      // 광화문: 37.5759, 126.9768
      const distance = calculateHaversineDistance(
        37.5665,
        126.978,
        37.5759,
        126.9768,
      );

      // 실제 거리: 약 1,050m
      expect(distance).toBeGreaterThan(1000);
      expect(distance).toBeLessThan(1100);
    });

    it('동일한 위치는 0km', () => {
      const distance = calculateHaversineDistance(
        37.5665,
        126.978,
        37.5665,
        126.978,
      );

      expect(distance).toBe(0);
    });
  });

  describe('경계값 테스트', () => {
    it('0km 경계값', () => {
      const distance = calculateHaversineDistance(
        37.5665,
        126.978,
        37.5665,
        126.978,
      );
      expect(distance).toBe(0);
    });

    it('5km 경계값 (약간 벗어난 좌표)', () => {
      // 서울시청 기준 약 5km 떨어진 지점
      const distance = calculateHaversineDistance(
        37.5665,
        126.978,
        37.5665 + 0.045, // 위도로 약 5km
        126.978,
      );

      // 5km ± 500m 범위
      expect(distance).toBeGreaterThan(4500);
      expect(distance).toBeLessThan(5500);
    });

    it('10km 경계값', () => {
      // 서울시청 기준 약 10km 떨어진 지점
      const distance = calculateHaversineDistance(
        37.5665,
        126.978,
        37.5665 + 0.09, // 위도로 약 10km
        126.978,
      );

      // 10km ± 500m 범위
      expect(distance).toBeGreaterThan(9500);
      expect(distance).toBeLessThan(10500);
    });
  });

  describe('부동소수점 정밀도', () => {
    it('소수점 8자리 위도/경도 계산 정확성', () => {
      const distance = calculateHaversineDistance(
        37.56656789,
        126.97801234,
        37.56667890,
        126.97812345,
      );

      // 매우 짧은 거리
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(50);
    });

    it('반복 계산 시 일관된 결과', () => {
      const lat1 = 37.5665;
      const lng1 = 126.978;
      const lat2 = 37.4979;
      const lng2 = 127.0276;

      const distance1 = calculateHaversineDistance(lat1, lng1, lat2, lng2);
      const distance2 = calculateHaversineDistance(lat1, lng1, lat2, lng2);
      const distance3 = calculateHaversineDistance(lat1, lng1, lat2, lng2);

      expect(distance1).toBe(distance2);
      expect(distance2).toBe(distance3);
    });
  });

  describe('입력 검증', () => {
    it('잘못된 위도 (>90) 입력 시 에러 발생', () => {
      expect(() => {
        calculateHaversineDistance(91, 126.978, 37.5665, 126.978);
      }).toThrow('Invalid latitude');
    });

    it('잘못된 위도 (<-90) 입력 시 에러 발생', () => {
      expect(() => {
        calculateHaversineDistance(-91, 126.978, 37.5665, 126.978);
      }).toThrow('Invalid latitude');
    });

    it('잘못된 경도 (>180) 입력 시 에러 발생', () => {
      expect(() => {
        calculateHaversineDistance(37.5665, 181, 37.5665, 126.978);
      }).toThrow('Invalid longitude');
    });

    it('잘못된 경도 (<-180) 입력 시 에러 발생', () => {
      expect(() => {
        calculateHaversineDistance(37.5665, -181, 37.5665, 126.978);
      }).toThrow('Invalid longitude');
    });
  });
});

describe('applyRoadDistanceCorrection', () => {
  describe('서울 시내 보정 (1.4배)', () => {
    it('1km → 1.4km', () => {
      const corrected = applyRoadDistanceCorrection(1000, 'SEOUL_DOWNTOWN');
      expect(corrected).toBe(1400);
    });

    it('5km → 7km', () => {
      const corrected = applyRoadDistanceCorrection(5000, 'SEOUL_DOWNTOWN');
      expect(corrected).toBe(7000);
    });

    it('10km → 14km', () => {
      const corrected = applyRoadDistanceCorrection(10000, 'SEOUL_DOWNTOWN');
      expect(corrected).toBe(14000);
    });
  });

  describe('교외 지역 보정 (1.2배)', () => {
    it('1km → 1.2km', () => {
      const corrected = applyRoadDistanceCorrection(1000, 'SUBURBAN');
      expect(corrected).toBe(1200);
    });

    it('5km → 6km', () => {
      const corrected = applyRoadDistanceCorrection(5000, 'SUBURBAN');
      expect(corrected).toBe(6000);
    });

    it('10km → 12km', () => {
      const corrected = applyRoadDistanceCorrection(10000, 'SUBURBAN');
      expect(corrected).toBe(12000);
    });
  });

  describe('기본 보정 (1.3배)', () => {
    it('1km → 1.3km (기본값)', () => {
      const corrected = applyRoadDistanceCorrection(1000);
      expect(corrected).toBe(1300);
    });

    it('1km → 1.3km (DEFAULT 명시)', () => {
      const corrected = applyRoadDistanceCorrection(1000, 'DEFAULT');
      expect(corrected).toBe(1300);
    });
  });

  describe('경계 지역 처리', () => {
    it('음수 거리는 0으로 처리', () => {
      const corrected = applyRoadDistanceCorrection(-100, 'SEOUL_DOWNTOWN');
      expect(corrected).toBe(0);
    });

    it('0km는 0km', () => {
      const corrected = applyRoadDistanceCorrection(0, 'SEOUL_DOWNTOWN');
      expect(corrected).toBe(0);
    });

    it('소수점 반올림 처리', () => {
      const corrected = applyRoadDistanceCorrection(1001, 'SEOUL_DOWNTOWN');
      // 1001 * 1.4 = 1401.4 → 1401
      expect(corrected).toBe(1401);
    });
  });
});

describe('calculateDistanceScore', () => {
  describe('정확한 점수 계산', () => {
    it('0km = 100점', () => {
      const score = calculateDistanceScore(0);
      expect(score).toBe(100);
    });

    it('5km = 50점', () => {
      const score = calculateDistanceScore(5000);
      expect(score).toBe(50);
    });

    it('10km = 0점', () => {
      const score = calculateDistanceScore(10000);
      expect(score).toBe(0);
    });

    it('2.5km = 75점', () => {
      const score = calculateDistanceScore(2500);
      expect(score).toBe(75);
    });

    it('7.5km = 25점', () => {
      const score = calculateDistanceScore(7500);
      expect(score).toBe(25);
    });

    it('1km = 90점', () => {
      const score = calculateDistanceScore(1000);
      expect(score).toBe(90);
    });

    it('3km = 70점', () => {
      const score = calculateDistanceScore(3000);
      expect(score).toBe(70);
    });
  });

  describe('경계값 테스트', () => {
    it('음수 거리는 100점으로 처리', () => {
      const score = calculateDistanceScore(-100);
      expect(score).toBe(100);
    });

    it('10km 경계값 정확히 0점', () => {
      const score = calculateDistanceScore(10000);
      expect(score).toBe(0);
    });

    it('10km 초과는 0점', () => {
      const score = calculateDistanceScore(15000);
      expect(score).toBe(0);
    });

    it('0.1km 미만 초단거리는 100점', () => {
      const score = calculateDistanceScore(50);
      expect(score).toBe(100);
    });
  });

  describe('선형 감소 로직 검증', () => {
    it('거리 증가 시 점수 선형 감소', () => {
      const score1km = calculateDistanceScore(1000);
      const score2km = calculateDistanceScore(2000);
      const score3km = calculateDistanceScore(3000);

      // 1km씩 증가할 때마다 점수 10점씩 감소
      expect(score1km - score2km).toBe(10);
      expect(score2km - score3km).toBe(10);
    });

    it('반 거리 = 반 점수 감소', () => {
      const score0km = calculateDistanceScore(0);
      const score5km = calculateDistanceScore(5000);
      const score10km = calculateDistanceScore(10000);

      expect(score0km).toBe(100);
      expect(score5km).toBe(50);
      expect(score10km).toBe(0);
    });
  });

  describe('부동소수점 정밀도', () => {
    it('소수점 거리 계산 정확성 (3333.33m → 67점)', () => {
      const score = calculateDistanceScore(3333.33);
      // 100 - (3333.33 / 10000) * 100 = 66.6667 → 67점
      expect(score).toBe(67);
    });

    it('반올림 처리 (4445m → 56점)', () => {
      const score = calculateDistanceScore(4445);
      // 100 - (4445 / 10000) * 100 = 55.55 → 56점
      expect(score).toBe(56);
    });

    it('반올림 처리 (4444m → 56점)', () => {
      const score = calculateDistanceScore(4444);
      // 100 - (4444 / 10000) * 100 = 55.56 → 56점
      expect(score).toBe(56);
    });
  });
});

describe('formatDistance', () => {
  describe('미터 단위 표시', () => {
    it('750m → "750m"', () => {
      expect(formatDistance(750)).toBe('750m');
    });

    it('500m → "500m"', () => {
      expect(formatDistance(500)).toBe('500m');
    });

    it('999m → "999m"', () => {
      expect(formatDistance(999)).toBe('999m');
    });
  });

  describe('킬로미터 단위 표시', () => {
    it('1000m → "1.0km"', () => {
      expect(formatDistance(1000)).toBe('1.0km');
    });

    it('2345m → "2.3km"', () => {
      expect(formatDistance(2345)).toBe('2.3km');
    });

    it('10500m → "10.5km"', () => {
      expect(formatDistance(10500)).toBe('10.5km');
    });

    it('5678m → "5.7km"', () => {
      expect(formatDistance(5678)).toBe('5.7km');
    });
  });
});

describe('calculateWalkTime', () => {
  describe('도보 시간 계산', () => {
    it('800m → "도보 10분"', () => {
      // 800m / 80m/분 = 10분
      expect(calculateWalkTime(800)).toBe('도보 10분');
    });

    it('1600m → "도보 20분"', () => {
      expect(calculateWalkTime(1600)).toBe('도보 20분');
    });

    it('80m → "도보 1분"', () => {
      expect(calculateWalkTime(80)).toBe('도보 1분');
    });

    it('0m → "도보 1분" (최소 1분)', () => {
      expect(calculateWalkTime(0)).toBe('도보 1분');
    });

    it('750m → "도보 10분" (반올림)', () => {
      // 750m / 80m/분 = 9.375분 → 10분
      expect(calculateWalkTime(750)).toBe('도보 10분');
    });
  });
});

describe('calculateDistanceInfo', () => {
  describe('통합 정보 계산', () => {
    it('서울시청 → 광화문 전체 정보', () => {
      const userLocation: Location = {
        latitude: 37.5665,
        longitude: 126.978,
      };

      const centerLocation: Location = {
        latitude: 37.5759,
        longitude: 126.9768,
      };

      const info = calculateDistanceInfo(
        userLocation,
        centerLocation,
        'SEOUL_DOWNTOWN',
      );

      // 직선 거리: 약 1,050m
      expect(info.straightDistanceMeters).toBeGreaterThan(1000);
      expect(info.straightDistanceMeters).toBeLessThan(1100);

      // 보정 거리: 직선 거리 * 1.4
      expect(info.adjustedDistanceMeters).toBeGreaterThan(1400);
      expect(info.adjustedDistanceMeters).toBeLessThan(1600);

      // 점수: 1.5km 이하이므로 85점 이상
      expect(info.score).toBeGreaterThanOrEqual(85);

      // 거리 텍스트
      expect(info.distanceText).toMatch(/^1\.[4-5]km$/);

      // 도보 시간
      expect(info.walkTime).toMatch(/^도보 \d+분$/);
    });

    it('동일 위치 = 최고 점수', () => {
      const location: Location = {
        latitude: 37.5665,
        longitude: 126.978,
      };

      const info = calculateDistanceInfo(location, location);

      expect(info.straightDistanceMeters).toBe(0);
      expect(info.adjustedDistanceMeters).toBe(0);
      expect(info.score).toBe(100);
      expect(info.distanceText).toBe('0m');
      expect(info.walkTime).toBe('도보 1분');
    });

    it('먼 거리 (10km 이상) = 0점', () => {
      const userLocation: Location = {
        latitude: 37.5665,
        longitude: 126.978,
      };

      const centerLocation: Location = {
        latitude: 37.4979, // 약 8.8km 직선거리
        longitude: 127.0276,
      };

      const info = calculateDistanceInfo(
        userLocation,
        centerLocation,
        'SEOUL_DOWNTOWN',
      );

      // 직선 거리: 약 8,793m
      expect(info.straightDistanceMeters).toBeGreaterThan(8500);
      expect(info.straightDistanceMeters).toBeLessThan(9000);

      // 보정 거리: 직선 거리 * 1.4 → 약 12,310m
      expect(info.adjustedDistanceMeters).toBeGreaterThan(11900);
      expect(info.adjustedDistanceMeters).toBeLessThan(12600);

      // 점수: 10km 초과이므로 0점
      expect(info.score).toBe(0);

      // 거리 텍스트
      expect(info.distanceText).toMatch(/^\d+\.\dkm$/);
    });
  });

  describe('지역별 보정 적용', () => {
    it('서울 시내 보정 (1.4배)', () => {
      const userLocation: Location = {
        latitude: 37.5665,
        longitude: 126.978,
      };

      const centerLocation: Location = {
        latitude: 37.5665 + 0.045, // 약 5km
        longitude: 126.978,
      };

      const info = calculateDistanceInfo(
        userLocation,
        centerLocation,
        'SEOUL_DOWNTOWN',
      );

      // 직선 거리: 약 5,000m
      // 보정 거리: 약 7,000m (5,000 * 1.4)
      expect(info.adjustedDistanceMeters).toBeGreaterThan(6500);
      expect(info.adjustedDistanceMeters).toBeLessThan(7500);
    });

    it('교외 지역 보정 (1.2배)', () => {
      const userLocation: Location = {
        latitude: 37.5665,
        longitude: 126.978,
      };

      const centerLocation: Location = {
        latitude: 37.5665 + 0.045, // 약 5km
        longitude: 126.978,
      };

      const info = calculateDistanceInfo(
        userLocation,
        centerLocation,
        'SUBURBAN',
      );

      // 직선 거리: 약 5,000m
      // 보정 거리: 약 6,000m (5,000 * 1.2)
      expect(info.adjustedDistanceMeters).toBeGreaterThan(5500);
      expect(info.adjustedDistanceMeters).toBeLessThan(6500);
    });

    it('기본 보정 (1.3배)', () => {
      const userLocation: Location = {
        latitude: 37.5665,
        longitude: 126.978,
      };

      const centerLocation: Location = {
        latitude: 37.5665 + 0.045, // 약 5km
        longitude: 126.978,
      };

      const info = calculateDistanceInfo(userLocation, centerLocation);

      // 직선 거리: 약 5,000m
      // 보정 거리: 약 6,500m (5,000 * 1.3)
      expect(info.adjustedDistanceMeters).toBeGreaterThan(6000);
      expect(info.adjustedDistanceMeters).toBeLessThan(7000);
    });
  });
});

describe('isKoreanLatitude', () => {
  it('한국 영역 내 위도 (33.0 ~ 43.0)', () => {
    expect(isKoreanLatitude(37.5665)).toBe(true); // 서울
    expect(isKoreanLatitude(33.5)).toBe(true); // 제주
    expect(isKoreanLatitude(38.0)).toBe(true); // 강원
  });

  it('한국 영역 경계값', () => {
    expect(isKoreanLatitude(33.0)).toBe(true); // 최소값
    expect(isKoreanLatitude(43.0)).toBe(true); // 최대값
  });

  it('한국 영역 외 위도', () => {
    expect(isKoreanLatitude(32.9)).toBe(false); // 너무 남쪽
    expect(isKoreanLatitude(43.1)).toBe(false); // 너무 북쪽
    expect(isKoreanLatitude(0)).toBe(false); // 적도
  });
});

describe('isKoreanLongitude', () => {
  it('한국 영역 내 경도 (124.0 ~ 132.0)', () => {
    expect(isKoreanLongitude(126.978)).toBe(true); // 서울
    expect(isKoreanLongitude(127.0)).toBe(true); // 중부
    expect(isKoreanLongitude(129.0)).toBe(true); // 동부
  });

  it('한국 영역 경계값', () => {
    expect(isKoreanLongitude(124.0)).toBe(true); // 최소값
    expect(isKoreanLongitude(132.0)).toBe(true); // 최대값
  });

  it('한국 영역 외 경도', () => {
    expect(isKoreanLongitude(123.9)).toBe(false); // 너무 서쪽
    expect(isKoreanLongitude(132.1)).toBe(false); // 너무 동쪽
    expect(isKoreanLongitude(0)).toBe(false); // 본초 자오선
  });
});
