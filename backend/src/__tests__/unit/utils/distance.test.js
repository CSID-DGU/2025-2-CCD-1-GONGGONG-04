/**
 * Distance Utility Tests
 *
 * Sprint 2 Day 6: Haversine formula and walk time calculation
 */

const { calculateDistance, calculateWalkTime } = require('../../../utils/distance');

describe('calculateDistance (Haversine)', () => {
  test('should calculate Seoul City Hall to Gangnam Station (~8.5km)', () => {
    const distance = calculateDistance(
      37.5665, 126.9780, // Seoul City Hall
      37.4979, 127.0276,  // Gangnam Station
    );

    // Allow ±200m tolerance for Haversine approximation
    expect(distance).toBeGreaterThanOrEqual(8600);
    expect(distance).toBeLessThanOrEqual(9000);
  });

  test('should calculate short distance accurately', () => {
    const distance = calculateDistance(
      37.5665, 126.9780,
      37.5675, 126.9790,
    );

    // ~135m
    expect(distance).toBeGreaterThanOrEqual(125);
    expect(distance).toBeLessThanOrEqual(145);
  });

  test('should return 0 for identical locations', () => {
    const distance = calculateDistance(
      37.5665, 126.9780,
      37.5665, 126.9780,
    );

    expect(distance).toBe(0);
  });

  test('should return integer (rounded meters)', () => {
    const distance = calculateDistance(
      37.5665, 126.9780,
      37.5675, 126.9790,
    );

    expect(Number.isInteger(distance)).toBe(true);
  });
});

describe('calculateWalkTime', () => {
  test('should calculate 1000m → 13분', () => {
    const walkTime = calculateWalkTime(1000);
    expect(walkTime).toBe('13분'); // 1000 / 80 = 12.5 → ceil = 13
  });

  test('should calculate 3000m → 38분', () => {
    const walkTime = calculateWalkTime(3000);
    expect(walkTime).toBe('38분'); // 3000 / 80 = 37.5 → ceil = 38
  });

  test('should calculate 5000m → 63분', () => {
    const walkTime = calculateWalkTime(5000);
    expect(walkTime).toBe('63분'); // 5000 / 80 = 62.5 → ceil = 63
  });

  test('should handle edge case: 100m → 2분', () => {
    const walkTime = calculateWalkTime(100);
    expect(walkTime).toBe('2분'); // 100 / 80 = 1.25 → ceil = 2
  });

  test('should round up partial minutes', () => {
    const walkTime = calculateWalkTime(1500); // 1500 / 80 = 18.75 → ceil = 19
    expect(walkTime).toBe('19분');
  });

  test('should format with Korean suffix', () => {
    const walkTime = calculateWalkTime(2000);
    expect(walkTime).toMatch(/^\d+분$/);
  });
});
