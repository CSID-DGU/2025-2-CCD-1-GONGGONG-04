/**
 * Program Score Service Unit Tests
 *
 * 프로그램 스코어링 서비스 단위 테스트
 * Sprint 2 - Task 3.4.2: Program Scoring Unit Tests
 *
 * @module tests/unit/scoring/programScore
 * @created 2025-01-27
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateProgramScore,
  matchProgramWithProfile,
  matchCategory,
  matchAgeGroup,
  matchSymptoms,
  matchOnline,
  matchFree,
  getActivePrograms,
  calculateBatchProgramScores,
} from '../../../src/services/scoring/programScore';
import type { UserProfile, ProgramInfo } from '../../../src/types/userProfile';

// ============================================
// 테스트 데이터 Helper Functions
// ============================================

/**
 * 기본 프로그램 생성
 */
function createProgram(overrides?: Partial<ProgramInfo>): ProgramInfo {
  return {
    id: BigInt(1),
    centerId: BigInt(100),
    programName: '개인상담 프로그램',
    programType: '개인상담',
    targetGroup: '성인',
    description: '일대일 심리상담 서비스',
    isOnlineAvailable: false,
    isFree: true,
    feeAmount: null,
    isActive: true,
    ...overrides,
  };
}

/**
 * 다양한 프로그램 세트 생성
 */
function createProgramSet(): ProgramInfo[] {
  return [
    createProgram({
      id: BigInt(1),
      programName: '우울증 극복 개인상담',
      programType: '개인상담',
      targetGroup: '20대',
      description: '우울감과 무기력함을 극복하는 개인 심리상담',
      isOnlineAvailable: true,
      isFree: false,
      feeAmount: 50000,
    }),
    createProgram({
      id: BigInt(2),
      programName: '불안장애 집단상담',
      programType: '집단상담',
      targetGroup: '성인',
      description: '불안과 공황장애를 함께 극복하는 그룹 프로그램',
      isOnlineAvailable: false,
      isFree: true,
    }),
    createProgram({
      id: BigInt(3),
      programName: '심리검사 및 평가',
      programType: '심리검사',
      targetGroup: '성인',
      description: '종합 심리검사 및 진단 서비스',
      isOnlineAvailable: false,
      isFree: false,
      feeAmount: 80000,
    }),
    createProgram({
      id: BigInt(4),
      programName: '직장인 스트레스 관리',
      programType: '정신건강교육',
      targetGroup: '30대',
      description: '직장인을 위한 스트레스 관리 교육',
      isOnlineAvailable: true,
      isFree: true,
    }),
    createProgram({
      id: BigInt(5),
      programName: '청소년 미술치료',
      programType: '미술치료',
      targetGroup: '청소년',
      description: '예술 활동을 통한 심리치료',
      isOnlineAvailable: false,
      isFree: true,
    }),
  ];
}

// ============================================
// Test Suite 1: 카테고리 매칭 테스트
// ============================================

describe('matchCategory', () => {
  it('정확 일치 시 100점을 반환해야 함', () => {
    expect(matchCategory('개인상담', '개인상담')).toBe(100);
  });

  it('부분 문자열 매칭 시 80점을 반환해야 함', () => {
    expect(matchCategory('개인상담 프로그램', '개인상담')).toBe(80);
    expect(matchCategory('개인상담', '상담')).toBe(80);
  });

  it('유사 카테고리 매칭 시 60점을 반환해야 함', () => {
    expect(matchCategory('심리상담', '개인상담')).toBe(60);
    expect(matchCategory('1:1상담', '개인상담')).toBe(60);
  });

  it('불일치 시 0점을 반환해야 함', () => {
    expect(matchCategory('집단상담', '개인상담')).toBe(0);
  });

  it('null 또는 undefined 입력 시 0점을 반환해야 함', () => {
    expect(matchCategory(null, '개인상담')).toBe(0);
    expect(matchCategory('개인상담', undefined)).toBe(0);
  });
});

// ============================================
// Test Suite 2: 연령대 매칭 테스트
// ============================================

describe('matchAgeGroup', () => {
  it('정확 일치 시 100점을 반환해야 함', () => {
    expect(matchAgeGroup('20대', '20대')).toBe(100);
    expect(matchAgeGroup('청소년', '청소년')).toBe(100);
  });

  it('"성인" 카테고리는 20-50대에 80점을 반환해야 함', () => {
    expect(matchAgeGroup('성인', '20대')).toBe(80);
    expect(matchAgeGroup('성인', '30대')).toBe(80);
    expect(matchAgeGroup('성인', '40대')).toBe(80);
    expect(matchAgeGroup('성인', '50대')).toBe(80);
  });

  it('"성인" 카테고리는 아동/청소년에 0점을 반환해야 함', () => {
    expect(matchAgeGroup('성인', '아동')).toBe(0);
    expect(matchAgeGroup('성인', '청소년')).toBe(0);
  });

  it('부분 문자열 매칭 시 60점을 반환해야 함', () => {
    expect(matchAgeGroup('20대 직장인', '20대')).toBe(60);
  });

  it('불일치 시 0점을 반환해야 함', () => {
    expect(matchAgeGroup('청소년', '20대')).toBe(0);
  });

  it('null 또는 undefined 입력 시 0점을 반환해야 함', () => {
    expect(matchAgeGroup(null, '20대')).toBe(0);
    expect(matchAgeGroup('20대', undefined)).toBe(0);
  });
});

// ============================================
// Test Suite 3: 증상 키워드 매칭 테스트
// ============================================

describe('matchSymptoms', () => {
  it('모든 증상이 매칭되면 100점을 반환해야 함', () => {
    const program = createProgram({
      programName: '우울증 극복 프로그램',
      description: '우울감과 무기력함을 해소하는 치료',
    });

    expect(matchSymptoms(program, ['우울감'])).toBe(100);
  });

  it('부분 증상 매칭 시 비율에 따라 점수를 반환해야 함', () => {
    const program = createProgram({
      programName: '우울증 극복',
      description: '우울감 해소',
    });

    // 2개 중 1개 매칭 = 50%
    expect(matchSymptoms(program, ['우울감', '불안'])).toBe(50);
  });

  it('증상이 매칭되지 않으면 0점을 반환해야 함', () => {
    const program = createProgram({
      programName: '미술치료',
      description: '예술 활동',
    });

    expect(matchSymptoms(program, ['우울감'])).toBe(0);
  });

  it('빈 증상 배열 시 0점을 반환해야 함', () => {
    const program = createProgram();
    expect(matchSymptoms(program, [])).toBe(0);
    expect(matchSymptoms(program, undefined)).toBe(0);
  });

  it('다양한 키워드로 증상을 매칭해야 함', () => {
    const program = createProgram({
      programName: 'depression 극복',
      description: '기분저하 해소',
    });

    // '우울감' 증상은 ['우울', '우울증', 'depression', '기분저하'] 키워드와 매칭
    expect(matchSymptoms(program, ['우울감'])).toBe(100);
  });
});

// ============================================
// Test Suite 4: 온라인/무료 매칭 테스트
// ============================================

describe('matchOnline', () => {
  it('온라인 선호 + 온라인 제공 시 100점', () => {
    expect(matchOnline(true, true)).toBe(100);
  });

  it('대면 선호 + 대면만 제공 시 100점', () => {
    expect(matchOnline(false, false)).toBe(100);
  });

  it('선호도 불일치 시 50점', () => {
    expect(matchOnline(true, false)).toBe(50);
    expect(matchOnline(false, true)).toBe(50);
  });

  it('선호도 없으면 0점', () => {
    expect(matchOnline(true, undefined)).toBe(0);
  });
});

describe('matchFree', () => {
  it('무료 선호 + 무료 제공 시 100점', () => {
    expect(matchFree(true, true)).toBe(100);
  });

  it('유료 가능 시 항상 100점', () => {
    expect(matchFree(true, false)).toBe(100);
    expect(matchFree(false, false)).toBe(100);
  });

  it('무료 선호하지만 유료일 때 0점', () => {
    expect(matchFree(false, true)).toBe(0);
  });

  it('선호도 없으면 0점', () => {
    expect(matchFree(true, undefined)).toBe(0);
  });
});

// ============================================
// Test Suite 5: 프로필 매칭 테스트 (통합)
// ============================================

describe('matchProgramWithProfile', () => {
  it('정확 매칭 (카테고리 + 연령) 시 높은 점수를 반환해야 함', () => {
    const program = createProgram({
      programName: '20대를 위한 개인상담',
      programType: '개인상담',
      targetGroup: '20대',
      description: '젊은 직장인을 위한 심리상담',
    });

    const profile: UserProfile = {
      preferredCategory: '개인상담',
      ageGroup: '20대',
    };

    const result = matchProgramWithProfile(program, profile);

    expect(result.matchScore).toBeGreaterThan(90); // 카테고리(100) + 연령대(100) 가중평균
    expect(result.matchReasons).toContain('카테고리 정확 일치');
    expect(result.matchReasons).toContain('연령대 정확 일치');
  });

  it('부분 매칭 (카테고리만) 시 중간 점수를 반환해야 함', () => {
    const program = createProgram({
      programType: '개인상담',
      targetGroup: '청소년', // 연령 불일치
    });

    const profile: UserProfile = {
      preferredCategory: '개인상담',
      ageGroup: '20대',
    };

    const result = matchProgramWithProfile(program, profile);

    // 카테고리만 매칭되므로 해당 항목의 점수 (100점)
    expect(result.matchScore).toBe(100);
    expect(result.matchReasons).toContain('카테고리 정확 일치');
  });

  it('부분 매칭 (연령만) 시 중간 점수를 반환해야 함', () => {
    const program = createProgram({
      programType: '집단상담', // 카테고리 불일치
      targetGroup: '20대',
    });

    const profile: UserProfile = {
      preferredCategory: '개인상담',
      ageGroup: '20대',
    };

    const result = matchProgramWithProfile(program, profile);

    // 연령대만 매칭되므로 해당 항목의 점수 (100점)
    expect(result.matchScore).toBe(100);
    expect(result.matchReasons).toContain('연령대 정확 일치');
  });

  it('미매칭 시 낮은 점수 또는 0점을 반환해야 함', () => {
    const program = createProgram({
      programType: '집단상담',
      targetGroup: '청소년',
    });

    const profile: UserProfile = {
      preferredCategory: '개인상담',
      ageGroup: '20대',
    };

    const result = matchProgramWithProfile(program, profile);

    expect(result.matchScore).toBe(0); // 아무것도 매칭 안됨
  });

  it('증상 키워드가 매칭되면 점수에 반영되어야 함', () => {
    const program = createProgram({
      programName: '우울증 극복 프로그램',
      programType: '개인상담',
      description: '우울감과 무기력함 해소',
    });

    const profile: UserProfile = {
      symptoms: ['우울감'],
      preferredCategory: '개인상담',
    };

    const result = matchProgramWithProfile(program, profile);

    expect(result.matchScore).toBeGreaterThan(80); // 카테고리 + 증상 매칭
    expect(result.matchReasons.some((r) => r.includes('증상'))).toBe(true);
  });

  it('온라인 선호도가 반영되어야 함', () => {
    const program = createProgram({
      programType: '개인상담',
      isOnlineAvailable: true,
    });

    const profile: UserProfile = {
      preferredCategory: '개인상담',
      preferOnline: true,
    };

    const result = matchProgramWithProfile(program, profile);

    expect(result.matchScore).toBeGreaterThan(90); // 카테고리 + 온라인 매칭
    expect(result.matchReasons).toContain('온라인 제공');
  });

  it('무료 선호도가 반영되어야 함', () => {
    const program = createProgram({
      programType: '개인상담',
      isFree: true,
    });

    const profile: UserProfile = {
      preferredCategory: '개인상담',
      preferFree: true,
    };

    const result = matchProgramWithProfile(program, profile);

    expect(result.matchScore).toBeGreaterThan(90); // 카테고리 + 무료 매칭
    expect(result.matchReasons).toContain('무료 제공');
  });
});

// ============================================
// Test Suite 6: 프로필 없는 경우 (프로그램 다양성)
// ============================================

describe('calculateProgramScore - 프로필 없는 경우', () => {
  it('프로그램 5개 이상 시 80점을 반환해야 함', () => {
    const programs = createProgramSet(); // 5개

    const result = calculateProgramScore(programs);

    expect(result.score).toBe(80);
    expect(result.activeProgramCount).toBe(5);
    expect(result.reason).toContain('5개 이상');
  });

  it('프로그램 3-4개 시 60점을 반환해야 함', () => {
    const programs = createProgramSet().slice(0, 3); // 3개

    const result = calculateProgramScore(programs);

    expect(result.score).toBe(60);
    expect(result.activeProgramCount).toBe(3);
    expect(result.reason).toContain('3-4개');
  });

  it('프로그램 1-2개 시 40점을 반환해야 함', () => {
    const programs = createProgramSet().slice(0, 1); // 1개

    const result = calculateProgramScore(programs);

    expect(result.score).toBe(40);
    expect(result.activeProgramCount).toBe(1);
    expect(result.reason).toContain('1-2개');
  });

  it('프로그램 없음 시 0점을 반환해야 함', () => {
    const result = calculateProgramScore([]);

    expect(result.score).toBe(0);
    expect(result.activeProgramCount).toBe(0);
    expect(result.reason).toContain('없음');
  });
});

// ============================================
// Test Suite 7: 프로필 있는 경우 (매칭 점수)
// ============================================

describe('calculateProgramScore - 프로필 있는 경우', () => {
  it('프로필 매칭 시 평균 점수를 반환해야 함', () => {
    const programs = createProgramSet();

    const profile: UserProfile = {
      symptoms: ['우울감'],
      preferredCategory: '개인상담',
      ageGroup: '20대',
    };

    const result = calculateProgramScore(programs, profile);

    expect(result.score).toBeGreaterThan(0);
    expect(result.matchedPrograms).toBeDefined();
    expect(result.matchedPrograms!.length).toBeLessThanOrEqual(3); // 상위 3개만
    expect(result.reason).toContain('프로필 매칭');
  });

  it('매칭 프로그램을 점수 순으로 정렬해야 함', () => {
    const programs = createProgramSet();

    const profile: UserProfile = {
      preferredCategory: '개인상담',
      ageGroup: '20대',
    };

    const result = calculateProgramScore(programs, profile);

    const matchScores = result.matchedPrograms!.map((m) => m.matchScore);

    // 내림차순 정렬 확인
    for (let i = 0; i < matchScores.length - 1; i++) {
      expect(matchScores[i]).toBeGreaterThanOrEqual(matchScores[i + 1]);
    }
  });

  it('상위 3개 프로그램만 반환해야 함', () => {
    const programs = createProgramSet(); // 5개 프로그램

    const profile: UserProfile = {
      preferredCategory: '개인상담',
    };

    const result = calculateProgramScore(programs, profile);

    expect(result.matchedPrograms!.length).toBe(3);
  });
});

// ============================================
// Test Suite 8: 활성 프로그램 필터링
// ============================================

describe('getActivePrograms', () => {
  it('활성 프로그램만 필터링해야 함', () => {
    const programs = [
      createProgram({ id: BigInt(1), isActive: true }),
      createProgram({ id: BigInt(2), isActive: false }), // 비활성
      createProgram({ id: BigInt(3), isActive: true }),
    ];

    const active = getActivePrograms(programs);

    expect(active.length).toBe(2);
    expect(active.every((p) => p.isActive)).toBe(true);
  });

  it('모든 프로그램이 비활성이면 빈 배열을 반환해야 함', () => {
    const programs = [
      createProgram({ isActive: false }),
      createProgram({ isActive: false }),
    ];

    const active = getActivePrograms(programs);

    expect(active.length).toBe(0);
  });

  it('빈 배열 입력 시 빈 배열을 반환해야 함', () => {
    expect(getActivePrograms([])).toEqual([]);
  });
});

// ============================================
// Test Suite 9: 엣지 케이스
// ============================================

describe('calculateProgramScore - 엣지 케이스', () => {
  it('빈 배열 입력 시 0점을 반환해야 함', () => {
    const result = calculateProgramScore([]);

    expect(result.score).toBe(0);
    expect(result.activeProgramCount).toBe(0);
  });

  it('null 프로필 입력 시 다양성 기준으로 점수 계산', () => {
    const programs = createProgramSet();

    const result = calculateProgramScore(programs, undefined);

    expect(result.score).toBe(80); // 5개 프로그램
    expect(result.matchedPrograms).toBeUndefined();
  });

  it('빈 프로필 객체 입력 시 다양성 모드로 동작해야 함', () => {
    const programs = createProgramSet();
    const emptyProfile: UserProfile = {};

    const result = calculateProgramScore(programs, emptyProfile);

    // 빈 프로필은 다양성 모드로 동작 (5개 프로그램 = 80점)
    expect(result.score).toBe(80);
    expect(result.matchedPrograms).toBeUndefined();
  });

  it('비활성 프로그램만 있을 때 0점을 반환해야 함', () => {
    const programs = [
      createProgram({ isActive: false }),
      createProgram({ isActive: false }),
    ];

    const result = calculateProgramScore(programs);

    expect(result.score).toBe(0);
    expect(result.activeProgramCount).toBe(0);
  });

  it('잘못된 입력 시 안전하게 처리해야 함', () => {
    // null 입력 시 빈 배열로 처리
    const result = calculateProgramScore(null as any);

    expect(result.score).toBe(0);
    expect(result.activeProgramCount).toBe(0);
    // null은 빈 배열로 처리되어 "제공 프로그램 없음" 메시지
  });
});

// ============================================
// Test Suite 10: 일괄 계산 (Batch Processing)
// ============================================

describe('calculateBatchProgramScores', () => {
  it('여러 센터에 대한 점수를 일괄 계산해야 함', () => {
    const centersMap = new Map<bigint, ProgramInfo[]>([
      [BigInt(100), createProgramSet().slice(0, 5)], // 5개
      [BigInt(101), createProgramSet().slice(0, 3)], // 3개
      [BigInt(102), createProgramSet().slice(0, 1)], // 1개
    ]);

    const results = calculateBatchProgramScores(centersMap);

    expect(results.size).toBe(3);
    expect(results.get(BigInt(100))!.score).toBe(80); // 5개
    expect(results.get(BigInt(101))!.score).toBe(60); // 3개
    expect(results.get(BigInt(102))!.score).toBe(40); // 1개
  });

  it('프로필과 함께 일괄 계산이 가능해야 함', () => {
    const centersMap = new Map<bigint, ProgramInfo[]>([
      [BigInt(100), createProgramSet()],
      [BigInt(101), createProgramSet()],
    ]);

    const profile: UserProfile = {
      preferredCategory: '개인상담',
      ageGroup: '20대',
    };

    const results = calculateBatchProgramScores(centersMap, profile);

    expect(results.size).toBe(2);
    expect(results.get(BigInt(100))!.matchedPrograms).toBeDefined();
    expect(results.get(BigInt(101))!.matchedPrograms).toBeDefined();
  });

  it('빈 Map 입력 시 빈 결과를 반환해야 함', () => {
    const centersMap = new Map<bigint, ProgramInfo[]>();

    const results = calculateBatchProgramScores(centersMap);

    expect(results.size).toBe(0);
  });
});
