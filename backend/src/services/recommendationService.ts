/**
 * Recommendation Service
 *
 * 센터 추천 비즈니스 로직
 * Sprint 2 - Task 4.1.2: Recommendation Service Logic
 *
 * @module services/recommendationService
 * @created 2025-01-27
 */

import { PrismaClient } from '@prisma/client';
import { calculateBatchTotalScores, type IntegratedScoreResult } from './scoring/scoringService';
import type { UserProfile } from '../types/userProfile';
import { calculateHaversineDistance } from './scoring/distanceScore';
import { cacheRecommendations, getCachedRecommendations } from '../utils/cache';

const prisma = new PrismaClient();

/**
 * 추천 요청 파라미터
 */
export interface RecommendationInput {
  /** 사용자 위도 */
  latitude: number;

  /** 사용자 경도 */
  longitude: number;

  /** 사용자 프로필 (선택적) */
  userProfile?: UserProfile;

  /** 최대 반경 (km, 기본값: 10km) */
  maxDistance?: number;

  /** 최대 추천 개수 (기본값: 5개) */
  limit?: number;

  /** 세션 ID (로그 저장용) */
  sessionId?: string;

  /** 사용자 ID (로그 저장용) */
  userId?: bigint;
}

/**
 * 추천 결과
 */
export interface RecommendationResult {
  /** 센터 ID */
  centerId: bigint;

  /** 센터명 */
  centerName: string;

  /** 총점 (0-100) */
  totalScore: number;

  /** 세부 점수 */
  scores: {
    distance: number;
    operating: number;
    specialty: number;
    program: number;
  };

  /** 추천 이유 (상위 3개) */
  reasons: string[];

  /** 센터 기본 정보 */
  center: {
    roadAddress: string;
    phoneNumber: string | null;
    distance: number; // 미터 단위
    walkTime: string;
  };
}

/**
 * 거리 기반 센터 필터링
 *
 * @param userLat - 사용자 위도
 * @param userLng - 사용자 경도
 * @param maxDistanceKm - 최대 거리 (km)
 * @returns 거리 내 센터 목록 (운영시간, 직원, 프로그램 포함)
 */
async function fetchNearbyCenters(
  userLat: number,
  userLng: number,
  maxDistanceKm: number = 10,
) {
  // 1. 모든 활성 센터 조회 (관계 포함)
  const centers = await prisma.center.findMany({
    where: {
      isActive: true,
      latitude: { not: null },
      longitude: { not: null },
    },
    include: {
      operatingHours: true,
      holidays: true,
      staff: true,
      programs: {
        where: {
          isActive: true, // 활성 프로그램만
        },
      },
    },
  });

  // 2. 거리 계산 및 필터링
  const maxDistanceMeters = maxDistanceKm * 1000;

  const nearbyCenters = centers
    .map((center) => {
      const distance = calculateHaversineDistance(
        userLat,
        userLng,
        Number(center.latitude),
        Number(center.longitude),
      );

      return {
        ...center,
        distance,
      };
    })
    .filter((center) => center.distance <= maxDistanceMeters)
    .sort((a, b) => a.distance - b.distance); // 거리순 정렬

  return nearbyCenters;
}

/**
 * 도보 시간 계산
 *
 * @param distanceMeters - 거리 (미터)
 * @returns 도보 시간 문자열 (예: "12분", "1시간 5분")
 */
function calculateWalkTime(distanceMeters: number): string {
  const WALKING_SPEED_METERS_PER_MINUTE = 80; // 분당 80미터
  const minutes = Math.ceil(distanceMeters / WALKING_SPEED_METERS_PER_MINUTE);

  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
}

/**
 * 추천 이유 생성
 *
 * 점수별로 상위 3개 이유 추출
 *
 * @param scoreResult - 통합 스코어링 결과
 * @returns 추천 이유 배열 (최대 3개)
 */
function generateRecommendationReasons(scoreResult: IntegratedScoreResult): string[] {
  const reasons: { score: number; text: string }[] = [];

  // 1. 거리 점수 (90점 이상)
  if (scoreResult.scores.distance >= 90) {
    reasons.push({
      score: scoreResult.scores.distance,
      text: `가까운 거리 (${scoreResult.details.distance.distanceText})`,
    });
  }

  // 2. 운영 시간 점수 (80점 이상)
  if (scoreResult.scores.operating >= 80) {
    reasons.push({
      score: scoreResult.scores.operating,
      text: scoreResult.details.operating.reason,
    });
  }

  // 3. 전문성 점수 (70점 이상)
  if (scoreResult.scores.specialty >= 70) {
    const specialty = scoreResult.details.specialty;
    if (specialty.topCertification) {
      reasons.push({
        score: scoreResult.scores.specialty,
        text: `${specialty.topCertification} 보유`,
      });
    }
  }

  // 4. 프로그램 점수 (70점 이상)
  if (scoreResult.scores.program >= 70) {
    const program = scoreResult.details.program;
    if (program.matchedPrograms && program.matchedPrograms.length > 0) {
      const topProgram = program.matchedPrograms[0];
      reasons.push({
        score: scoreResult.scores.program,
        text: `${topProgram.programName} 매칭`,
      });
    } else if (program.activeProgramCount >= 5) {
      reasons.push({
        score: scoreResult.scores.program,
        text: `다양한 프로그램 제공 (${program.activeProgramCount}개)`,
      });
    }
  }

  // 5. 점수순 정렬 후 상위 3개 선택
  return reasons
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.text);
}

/**
 * 센터 추천 계산
 *
 * @param input - 추천 요청 파라미터
 * @returns 추천 센터 목록 (점수순)
 *
 * @example
 * ```typescript
 * const recommendations = await getRecommendations({
 *   latitude: 37.5665,
 *   longitude: 126.9780,
 *   userProfile: { symptoms: ['우울감'], preferredCategory: '개인상담' },
 *   maxDistance: 10,
 *   limit: 5,
 * });
 *
 * console.log(recommendations[0].centerName); // 추천 1순위 센터
 * console.log(recommendations[0].totalScore); // 총점
 * ```
 */
export async function getRecommendations(
  input: RecommendationInput,
): Promise<RecommendationResult[]> {
  const {
    latitude,
    longitude,
    userProfile,
    maxDistance = 10,
    limit = 5,
    sessionId,
    userId,
  } = input;

  try {
    // 0. 캐시 조회 (Sprint 2 - Task 4.2.3)
    const cachedResults = await getCachedRecommendations(
      latitude,
      longitude,
      userProfile,
      maxDistance,
      limit,
    );

    if (cachedResults && cachedResults.length > 0) {
      console.log(`[Recommendation] Cache hit - returning ${cachedResults.length} recommendations`);
      return cachedResults;
    }

    console.log('[Recommendation] Cache miss - calculating recommendations');

    // 1. 거리 기반 센터 조회
    const nearbyCenters = await fetchNearbyCenters(latitude, longitude, maxDistance);

    if (nearbyCenters.length === 0) {
      return []; // 검색 반경 내 센터 없음
    }

    // 2. 통합 점수 계산 (병렬 처리)
    const centersForScoring = nearbyCenters.map((center) => ({
      id: center.id,
      centerName: center.centerName,
      latitude: Number(center.latitude),
      longitude: Number(center.longitude),
      operatingHours: center.operatingHours.map((oh) => ({
        id: oh.id,
        centerId: oh.centerId,
        dayOfWeek: oh.dayOfWeek as 1 | 2 | 3 | 4 | 5 | 6 | 7,
        openTime: oh.openTime,
        closeTime: oh.closeTime,
        isHoliday: oh.isHoliday,
        isOpen: oh.isOpen,
      })),
      holidays: center.holidays.map((h) => ({
        id: h.id,
        centerId: h.centerId,
        holidayDate: h.holidayDate,
        holidayName: h.holidayName,
        isRegular: h.isRegular,
      })),
      staff: center.staff.map((s) => ({
        id: s.id,
        centerId: s.centerId,
        staffType: s.staffType,
        staffCount: s.staffCount,
        description: s.description,
      })),
      programs: center.programs.map((p) => ({
        id: p.id,
        centerId: p.centerId,
        programName: p.programName,
        programType: p.programType,
        targetGroup: p.targetGroup,
        description: p.description,
        isOnlineAvailable: p.isOnlineAvailable,
        isFree: p.isFree,
        feeAmount: p.feeAmount ? Number(p.feeAmount) : null,
        isActive: p.isActive,
      })),
    }));

    const scoreResults = await calculateBatchTotalScores(
      centersForScoring,
      latitude,
      longitude,
      new Date(),
      userProfile,
    );

    // 3. 상위 N개 선택
    const topRecommendations = scoreResults.slice(0, limit);

    // 4. 응답 포맷팅
    const recommendations: RecommendationResult[] = topRecommendations.map((scoreResult) => {
      const center = nearbyCenters.find((c) => c.id === scoreResult.centerId)!;

      return {
        centerId: scoreResult.centerId,
        centerName: scoreResult.centerName,
        totalScore: scoreResult.totalScore,
        scores: scoreResult.scores,
        reasons: generateRecommendationReasons(scoreResult),
        center: {
          roadAddress: center.roadAddress || '주소 정보 없음',
          phoneNumber: center.phoneNumber,
          distance: Math.round(center.distance), // 미터 단위 반올림
          walkTime: calculateWalkTime(center.distance),
        },
      };
    });

    // 5. 추천 이력 저장 (비동기, 실패해도 응답에 영향 없음)
    if (sessionId || userId) {
      saveRecommendationLogs(
        topRecommendations,
        latitude,
        longitude,
        sessionId,
        userId,
      ).catch((error) => {
        console.error('추천 이력 저장 실패:', error);
      });
    }

    // 6. 추천 결과 캐싱 (Sprint 2 - Task 4.2.3)
    cacheRecommendations(
      latitude,
      longitude,
      recommendations,
      userProfile,
      maxDistance,
      limit,
    ).catch((error) => {
      console.error('추천 결과 캐싱 실패:', error);
    });

    return recommendations;
  } catch (error) {
    console.error('추천 계산 중 오류:', error);
    throw new Error('센터 추천 계산에 실패했습니다');
  }
}

/**
 * 추천 이력 저장
 *
 * @param recommendations - 추천 결과 목록
 * @param userLat - 사용자 위도
 * @param userLng - 사용자 경도
 * @param sessionId - 세션 ID
 * @param userId - 사용자 ID
 */
async function saveRecommendationLogs(
  recommendations: IntegratedScoreResult[],
  userLat: number,
  userLng: number,
  sessionId?: string,
  userId?: bigint,
): Promise<void> {
  try {
    // 추천 이력 일괄 저장
    await prisma.recommendation.createMany({
      data: recommendations.map((rec, index) => ({
        centerId: rec.centerId,
        userId: userId ?? undefined,
        sessionId: sessionId ?? undefined,
        recommendedAt: new Date(),
        userLatitude: userLat,
        userLongitude: userLng,
        totalScore: rec.totalScore,
        rankPosition: index + 1,
        recommendationType: 'RULE_BASED' as const, // Sprint 2: 규칙 기반 추천
      })),
    });
  } catch (error) {
    // 로그 저장 실패는 치명적이지 않으므로 에러만 기록
    console.error('추천 이력 저장 실패:', error);
  }
}

// ============================================
// Sprint 3 - Task 3.4.1: Assessment-based Recommendations
// ============================================

/**
 * Severity 코드 타입
 */
export type SeverityCode = 'LOW' | 'MID' | 'HIGH';

/**
 * 스코어링 가중치 타입
 */
export interface ScoringWeights {
  /** 거리 가중치 */
  distance: number;
  /** 운영 시간 가중치 */
  operating: number;
  /** 전문성 가중치 */
  specialty: number;
  /** 프로그램 매칭 가중치 */
  program: number;
}

/**
 * Severity에 따른 가중치 조정
 *
 * Sprint 3 - Task 3.4.1
 *
 * @param severityCode - 진단 심각도 ('LOW' | 'MID' | 'HIGH')
 * @returns 조정된 스코어링 가중치
 *
 * @example
 * ```typescript
 * const weights = getWeightsBySeverity('HIGH');
 * // { distance: 0.30, operating: 0.25, specialty: 0.20, program: 0.30 }
 * ```
 *
 * **가중치 조정 로직**:
 * - **진단 없음** (기본): distance 35%, program 20%
 * - **진단 있음** (LOW/MID/HIGH): distance 30%, program 30%
 * - Program 가중치 증가로 매칭 프로그램 중요도 상승
 */
export function getWeightsBySeverity(severityCode?: SeverityCode | null): ScoringWeights {
  // 진단이 없으면 기본 가중치 사용
  if (!severityCode) {
    return {
      distance: 0.35,
      operating: 0.25,
      specialty: 0.20,
      program: 0.20,
    };
  }

  // 진단이 있으면 distance를 줄이고 program을 늘림
  return {
    distance: 0.30,
    operating: 0.25,
    specialty: 0.20,
    program: 0.30,
  };
}

/**
 * Assessment 기반 센터 추천
 *
 * Sprint 3 - Task 3.4.1
 *
 * @param assessmentId - 진단 ID
 * @param latitude - 사용자 위도
 * @param longitude - 사용자 경도
 * @param options - 추가 옵션 (maxDistance, limit 등)
 * @returns 추천 센터 목록 (점수순, HIGH severity 시 24시간 센터 우선)
 *
 * @throws {Error} Assessment not found or DB error
 *
 * @example
 * ```typescript
 * const recommendations = await getRecommendationsByAssessment(
 *   123,
 *   37.5665,
 *   126.9780,
 *   { maxDistance: 10, limit: 5 }
 * );
 * ```
 *
 * **HIGH Severity 특별 처리**:
 * - 24시간 운영 센터를 최우선 추천
 * - 긴급 연락처 정보 포함
 */
export async function getRecommendationsByAssessment(
  assessmentId: number,
  latitude: number,
  longitude: number,
  options: {
    maxDistance?: number;
    limit?: number;
    sessionId?: string;
  } = {},
): Promise<RecommendationResult[]> {
  try {
    // 1. Assessment 조회
    const assessment = await prisma.userAssessment.findUnique({
      where: {
        id: assessmentId,
      },
      select: {
        id: true,
        userId: true,
        severityCode: true,
        totalScore: true,
        answersJson: true,
      },
    });

    if (!assessment) {
      throw new Error(`Assessment with ID ${assessmentId} not found`);
    }

    // 2. Severity에 따른 가중치 조정
    const weights = getWeightsBySeverity(assessment.severityCode as SeverityCode);

    console.log(`[Assessment Recommendation] Using weights for ${assessment.severityCode}:`, weights);

    // 3. 기본 추천 계산 (가중치는 현재 하드코딩되어 있음, 추후 수정 필요)
    const recommendations = await getRecommendations({
      latitude,
      longitude,
      maxDistance: options.maxDistance || 10,
      limit: options.limit || 5,
      sessionId: options.sessionId,
      userId: assessment.userId,
      // TODO: 가중치를 scoringService에 전달할 수 있도록 수정 필요
    });

    // 4. HIGH Severity 특별 처리: 24시간 센터 우선 정렬
    if (assessment.severityCode === 'HIGH') {
      return prioritize24HourCenters(recommendations);
    }

    return recommendations;
  } catch (error) {
    console.error('[Assessment Recommendation] Error:', error);
    throw new Error(`Failed to get recommendations for assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 24시간 운영 센터를 최우선으로 정렬
 *
 * HIGH severity 진단 결과에 대해 24시간 운영 센터를 최상위로 배치
 *
 * @param recommendations - 기존 추천 목록
 * @returns 24시간 센터가 우선 정렬된 추천 목록
 */
function prioritize24HourCenters(
  recommendations: RecommendationResult[],
): RecommendationResult[] {
  // 24시간 운영 센터 여부 판단 로직
  // '24시간' 키워드가 reasons에 포함되어 있으면 24시간 센터로 간주
  const is24HourCenter = (rec: RecommendationResult): boolean => {
    return rec.reasons.some((reason) => reason.includes('24시간'));
  };

  // 24시간 센터와 일반 센터 분리
  const twentyFourHourCenters = recommendations.filter(is24HourCenter);
  const regularCenters = recommendations.filter((rec) => !is24HourCenter(rec));

  // 24시간 센터를 앞에, 나머지는 뒤에 배치 (각각의 점수 순서는 유지)
  return [...twentyFourHourCenters, ...regularCenters];
}
