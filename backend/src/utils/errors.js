/**
 * Custom Error Classes
 *
 * Phase 2 Sprint 5: 커스텀 에러 정의
 * LLM API, Vector DB, Rate Limit 등의 에러 처리
 */

/**
 * LLM API 에러
 */
class LLMAPIError extends Error {
  constructor(message, provider = 'openai', originalError = null) {
    super(message);
    this.name = 'LLMAPIError';
    this.provider = provider;  // 'openai', 'claude'
    this.originalError = originalError;
    this.statusCode = 503;
    this.retriable = true;  // 재시도 가능
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      provider: this.provider,
      statusCode: this.statusCode,
      fallbackMode: true
    };
  }
}

/**
 * Vector DB 에러
 */
class VectorDBError extends Error {
  constructor(message, operation = 'unknown', originalError = null) {
    super(message);
    this.name = 'VectorDBError';
    this.operation = operation;  // 'search', 'upsert', 'delete', 'create_collection'
    this.originalError = originalError;
    this.statusCode = 500;
    this.retriable = false;
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      operation: this.operation,
      statusCode: this.statusCode
    };
  }
}

/**
 * Rate Limit 초과 에러
 */
class RateLimitExceededError extends Error {
  constructor(message, retryAfter = 60) {
    super(message);
    this.name = 'RateLimitExceededError';
    this.retryAfter = retryAfter;  // 초 단위
    this.statusCode = 429;
    this.retriable = true;
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      retryAfter: this.retryAfter,
      statusCode: this.statusCode
    };
  }
}

/**
 * 임베딩 생성 실패 에러
 */
class EmbeddingGenerationError extends Error {
  constructor(message, text = null, originalError = null) {
    super(message);
    this.name = 'EmbeddingGenerationError';
    this.text = text ? text.substring(0, 100) + '...' : null;  // 최대 100자만 저장
    this.originalError = originalError;
    this.statusCode = 500;
    this.retriable = true;
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      text: this.text,
      statusCode: this.statusCode
    };
  }
}

/**
 * 의미론적 검색 에러
 */
class SemanticSearchError extends Error {
  constructor(message, queryEmbedding = null, originalError = null) {
    super(message);
    this.name = 'SemanticSearchError';
    this.hasQueryEmbedding = queryEmbedding !== null;
    this.originalError = originalError;
    this.statusCode = 500;
    this.retriable = false;
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      hasQueryEmbedding: this.hasQueryEmbedding,
      statusCode: this.statusCode
    };
  }
}

/**
 * 입력 검증 에러
 */
class ValidationError extends Error {
  constructor(message, field = null, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.details = details;
    this.statusCode = 400;
    this.retriable = false;
  }

  toJSON() {
    return {
      error: 'INVALID_INPUT',
      message: this.message,
      field: this.field,
      details: this.details,
      statusCode: this.statusCode
    };
  }
}

/**
 * 캐시 에러
 */
class CacheError extends Error {
  constructor(message, operation = 'unknown', originalError = null) {
    super(message);
    this.name = 'CacheError';
    this.operation = operation;  // 'get', 'set', 'delete'
    this.originalError = originalError;
    this.statusCode = 500;
    this.retriable = true;
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      operation: this.operation,
      statusCode: this.statusCode
    };
  }
}

/**
 * 추천 시스템 에러
 */
class RecommendationError extends Error {
  constructor(message, algorithm = 'unknown', originalError = null) {
    super(message);
    this.name = 'RecommendationError';
    this.algorithm = algorithm;  // 'rule_based', 'hybrid', 'semantic'
    this.originalError = originalError;
    this.statusCode = 500;
    this.retriable = false;
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      algorithm: this.algorithm,
      statusCode: this.statusCode
    };
  }
}

/**
 * 에러 타입 체크 헬퍼 함수
 */
function isRetriableError(error) {
  return error.retriable === true || error.name === 'LLMAPIError' || error.name === 'RateLimitExceededError';
}

function isLLMError(error) {
  return error.name === 'LLMAPIError' || error.name === 'EmbeddingGenerationError';
}

function isVectorDBError(error) {
  return error.name === 'VectorDBError' || error.name === 'SemanticSearchError';
}

module.exports = {
  // Error Classes
  LLMAPIError,
  VectorDBError,
  RateLimitExceededError,
  EmbeddingGenerationError,
  SemanticSearchError,
  ValidationError,
  CacheError,
  RecommendationError,

  // Helper Functions
  isRetriableError,
  isLLMError,
  isVectorDBError
};
