/**
 * Recommendation Controller
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.6: Recommendation Controller 구현
 *
 * 기능:
 * 1. 추천 센터 계산 및 반환
 * 2. 4가지 점수 계산 및 가중치 적용
 * 3. 추천 로그 DB 저장
 */

const { recommendationRequestSchema } = require('../utils/validation');
const distanceService = require('../services/distance.service');
const operatingService = require('../services/operating.service');
const specialtyService = require('../services/specialty.service');
const programService = require('../services/program.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * 추천 센터 목록 계산 및 반환
 *
 * POST /api/v1/recommendations/calculate
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
exports.calculateRecommendations = async (req, res, next) => {
  try {
    // 1. 입력 검증 (Zod)
    const validated = recommendationRequestSchema.parse(req.body);
    const { userId, sessionId, location, filters, assessmentId } = validated;

    const maxDistance = filters?.maxDistance || 50; // 기본값: 50km

    // 2. 센터 조회 (운영시간, 프로그램, 직원 포함)
    const centers = await prisma.center.findMany({
      include: {
        operatingHours: true, // 운영시간 (relation name in schema)
        programs: true, // 프로그램 (relation name in schema)
        staff: true, // 직원 정보
      },
    });

    // 3. 거리 계산 및 필터링
    // Convert Decimal types to numbers for centers
    const centersWithNumbers = centers.map(center => ({
      ...center,
      latitude: center.latitude ? Number(center.latitude) : null,
      longitude: center.longitude ? Number(center.longitude) : null,
    }));

    const nearbyCenters = distanceService.filterCentersByDistance(
      centersWithNumbers,
      location,
      maxDistance
    );

    if (nearbyCenters.length === 0) {
      return res.json({
        success: true,
        data: {
          recommendations: [],
          totalCount: 0,
          message: '검색 조건에 맞는 센터가 없습니다',
        },
      });
    }

    // 4. 점수 계산
    const scoredCenters = nearbyCenters.map(center => {
      // 4-1. 거리 점수 (이미 계산됨)
      const distanceScore = center.distanceScore;

      // 4-2. 운영시간 점수
      const operatingScore = operatingService.calculateOperatingScore(
        center.operatingHours,
        new Date(),
        [] // Sprint 1: 공휴일 데이터 없음
      );

      // 4-3. 전문성 점수 - staff 배열에서 직원 유형 확인
      const staffTypes = center.staff.map(s => s.staffType);
      const staffInfo = {
        hasPsychiatrist: staffTypes.includes('psychiatrist'),
        hasNurse: staffTypes.includes('nurse'),
        hasSocialWorker: staffTypes.includes('social_worker'),
        hasOthers: staffTypes.some(
          type => !['psychiatrist', 'nurse', 'social_worker'].includes(type)
        ),
      };
      const specialtyScore = specialtyService.calculateSpecialtyScore(staffInfo);

      // 4-4. 프로그램 점수
      const userProfile = {
        age: null, // Sprint 1: 나이 정보 없음
        assessmentResult: assessmentId
          ? { severity: 'MID', category: 'general' } // 간단한 구현
          : null,
      };
      const programScore = programService.calculateProgramScore(center.programs, userProfile);

      // 4-5. 총점 계산 (가중치 적용)
      const totalScore =
        distanceScore * 0.35 + operatingScore * 0.25 + specialtyScore * 0.2 + programScore * 0.2;

      return {
        ...center,
        scores: {
          distance: distanceScore,
          operating: operatingScore,
          specialty: specialtyScore,
          program: programScore,
        },
        totalScore: Math.round(totalScore * 100) / 100, // 소수점 2자리
      };
    });

    // 5. 총점 내림차순 정렬 및 상위 10개 선택
    const topRecommendations = scoredCenters
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);

    // 6. 추천 로그 DB 저장
    if (topRecommendations.length > 0) {
      await prisma.recommendation.createMany({
        data: topRecommendations.map(rec => ({
          userId: userId ? BigInt(userId) : null,
          sessionId: sessionId || null,
          centerId: BigInt(rec.id), // Convert to BigInt
          recommendationType: 'RULE_BASED', // Sprint 1: Rule-based recommendation
          totalScore: rec.totalScore,
          distanceScore: rec.scores.distance,
          operatingScore: rec.scores.operating,
          specialtyScore: rec.scores.specialty,
          programMatchScore: rec.scores.program, // Use programMatchScore (schema field name)
          // Note: assessmentId not in schema, removed from Sprint 1
        })),
      });
    }

    // 7. 응답 포맷팅
    const response = {
      success: true,
      data: {
        recommendations: topRecommendations.map(rec => ({
          centerId: Number(rec.id), // Convert BigInt to Number
          centerName: rec.centerName,
          centerType: rec.centerType,
          roadAddress: rec.roadAddress,
          phoneNumber: rec.phoneNumber,
          distance: rec.distance,
          totalScore: rec.totalScore,
          scores: {
            distance: rec.scores.distance,
            operating: rec.scores.operating,
            specialty: rec.scores.specialty,
            program: rec.scores.program,
          },
          isOpen: operatingService.isCurrentlyOpen(rec.operatingHours, new Date(), []),
        })),
        totalCount: topRecommendations.length,
      },
    };

    res.json(response);
  } catch (error) {
    // Zod 검증 에러 처리
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '입력 데이터가 유효하지 않습니다',
          details: error.errors,
        },
      });
    }

    // 다른 에러는 next로 전달 (에러 핸들러 미들웨어에서 처리)
    next(error);
  }
};
