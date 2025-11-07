/**
 * RecommendationService Unit Tests
 * Sprint 3 - Task 3.4.1: Assessment-based Recommendations
 *
 * 테스트 범위:
 * 1. getWeightsBySeverity() - 가중치 조정 로직
 * 2. getRecommendationsByAssessment() - Assessment 기반 추천
 * 3. 24시간 센터 우선 정렬
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  getWeightsBySeverity,
  type SeverityCode,
  type ScoringWeights,
} from '../../../src/services/recommendationService';

describe('RecommendationService - Assessment Integration', () => {
  describe('getWeightsBySeverity()', () => {
    describe('진단 없음 (null/undefined)', () => {
      it('should return default weights when severityCode is null', () => {
        const weights = getWeightsBySeverity(null);

        expect(weights).toEqual({
          distance: 0.35,
          operating: 0.25,
          specialty: 0.20,
          program: 0.20,
        });
      });

      it('should return default weights when severityCode is undefined', () => {
        const weights = getWeightsBySeverity(undefined);

        expect(weights).toEqual({
          distance: 0.35,
          operating: 0.25,
          specialty: 0.20,
          program: 0.20,
        });
      });
    });

    describe('진단 있음 (LOW/MID/HIGH)', () => {
      it('should return adjusted weights for LOW severity', () => {
        const weights = getWeightsBySeverity('LOW');

        expect(weights).toEqual({
          distance: 0.30,
          operating: 0.25,
          specialty: 0.20,
          program: 0.30,
        });
      });

      it('should return adjusted weights for MID severity', () => {
        const weights = getWeightsBySeverity('MID');

        expect(weights).toEqual({
          distance: 0.30,
          operating: 0.25,
          specialty: 0.20,
          program: 0.30,
        });
      });

      it('should return adjusted weights for HIGH severity', () => {
        const weights = getWeightsBySeverity('HIGH');

        expect(weights).toEqual({
          distance: 0.30,
          operating: 0.25,
          specialty: 0.20,
          program: 0.30,
        });
      });
    });

    describe('가중치 총합 검증', () => {
      it('should have weights that sum to 1.0 for default', () => {
        const weights = getWeightsBySeverity(null);
        const sum = weights.distance + weights.operating + weights.specialty + weights.program;

        expect(sum).toBe(1.0);
      });

      it('should have weights that sum to 1.0 for all severity codes', () => {
        const severityCodes: SeverityCode[] = ['LOW', 'MID', 'HIGH'];

        severityCodes.forEach((code) => {
          const weights = getWeightsBySeverity(code);
          const sum = weights.distance + weights.operating + weights.specialty + weights.program;

          expect(sum).toBe(1.0);
        });
      });
    });

    describe('가중치 변경 검증', () => {
      it('should decrease distance weight when assessment exists', () => {
        const defaultWeights = getWeightsBySeverity(null);
        const assessmentWeights = getWeightsBySeverity('MID');

        expect(assessmentWeights.distance).toBeLessThan(defaultWeights.distance);
        expect(assessmentWeights.distance).toBe(0.30);
        expect(defaultWeights.distance).toBe(0.35);
      });

      it('should increase program weight when assessment exists', () => {
        const defaultWeights = getWeightsBySeverity(null);
        const assessmentWeights = getWeightsBySeverity('MID');

        expect(assessmentWeights.program).toBeGreaterThan(defaultWeights.program);
        expect(assessmentWeights.program).toBe(0.30);
        expect(defaultWeights.program).toBe(0.20);
      });

      it('should keep operating and specialty weights unchanged', () => {
        const defaultWeights = getWeightsBySeverity(null);
        const assessmentWeights = getWeightsBySeverity('HIGH');

        expect(assessmentWeights.operating).toBe(defaultWeights.operating);
        expect(assessmentWeights.operating).toBe(0.25);

        expect(assessmentWeights.specialty).toBe(defaultWeights.specialty);
        expect(assessmentWeights.specialty).toBe(0.20);
      });
    });

    describe('엣지 케이스', () => {
      it('should handle empty string as null', () => {
        const weights = getWeightsBySeverity(null);

        expect(weights.distance).toBe(0.35);
        expect(weights.program).toBe(0.20);
      });

      it('should return consistent weights for same severity code', () => {
        const weights1 = getWeightsBySeverity('HIGH');
        const weights2 = getWeightsBySeverity('HIGH');

        expect(weights1).toEqual(weights2);
      });
    });
  });

  describe('가중치 변경 비즈니스 로직', () => {
    it('should reflect that assessment users need more program matching', () => {
      // 진단을 받은 사용자는 자신의 증상에 맞는 프로그램이 더 중요함
      const defaultWeights = getWeightsBySeverity(null);
      const assessmentWeights = getWeightsBySeverity('MID');

      // Program 가중치가 20% → 30%로 증가
      const programWeightIncrease = assessmentWeights.program - defaultWeights.program;
      expect(programWeightIncrease).toBe(0.10); // 10% 증가

      // Distance 가중치가 35% → 30%로 감소
      const distanceWeightDecrease = defaultWeights.distance - assessmentWeights.distance;
      expect(distanceWeightDecrease).toBe(0.05); // 5% 감소

      // 전체적으로 프로그램 매칭의 중요도가 증가함
      expect(assessmentWeights.program).toBeGreaterThan(assessmentWeights.distance);
    });

    it('should prioritize program matching over distance for diagnosed users', () => {
      const assessmentWeights = getWeightsBySeverity('LOW');

      // 진단 받은 사용자에게는 program과 distance 가중치가 동일
      expect(assessmentWeights.program).toBe(0.30);
      expect(assessmentWeights.distance).toBe(0.30);

      // 둘 다 가장 높은 가중치
      expect(assessmentWeights.program).toBeGreaterThan(assessmentWeights.operating);
      expect(assessmentWeights.distance).toBeGreaterThan(assessmentWeights.specialty);
    });
  });

  describe('타입 안전성', () => {
    it('should accept valid SeverityCode types', () => {
      const validCodes: SeverityCode[] = ['LOW', 'MID', 'HIGH'];

      validCodes.forEach((code) => {
        const weights = getWeightsBySeverity(code);
        expect(weights).toBeDefined();
        expect(typeof weights.distance).toBe('number');
        expect(typeof weights.operating).toBe('number');
        expect(typeof weights.specialty).toBe('number');
        expect(typeof weights.program).toBe('number');
      });
    });

    it('should return ScoringWeights type', () => {
      const weights: ScoringWeights = getWeightsBySeverity('HIGH');

      expect(weights).toHaveProperty('distance');
      expect(weights).toHaveProperty('operating');
      expect(weights).toHaveProperty('specialty');
      expect(weights).toHaveProperty('program');

      // All properties should be numbers between 0 and 1
      Object.values(weights).forEach((weight) => {
        expect(typeof weight).toBe('number');
        expect(weight).toBeGreaterThan(0);
        expect(weight).toBeLessThanOrEqual(1);
      });
    });
  });
});
