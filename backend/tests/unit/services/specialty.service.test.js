/**
 * Specialty Service Unit Tests
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.3: Specialty Service 단위 테스트
 *
 * 검증: 8개 테스트 통과
 */

const { calculateSpecialtyScore } = require('../../../src/services/specialty.service');

describe('Specialty Service', () => {
  describe('calculateSpecialtyScore', () => {
    // Test 1: 정신건강의학과 전문의 있음 → 100점
    test('should return 100 when center has psychiatrist', () => {
      const staffInfo = {
        hasPsychiatrist: true,
        hasNurse: false,
        hasSocialWorker: false,
        hasOthers: false,
      };
      const score = calculateSpecialtyScore(staffInfo);
      expect(score).toBe(100);
    });

    // Test 2: 간호사 있음 → 80점
    test('should return 80 when center has nurse', () => {
      const staffInfo = {
        hasPsychiatrist: false,
        hasNurse: true,
        hasSocialWorker: false,
        hasOthers: false,
      };
      const score = calculateSpecialtyScore(staffInfo);
      expect(score).toBe(80);
    });

    // Test 3: 사회복지사 있음 → 80점
    test('should return 80 when center has social worker', () => {
      const staffInfo = {
        hasPsychiatrist: false,
        hasNurse: false,
        hasSocialWorker: true,
        hasOthers: false,
      };
      const score = calculateSpecialtyScore(staffInfo);
      expect(score).toBe(80);
    });

    // Test 4: 간호사와 사회복지사 모두 있음 → 80점
    test('should return 80 when center has both nurse and social worker', () => {
      const staffInfo = {
        hasPsychiatrist: false,
        hasNurse: true,
        hasSocialWorker: true,
        hasOthers: false,
      };
      const score = calculateSpecialtyScore(staffInfo);
      expect(score).toBe(80);
    });

    // Test 5: 기타 전문 인력만 있음 → 60점
    test('should return 60 when center has only other staff', () => {
      const staffInfo = {
        hasPsychiatrist: false,
        hasNurse: false,
        hasSocialWorker: false,
        hasOthers: true,
      };
      const score = calculateSpecialtyScore(staffInfo);
      expect(score).toBe(60);
    });

    // Test 6: 정보 없음 (빈 객체) → 40점
    test('should return 40 when no staff information', () => {
      const staffInfo = {};
      const score = calculateSpecialtyScore(staffInfo);
      expect(score).toBe(40);
    });

    // Test 7: TypeError - null 또는 undefined 입력
    test('should throw TypeError for null or undefined input', () => {
      expect(() => calculateSpecialtyScore(null)).toThrow(TypeError);
      expect(() => calculateSpecialtyScore(undefined)).toThrow(TypeError);
    });

    // Test 8: TypeError - 객체가 아닌 입력
    test('should throw TypeError for non-object input', () => {
      expect(() => calculateSpecialtyScore('invalid')).toThrow(TypeError);
      expect(() => calculateSpecialtyScore(123)).toThrow(TypeError);
      expect(() => calculateSpecialtyScore(true)).toThrow(TypeError);
    });
  });
});
