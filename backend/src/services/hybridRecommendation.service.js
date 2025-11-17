/**
 * Hybrid Recommendation Service
 *
 * Phase 2 Sprint 5: 하이브리드 추천 시스템
 * Phase 1 규칙 기반 (70%) + Phase 2 의미론적 유사도 (30%) 결합
 */

const { getRecommendations } = require('./recommendationService');
const semanticSearchService = require('./semanticSearch.service');
const { RecommendationError } = require('../utils/errors');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Redis client for caching
const Redis = require('ioredis');
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redisClient.on('error', (err) => {
  logger.error('Redis 연결 에러 (Hybrid Recommendation)', { error: err.message });
});

/**
 * 하이브리드 추천 기본 가중치
 */
const DEFAULT_WEIGHTS = {
  embedding: parseFloat(process.env.DEFAULT_EMBEDDING_WEIGHT || '0.3'),
  rule: parseFloat(process.env.DEFAULT_RULE_WEIGHT || '0.7')
};

/**
 * 하이브리드 추천 요청
 *
 * @typedef {Object} HybridRecommendationRequest
 * @property {number} latitude - 사용자 위도
 * @property {number} longitude - 사용자 경도
 * @property {number} [maxDistance=10] - 최대 거리 (km)
 * @property {string[]} [preferredDays] - 선호 요일
 * @property {string[]} [preferredTimes] - 선호 시간대
 * @property {string[]} [specialties] - 전문 분야
 * @property {string} userQuery - 사용자 쿼리 텍스트
 * @property {number} [assessmentId] - 자가진단 ID
 * @property {Object} [weights] - 가중치 조정
 * @property {number} weights.embedding - 임베딩 가중치 (0~1)
 * @property {number} weights.rule - 규칙 기반 가중치 (0~1)
 * @property {number} [limit=10] - 반환할 최대 결과 수
 * @property {string} [sessionId] - 세션 ID
 * @property {bigint} [userId] - 사용자 ID
 */

/**
 * 하이브리드 추천 계산
 *
 * @param {HybridRecommendationRequest} request - 추천 요청
 * @returns {Promise<Object>} 하이브리드 추천 결과
 */
async function getHybridRecommendations(request) {
  const startTime = Date.now();

  const {
    latitude,
    longitude,
    maxDistance = 10,
    userQuery,
    assessmentId,
    weights = DEFAULT_WEIGHTS,
    limit = 10,
    sessionId,
    userId
  } = request;

  // 가중치 검증
  const WEIGHT_EMBEDDING = weights.embedding || DEFAULT_WEIGHTS.embedding;
  const WEIGHT_RULE = weights.rule || DEFAULT_WEIGHTS.rule;

  if (Math.abs((WEIGHT_EMBEDDING + WEIGHT_RULE) - 1.0) > 0.001) {
    throw new RecommendationError(
      '가중치 합은 1.0이어야 합니다',
      'hybrid',
      new Error(`embedding: ${WEIGHT_EMBEDDING}, rule: ${WEIGHT_RULE}`)
    );
  }

  logger.info('하이브리드 추천 요청', {
    latitude,
    longitude,
    maxDistance,
    queryLength: userQuery?.length,
    weights: { embedding: WEIGHT_EMBEDDING, rule: WEIGHT_RULE },
    assessmentId
  });

  try {
    // 캐시 확인
    const cacheKey = generateCacheKey({
      latitude,
      longitude,
      maxDistance,
      userQuery,
      assessmentId,
      weights,
      limit
    });

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        logger.info('하이브리드 추천 캐시 히트', { cacheKey });
        return {
          ...cachedData,
          metadata: {
            ...cachedData.metadata,
            cacheHit: true
          }
        };
      }
    } catch (cacheError) {
      logger.warn('캐시 조회 실패, 계산 진행', { error: cacheError.message });
    }

    // 1. Phase 1 규칙 기반 추천 실행
    logger.debug('Phase 1 규칙 기반 추천 시작');

    const ruleBasedResults = await getRecommendations({
      latitude,
      longitude,
      maxDistance,
      limit: limit * 2,  // 더 많이 가져와서 의미론적 검색과 병합
      sessionId,
      userId
    });

    logger.debug('Phase 1 규칙 기반 추천 완료', {
      resultCount: ruleBasedResults.length
    });

    // 2. Phase 2 의미론적 검색 (LLM 기반)
    let semanticResults = [];
    let fallbackMode = false;
    let fallbackReason = null;

    try {
      // userQuery가 없으면 의미론적 검색 스킵
      if (!userQuery || userQuery.trim().length === 0) {
        logger.warn('userQuery가 없어 의미론적 검색 스킵');
        fallbackMode = true;
        fallbackReason = 'No user query provided';
      } else {
        logger.debug('Phase 2 의미론적 검색 시작');

        // 자가진단 응답 통합
        let queryText = userQuery;
        if (assessmentId) {
          const assessmentText = await getAssessmentText(assessmentId);
          if (assessmentText) {
            queryText = `${userQuery}\n\n${assessmentText}`;
          }
        }

        const semanticSearchResult = await semanticSearchService.semanticSearch({
          queryText,
          topK: limit * 2,
          threshold: 0.2
        });

        semanticResults = semanticSearchResult.results;

        logger.debug('Phase 2 의미론적 검색 완료', {
          resultCount: semanticResults.length,
          queryTime: semanticSearchResult.metadata.queryTime
        });
      }
    } catch (llmError) {
      logger.warn('LLM 서비스 실패, 규칙 기반만 사용 (Graceful Degradation)', {
        error: llmError.message
      });
      fallbackMode = true;
      fallbackReason = llmError.message;
    }

    // 3. 두 결과 병합 및 하이브리드 점수 계산
    let finalResults;

    if (fallbackMode) {
      // LLM 실패 시 규칙 기반만 사용
      finalResults = ruleBasedResults.slice(0, limit).map(result => ({
        ...result,
        scores: {
          ...result.scores,
          total: result.totalScore,
          ruleBasedScore: result.totalScore,
          embeddingScore: 0
        },
        matchedKeywords: [],
        algorithm: 'rule_based_fallback'
      }));
    } else {
      // 하이브리드 점수 계산
      finalResults = mergeAndScoreResults(
        ruleBasedResults,
        semanticResults,
        WEIGHT_EMBEDDING,
        WEIGHT_RULE,
        limit
      );
    }

    const queryTime = Date.now() - startTime;

    const response = {
      recommendations: finalResults,
      metadata: {
        totalCount: finalResults.length,
        queryTime,
        cacheHit: false,
        algorithm: fallbackMode ? 'rule_based_fallback' : 'hybrid_v1',
        weights: {
          embedding: WEIGHT_EMBEDDING,
          rule: WEIGHT_RULE
        },
        fallbackMode,
        fallbackReason
      }
    };

    // 캐싱 (10분 TTL)
    try {
      await redisClient.setex(cacheKey, 600, JSON.stringify(response));
    } catch (cacheError) {
      logger.warn('캐시 저장 실패', { error: cacheError.message });
    }

    logger.info('하이브리드 추천 완료', {
      resultCount: finalResults.length,
      queryTime: `${queryTime}ms`,
      fallbackMode,
      algorithm: response.metadata.algorithm
    });

    return response;
  } catch (error) {
    logger.error('하이브리드 추천 실패', {
      error: error.message,
      latitude,
      longitude
    });

    throw new RecommendationError('하이브리드 추천 계산 실패', 'hybrid', error);
  }
}

/**
 * 두 결과를 병합하고 하이브리드 점수 계산
 */
function mergeAndScoreResults(ruleResults, semanticResults, weightEmbedding, weightRule, limit) {
  const semanticMap = new Map();
  semanticResults.forEach(result => {
    semanticMap.set(result.centerId, result);
  });

  const merged = ruleResults.map(ruleResult => {
    const semanticMatch = semanticMap.get(Number(ruleResult.centerId));

    // 규칙 기반 점수 정규화 (0~100 → 0~1)
    const normalizedRuleScore = ruleResult.totalScore / 100;

    // 임베딩 점수 (0~1 범위)
    const embeddingScore = semanticMatch ? semanticMatch.similarityScore : 0;

    // 하이브리드 점수 계산
    const hybridScore = (
      (embeddingScore * weightEmbedding) +
      (normalizedRuleScore * weightRule)
    ) * 100;  // 0~100 범위로 재변환

    return {
      centerId: ruleResult.centerId,
      centerName: ruleResult.centerName,
      totalScore: Math.round(hybridScore),
      scores: {
        total: Math.round(hybridScore),
        ruleBasedScore: ruleResult.totalScore,
        embeddingScore: Math.round(embeddingScore * 100),
        breakdown: ruleResult.scores
      },
      reasons: [
        ...ruleResult.reasons,
        ...(semanticMatch && embeddingScore > 0.7
          ? [`💡 ${semanticMatch.matchedKeywords.slice(0, 2).join(', ')}에 특화`]
          : [])
      ],
      matchedKeywords: semanticMatch?.matchedKeywords || [],
      center: ruleResult.center,
      algorithm: 'hybrid_v1'
    };
  });

  // 하이브리드 점수로 재정렬
  merged.sort((a, b) => b.totalScore - a.totalScore);

  return merged.slice(0, limit);
}

/**
 * 자가진단 응답을 텍스트로 변환
 */
async function getAssessmentText(assessmentId) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const assessment = await prisma.userAssessment.findUnique({
      where: { id: assessmentId },
      select: {
        totalScore: true,
        severityCode: true,
        answersJson: true
      }
    });

    if (!assessment) {
      return null;
    }

    const severityText = {
      'LOW': '낮은 수준',
      'MID': '중간 수준',
      'HIGH': '높은 수준'
    }[assessment.severityCode] || '알 수 없음';

    return `
자가진단 결과:
- 총점: ${assessment.totalScore}점
- 심각도: ${severityText}

응답 내용:
${assessment.answersJson || '응답 정보 없음'}
    `.trim();
  } catch (error) {
    logger.error('자가진단 정보 조회 실패', { error: error.message, assessmentId });
    return null;
  }
}

/**
 * 캐시 키 생성
 */
function generateCacheKey(params) {
  const keyString = JSON.stringify({
    lat: params.latitude.toFixed(4),
    lng: params.longitude.toFixed(4),
    dist: params.maxDistance,
    query: params.userQuery,
    assessment: params.assessmentId,
    weights: params.weights,
    limit: params.limit
  });

  const hash = crypto.createHash('sha256').update(keyString).digest('hex').substring(0, 16);
  return `recommendation:hybrid:${hash}`;
}

/**
 * 하이브리드 추천 캐시 삭제
 */
async function clearHybridRecommendationCache() {
  try {
    const keys = await redisClient.keys('recommendation:hybrid:*');
    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.info('하이브리드 추천 캐시 삭제', { count: keys.length });
    }
  } catch (error) {
    logger.error('캐시 삭제 실패', { error: error.message });
  }
}

module.exports = {
  getHybridRecommendations,
  clearHybridRecommendationCache,
  DEFAULT_WEIGHTS
};
