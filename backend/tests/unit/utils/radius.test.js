/**
 * Radius Utility Unit Tests
 *
 * Sprint 2 Day 6: Radius parameter expansion tests
 * Task: Test radius conversion and display functions
 *
 * 목표: 11개 테스트 통과
 */

const {
  getRadiusInMeters,
  getRadiusDisplay,
} = require('../../../src/utils/radius');

describe('Radius Utility', () => {
  describe('getRadiusInMeters', () => {
    // Test 1: 10km 반경 변환
    test('should convert "10" to 10000 meters', () => {
      const result = getRadiusInMeters('10');
      expect(result).toBe(10000);
    });

    // Test 2: 30km 반경 변환
    test('should convert "30" to 30000 meters', () => {
      const result = getRadiusInMeters('30');
      expect(result).toBe(30000);
    });

    // Test 3: 50km 반경 변환
    test('should convert "50" to 50000 meters', () => {
      const result = getRadiusInMeters('50');
      expect(result).toBe(50000);
    });

    // Test 4: 100km 반경 변환
    test('should convert "100" to 100000 meters', () => {
      const result = getRadiusInMeters('100');
      expect(result).toBe(100000);
    });

    // Test 5: "all" 반경 변환 (무제한)
    test('should convert "all" to 999999999 meters (unlimited)', () => {
      const result = getRadiusInMeters('all');
      expect(result).toBe(999999999);
    });

    // Test 6: TypeError - 숫자 타입 입력
    test('should throw Error for number type input', () => {
      expect(() => getRadiusInMeters(10)).toThrow(Error);
      expect(() => getRadiusInMeters(10)).toThrow('Radius must be a string');
    });

    // Test 7: TypeError - null 입력
    test('should throw Error for null input', () => {
      expect(() => getRadiusInMeters(null)).toThrow(Error);
    });

    // Test 8: TypeError - undefined 입력
    test('should throw Error for undefined input', () => {
      expect(() => getRadiusInMeters(undefined)).toThrow(Error);
    });

    // Test 9: Error - 잘못된 radius 값
    test('should throw Error for invalid radius value', () => {
      expect(() => getRadiusInMeters('5')).toThrow(Error);
      expect(() => getRadiusInMeters('5')).toThrow('Invalid radius value');
    });

    // Test 10: Error - 빈 문자열
    test('should throw Error for empty string', () => {
      expect(() => getRadiusInMeters('')).toThrow(Error);
      expect(() => getRadiusInMeters('')).toThrow('Invalid radius value');
    });
  });

  describe('getRadiusDisplay', () => {
    // Test 11: 10km 디스플레이
    test('should return "10km" for radius "10"', () => {
      const result = getRadiusDisplay('10');
      expect(result).toBe('10km');
    });

    // Test 12: 30km 디스플레이
    test('should return "30km" for radius "30"', () => {
      const result = getRadiusDisplay('30');
      expect(result).toBe('30km');
    });

    // Test 13: 50km 디스플레이
    test('should return "50km" for radius "50"', () => {
      const result = getRadiusDisplay('50');
      expect(result).toBe('50km');
    });

    // Test 14: 100km 디스플레이
    test('should return "100km" for radius "100"', () => {
      const result = getRadiusDisplay('100');
      expect(result).toBe('100km');
    });

    // Test 15: "all" 디스플레이
    test('should return "전체" for radius "all"', () => {
      const result = getRadiusDisplay('all');
      expect(result).toBe('전체');
    });

    // Test 16: Edge case - 다른 값에 대한 기본 동작
    test('should return formatted string for any other value', () => {
      const result = getRadiusDisplay('5');
      expect(result).toBe('5km');
    });
  });

  describe('Integration scenarios', () => {
    // Test 17: 모든 유효한 radius 값에 대한 변환 확인
    test('should handle all valid radius values correctly', () => {
      const validRadii = ['10', '30', '50', '100', 'all'];
      const expectedMeters = [10000, 30000, 50000, 100000, 999999999];

      validRadii.forEach((radius, index) => {
        expect(getRadiusInMeters(radius)).toBe(expectedMeters[index]);
      });
    });

    // Test 18: 모든 유효한 radius 값에 대한 디스플레이 확인
    test('should display all valid radius values correctly', () => {
      const testCases = [
        { radius: '10', expected: '10km' },
        { radius: '30', expected: '30km' },
        { radius: '50', expected: '50km' },
        { radius: '100', expected: '100km' },
        { radius: 'all', expected: '전체' },
      ];

      testCases.forEach(({ radius, expected }) => {
        expect(getRadiusDisplay(radius)).toBe(expected);
      });
    });
  });
});
