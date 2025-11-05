/**
 * Recommendation Controller
 *
 * 센터 추천 API 컨트롤러
 * Sprint 2 - Task 4.1.1: Recommendation Controller Implementation
 *
 * @module controllers/recommendationController
 * @created 2025-01-27
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { recommendationRequestSchema } from '../validators/recommendationSchema';
import { getRecommendations } from '../services/recommendationService';
import {
  trackRecommendationRequest,
  trackRecommendationDuration,
  trackRecommendationResultCount,
  incrementActiveRecommendations,
  decrementActiveRecommendations,
} from '../utils/metrics';
import logger from '../utils/logger';

/**
 * 센터 추천 계산 및 반환
 *
 * **POST /api/v1/recommendations**
 *
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express Next Function
 *
 * @example
 * ```json
 * // Request Body
 * {
 *   "latitude": 37.5665,
 *   "longitude": 126.9780,
 *   "userProfile": {
 *     "symptoms": ["우울감", "불안"],
 *     "preferredCategory": "개인상담",
 *     "ageGroup": "20대",
 *     "preferOnline": false,
 *     "preferFree": true
 *   },
 *   "maxDistance": 10,
 *   "limit": 5
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "recommendations": [
 *       {
 *         "centerId": "1",
 *         "centerName": "서울 정신건강센터",
 *         "totalScore": 87.45,
 *         "scores": {
 *           "distance": 95,
 *           "operating": 100,
 *           "specialty": 80,
 *           "program": 60
 *         },
 *         "reasons": [
 *           "현재 운영 중",
 *           "정신건강의학과 전문의 보유",
 *           "가까운 거리 (500m)"
 *         ],
 *         "center": {
 *           "roadAddress": "서울시 강남구 테헤란로 123",
 *           "phoneNumber": "02-1234-5678",
 *           "distance": 500,
 *           "walkTime": "7분"
 *         }
 *       }
 *     ],
 *     "totalCount": 1,
 *     "searchCriteria": {
 *       "latitude": 37.5665,
 *       "longitude": 126.9780,
 *       "maxDistance": 10,
 *       "limit": 5
 *     }
 *   }
 * }
 * ```
 */
export const calculateRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Metrics: Start tracking
  const startTime = Date.now();
  incrementActiveRecommendations();

  try {
    // 1. 입력 검증 (Zod)
    const validated = recommendationRequestSchema.parse(req.body);

    const {
      latitude,
      longitude,
      userProfile,
      maxDistance = 10,
      limit = 5,
      sessionId,
      userId,
    } = validated;

    // 2. 추천 서비스 호출
    const recommendations = await getRecommendations({
      latitude,
      longitude,
      userProfile,
      maxDistance,
      limit,
      sessionId,
      userId,
    });

    // 3. 응답 포맷팅
    const response = {
      success: true,
      data: {
        recommendations: recommendations.map((rec) => ({
          centerId: rec.centerId.toString(), // bigint → string (JSON 직렬화)
          centerName: rec.centerName,
          totalScore: rec.totalScore,
          scores: rec.scores,
          reasons: rec.reasons,
          center: rec.center,
        })),
        totalCount: recommendations.length,
        searchCriteria: {
          latitude,
          longitude,
          maxDistance,
          limit,
        },
      },
    };

    res.status(200).json(response);

    // Metrics: Track success
    const durationSeconds = (Date.now() - startTime) / 1000;
    trackRecommendationRequest('POST', 200, !!userProfile);
    trackRecommendationDuration('POST', 200, durationSeconds);
    trackRecommendationResultCount(recommendations.length);
    decrementActiveRecommendations();
  } catch (error) {
    // Metrics: Track error
    const durationSeconds = (Date.now() - startTime) / 1000;
    decrementActiveRecommendations();

    // 4. 에러 핸들링
    if (error instanceof ZodError) {
      // Validation Error → 400 Bad Request
      trackRecommendationRequest('POST', 400, false);
      trackRecommendationDuration('POST', 400, durationSeconds);

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '입력값이 올바르지 않습니다',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
      });
      return;
    }

    if (error instanceof Error) {
      // 일반 에러 → 500 Internal Server Error
      trackRecommendationRequest('POST', 500, false);
      trackRecommendationDuration('POST', 500, durationSeconds);

      logger.error('추천 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || '서버 내부 오류가 발생했습니다',
        },
      });
      return;
    }

    // 예상치 못한 에러
    trackRecommendationRequest('POST', 500, false);
    trackRecommendationDuration('POST', 500, durationSeconds);
    next(error);
  }
};

/**
 * 추천 이력 조회 (선택적 구현)
 *
 * **GET /api/v1/recommendations/history**
 *
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express Next Function
 */
export const getRecommendationHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // TODO: Sprint 3에서 구현 예정
    res.status(501).json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: '아직 구현되지 않은 기능입니다',
      },
    });
  } catch (error) {
    next(error);
  }
};
