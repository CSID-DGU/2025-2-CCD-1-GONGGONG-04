/**
 * Rate Limiter Utility
 *
 * Phase 2 Sprint 5: LLM API 호출 Rate Limiting
 * Bottleneck 라이브러리를 사용한 속도 제한
 */

const Bottleneck = require('bottleneck');
const logger = require('./logger');

/**
 * LLM API 호출 Rate Limiter
 *
 * OpenAI Free Tier 기준:
 * - 분당 100회 요청
 * - 초당 약 1.67회 (600ms 간격)
 */
const llmLimiter = new Bottleneck({
  minTime: 600,                     // 최소 600ms 간격 (분당 100회)
  maxConcurrent: 5,                 // 동시 요청 최대 5개
  reservoir: 100,                   // 초기 허용량 100개
  reservoirRefreshAmount: 100,      // 갱신 시 100개로 재설정
  reservoirRefreshInterval: 60 * 1000,  // 1분마다 갱신
  highWater: 50,                    // 대기열 최대 50개
  strategy: Bottleneck.strategy.LEAK  // LEAK 전략 (느린 누수)
});

/**
 * Vector DB 호출 Rate Limiter
 *
 * Qdrant 기준:
 * - 초당 100회 요청 (로컬 단일 노드)
 */
const vectorDBLimiter = new Bottleneck({
  minTime: 10,                      // 최소 10ms 간격 (초당 100회)
  maxConcurrent: 10,                // 동시 요청 최대 10개
  reservoir: 1000,                  // 초기 허용량 1000개
  reservoirRefreshAmount: 1000,
  reservoirRefreshInterval: 10 * 1000,  // 10초마다 갱신
  highWater: 100,
  strategy: Bottleneck.strategy.LEAK
});

/**
 * Rate Limiter 이벤트 로깅
 */
llmLimiter.on('failed', (error, jobInfo) => {
  logger.error('LLM API 호출 실패', {
    error: error.message,
    retryCount: jobInfo.retryCount
  });

  // 429 에러 시 재시도
  if (error.status === 429) {
    return 60000;  // 60초 후 재시도
  }
});

llmLimiter.on('depleted', (empty) => {
  logger.warn('LLM API Rate Limit 도달', {
    isEmpty: empty,
    reservoir: llmLimiter.reservoir
  });
});

vectorDBLimiter.on('failed', (error, jobInfo) => {
  logger.error('Vector DB 호출 실패', {
    error: error.message,
    retryCount: jobInfo.retryCount
  });
});

/**
 * Rate Limiter 상태 조회
 */
async function getLimiterStatus() {
  return {
    llm: {
      running: llmLimiter.running(),
      queued: llmLimiter.queued(),
      reservoir: llmLimiter.reservoir
    },
    vectorDB: {
      running: vectorDBLimiter.running(),
      queued: vectorDBLimiter.queued(),
      reservoir: vectorDBLimiter.reservoir
    }
  };
}

/**
 * Rate Limiter 정지
 */
async function stopLimiters() {
  await Promise.all([
    llmLimiter.stop({ dropWaitingJobs: false }),
    vectorDBLimiter.stop({ dropWaitingJobs: false })
  ]);
  logger.info('모든 Rate Limiter 정지');
}

module.exports = {
  llmLimiter,
  vectorDBLimiter,
  getLimiterStatus,
  stopLimiters
};
