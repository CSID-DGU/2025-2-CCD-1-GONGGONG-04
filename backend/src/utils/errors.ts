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
      json.error.originalError = {
        message: this.originalError.message,
        stack: this.originalError.stack,
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
 * Check if an error is an operational error
 * 에러가 운영 에러인지 확인
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational === true;
  }
  return false;
}
