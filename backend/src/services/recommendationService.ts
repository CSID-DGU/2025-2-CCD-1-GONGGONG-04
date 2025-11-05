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
