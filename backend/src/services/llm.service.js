/**
 * LLM Service
 *
 * Phase 2 Sprint 5: LLM API 통합
 * OpenAI text-embedding-3-large를 사용한 텍스트 임베딩 생성
 */

const { openai, config: openaiConfig } = require('../config/openai');
const { llmLimiter } = require('../utils/rateLimiter');
const {
  LLMAPIError,
  RateLimitExceededError,
  EmbeddingGenerationError,
  ValidationError
} = require('../utils/errors');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Redis client (cache.ts에서 사용)
const Redis = require('ioredis');
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redisClient.on('error', (err) => {
  logger.error('Redis 연결 에러 (LLM Service)', { error: err.message });
});

/**
 * 텍스트 해시 생성 (캐시 키용)
 */
function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex').substring(0, 16);
}

/**
 * 텍스트 임베딩 생성
 *
 * @param {Object} request - 임베딩 요청
 * @param {string|string[]} request.text - 단일 텍스트 또는 배치 처리용 배열
 * @param {string} [request.model='openai'] - 사용할 모델 ('openai' | 'claude')
 * @param {boolean} [request.cache=true] - 캐싱 사용 여부
 * @returns {Promise<Object>} 임베딩 결과
 */
async function generateEmbedding(request) {
  const { text, model = 'openai', cache = true } = request;

  // 입력 검증
  if (!text || (Array.isArray(text) && text.length === 0)) {
    throw new ValidationError('텍스트는 필수입니다', 'text');
  }

  const texts = Array.isArray(text) ? text : [text];

  // 배치 크기 검증
  if (texts.length > openaiConfig.limits.maxBatchSize) {
    throw new ValidationError(
      `배치 크기는 최대 ${openaiConfig.limits.maxBatchSize}개까지 가능합니다`,
      'text',
      { currentSize: texts.length, maxSize: openaiConfig.limits.maxBatchSize }
    );
  }

  // 텍스트 길이 검증
  for (const t of texts) {
    if (typeof t !== 'string') {
      throw new ValidationError('모든 텍스트는 문자열이어야 합니다', 'text');
    }
    if (t.length === 0) {
      throw new ValidationError('빈 문자열은 허용되지 않습니다', 'text');
    }
    if (t.length > 5000) {
      throw new ValidationError('텍스트 길이는 최대 5000자까지 가능합니다', 'text', {
        currentLength: t.length,
        maxLength: 5000
      });
    }
  }

  try {
    // 캐시 확인
    if (cache && texts.length === 1) {
      const cacheKey = `embedding:${model}:${hashText(texts[0])}`;
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          logger.debug('임베딩 캐시 히트', { cacheKey });
          return {
            embeddings: [cachedData.embedding],
            model: cachedData.model,
            tokenCount: cachedData.tokenCount,
            cacheHit: true
          };
        }
      } catch (cacheError) {
        logger.warn('캐시 조회 실패, API 호출 진행', { error: cacheError.message });
      }
    }

    // Rate Limiter를 통한 API 호출
    const result = await llmLimiter.schedule(async () => {
      return await callOpenAIEmbedding(texts, model);
    });

    // 캐싱 (단일 텍스트만)
    if (cache && texts.length === 1 && result.embeddings.length > 0) {
      const cacheKey = `embedding:${model}:${hashText(texts[0])}`;
      try {
        await redisClient.setex(
          cacheKey,
          3600,  // 1시간 TTL
          JSON.stringify({
            embedding: result.embeddings[0],
            model: result.model,
            tokenCount: result.tokenCount,
            createdAt: new Date().toISOString()
          })
        );
      } catch (cacheError) {
        logger.warn('캐시 저장 실패', { error: cacheError.message });
      }
    }

    logger.info('임베딩 생성 성공', {
      textCount: texts.length,
      model: result.model,
      tokenCount: result.tokenCount,
      cacheHit: false
    });

    return {
      ...result,
      cacheHit: false
    };

  } catch (error) {
    logger.error('임베딩 생성 실패', {
      error: error.message,
      textCount: texts.length,
      model
    });

    // 에러 타입에 따라 재분류
    if (error.name === 'RateLimitExceededError' || error.status === 429) {
      throw new RateLimitExceededError('OpenAI API 호출 한도 초과. 1분 후 재시도하세요', 60);
    }

    if (error.name === 'ValidationError') {
      throw error;
    }

    throw new EmbeddingGenerationError('임베딩 생성 중 오류 발생', texts[0], error);
  }
}

/**
 * OpenAI Embedding API 호출
 */
async function callOpenAIEmbedding(texts, modelType) {
  try {
    const modelName = modelType === 'openai'
      ? openaiConfig.models.embedding.large
      : openaiConfig.models.embedding.small;

    const response = await openai.embeddings.create({
      model: modelName,
      input: texts,
      encoding_format: 'float'
    });

    return {
      embeddings: response.data.map(d => d.embedding),
      model: response.model,
      tokenCount: response.usage.total_tokens
    };
  } catch (error) {
    // OpenAI 에러 코드 처리
    if (error.status === 429) {
      throw new RateLimitExceededError('OpenAI API Rate Limit 초과', 60);
    }

    if (error.status === 401) {
      throw new LLMAPIError('OpenAI API 키가 유효하지 않습니다', 'openai', error);
    }

    if (error.status >= 500) {
      throw new LLMAPIError('OpenAI API 서버 오류', 'openai', error);
    }

    throw new LLMAPIError(`OpenAI API 호출 실패: ${error.message}`, 'openai', error);
  }
}

/**
 * 배치 임베딩 생성 (여러 텍스트를 한 번에 처리)
 *
 * @param {string[]} texts - 텍스트 배열
 * @param {Object} options - 옵션
 * @returns {Promise<Object>} 배치 임베딩 결과
 */
async function batchGenerateEmbeddings(texts, options = {}) {
  const { batchSize = 50, model = 'openai', cache = true } = options;

  if (!Array.isArray(texts) || texts.length === 0) {
    throw new ValidationError('texts는 비어있지 않은 배열이어야 합니다', 'texts');
  }

  const results = [];
  let totalTokens = 0;

  // batchSize 단위로 분할 처리
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    logger.debug('배치 임베딩 처리 중', {
      currentBatch: Math.floor(i / batchSize) + 1,
      totalBatches: Math.ceil(texts.length / batchSize),
      batchSize: batch.length
    });

    const result = await generateEmbedding({
      text: batch,
      model,
      cache
    });

    results.push(...result.embeddings);
    totalTokens += result.tokenCount;
  }

  logger.info('배치 임베딩 완료', {
    totalTexts: texts.length,
    totalTokens,
    batches: Math.ceil(texts.length / batchSize)
  });

  return {
    embeddings: results,
    totalTexts: texts.length,
    totalTokens,
    model
  };
}

/**
 * 임베딩 캐시 삭제
 *
 * @param {string} text - 캐시 삭제할 텍스트
 * @param {string} model - 모델명
 */
async function deleteEmbeddingCache(text, model = 'openai') {
  const cacheKey = `embedding:${model}:${hashText(text)}`;
  try {
    await redisClient.del(cacheKey);
    logger.debug('임베딩 캐시 삭제', { cacheKey });
  } catch (error) {
    logger.warn('캐시 삭제 실패', { error: error.message, cacheKey });
  }
}

/**
 * 모든 임베딩 캐시 삭제
 */
async function clearAllEmbeddingCache() {
  try {
    const keys = await redisClient.keys('embedding:*');
    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.info('모든 임베딩 캐시 삭제', { count: keys.length });
    }
  } catch (error) {
    logger.error('캐시 일괄 삭제 실패', { error: error.message });
  }
}

/**
 * LLM 서비스 헬스 체크
 */
async function healthCheck() {
  try {
    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return {
        status: 'unavailable',
        reason: 'OPENAI_API_KEY가 설정되지 않았습니다'
      };
    }

    // Redis 연결 확인
    const redisStatus = redisClient.status;

    return {
      status: 'healthy',
      redis: redisStatus,
      model: openaiConfig.models.embedding.large
    };
  } catch (error) {
    logger.error('LLM 서비스 헬스 체크 실패', { error: error.message });
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

module.exports = {
  generateEmbedding,
  batchGenerateEmbeddings,
  deleteEmbeddingCache,
  clearAllEmbeddingCache,
  healthCheck
};
