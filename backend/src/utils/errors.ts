/**
 * Custom Error Classes
 *
 * Provides structured error handling for the API with HTTP status codes.
 * Used across controllers to ensure consistent error responses.
 *
 * @module utils/errors
 */

/**
 * Base API Error class
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Invalid input data
 */
export class ValidationError extends ApiError {
  details?: any;

  constructor(message: string, details?: any) {
    super(message, 400);
    this.details = details;
  }
}

/**
 * 404 Not Found - Resource does not exist
 */
export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
  }
}

/**
 * 403 Forbidden - User does not have permission
 */
export class ForbiddenError extends ApiError {
  constructor(message: string) {
    super(message, 403);
  }
}

/**
 * 409 Conflict - Resource already exists
 */
export class ConflictError extends ApiError {
  existingId?: number;

  constructor(message: string, existingId?: number) {
    super(message, 409);
    this.existingId = existingId;
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = '인증이 필요합니다.') {
    super(message, 401);
  }
}
