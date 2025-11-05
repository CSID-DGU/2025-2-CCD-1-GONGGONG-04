/**
 * Integrated Scoring Service
 *
 * 통합 센터 추천 점수 계산 서비스
 * Sprint 2 - Task 3.4.3: Integrated Scoring Service
 *
 * 4개 스코어링 모듈을 통합하여 최종 추천 점수 계산:
 * - 거리 점수 (35%)
 * - 운영 시간 점수 (25%)
 * - 전문성 점수 (20%)
 * - 프로그램 매칭 점수 (20%)
 *
 * @module services/scoring/scoringService
 * @created 2025-01-27
 */

import { calculateDistanceInfo } from './distanceScore';
import { calculateOperatingScore } from './operatingScore';
import { calculateSpecialtyScore, type SpecialtyScoreResult } from './specialtyScore';
import { calculateProgramScore, type ProgramScoreResult } from './programScore';
import type { UserProfile, ProgramInfo } from '../../types/userProfile';
import type { OperatingHour, Holiday, OperatingScoreResult } from '../../types/operatingHours';
import type { DistanceInfo } from '../../types/location';
import type { StaffInfo } from './specialtyScore';

/**
 * 스코어링 가중치
 *
 * 각 평가 요소의 중요도를 나타내는 가중치
 * 총합은 항상 100%
 */
export const SCORING_WEIGHTS = {
  /** 거리 가중치 (35%) */
  DISTANCE: 0.35,

  /** 운영 시간 가중치 (25%) */
  OPERATING: 0.25,

  /** 전문성 가중치 (20%) */
  SPECIALTY: 0.20,

  /** 프로그램 매칭 가중치 (20%) */
  PROGRAM: 0.20,
} as const;

/**
 * 개별 스코어 실패 시 사용할 기본값
 */
const DEFAULT_SCORE_ON_FAILURE = 50;

/**
 * 센터 정보 인터페이스
 */
export interface CenterInfo {
  /** 센터 ID */
  id: bigint;

  /** 센터명 */
  centerName: string;

  /** 위도 */
  latitude: number;

  /** 경도 */
  longitude: number;

  /** 운영 시간 목록 */
  operatingHours?: OperatingHour[];

  /** 휴무일 목록 */
  holidays?: Holiday[];

  /** 직원 정보 목록 */
  staff?: StaffInfo[];

  /** 프로그램 목록 */
  programs?: ProgramInfo[];
}

/**
 * 통합 스코어링 결과 인터페이스
 */
export interface IntegratedScoreResult {
  /** 센터 ID */
  centerId: bigint;

  /** 센터명 */
  centerName: string;

  /** 최종 점수 (0-100, 소수점 둘째 자리) */
  totalScore: number;

  /** 세부 점수 breakdown */
  scores: {
    /** 거리 점수 (0-100) */
    distance: number;

    /** 운영 시간 점수 (0-100) */
    operating: number;

    /** 전문성 점수 (0-100) */
    specialty: number;

    /** 프로그램 매칭 점수 (0-100) */
    program: number;
  };

  /** 세부 결과 (디버깅 및 설명용) */
  details: {
    distance: DistanceInfo;
    operating: OperatingScoreResult;
    specialty: SpecialtyScoreResult;
    program: ProgramScoreResult;
  };

  /** 계산 성공 여부 */
  success: boolean;

  /** 실패한 스코어링 모듈 목록 (있을 경우) */
  failedModules?: string[];
}

/**
 * 스코어링 입력 파라미터
 */
export interface ScoringInput {
  /** 센터 정보 */
  center: CenterInfo;

  /** 사용자 위치 (위도) */
  userLatitude: number;

  /** 사용자 위치 (경도) */
  userLongitude: number;

  /** 현재 시간 (기본값: new Date()) */
  currentTime?: Date;

  /** 사용자 프로필 (프로그램 매칭용, 선택적) */
  userProfile?: UserProfile;
}

/**
 * 4개 스코어링 모듈을 병렬로 실행하여 통합 점수 계산
 *
 * @param input - 스코어링 입력 파라미터
 * @returns 통합 스코어링 결과
 *
 * @throws {Error} 모든 스코어링 모듈이 실패한 경우
 *
 * @example
 * ```typescript
 * const center = {
 *   id: BigInt(1),
 *   centerName: '서울 정신건강센터',
 *   latitude: 37.5665,
 *   longitude: 126.9780,
 *   operatingHours: [...],
 *   holidays: [...],
 *   staff: [...],
 *   programs: [...],
 * };
 *
 * const result = await calculateTotalScore({
 *   center,
 *   userLatitude: 37.5500,
 *   userLongitude: 126.9900,
 *   currentTime: new Date(),
 *   userProfile: { symptoms: ['우울감'], preferredCategory: '개인상담' },
 * });
 *
 * console.log(result.totalScore); // 82.45 (가중 평균)
 * console.log(result.scores.distance); // 90
 * console.log(result.scores.operating); // 100
 * console.log(result.scores.specialty); // 80
 * console.log(result.scores.program); // 60
 * ```
 */
export async function calculateTotalScore(
  input: ScoringInput,
): Promise<IntegratedScoreResult> {
  const { center, userLatitude, userLongitude, currentTime = new Date(), userProfile } = input;

  const failedModules: string[] = [];
  let allModulesFailed = true;

  // 1. 병렬 스코어링 실행 (Promise.all)
  const [distanceResult, operatingResult, specialtyResult, programResult] = await Promise.all([
    // 거리 점수
    Promise.resolve()
      .then(() =>
        calculateDistanceInfo(
          { latitude: userLatitude, longitude: userLongitude },
          { latitude: center.latitude, longitude: center.longitude },
        ),
      )
      .catch((_error: unknown) => {
        failedModules.push('distance');
        return null;
      }),

    // 운영 시간 점수
    Promise.resolve()
      .then(() =>
        calculateOperatingScore(
          currentTime,
          center.operatingHours || [],
          center.holidays || [],
        ),
      )
      .catch((_error: unknown) => {
        failedModules.push('operating');
        return null;
      }),

    // 전문성 점수
    Promise.resolve()
      .then(() => calculateSpecialtyScore(center.staff || []))
      .catch((_error: unknown) => {
        failedModules.push('specialty');
        return null;
      }),

    // 프로그램 매칭 점수
    Promise.resolve()
      .then(() => calculateProgramScore(center.programs || [], userProfile))
      .catch((_error: unknown) => {
        failedModules.push('program');
        return null;
      }),
  ]);

  // 2. 개별 점수 추출 (실패 시 기본값 50점)
  const distanceScore = distanceResult?.score ?? DEFAULT_SCORE_ON_FAILURE;
  const operatingScore = operatingResult?.score ?? DEFAULT_SCORE_ON_FAILURE;
  const specialtyScore = specialtyResult?.score ?? DEFAULT_SCORE_ON_FAILURE;
  const programScore = programResult?.score ?? DEFAULT_SCORE_ON_FAILURE;

  // 3. 모든 모듈 실패 체크
  if (failedModules.length === 4) {
    throw new Error(
      `전체 스코어링 실패: 모든 평가 모듈에서 오류가 발생했습니다. (센터 ID: ${center.id})`,
    );
  }

  // 적어도 하나의 모듈은 성공
  if (failedModules.length < 4) {
    allModulesFailed = false;
  }

  // 4. 가중 평균 계산
  const totalScore =
    distanceScore * SCORING_WEIGHTS.DISTANCE +
    operatingScore * SCORING_WEIGHTS.OPERATING +
    specialtyScore * SCORING_WEIGHTS.SPECIALTY +
    programScore * SCORING_WEIGHTS.PROGRAM;

  // 5. 소수점 둘째 자리 반올림
  const roundedTotalScore = Math.round(totalScore * 100) / 100;

  // 6. 결과 반환
  return {
    centerId: center.id,
    centerName: center.centerName,
    totalScore: roundedTotalScore,
    scores: {
      distance: distanceScore,
      operating: operatingScore,
      specialty: specialtyScore,
      program: programScore,
    },
    details: {
      distance: distanceResult ?? {
        score: DEFAULT_SCORE_ON_FAILURE,
        straightDistanceMeters: 0,
        adjustedDistanceMeters: 0,
        distanceText: '0m',
        walkTime: '도보 0분',
      },
      operating: operatingResult ?? {
        score: DEFAULT_SCORE_ON_FAILURE,
        status: 'NO_INFORMATION' as const,
        reason: '운영 정보 없음',
      },
      specialty: specialtyResult ?? {
        score: DEFAULT_SCORE_ON_FAILURE,
        totalStaffCount: 0,
        certifiedStaffCount: 0,
        reason: '전문성 정보 없음',
      },
      program: programResult ?? {
        score: DEFAULT_SCORE_ON_FAILURE,
        totalProgramCount: 0,
        activeProgramCount: 0,
        reason: '프로그램 정보 없음',
      },
    },
    success: !allModulesFailed,
    failedModules: failedModules.length > 0 ? failedModules : undefined,
  };
}

/**
 * 다수의 센터에 대한 통합 점수 일괄 계산
 *
 * @param centers - 센터 정보 배열
 * @param userLatitude - 사용자 위도
 * @param userLongitude - 사용자 경도
 * @param currentTime - 현재 시간 (기본값: new Date())
 * @param userProfile - 사용자 프로필 (선택적)
 * @returns 센터별 통합 점수 배열 (점수 내림차순 정렬)
 *
 * @example
 * ```typescript
 * const centers = [center1, center2, center3];
 * const results = await calculateBatchTotalScores(
 *   centers,
 *   37.5500,
 *   126.9900,
 *   new Date(),
 *   { symptoms: ['우울감'] }
 * );
 *
 * console.log(results[0].totalScore); // 가장 높은 점수
 * console.log(results[0].centerName); // 추천 1순위 센터
 * ```
 */
export async function calculateBatchTotalScores(
  centers: CenterInfo[],
  userLatitude: number,
  userLongitude: number,
  currentTime: Date = new Date(),
  userProfile?: UserProfile,
): Promise<IntegratedScoreResult[]> {
  // 병렬 실행
  const scoringPromises = centers.map((center) =>
    calculateTotalScore({
      center,
      userLatitude,
      userLongitude,
      currentTime,
      userProfile,
    }).catch((error) => {
      // 개별 센터 실패는 무시하고 계속 진행
      console.error(`센터 ${center.id} 스코어링 실패:`, error);
      return null;
    }),
  );

  const results = await Promise.all(scoringPromises);

  // null 제거 및 점수 내림차순 정렬
  return results
    .filter((result): result is IntegratedScoreResult => result !== null)
    .sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * 스코어링 가중치 검증
 *
 * 가중치 합이 100%(1.0)인지 확인
 *
 * @returns 가중치 합이 100%이면 true
 */
export function validateScoringWeights(): boolean {
  const sum =
    SCORING_WEIGHTS.DISTANCE +
    SCORING_WEIGHTS.OPERATING +
    SCORING_WEIGHTS.SPECIALTY +
    SCORING_WEIGHTS.PROGRAM;

  // 부동소수점 오차 고려 (0.0001 이내)
  return Math.abs(sum - 1.0) < 0.0001;
}

/**
 * 점수 등급 계산
 *
 * @param score - 총점 (0-100)
 * @returns 등급 (S, A, B, C, D)
 */
export function getScoreGrade(score: number): string {
  if (score >= 90) {return 'S';} // 최우수
  if (score >= 80) {return 'A';} // 우수
  if (score >= 70) {return 'B';} // 양호
  if (score >= 60) {return 'C';} // 보통
  return 'D'; // 미흡
}
