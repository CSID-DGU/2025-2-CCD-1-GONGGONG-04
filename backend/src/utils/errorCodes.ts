/**
 * Error Codes Documentation
 *
 * Sprint 1 - Day 2: Error Handling Enhancement
 *
 * This file documents all error codes used in the application.
 * Each error code maps to a specific error type and HTTP status code.
 */

/**
 * Error Code Enumeration
 *
 * Usage:
 * - Use these codes when creating AppError instances
 * - Helps maintain consistency across the application
 * - Easy to search and reference
 */
export const ERROR_CODES = {
  // ========================================
  // Validation Errors (400)
  // ========================================
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_COORDINATES: 'INVALID_COORDINATES',
  INVALID_RADIUS: 'INVALID_RADIUS',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // ========================================
  // Authentication Errors (401)
  // ========================================
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // ========================================
  // Authorization Errors (403)
  // ========================================
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // ========================================
  // Resource Not Found Errors (404)
  // ========================================
  NOT_FOUND: 'NOT_FOUND',
  CENTER_NOT_FOUND: 'CENTER_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ASSESSMENT_NOT_FOUND: 'ASSESSMENT_NOT_FOUND',

  // ========================================
  // Conflict Errors (409)
  // ========================================
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

  // ========================================
  // Database Errors (500)
  // ========================================
  DATABASE_ERROR: 'DATABASE_ERROR',
  QUERY_FAILED: 'QUERY_FAILED',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',

  // ========================================
  // Cache Errors (500 - Non-fatal)
  // ========================================
  CACHE_ERROR: 'CACHE_ERROR',
  REDIS_CONNECTION_ERROR: 'REDIS_CONNECTION_ERROR',

  // ========================================
  // Internal Server Errors (500)
  // ========================================
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

/**
 * Error Code Type
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Error Response Interface
 *
 * Standard error response format used across the application
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode | string;
    message: string;
    details?: unknown;
  };
}

/**
 * Error Code to HTTP Status Code Mapping
 */
export const ERROR_STATUS_CODES: Record<string, number> = {
  // Validation Errors
  VALIDATION_ERROR: 400,
  INVALID_INPUT: 400,
  INVALID_COORDINATES: 400,
  INVALID_RADIUS: 400,
  MISSING_REQUIRED_FIELD: 400,

  // Authentication Errors
  UNAUTHORIZED: 401,
  INVALID_TOKEN: 401,
  TOKEN_EXPIRED: 401,

  // Authorization Errors
  FORBIDDEN: 403,
  INSUFFICIENT_PERMISSIONS: 403,

  // Not Found Errors
  NOT_FOUND: 404,
  CENTER_NOT_FOUND: 404,
  USER_NOT_FOUND: 404,
  ASSESSMENT_NOT_FOUND: 404,

  // Conflict Errors
  CONFLICT: 409,
  DUPLICATE_ENTRY: 409,

  // Server Errors
  DATABASE_ERROR: 500,
  QUERY_FAILED: 500,
  CONNECTION_ERROR: 500,
  FOREIGN_KEY_VIOLATION: 500,
  CACHE_ERROR: 500,
  REDIS_CONNECTION_ERROR: 500,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Error Code to User-Friendly Message Mapping (Korean)
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Validation Errors
  VALIDATION_ERROR: '입력 데이터가 유효하지 않습니다',
  INVALID_INPUT: '입력값이 올바르지 않습니다',
  INVALID_COORDINATES: '잘못된 좌표값입니다',
  INVALID_RADIUS: '잘못된 반경값입니다 (1-50km)',
  MISSING_REQUIRED_FIELD: '필수 입력 항목이 누락되었습니다',

  // Authentication Errors
  UNAUTHORIZED: '인증이 필요합니다',
  INVALID_TOKEN: '유효하지 않은 토큰입니다',
  TOKEN_EXPIRED: '토큰이 만료되었습니다',

  // Authorization Errors
  FORBIDDEN: '권한이 없습니다',
  INSUFFICIENT_PERMISSIONS: '충분한 권한이 없습니다',

  // Not Found Errors
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다',
  CENTER_NOT_FOUND: '요청한 센터를 찾을 수 없습니다',
  USER_NOT_FOUND: '요청한 사용자를 찾을 수 없습니다',
  ASSESSMENT_NOT_FOUND: '요청한 자가진단을 찾을 수 없습니다',

  // Conflict Errors
  CONFLICT: '요청한 작업이 기존 데이터와 충돌합니다',
  DUPLICATE_ENTRY: '이미 존재하는 데이터입니다',

  // Server Errors
  DATABASE_ERROR: '데이터베이스 조회 중 오류가 발생했습니다',
  QUERY_FAILED: '데이터베이스 쿼리 실행에 실패했습니다',
  CONNECTION_ERROR: '데이터베이스 연결에 실패했습니다',
  FOREIGN_KEY_VIOLATION: '참조 무결성 제약 조건 위반입니다',
  CACHE_ERROR: '캐시 작업 중 오류가 발생했습니다',
  REDIS_CONNECTION_ERROR: 'Redis 연결에 실패했습니다',
  INTERNAL_ERROR: '서버 내부 에러가 발생했습니다',
  SERVICE_UNAVAILABLE: '서비스를 일시적으로 사용할 수 없습니다',
};

/**
 * Example Error Responses
 *
 * These examples show what clients will receive for different error types
 */
export const ERROR_EXAMPLES = {
  VALIDATION_ERROR: {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: '입력 데이터가 유효하지 않습니다',
      details: [
        {
          field: 'query.lat',
          message: 'Latitude must be between -90 and 90',
        },
      ],
    },
  },

  INVALID_COORDINATES: {
    success: false,
    error: {
      code: 'INVALID_COORDINATES',
      message: '잘못된 좌표값입니다',
      details: {
        lat: 37.5665,
        lng: 200.0, // Invalid longitude
      },
    },
  },

  DATABASE_ERROR: {
    success: false,
    error: {
      code: 'DATABASE_ERROR',
      message: '데이터베이스 조회 중 오류가 발생했습니다',
    },
  },

  NOT_FOUND: {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '요청한 센터를 찾을 수 없습니다',
    },
  },

  CACHE_ERROR: {
    // Note: This error is logged but NOT sent to client
    // The request continues with database query
    logged: {
      level: 'error',
      message: 'Redis connection failed',
      code: 'CACHE_ERROR',
      operation: 'get',
    },
    clientReceives: {
      success: true,
      data: {
        // Normal response data from database
      },
    },
  },
};
