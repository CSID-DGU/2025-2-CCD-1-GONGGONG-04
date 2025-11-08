/**
 * Map Utils Unit Tests
 *
 * Sprint 2 - Day 8
 */

import {
  getRadiusInMeters,
  getZoomLevelForRadius,
  getRadiusDisplay,
} from '../utils';

describe('Map Utils', () => {
  describe('getRadiusInMeters', () => {
    it('should convert radius to meters correctly', () => {
      expect(getRadiusInMeters('1')).toBe(1000);
      expect(getRadiusInMeters('3')).toBe(3000);
      expect(getRadiusInMeters('5')).toBe(5000);
      expect(getRadiusInMeters('10')).toBe(10000);
      expect(getRadiusInMeters('all')).toBe(50000);
    });
  });

  describe('getZoomLevelForRadius', () => {
    it('should return correct zoom level for each radius', () => {
      expect(getZoomLevelForRadius('1')).toBe(7);
      expect(getZoomLevelForRadius('3')).toBe(9);
      expect(getZoomLevelForRadius('5')).toBe(10);
      expect(getZoomLevelForRadius('10')).toBe(11);
      expect(getZoomLevelForRadius('all')).toBe(12);
    });
  });

  describe('getRadiusDisplay', () => {
    it('should return user-friendly display string', () => {
      expect(getRadiusDisplay('1')).toBe('1km');
      expect(getRadiusDisplay('3')).toBe('3km');
      expect(getRadiusDisplay('5')).toBe('5km');
      expect(getRadiusDisplay('10')).toBe('10km');
      expect(getRadiusDisplay('all')).toBe('전체');
    });
  });
});
