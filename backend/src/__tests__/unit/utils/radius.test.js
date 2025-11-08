/**
 * Radius Utility Tests
 *
 * Sprint 2 Day 6: Radius parameter expansion
 */

const { getRadiusInMeters, getRadiusDisplay } = require('../../../utils/radius');

describe('getRadiusInMeters', () => {
  test('should convert "1" to 1000 meters', () => {
    const meters = getRadiusInMeters('1');
    expect(meters).toBe(1000);
  });

  test('should convert "3" to 3000 meters', () => {
    const meters = getRadiusInMeters('3');
    expect(meters).toBe(3000);
  });

  test('should convert "5" to 5000 meters', () => {
    const meters = getRadiusInMeters('5');
    expect(meters).toBe(5000);
  });

  test('should convert "10" to 10000 meters', () => {
    const meters = getRadiusInMeters('10');
    expect(meters).toBe(10000);
  });

  test('should convert "all" to 999999999 meters', () => {
    const meters = getRadiusInMeters('all');
    expect(meters).toBe(999999999);
  });

  test('should throw error for invalid radius value', () => {
    expect(() => getRadiusInMeters('invalid')).toThrow(
      'Invalid radius value: invalid. Must be one of: 10, 30, 50, 100, all',
    );
  });

  test('should throw error for empty string', () => {
    expect(() => getRadiusInMeters('')).toThrow('Invalid radius value');
  });

  test('should throw error for non-string input (number)', () => {
    expect(() => getRadiusInMeters(5)).toThrow('Radius must be a string');
  });
});

describe('getRadiusDisplay', () => {
  test('should display "1km" for radius "1"', () => {
    const display = getRadiusDisplay('1');
    expect(display).toBe('1km');
  });

  test('should display "3km" for radius "3"', () => {
    const display = getRadiusDisplay('3');
    expect(display).toBe('3km');
  });

  test('should display "5km" for radius "5"', () => {
    const display = getRadiusDisplay('5');
    expect(display).toBe('5km');
  });

  test('should display "10km" for radius "10"', () => {
    const display = getRadiusDisplay('10');
    expect(display).toBe('10km');
  });

  test('should display "전체" for radius "all"', () => {
    const display = getRadiusDisplay('all');
    expect(display).toBe('전체');
  });
});
