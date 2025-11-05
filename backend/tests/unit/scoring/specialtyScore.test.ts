/**
 * Specialty Score Unit Tests
 *
 * 전문성 스코어링 로직 단위 테스트
 * Sprint 2 - Task 3.3.2: Specialty Score Unit Tests
 *
 * @module tests/unit/scoring/specialtyScore.test
 * @created 2025-01-27
 */

import {
  getCertificationScore,
  findTopCertification,
  getTotalStaffCount,
  getCertifiedStaffCount,
  calculateSpecialtyScore,
  getCertificationGrade,
  getCenterSpecialtyGrade,
  calculateBatchSpecialtyScores,
  StaffInfo,
  CERTIFICATION_SCORES,
} from '../../../src/services/scoring/specialtyScore';

// ============================================
// 테스트 데이터 Factory
// ============================================

/**
 * 직원 정보 Mock 데이터 생성
 */
function createStaff(staffType: string, staffCount: number = 1): StaffInfo {
  return {
    id: BigInt(Math.floor(Math.random() * 1000)),
    centerId: BigInt(100),
    staffType,
    staffCount,
    description: null,
  };
}

// ============================================
// Test Suite 1: 자격증별 점수 테스트 (7개)
// ============================================

describe('자격증별 점수 테스트', () => {
  test('정신건강의학과 전문의 = 100점', () => {
    expect(getCertificationScore('정신건강의학과 전문의')).toBe(100);
    expect(getCertificationScore('정신건강의학과전문의')).toBe(100);
    expect(getCertificationScore('정신과 전문의')).toBe(100);
  });

  test('정신건강전문요원 1급 = 80점', () => {
    expect(getCertificationScore('정신건강전문요원 1급')).toBe(80);
    expect(getCertificationScore('정신건강전문요원1급')).toBe(80);
  });

  test('정신건강전문요원 2급 = 70점', () => {
    expect(getCertificationScore('정신건강전문요원 2급')).toBe(70);
    expect(getCertificationScore('정신건강전문요원2급')).toBe(70);
  });

  test('임상심리사 1급 = 60점', () => {
    expect(getCertificationScore('임상심리사 1급')).toBe(60);
    expect(getCertificationScore('임상심리사1급')).toBe(60);
  });

  test('임상심리사 2급 = 50점', () => {
    expect(getCertificationScore('임상심리사 2급')).toBe(50);
    expect(getCertificationScore('임상심리사2급')).toBe(50);
  });

  test('상담심리사 = 40-50점', () => {
    expect(getCertificationScore('상담심리사 1급')).toBe(50);
    expect(getCertificationScore('상담심리사 2급')).toBe(40);
    expect(getCertificationScore('상담심리사')).toBe(40);
  });

  test('자격증 없음 = 20점', () => {
    expect(getCertificationScore('')).toBe(20);
    expect(getCertificationScore('알 수 없는 자격증')).toBe(20);
    expect(getCertificationScore('일반 직원')).toBe(20);
  });
});

// ============================================
// Test Suite 2: 부분 매칭 테스트 (5개)
// ============================================

describe('자격증 부분 매칭', () => {
  test('정신건강의학과 키워드 매칭', () => {
    expect(getCertificationScore('정신건강의학과 레지던트')).toBe(100);
    expect(getCertificationScore('정신건강의학과')).toBe(100);
  });

  test('전문요원 키워드 매칭', () => {
    expect(getCertificationScore('정신건강전문요원')).toBe(65);
    expect(getCertificationScore('정신건강전문요원 수련생')).toBe(75); // 키워드 매칭 평균값
  });

  test('임상심리사 키워드 매칭', () => {
    expect(getCertificationScore('임상심리사')).toBe(50);
    expect(getCertificationScore('임상심리전문가')).toBe(60);
  });

  test('사회복지사 키워드 매칭', () => {
    expect(getCertificationScore('사회복지사 1급')).toBe(40);
    expect(getCertificationScore('사회복지사 2급')).toBe(35);
    expect(getCertificationScore('사회복지사')).toBe(37); // 키워드 매칭 평균값
  });

  test('기타 자격증 매칭', () => {
    expect(getCertificationScore('정신보건간호사')).toBe(55);
    expect(getCertificationScore('청소년상담사')).toBe(35);
    expect(getCertificationScore('전문상담사')).toBe(35);
  });
});

// ============================================
// Test Suite 3: 복합 케이스 (3개)
// ============================================

describe('복합 케이스', () => {
  test('전문의 + 전문요원 → 100점 (최대값 선택)', () => {
    const staff: StaffInfo[] = [
      createStaff('정신건강의학과 전문의', 1),
      createStaff('정신건강전문요원 1급', 2),
    ];

    const result = calculateSpecialtyScore(staff);
    expect(result.score).toBe(100);
    expect(result.topCertification).toBe('정신건강의학과 전문의');
  });

  test('여러 직원 중 최고 점수 선택', () => {
    const staff: StaffInfo[] = [
      createStaff('상담심리사 2급', 5),
      createStaff('임상심리사 1급', 2),
      createStaff('사회복지사 1급', 3),
    ];

    const result = calculateSpecialtyScore(staff);
    expect(result.score).toBe(60); // 임상심리사 1급
    expect(result.topCertification).toBe('임상심리사 1급');
    expect(result.totalStaffCount).toBe(10);
  });

  test('동일 점수 여러 개 - 먼저 나온 자격증 선택', () => {
    const staff: StaffInfo[] = [
      createStaff('임상심리사 1급', 1),
      createStaff('임상심리전문가', 1), // 동일하게 60점
    ];

    const result = calculateSpecialtyScore(staff);
    expect(result.score).toBe(60);
    // 먼저 나온 자격증 선택
    expect(['임상심리사 1급', '임상심리전문가']).toContain(result.topCertification);
  });
});

// ============================================
// Test Suite 4: 엣지 케이스 (3개)
// ============================================

describe('엣지 케이스', () => {
  test('빈 배열 = 0점', () => {
    const result = calculateSpecialtyScore([]);
    expect(result.score).toBe(0);
    expect(result.totalStaffCount).toBe(0);
    expect(result.certifiedStaffCount).toBe(0);
    expect(result.reason).toContain('직원 정보가 없습니다');
  });

  test('null/undefined = 0점', () => {
    const result1 = calculateSpecialtyScore(null as any);
    expect(result1.score).toBe(0);

    const result2 = calculateSpecialtyScore(undefined as any);
    expect(result2.score).toBe(0);
  });

  test('모든 직원 자격증 없음 = 0점', () => {
    const staff: StaffInfo[] = [
      createStaff('일반 직원', 3),
      createStaff('인턴', 2),
      createStaff('행정 직원', 1),
    ];

    const result = calculateSpecialtyScore(staff);
    expect(result.score).toBe(20); // 기본값
    expect(result.totalStaffCount).toBe(6);
    expect(result.certifiedStaffCount).toBe(0); // 기본값(20점)보다 높은 자격증 없음
  });
});

// ============================================
// Test Suite 5: 직원 수 계산 (4개)
// ============================================

describe('직원 수 계산', () => {
  test('전체 직원 수 합산', () => {
    const staff: StaffInfo[] = [
      createStaff('정신건강의학과 전문의', 1),
      createStaff('임상심리사 1급', 2),
      createStaff('상담심리사 2급', 3),
    ];

    expect(getTotalStaffCount(staff)).toBe(6);
  });

  test('자격증 보유 직원 수 (점수 20점 초과만)', () => {
    const staff: StaffInfo[] = [
      createStaff('정신건강의학과 전문의', 1),
      createStaff('임상심리사 1급', 2),
      createStaff('일반 직원', 5), // 20점 (제외)
    ];

    expect(getCertifiedStaffCount(staff)).toBe(3); // 1 + 2
  });

  test('staffCount 없는 경우 0으로 처리', () => {
    const staff: StaffInfo[] = [
      { staffType: '정신건강의학과 전문의' } as StaffInfo,
      { staffType: '임상심리사 1급', staffCount: 2 },
    ];

    expect(getTotalStaffCount(staff)).toBe(2); // 0 + 2
  });

  test('빈 배열 = 0명', () => {
    expect(getTotalStaffCount([])).toBe(0);
    expect(getCertifiedStaffCount([])).toBe(0);
  });
});

// ============================================
// Test Suite 6: 최고 자격증 찾기 (4개)
// ============================================

describe('최고 자격증 찾기', () => {
  test('단일 자격증', () => {
    const staff: StaffInfo[] = [createStaff('임상심리사 1급', 2)];
    const topCert = findTopCertification(staff);

    expect(topCert).not.toBeNull();
    expect(topCert?.certification).toBe('임상심리사 1급');
    expect(topCert?.score).toBe(60);
  });

  test('다수 자격증 중 최고값', () => {
    const staff: StaffInfo[] = [
      createStaff('상담심리사 2급', 3),
      createStaff('정신건강전문요원 1급', 1),
      createStaff('임상심리사 1급', 2),
    ];

    const topCert = findTopCertification(staff);
    expect(topCert?.certification).toBe('정신건강전문요원 1급');
    expect(topCert?.score).toBe(80);
  });

  test('자격증 없는 경우', () => {
    const staff: StaffInfo[] = [createStaff('일반 직원', 5)];
    const topCert = findTopCertification(staff);

    expect(topCert).not.toBeNull();
    expect(topCert?.score).toBe(20); // 기본값
  });

  test('빈 배열 = null', () => {
    expect(findTopCertification([])).toBeNull();
  });
});

// ============================================
// Test Suite 7: 자격증 등급 분류 (5개)
// ============================================

describe('자격증 등급 분류', () => {
  test('S등급 (90점 이상) - 최고 전문가', () => {
    expect(getCertificationGrade(100)).toBe('S');
    expect(getCertificationGrade(90)).toBe('S');
  });

  test('A등급 (70-89점) - 고급 전문가', () => {
    expect(getCertificationGrade(80)).toBe('A');
    expect(getCertificationGrade(70)).toBe('A');
  });

  test('B등급 (50-69점) - 중급 전문가', () => {
    expect(getCertificationGrade(60)).toBe('B');
    expect(getCertificationGrade(50)).toBe('B');
  });

  test('C등급 (30-49점) - 일반 전문가', () => {
    expect(getCertificationGrade(40)).toBe('C');
    expect(getCertificationGrade(30)).toBe('C');
  });

  test('D등급 (30점 미만) - 기본 자격', () => {
    expect(getCertificationGrade(20)).toBe('D');
    expect(getCertificationGrade(0)).toBe('D');
  });
});

// ============================================
// Test Suite 8: 센터 전문성 등급 (5개)
// ============================================

describe('센터 전문성 등급', () => {
  test('S등급 센터 - 전문의 보유', () => {
    const staff: StaffInfo[] = [createStaff('정신건강의학과 전문의', 1)];
    const gradeInfo = getCenterSpecialtyGrade(staff);

    expect(gradeInfo.grade).toBe('S');
    expect(gradeInfo.description).toContain('최고 수준');
  });

  test('A등급 센터 - 전문요원 보유', () => {
    const staff: StaffInfo[] = [createStaff('정신건강전문요원 1급', 2)];
    const gradeInfo = getCenterSpecialtyGrade(staff);

    expect(gradeInfo.grade).toBe('A');
    expect(gradeInfo.description).toContain('고급 전문');
  });

  test('B등급 센터 - 심리사 보유', () => {
    const staff: StaffInfo[] = [createStaff('임상심리사 1급', 3)];
    const gradeInfo = getCenterSpecialtyGrade(staff);

    expect(gradeInfo.grade).toBe('B');
    expect(gradeInfo.description).toContain('중급 전문');
  });

  test('C등급 센터 - 일반 자격증', () => {
    const staff: StaffInfo[] = [createStaff('사회복지사 1급', 2)];
    const gradeInfo = getCenterSpecialtyGrade(staff);

    expect(gradeInfo.grade).toBe('C');
    expect(gradeInfo.description).toContain('일반 전문');
  });

  test('D등급 센터 - 자격증 미보유', () => {
    const staff: StaffInfo[] = [createStaff('일반 직원', 5)];
    const gradeInfo = getCenterSpecialtyGrade(staff);

    expect(gradeInfo.grade).toBe('D');
    expect(gradeInfo.description).toContain('기본 인력');
  });
});

// ============================================
// Test Suite 9: 일괄 계산 (2개)
// ============================================

describe('다수 센터 일괄 계산', () => {
  test('여러 센터 점수 계산', () => {
    const centersWithStaff = new Map<bigint, StaffInfo[]>([
      [BigInt(1), [createStaff('정신건강의학과 전문의', 1)]],
      [BigInt(2), [createStaff('임상심리사 1급', 2)]],
      [BigInt(3), [createStaff('상담심리사 2급', 3)]],
    ]);

    const results = calculateBatchSpecialtyScores(centersWithStaff);

    expect(results.size).toBe(3);
    expect(results.get(BigInt(1))?.score).toBe(100);
    expect(results.get(BigInt(2))?.score).toBe(60);
    expect(results.get(BigInt(3))?.score).toBe(40);
  });

  test('빈 맵 처리', () => {
    const centersWithStaff = new Map<bigint, StaffInfo[]>();
    const results = calculateBatchSpecialtyScores(centersWithStaff);

    expect(results.size).toBe(0);
  });
});

// ============================================
// Test Suite 10: 실제 데이터 시나리오 (3개)
// ============================================

describe('실제 데이터 시나리오', () => {
  test('종합병원 정신건강의학과 - 다양한 전문 인력', () => {
    const staff: StaffInfo[] = [
      createStaff('정신건강의학과 전문의', 3),
      createStaff('정신건강전문요원 1급', 2),
      createStaff('임상심리사 1급', 4),
      createStaff('사회복지사 1급', 2),
    ];

    const result = calculateSpecialtyScore(staff);
    expect(result.score).toBe(100);
    expect(result.totalStaffCount).toBe(11);
    expect(result.certifiedStaffCount).toBe(11);
    expect(result.topCertification).toBe('정신건강의학과 전문의');
  });

  test('정신건강복지센터 - 중급 전문 인력', () => {
    const staff: StaffInfo[] = [
      createStaff('정신건강전문요원 2급', 3),
      createStaff('임상심리사 2급', 2),
      createStaff('사회복지사 1급', 5),
    ];

    const result = calculateSpecialtyScore(staff);
    expect(result.score).toBe(70);
    expect(result.totalStaffCount).toBe(10);
    expect(result.topCertification).toBe('정신건강전문요원 2급');
  });

  test('소규모 상담센터 - 상담심리사 중심', () => {
    const staff: StaffInfo[] = [
      createStaff('상담심리사 1급', 1),
      createStaff('상담심리사 2급', 2),
    ];

    const result = calculateSpecialtyScore(staff);
    expect(result.score).toBe(50);
    expect(result.totalStaffCount).toBe(3);
    expect(result.topCertification).toBe('상담심리사 1급');
  });
});

// ============================================
// Test Suite 11: CERTIFICATION_SCORES 검증 (1개)
// ============================================

describe('CERTIFICATION_SCORES 매핑 검증', () => {
  test('모든 정의된 자격증이 유효한 점수 반환', () => {
    const certifications = Object.keys(CERTIFICATION_SCORES);

    for (const cert of certifications) {
      const score = getCertificationScore(cert);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBe(CERTIFICATION_SCORES[cert]);
    }

    expect(certifications.length).toBeGreaterThan(20); // 최소 20개 이상
  });
});

// ============================================
// Test Suite 12: 에러 처리 (2개)
// ============================================

describe('에러 처리', () => {
  test('잘못된 입력 타입', () => {
    expect(getCertificationScore(null as any)).toBe(20);
    expect(getCertificationScore(undefined as any)).toBe(20);
    expect(getCertificationScore(123 as any)).toBe(20);
  });

  test('예외 발생 시 안전한 기본값 반환', () => {
    // staffType이 없는 비정상 객체
    const invalidStaff: any = [{ id: BigInt(1) }];

    const result = calculateSpecialtyScore(invalidStaff);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
