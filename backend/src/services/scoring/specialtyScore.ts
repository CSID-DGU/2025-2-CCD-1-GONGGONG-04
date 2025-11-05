/**
 * Specialty Score Calculation Service
 *
 * 전문성 기반 점수 계산 서비스
 * Sprint 2 - Task 3.3.1: Specialty Scoring Module
 *
 * @module services/scoring/specialtyScore
 * @created 2025-01-27
 */

/**
 * 자격증 점수 매핑
 *
 * 정신건강 관련 자격증에 대한 점수 체계
 * 높은 점수 = 전문성이 높음
 */
export const CERTIFICATION_SCORES: Record<string, number> = {
  // 의료 전문가 (최고 등급)
  '정신건강의학과 전문의': 100,
  '정신건강의학과전문의': 100,
  '정신과 전문의': 100,
  '정신과전문의': 100,

  // 정신건강전문요원
  '정신건강전문요원 1급': 80,
  '정신건강전문요원1급': 80,
  '정신건강전문요원 2급': 70,
  '정신건강전문요원2급': 70,
  '정신건강전문요원': 65, // 급수 미명시

  // 임상심리사
  '임상심리사 1급': 60,
  '임상심리사1급': 60,
  '임상심리사 2급': 50,
  '임상심리사2급': 50,
  '임상심리사': 50, // 급수 미명시

  // 상담심리사
  '상담심리사 1급': 50,
  '상담심리사1급': 50,
  '상담심리사 2급': 40,
  '상담심리사2급': 40,
  '상담심리사': 40, // 급수 미명시

  // 기타 관련 자격증
  '정신보건간호사': 55,
  '정신건강간호사': 55,
  '사회복지사 1급': 40,
  '사회복지사1급': 40,
  '사회복지사 2급': 35,
  '사회복지사2급': 35,
  '임상심리전문가': 60,
  '청소년상담사': 35,
  '전문상담사': 35,
};

/**
 * 직원 정보 인터페이스
 */
export interface StaffInfo {
  /** 직원 ID */
  id?: bigint;

  /** 센터 ID */
  centerId?: bigint;

  /** 직원 유형/자격증 */
  staffType: string;

  /** 직원 수 */
  staffCount?: number;

  /** 설명 */
  description?: string | null;
}

/**
 * 전문성 점수 결과 인터페이스
 */
export interface SpecialtyScoreResult {
  /** 전문성 점수 (0-100) */
  score: number;

  /** 최고 자격증 */
  topCertification?: string;

  /** 최고 자격증 점수 */
  topCertificationScore?: number;

  /** 전체 직원 수 */
  totalStaffCount: number;

  /** 자격증 보유 직원 수 */
  certifiedStaffCount: number;

  /** 점수 산출 이유 */
  reason: string;
}

/**
 * 자격증 문자열에서 점수 조회
 *
 * @param certification - 자격증 문자열
 * @returns 자격증 점수 (0-100), 매칭되지 않으면 20점
 *
 * @example
 * ```typescript
 * getCertificationScore('정신건강의학과 전문의'); // 100
 * getCertificationScore('임상심리사 1급'); // 60
 * getCertificationScore('알 수 없는 자격증'); // 20
 * ```
 */
export function getCertificationScore(certification: string): number {
  if (!certification || typeof certification !== 'string') {
    return 20; // 기본값
  }

  // 정확히 매칭되는 자격증 찾기
  const normalizedCert = certification.trim();
  const exactScore = CERTIFICATION_SCORES[normalizedCert];

  if (exactScore !== undefined) {
    return exactScore;
  }

  // 부분 매칭 (키워드 검색)
  // 우선순위: 의료 전문가 > 전문요원 > 임상심리사 > 상담심리사
  const keywords = [
    { keyword: '정신건강의학과', score: 100 },
    { keyword: '정신과전문의', score: 100 },
    { keyword: '정신건강전문요원', score: 75 }, // 평균값
    { keyword: '임상심리사', score: 55 }, // 평균값
    { keyword: '임상심리전문가', score: 60 },
    { keyword: '상담심리사', score: 45 }, // 평균값
    { keyword: '정신보건간호사', score: 55 },
    { keyword: '정신건강간호사', score: 55 },
    { keyword: '사회복지사', score: 37 }, // 평균값
    { keyword: '청소년상담사', score: 35 },
    { keyword: '전문상담사', score: 35 },
  ];

  for (const { keyword, score } of keywords) {
    if (normalizedCert.includes(keyword)) {
      return score;
    }
  }

  // 매칭되지 않는 경우 기본값
  return 20;
}

/**
 * 직원 배열에서 최고 자격증 찾기
 *
 * @param staff - 직원 정보 배열
 * @returns 최고 자격증 정보 (자격증명, 점수) 또는 null
 */
export function findTopCertification(
  staff: StaffInfo[],
): { certification: string; score: number } | null {
  if (!staff || staff.length === 0) {
    return null;
  }

  let topCertification = '';
  let topScore = 0;

  for (const staffMember of staff) {
    const score = getCertificationScore(staffMember.staffType);
    if (score > topScore) {
      topScore = score;
      topCertification = staffMember.staffType;
    }
  }

  if (topScore === 0) {
    return null;
  }

  return { certification: topCertification, score: topScore };
}

/**
 * 전체 직원 수 계산
 *
 * @param staff - 직원 정보 배열
 * @returns 전체 직원 수
 */
export function getTotalStaffCount(staff: StaffInfo[]): number {
  if (!staff || staff.length === 0) {
    return 0;
  }

  return staff.reduce((total, staffMember) => {
    const count = staffMember.staffCount || 0;
    return total + count;
  }, 0);
}

/**
 * 자격증 보유 직원 수 계산
 *
 * @param staff - 직원 정보 배열
 * @returns 자격증 보유 직원 수 (점수 20점 초과 자격증만 카운트)
 */
export function getCertifiedStaffCount(staff: StaffInfo[]): number {
  if (!staff || staff.length === 0) {
    return 0;
  }

  return staff.reduce((total, staffMember) => {
    const score = getCertificationScore(staffMember.staffType);
    // 기본값(20점)보다 높은 자격증만 카운트
    if (score > 20) {
      const count = staffMember.staffCount || 0;
      return total + count;
    }
    return total;
  }, 0);
}

/**
 * 전문성 점수 계산
 *
 * 직원 배열에서 최고 자격증 점수를 센터의 전문성 점수로 사용
 *
 * @param staff - 센터의 직원 정보 배열
 * @returns 전문성 점수 결과 (0-100점)
 *
 * @example
 * ```typescript
 * const staff = [
 *   { staffType: '정신건강의학과 전문의', staffCount: 1 },
 *   { staffType: '임상심리사 1급', staffCount: 2 },
 *   { staffType: '상담심리사 2급', staffCount: 3 },
 * ];
 *
 * const result = calculateSpecialtyScore(staff);
 * console.log(result.score); // 100 (정신건강의학과 전문의)
 * console.log(result.topCertification); // '정신건강의학과 전문의'
 * console.log(result.totalStaffCount); // 6
 * ```
 */
export function calculateSpecialtyScore(staff: StaffInfo[]): SpecialtyScoreResult {
  try {
    // 1. 빈 배열 또는 null/undefined 처리
    if (!staff || staff.length === 0) {
      return {
        score: 0,
        totalStaffCount: 0,
        certifiedStaffCount: 0,
        reason: '직원 정보가 없습니다',
      };
    }

    // 2. 최고 자격증 찾기
    const topCert = findTopCertification(staff);

    if (!topCert) {
      return {
        score: 0,
        totalStaffCount: getTotalStaffCount(staff),
        certifiedStaffCount: 0,
        reason: '자격증 정보가 없습니다',
      };
    }

    // 3. 직원 수 계산
    const totalStaffCount = getTotalStaffCount(staff);
    const certifiedStaffCount = getCertifiedStaffCount(staff);

    // 4. 점수 및 이유 생성
    let reason = `최고 자격: ${topCert.certification}`;

    if (certifiedStaffCount > 0) {
      reason += ` (자격증 보유 직원 ${certifiedStaffCount}명)`;
    }

    return {
      score: topCert.score,
      topCertification: topCert.certification,
      topCertificationScore: topCert.score,
      totalStaffCount,
      certifiedStaffCount,
      reason,
    };
  } catch {
    // 에러 발생 시 기본값 반환
    return {
      score: 0,
      totalStaffCount: 0,
      certifiedStaffCount: 0,
      reason: '전문성 정보를 확인할 수 없습니다',
    };
  }
}

/**
 * 자격증 등급 분류
 *
 * @param score - 자격증 점수
 * @returns 자격증 등급 (S, A, B, C, D)
 */
export function getCertificationGrade(score: number): string {
  if (score >= 90) {return 'S';} // 최고 전문가 (의사)
  if (score >= 70) {return 'A';} // 고급 전문가 (전문요원 1-2급)
  if (score >= 50) {return 'B';} // 중급 전문가 (임상/상담심리사)
  if (score >= 30) {return 'C';} // 일반 전문가 (사회복지사 등)
  return 'D'; // 기본 자격
}

/**
 * 센터 전문성 등급 계산
 *
 * @param staff - 직원 정보 배열
 * @returns 센터 전문성 등급 및 설명
 */
export function getCenterSpecialtyGrade(
  staff: StaffInfo[],
): { grade: string; description: string } {
  const result = calculateSpecialtyScore(staff);

  const grade = getCertificationGrade(result.score);

  const descriptions: Record<string, string> = {
    S: '최고 수준의 전문 인력 보유 (정신건강의학과 전문의)',
    A: '고급 전문 인력 보유 (정신건강전문요원)',
    B: '중급 전문 인력 보유 (임상/상담심리사)',
    C: '일반 전문 인력 보유',
    D: '기본 인력 구성',
  };

  return {
    grade,
    description: descriptions[grade] || '인력 정보 부족',
  };
}

/**
 * 다수의 센터에 대한 전문성 점수 일괄 계산
 *
 * @param centersWithStaff - 센터별 직원 정보 맵 { centerId: staff[] }
 * @returns 센터별 전문성 점수 맵 { centerId: SpecialtyScoreResult }
 */
export function calculateBatchSpecialtyScores(
  centersWithStaff: Map<bigint, StaffInfo[]>,
): Map<bigint, SpecialtyScoreResult> {
  const results = new Map<bigint, SpecialtyScoreResult>();

  // Map iteration을 Array.from()으로 처리 (TypeScript compatibility)
  const entries = Array.from(centersWithStaff.entries());
  for (const [centerId, staff] of entries) {
    const score = calculateSpecialtyScore(staff);
    results.set(centerId, score);
  }

  return results;
}
