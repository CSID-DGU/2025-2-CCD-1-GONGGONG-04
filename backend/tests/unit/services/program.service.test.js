/**
 * Program Service Unit Tests
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.4: Program Service 단위 테스트
 *
 * 검증: 12개 테스트 통과
 */

const {
  matchProgramsByAssessment,
  calculateProgramScore,
} = require('../../../src/services/program.service');

describe('Program Service', () => {
  // 공통 테스트 데이터
  const mockPrograms = [
    {
      programName: '우울증 집단치료',
      category: 'depression',
      targetSeverity: ['MID', 'HIGH'],
      targetAge: { min: 20, max: 40 },
    },
    {
      programName: '불안 완화 프로그램',
      category: 'anxiety',
      targetSeverity: ['LOW', 'MID'],
      targetAge: { min: 18, max: 65 },
    },
    {
      programName: '스트레스 관리',
      category: 'stress',
      targetSeverity: ['LOW'],
      targetAge: null,
    },
    {
      programName: '일반 상담',
      category: 'general',
      targetSeverity: null,
      targetAge: null,
    },
  ];

  describe('matchProgramsByAssessment', () => {
    // Test 1: 정확한 category + severity 매칭
    test('should match programs with exact category and severity', () => {
      const assessmentResult = { severity: 'MID', category: 'depression' };
      const matched = matchProgramsByAssessment(mockPrograms, assessmentResult);

      expect(matched.length).toBeGreaterThan(0);
      expect(matched[0].programName).toBe('우울증 집단치료');
      expect(matched[0].category).toBe('depression');
    });

    // Test 2: category만 일치하는 경우
    test('should match programs with category only', () => {
      const assessmentResult = { severity: 'LOW', category: 'depression' };
      const matched = matchProgramsByAssessment(mockPrograms, assessmentResult);

      // depression category는 있지만 LOW severity는 targetSeverity에 없음
      // 그래도 category 매칭으로 포함됨 (낮은 점수)
      const depressionProgram = matched.find(p => p.category === 'depression');
      expect(depressionProgram).toBeDefined();
    });

    // Test 3: general 프로그램 매칭
    test('should include general programs in matches', () => {
      const assessmentResult = { severity: 'HIGH', category: 'depression' };
      const matched = matchProgramsByAssessment(mockPrograms, assessmentResult);

      const generalProgram = matched.find(p => p.category === 'general');
      expect(generalProgram).toBeDefined();
      expect(generalProgram.programName).toBe('일반 상담');
    });

    // Test 4: 빈 프로그램 배열
    test('should return empty array when no programs', () => {
      const assessmentResult = { severity: 'MID', category: 'depression' };
      const matched = matchProgramsByAssessment([], assessmentResult);

      expect(matched).toEqual([]);
    });

    // Test 5: TypeError - programs가 배열이 아닌 경우
    test('should throw TypeError if programs is not an array', () => {
      const assessmentResult = { severity: 'MID', category: 'depression' };
      expect(() => matchProgramsByAssessment({}, assessmentResult)).toThrow(TypeError);
    });

    // Test 6: TypeError - assessmentResult가 잘못된 경우
    test('should throw TypeError for invalid assessmentResult', () => {
      expect(() => matchProgramsByAssessment(mockPrograms, null)).toThrow(TypeError);
      expect(() => matchProgramsByAssessment(mockPrograms, {})).toThrow(TypeError);
      expect(() => matchProgramsByAssessment(mockPrograms, { severity: 'MID' })).toThrow(TypeError);
    });
  });

  describe('calculateProgramScore', () => {
    // Test 7: 완전 일치 (category + severity + age) → 100점
    test('should return 100 for exact match (category + severity + age)', () => {
      const userProfile = {
        age: 25,
        assessmentResult: { severity: 'MID', category: 'depression' },
      };
      const score = calculateProgramScore(mockPrograms, userProfile);

      expect(score).toBe(100);
    });

    // Test 8: 유사 프로그램 (category 일치) → 70점
    test('should return 70 for similar match (category match)', () => {
      const programs = [
        {
          programName: '우울증 치료',
          category: 'depression',
          targetSeverity: ['HIGH'], // severity 불일치
          targetAge: null,
        },
      ];
      const userProfile = {
        age: 25,
        assessmentResult: { severity: 'LOW', category: 'depression' },
      };
      const score = calculateProgramScore(programs, userProfile);

      expect(score).toBe(70);
    });

    // Test 9: 일반 프로그램 → 50점
    test('should return 50 for general program', () => {
      const programs = [
        {
          programName: '일반 상담',
          category: 'general',
          targetSeverity: null,
          targetAge: null,
        },
      ];
      const userProfile = {
        age: 25,
        assessmentResult: { severity: 'MID', category: 'depression' },
      };
      const score = calculateProgramScore(programs, userProfile);

      expect(score).toBe(50);
    });

    // Test 10: 프로그램 정보 없음 → 30점
    test('should return 30 when no programs available', () => {
      const userProfile = {
        age: 25,
        assessmentResult: { severity: 'MID', category: 'depression' },
      };
      const score = calculateProgramScore([], userProfile);

      expect(score).toBe(30);
    });

    // Test 11: assessmentResult 없음 → 일반 프로그램 점수 또는 30점
    test('should return 50 or 30 when no assessmentResult', () => {
      const userProfile = { age: 25 };
      const scoreWithPrograms = calculateProgramScore(mockPrograms, userProfile);
      const scoreWithoutPrograms = calculateProgramScore([], userProfile);

      expect(scoreWithPrograms).toBe(50); // 프로그램 있음
      expect(scoreWithoutPrograms).toBe(30); // 프로그램 없음
    });

    // Test 12: TypeError - programs가 배열이 아닌 경우
    test('should throw TypeError if programs is not an array', () => {
      const userProfile = {
        age: 25,
        assessmentResult: { severity: 'MID', category: 'depression' },
      };
      expect(() => calculateProgramScore({}, userProfile)).toThrow(TypeError);
    });

    // Test 13 (보너스): TypeError - userProfile이 잘못된 경우
    test('should throw TypeError for invalid userProfile', () => {
      expect(() => calculateProgramScore(mockPrograms, null)).toThrow(TypeError);
    });
  });
});
