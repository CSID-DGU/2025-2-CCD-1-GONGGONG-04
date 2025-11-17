/**
 * Hybrid Recommendation Controller
 *
 * Phase 2 Sprint 5: 하이브리드 추천 API 핸들러
 * POST /api/v2/recommendations/hybrid
 */

const hybridRecommendationService = require('../services/hybridRecommendation.service');
const { hybridRecommendationRequestSchema } = require('../validators/hybridRecommendation.schema');
const logger = require('../utils/logger');

/**
 * 하이브리드 추천 API 핸들러
 *
 * @route POST /api/v2/recommendations/hybrid
 * @access Public
 */
async function getHybridRecommendations(req, res) {
  try {
    // 1. 입력 검증
    const validationResult = hybridRecommendationRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: '입력 검증 실패',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const request = validationResult.data;

    logger.info('하이브리드 추천 요청 수신', {
      latitude: request.latitude,
      longitude: request.longitude,
      queryLength: request.userQuery?.length,
      assessmentId: request.assessmentId,
      ip: req.ip
    });

    // 2. 하이브리드 추천 계산
    const result = await hybridRecommendationService.getHybridRecommendations({
      ...request,
      userId: req.user?.id  // 인증된 경우 사용자 ID 포함
    });

    // 3. 응답 반환
    res.status(200).json({
      success: true,
      data: {
        recommendations: result.recommendations,
        metadata: result.metadata
      }
    });
  } catch (error) {
    logger.error('하이브리드 추천 API 에러', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    // 에러 타입에 따른 응답
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: error.message,
        field: error.field
      });
    }

    if (error.name === 'RecommendationError') {
      return res.status(500).json({
        error: 'RECOMMENDATION_ERROR',
        message: error.message,
        algorithm: error.algorithm
      });
    }

    // 기본 에러 응답
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? '서버 오류가 발생했습니다'
        : error.message
    });
  }
}

/**
 * 하이브리드 추천 헬스 체크
 *
 * @route GET /api/v2/recommendations/hybrid/health
 * @access Public
 */
async function healthCheck(req, res) {
  try {
    const llmService = require('../services/llm.service');
    const vectorDBService = require('../services/vectorDB.service');

    const [llmHealth, vectorDBHealth] = await Promise.all([
      llmService.healthCheck(),
      vectorDBService.healthCheck()
    ]);

    const isHealthy = llmHealth.status !== 'unhealthy' && vectorDBHealth.status !== 'unhealthy';

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      components: {
        llm: llmHealth,
        vectorDB: vectorDBHealth
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('헬스 체크 실패', { error: error.message });

    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 추천 가중치 조회 (관리자용)
 *
 * @route GET /api/v2/recommendations/hybrid/weights
 * @access Admin
 */
function getWeights(req, res) {
  const weights = hybridRecommendationService.DEFAULT_WEIGHTS;

  res.status(200).json({
    success: true,
    data: {
      weights,
      updatedAt: new Date().toISOString()
    }
  });
}

/**
 * 캐시 삭제 (관리자용)
 *
 * @route DELETE /api/v2/recommendations/hybrid/cache
 * @access Admin
 */
async function clearCache(req, res) {
  try {
    await hybridRecommendationService.clearHybridRecommendationCache();

    logger.info('하이브리드 추천 캐시 삭제 완료', {
      requestedBy: req.user?.id || 'admin'
    });

    res.status(200).json({
      success: true,
      message: '캐시가 성공적으로 삭제되었습니다'
    });
  } catch (error) {
    logger.error('캐시 삭제 실패', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getHybridRecommendations,
  healthCheck,
  getWeights,
  clearCache
};
