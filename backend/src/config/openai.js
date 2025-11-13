/**
 * OpenAI API Configuration
 *
 * Phase 2 Sprint 5: LLM API 통합
 * OpenAI text-embedding-3-large 모델 사용
 */

const { OpenAI } = require('openai');
const logger = require('../utils/logger');

/**
 * OpenAI 클라이언트 초기화
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID || undefined,
  maxRetries: 3,
  timeout: 10000 // 10초
});

/**
 * OpenAI API 키 유효성 검증
 */
async function validateOpenAIKey() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      logger.warn('OPENAI_API_KEY가 설정되지 않았습니다. LLM 기능이 비활성화됩니다.');
      return false;
    }

    // API 키 유효성 테스트 (간단한 임베딩 요청)
    await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'test'
    });

    logger.info('OpenAI API 연결 성공');
    return true;
  } catch (error) {
    logger.error('OpenAI API 연결 실패', {
      error: error.message,
      code: error.code
    });
    return false;
  }
}

/**
 * OpenAI 설정 정보
 */
const config = {
  models: {
    embedding: {
      large: 'text-embedding-3-large',  // 3072 dimensions
      small: 'text-embedding-3-small'   // 1536 dimensions
    }
  },
  limits: {
    maxTokens: 8191,                    // text-embedding-3 계열 최대 토큰
    maxBatchSize: 50,                   // 배치 임베딩 최대 개수
    rateLimit: 100                      // 분당 요청 수 (무료 티어 기준)
  },
  pricing: {
    largeModelPer1KTokens: 0.00013,     // USD
    smallModelPer1KTokens: 0.00002      // USD
  }
};

module.exports = {
  openai,
  validateOpenAIKey,
  config
};
