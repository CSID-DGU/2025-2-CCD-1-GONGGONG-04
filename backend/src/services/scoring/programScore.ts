/**
 * Program Score Calculation Service
 *
 * 프로그램 매칭 기반 점수 계산 서비스
 * Sprint 2 - Task 3.4.1: User Profile Matching Logic
 *
 * @module services/scoring/programScore
 * @created 2025-01-27
 */

import type { UserProfile, ProgramInfo, ProgramMatchResult } from '../../types/userProfile';

/**
 * 프로그램 스코어링 결과 인터페이스
 */
export interface ProgramScoreResult {
  /** 프로그램 점수 (0-100) */
  score: number;

  /** 전체 프로그램 수 */
  totalProgramCount: number;

  /** 활성 프로그램 수 */
  activeProgramCount: number;

  /** 매칭된 프로그램 (프로필 있을 때만) */
  matchedPrograms?: ProgramMatchResult[];

  /** 점수 산출 이유 */
  reason: string;
}

/**
 * 매칭 가중치 설정
 *
 * 프로그램-프로필 매칭 시 각 요소의 중요도
 */
export const MATCHING_WEIGHTS = {
  /** 카테고리 일치 가중치 */
  CATEGORY: 100,

  /** 연령대 일치 가중치 */
  AGE_GROUP: 50,

  /** 증상 키워드 매칭 가중치 */
  SYMPTOM: 30,

  /** 온라인 제공 가중치 */
  ONLINE: 20,

  /** 무료 제공 가중치 */
  FREE: 15,
} as const;

/**
 * 카테고리 유사도 매핑
 *
 * 완전 일치하지 않아도 유사한 카테고리로 부분 점수 부여
 */
const CATEGORY_SIMILARITY: Record<string, string[]> = {
  개인상담: ['심리상담', '정신상담', '1:1상담'],
  집단상담: ['그룹상담', '집단치료', '그룹치료'],
  심리검사: ['심리평가', '심리측정', '진단검사'],
  정신건강교육: ['예방교육', '정신건강강좌', '교육프로그램'],
  인지행동치료: ['CBT', '인지치료', '행동치료'],
  미술치료: ['예술치료', '미술심리치료'],
  음악치료: ['예술치료', '음악심리치료'],
};

/**
 * 증상 키워드 매핑
 *
 * 프로그램 설명이나 이름에서 찾을 수 있는 증상 관련 키워드
 */
const SYMPTOM_KEYWORDS: Record<string, string[]> = {
  우울감: ['우울', '우울증', 'depression', '기분저하'],
  불안: ['불안', '불안장애', 'anxiety', '걱정'],
  스트레스: ['스트레스', 'stress', '긴장', '압박'],
  불면증: ['불면', '수면', 'sleep', '잠'],
  공황장애: ['공황', 'panic', '공포'],
  강박증: ['강박', 'OCD', '반복행동'],
  외상후스트레스: ['PTSD', '트라우마', 'trauma', '외상'],
  대인관계: ['대인관계', '관계', '사회성', '소통'],
  가족갈등: ['가족', '부부', '부모자녀', '가정'],
  직장스트레스: ['직장', '직무', '업무', '번아웃'],
  학업스트레스: ['학업', '학교', '공부', '시험'],
  중독: ['중독', 'addiction', '의존'],
  자살사고: ['자살', '자해', '위기개입'],
};

/**
 * 활성 프로그램 필터링
 *
 * @param programs - 전체 프로그램 목록
 * @returns 활성 상태인 프로그램만 필터링
 */
export function getActivePrograms(programs: ProgramInfo[]): ProgramInfo[] {
  if (!programs || programs.length === 0) {
    return [];
  }

  return programs.filter((program) => program.isActive === true);
}

/**
 * 카테고리 매칭 점수 계산
 *
 * @param programType - 프로그램 유형
 * @param preferredCategory - 사용자 선호 카테고리
 * @returns 매칭 점수 (0-100)
 *
 * @example
 * ```typescript
 * matchCategory('개인상담', '개인상담'); // 100 (정확 일치)
 * matchCategory('심리상담', '개인상담'); // 60 (유사 카테고리)
 * matchCategory('집단상담', '개인상담'); // 0 (불일치)
 * ```
 */
export function matchCategory(
  programType: string | null,
  preferredCategory?: string,
): number {
  if (!programType || !preferredCategory) {
    return 0;
  }

  const normalizedProgram = programType.trim();
  const normalizedPreference = preferredCategory.trim();

  // 1. 정확 일치
  if (normalizedProgram === normalizedPreference) {
    return 100;
  }

  // 2. 부분 문자열 매칭
  if (
    normalizedProgram.includes(normalizedPreference) ||
    normalizedPreference.includes(normalizedProgram)
  ) {
    return 80;
  }

  // 3. 유사 카테고리 매칭
  const similarCategories = CATEGORY_SIMILARITY[normalizedPreference] || [];
  for (const similar of similarCategories) {
    if (normalizedProgram.includes(similar)) {
      return 60;
    }
  }

  return 0;
}

/**
 * 연령대 매칭 점수 계산
 *
 * @param targetGroup - 프로그램 대상 그룹
 * @param userAgeGroup - 사용자 연령대
 * @returns 매칭 점수 (0-100)
 *
 * @example
 * ```typescript
 * matchAgeGroup('20대', '20대'); // 100 (정확 일치)
 * matchAgeGroup('성인', '20대'); // 80 ('성인'은 모든 연령대 포함)
 * matchAgeGroup('청소년', '20대'); // 0 (불일치)
 * ```
 */
export function matchAgeGroup(
  targetGroup: string | null,
  userAgeGroup?: string,
): number {
  if (!targetGroup || !userAgeGroup) {
    return 0;
  }

  const normalizedTarget = targetGroup.trim();
  const normalizedUser = userAgeGroup.trim();

  // 1. 정확 일치
  if (normalizedTarget === normalizedUser) {
    return 100;
  }

  // 2. '성인' 카테고리는 20대-50대 모두 포함
  if (normalizedTarget === '성인' || normalizedTarget.includes('성인')) {
    const adultAges = ['20대', '30대', '40대', '50대'];
    if (adultAges.includes(normalizedUser)) {
      return 80;
    }
  }

  // 3. 부분 문자열 매칭
  if (
    normalizedTarget.includes(normalizedUser) ||
    normalizedUser.includes(normalizedTarget)
  ) {
    return 60;
  }

  return 0;
}

/**
 * 증상 키워드 매칭 점수 계산
 *
 * @param program - 프로그램 정보
 * @param symptoms - 사용자 증상 목록
 * @returns 매칭 점수 (0-100)
 *
 * @example
 * ```typescript
 * const program = {
 *   programName: '우울증 극복 프로그램',
 *   description: '우울감과 무기력함을 해소하는 인지행동치료',
 * };
 * matchSymptoms(program, ['우울감', '불안']); // 100 (우울감 키워드 매칭)
 * ```
 */
export function matchSymptoms(
  program: Pick<ProgramInfo, 'programName' | 'description' | 'programType'>,
  symptoms?: string[],
): number {
  if (!symptoms || symptoms.length === 0) {
    return 0;
  }

  const searchText = `${program.programName || ''} ${program.description || ''} ${program.programType || ''}`.toLowerCase();

  let matchCount = 0;
  const totalSymptoms = symptoms.length;

  for (const symptom of symptoms) {
    const keywords = SYMPTOM_KEYWORDS[symptom] || [symptom];

    // 키워드 중 하나라도 매칭되면 카운트
    const hasMatch = keywords.some((keyword) =>
      searchText.includes(keyword.toLowerCase()),
    );

    if (hasMatch) {
      matchCount++;
    }
  }

  // 매칭 비율에 따라 점수 부여
  if (matchCount === 0) {return 0;}
  if (matchCount === totalSymptoms) {return 100;} // 모든 증상 매칭

  // 부분 매칭: 비율에 따라 점수 부여
  return Math.round((matchCount / totalSymptoms) * 100);
}

/**
 * 온라인 제공 매칭
 *
 * @param isOnlineAvailable - 프로그램 온라인 제공 여부
 * @param preferOnline - 사용자 온라인 선호 여부
 * @returns 매칭 점수 (0-100)
 */
export function matchOnline(
  isOnlineAvailable: boolean,
  preferOnline?: boolean,
): number {
  if (preferOnline === undefined) {
    return 0; // 선호도 없음
  }

  if (preferOnline && isOnlineAvailable) {
    return 100; // 온라인 선호 + 온라인 제공
  }

  if (!preferOnline && !isOnlineAvailable) {
    return 100; // 대면 선호 + 대면만 제공
  }

  return 50; // 선호도와 불일치하지만 완전히 맞지 않는 것은 아님
}

/**
 * 무료 프로그램 매칭
 *
 * @param isFree - 프로그램 무료 여부
 * @param preferFree - 사용자 무료 선호 여부
 * @returns 매칭 점수 (0-100)
 */
export function matchFree(isFree: boolean, preferFree?: boolean): number {
  if (preferFree === undefined) {
    return 0; // 선호도 없음
  }

  if (preferFree && isFree) {
    return 100; // 무료 선호 + 무료 제공
  }

  if (!preferFree) {
    return 100; // 유료 가능 (비용 상관 없음)
  }

  return 0; // 무료 선호하지만 유료 프로그램
}

/**
 * 단일 프로그램에 대한 프로필 매칭 점수 계산
 *
 * @param program - 프로그램 정보
 * @param profile - 사용자 프로필
 * @returns 매칭 결과 (점수 및 이유)
 *
 * @example
 * ```typescript
 * const program = {
 *   id: BigInt(1),
 *   programName: '우울증 극복 개인상담',
 *   programType: '개인상담',
 *   targetGroup: '20대',
 *   description: '우울감 해소를 위한 1:1 상담',
 *   isOnlineAvailable: true,
 *   isFree: false,
 *   isActive: true,
 * };
 *
 * const profile = {
 *   symptoms: ['우울감'],
 *   preferredCategory: '개인상담',
 *   ageGroup: '20대',
 *   preferOnline: true,
 * };
 *
 * const result = matchProgramWithProfile(program, profile);
 * console.log(result.matchScore); // 높은 점수 (다중 매칭)
 * console.log(result.matchReasons); // ['카테고리 정확 일치', '연령대 일치', ...]
 * ```
 */
export function matchProgramWithProfile(
  program: ProgramInfo,
  profile: UserProfile,
): ProgramMatchResult {
  const reasons: string[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  // 1. 카테고리 매칭
  if (profile.preferredCategory) {
    const categoryScore = matchCategory(program.programType, profile.preferredCategory);
    if (categoryScore > 0) {
      totalScore += categoryScore * MATCHING_WEIGHTS.CATEGORY;
      totalWeight += MATCHING_WEIGHTS.CATEGORY;

      if (categoryScore === 100) {
        reasons.push('카테고리 정확 일치');
      } else if (categoryScore >= 80) {
        reasons.push('카테고리 부분 일치');
      } else {
        reasons.push('카테고리 유사');
      }
    }
  }

  // 2. 연령대 매칭
  if (profile.ageGroup) {
    const ageScore = matchAgeGroup(program.targetGroup, profile.ageGroup);
    if (ageScore > 0) {
      totalScore += ageScore * MATCHING_WEIGHTS.AGE_GROUP;
      totalWeight += MATCHING_WEIGHTS.AGE_GROUP;

      if (ageScore === 100) {
        reasons.push('연령대 정확 일치');
      } else {
        reasons.push('연령대 부분 일치');
      }
    }
  }

  // 3. 증상 키워드 매칭
  if (profile.symptoms && profile.symptoms.length > 0) {
    const symptomScore = matchSymptoms(program, profile.symptoms);
    if (symptomScore > 0) {
      totalScore += symptomScore * MATCHING_WEIGHTS.SYMPTOM;
      totalWeight += MATCHING_WEIGHTS.SYMPTOM;

      if (symptomScore === 100) {
        reasons.push('증상 완전 매칭');
      } else {
        reasons.push(`증상 부분 매칭 (${symptomScore}%)`);
      }
    }
  }

  // 4. 온라인 제공 매칭
  if (profile.preferOnline !== undefined) {
    const onlineScore = matchOnline(program.isOnlineAvailable, profile.preferOnline);
    if (onlineScore > 0) {
      totalScore += onlineScore * MATCHING_WEIGHTS.ONLINE;
      totalWeight += MATCHING_WEIGHTS.ONLINE;

      if (onlineScore === 100) {
        reasons.push(profile.preferOnline ? '온라인 제공' : '대면 제공');
      }
    }
  }

  // 5. 무료 프로그램 매칭
  if (profile.preferFree !== undefined) {
    const freeScore = matchFree(program.isFree, profile.preferFree);
    if (freeScore > 0) {
      totalScore += freeScore * MATCHING_WEIGHTS.FREE;
      totalWeight += MATCHING_WEIGHTS.FREE;

      if (freeScore === 100 && profile.preferFree) {
        reasons.push('무료 제공');
      }
    }
  }

  // 가중 평균 계산
  const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

  // 매칭 이유가 없으면 기본 메시지
  if (reasons.length === 0) {
    reasons.push('매칭 정보 부족');
  }

  return {
    programId: program.id,
    programName: program.programName,
    matchScore: finalScore,
    matchReasons: reasons,
  };
}

/**
 * 센터의 프로그램 점수 계산
 *
 * **프로필이 있는 경우**: 모든 활성 프로그램과 프로필 매칭 후 평균 점수
 * **프로필이 없는 경우**: 프로그램 다양성 기준으로 점수 부여
 *
 * @param programs - 센터의 프로그램 목록
 * @param profile - 사용자 프로필 (선택적)
 * @returns 프로그램 점수 결과
 *
 * @example
 * ```typescript
 * // 프로필 있는 경우
 * const programs = [program1, program2, program3];
 * const profile = { symptoms: ['우울감'], preferredCategory: '개인상담' };
 * const result = calculateProgramScore(programs, profile);
 * console.log(result.score); // 매칭 점수 평균
 *
 * // 프로필 없는 경우
 * const result = calculateProgramScore(programs);
 * console.log(result.score); // 프로그램 개수에 따라 80/60/40/0
 * ```
 */
export function calculateProgramScore(
  programs: ProgramInfo[],
  profile?: UserProfile,
): ProgramScoreResult {
  try {
    // 1. 활성 프로그램 필터링
    const activePrograms = getActivePrograms(programs);
    const activeProgramCount = activePrograms.length;

    // 2. 프로그램이 없는 경우
    if (activeProgramCount === 0) {
      return {
        score: 0,
        totalProgramCount: programs?.length || 0,
        activeProgramCount: 0,
        reason: '제공 프로그램 없음',
      };
    }

    // 3-A. 프로필이 있는 경우: 매칭 점수 계산
    if (profile && Object.keys(profile).length > 0) {
      const matchResults = activePrograms.map((program) =>
        matchProgramWithProfile(program, profile),
      );

      // 평균 매칭 점수 계산
      const totalMatchScore = matchResults.reduce(
        (sum, result) => sum + result.matchScore,
        0,
      );
      const averageScore = Math.round(totalMatchScore / matchResults.length);

      // 상위 3개 매칭 프로그램만 반환
      const topMatches = matchResults
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);

      return {
        score: averageScore,
        totalProgramCount: programs.length,
        activeProgramCount,
        matchedPrograms: topMatches,
        reason: `프로필 매칭 (상위 ${topMatches.length}개 프로그램)`,
      };
    }

    // 3-B. 프로필이 없는 경우: 프로그램 다양성 기준
    let diversityScore = 0;
    let reason = '';

    if (activeProgramCount >= 5) {
      diversityScore = 80;
      reason = '다양한 프로그램 제공 (5개 이상)';
    } else if (activeProgramCount >= 3) {
      diversityScore = 60;
      reason = '적절한 프로그램 제공 (3-4개)';
    } else if (activeProgramCount >= 1) {
      diversityScore = 40;
      reason = '제한적 프로그램 제공 (1-2개)';
    }

    return {
      score: diversityScore,
      totalProgramCount: programs.length,
      activeProgramCount,
      reason,
    };
  } catch {
    // 에러 발생 시 기본값 반환
    return {
      score: 0,
      totalProgramCount: programs?.length || 0,
      activeProgramCount: 0,
      reason: '프로그램 정보를 확인할 수 없습니다',
    };
  }
}

/**
 * 다수의 센터에 대한 프로그램 점수 일괄 계산
 *
 * @param centersWithPrograms - 센터별 프로그램 정보 맵 { centerId: programs[] }
 * @param profile - 사용자 프로필 (선택적)
 * @returns 센터별 프로그램 점수 맵 { centerId: ProgramScoreResult }
 */
export function calculateBatchProgramScores(
  centersWithPrograms: Map<bigint, ProgramInfo[]>,
  profile?: UserProfile,
): Map<bigint, ProgramScoreResult> {
  const results = new Map<bigint, ProgramScoreResult>();

  // Map iteration을 Array.from()으로 처리 (TypeScript compatibility)
  const entries = Array.from(centersWithPrograms.entries());
  for (const [centerId, programs] of entries) {
    const score = calculateProgramScore(programs, profile);
    results.set(centerId, score);
  }

  return results;
}
