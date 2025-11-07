/**
 * Custom Error Classes
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.9: 에러 클래스 작성
 *
 * Provides structured error handling for the API with HTTP status codes.
 * All errors inherit from AppError and are marked as operational.
 */

/**
 * Base application error class
 * 기본 애플리케이션 에러 클래스
 */
export class AppError extends Error {
  statusCode: number;
  code: string;
  details: unknown;
  isOperational: boolean;

  constructor(
    message: string = 'Application Error',
    statusCode: number = 500,
    code: string = 'APP_ERROR',
    details: unknown = null,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): { success: false; error: { code: string; message: string; details?: unknown } } {
    const result: { success: false; error: { code: string; message: string; details?: unknown } } = {
      success: false,
      error: {
        code: this.code,
        message: this.message,
      },
    };

    if (this.details) {
      result.error.details = this.details;
    }

    return result;
  }
}

/**
 * Validation Error (400 Bad Request)
 * 검증 에러
 */
export class ValidationError extends AppError {
  constructor(message: string = '입력 데이터가 유효하지 않습니다', details: unknown = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }

  /**
   * Create ValidationError from Zod error
   * Zod 에러에서 ValidationError 생성
   */
  static fromZodError(zodError: { errors: Array<{ path: Array<string | number>; message: string; code: string }> }): ValidationError {
    const details = zodError.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    return new ValidationError('입력 데이터가 유효하지 않습니다', details);
  }
}

/**
 * Not Found Error (404 Not Found)
 * 리소스 없음 에러
 */
export class NotFoundError extends AppError {
  resource: string;
  identifier: string | number | null;

  constructor(resource: string = 'Resource', identifier: string | number | null = null) {
    const resourceName = resource;
    const message = identifier
      ? `${resourceName}를 찾을 수 없습니다 (ID: ${identifier})`
      : `${resourceName}를 찾을 수 없습니다`;

    super(message, 404, 'NOT_FOUND', null);
    this.resource = resourceName;
    this.identifier = identifier;
  }
}

/**
 * Internal Server Error (500 Internal Server Error)
 * 내부 서버 에러
 */
export class InternalError extends AppError {
  originalError: Error | null;

  constructor(
    message: string = '서버 내부 에러가 발생했습니다',
    originalError: Error | null = null,
  ) {
    let errorMessage = message;

    // 프로덕션에서는 상세 에러 숨김
    if (process.env.NODE_ENV === 'production' && originalError) {
      errorMessage = '서버 내부 에러가 발생했습니다';
    }

    super(errorMessage, 500, 'INTERNAL_ERROR', null);
    this.originalError = originalError;
  }

  toJSON() {
    const json = super.toJSON();

    // 개발 환경에서만 원본 에러 정보 포함
    if (process.env.NODE_ENV === 'development' && this.originalError) {
      return {
        ...json,
        error: {
          ...json.error,
          originalError: {
            message: this.originalError.message,
            stack: this.originalError.stack,
          },
        },
      };
    }

    return json;
  }
}

/**
 * Unauthorized Error (401 Unauthorized)
 * 인증 에러
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = '인증이 필요합니다.') {
    super(message, 401, 'UNAUTHORIZED', null);
  }
}

/**
 * Forbidden Error (403 Forbidden)
 * 권한 에러
 */
export class ForbiddenError extends AppError {
  constructor(message: string = '권한이 없습니다.') {
    super(message, 403, 'FORBIDDEN', null);
  }
}

/**
 * Conflict Error (409 Conflict)
 * 충돌 에러
 */
export class ConflictError extends AppError {
  existingId?: number;

  constructor(message: string, existingId?: number) {
    super(message, 409, 'CONFLICT', null);
    this.existingId = existingId;
  }
}

/**
 * Database Error (500 Internal Server Error)
 * 데이터베이스 에러
 *
 * Sprint 1 - Day 2: Error Handling Enhancement
 */
export class DatabaseError extends AppError {
  prismaCode?: string;

  constructor(
    message: string = '데이터베이스 조회 중 오류가 발생했습니다',
    code: string = 'DATABASE_ERROR',
    prismaCode?: string,
  ) {
    super(message, 500, code, null);
    this.prismaCode = prismaCode;
  }

  /**
   * Create DatabaseError from Prisma error
   * Prisma 에러에서 DatabaseError 생성
   */
  static fromPrismaError(prismaError: {
    code: string;
    meta?: Record<string, unknown>;
    message: string;
  }): DatabaseError {
    let message = '데이터베이스 조회 중 오류가 발생했습니다';
    let code = 'DATABASE_ERROR';

    // Prisma 에러 코드별 처리
    switch (prismaError.code) {
      case 'P2002':
        // Unique constraint violation
        message = '이미 존재하는 데이터입니다';
        code = 'DUPLICATE_ENTRY';
        break;
      case 'P2025':
        // Record not found
        message = '요청한 데이터를 찾을 수 없습니다';
        code = 'NOT_FOUND';
        break;
      case 'P2003':
        // Foreign key constraint violation
        message = '참조 무결성 제약 조건 위반입니다';
        code = 'FOREIGN_KEY_VIOLATION';
        break;
      case 'P2010':
        // Raw query failed
        message = '데이터베이스 쿼리 실행에 실패했습니다';
        code = 'QUERY_FAILED';
        break;
      case 'P1001':
        // Connection error
        message = '데이터베이스 연결에 실패했습니다';
        code = 'CONNECTION_ERROR';
        break;
      default:
        // Keep default message
        break;
    }

    const error = new DatabaseError(message, code, prismaError.code);
    return error;
  }
}

/**
 * Cache Error (Non-fatal, logged but doesn't fail request)
 * 캐시 에러 (Redis)
 *
 * Sprint 1 - Day 2: Error Handling Enhancement
 *
 * Note: This error should be caught and logged, but NOT thrown to client.
 * The application should gracefully degrade when Redis is unavailable.
 */
export class CacheError extends AppError {
  operation: string;

  constructor(message: string = '캐시 작업 중 오류가 발생했습니다', operation: string = 'unknown') {
    super(message, 500, 'CACHE_ERROR', null);
    this.operation = operation;
  }
}

/**
 * Invalid Coordinates Error (400 Bad Request)
 * 잘못된 좌표 에러
 *
 * Sprint 1 - Day 2: Map Search Error Types
 */
export class InvalidCoordinatesError extends ValidationError {
  constructor(message: string = '잘못된 좌표값입니다', details: unknown = null) {
    super(message, details);
    this.code = 'INVALID_COORDINATES';
  }
}

/**
 * Invalid Radius Error (400 Bad Request)
 * 잘못된 반경 에러
 *
 * Sprint 1 - Day 2: Map Search Error Types
 */
export class InvalidRadiusError extends ValidationError {
  constructor(message: string = '잘못된 반경값입니다 (1-50km)', details: unknown = null) {
    super(message, details);
    this.code = 'INVALID_RADIUS';
  }
}

/**
 * Check if an error is an operational error
 * 에러가 운영 에러인지 확인
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational === true;
  }
  return false;
}
