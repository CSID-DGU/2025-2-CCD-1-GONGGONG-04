/**
 * Unit tests for Error Classes
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.9: 에러 클래스 단위 테스트
 */

import {
  AppError,
  ValidationError,
  NotFoundError,
  InternalError,
  isOperationalError,
} from '../../../src/utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    test('should create AppError with default values', () => {
      const error = new AppError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('APP_ERROR');
      expect(error.details).toBeNull();
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    test('should create AppError with custom values', () => {
      const details = { field: 'email', issue: 'invalid format' };
      const error = new AppError('Custom error', 400, 'CUSTOM_CODE', details);

      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.details).toEqual(details);
    });

    test('should convert to JSON format', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR');
      const json = error.toJSON();

      expect(json).toEqual({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test error',
        },
      });
    });

    test('should include details in JSON when provided', () => {
      const details = { field: 'name', value: 'invalid' };
      const error = new AppError('Test error', 400, 'TEST_ERROR', details);
      const json = error.toJSON();

      expect(json.error.details).toEqual(details);
    });

    test('should capture stack trace', () => {
      const error = new AppError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('ValidationError', () => {
    test('should create ValidationError with default message', () => {
      const error = new ValidationError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('입력 데이터가 유효하지 않습니다');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    test('should create ValidationError with custom message', () => {
      const error = new ValidationError('Custom validation error');

      expect(error.message).toBe('Custom validation error');
      expect(error.statusCode).toBe(400);
    });

    test('should create ValidationError with details', () => {
      const details = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' },
      ];
      const error = new ValidationError('Validation failed', details);

      expect(error.details).toEqual(details);
    });

    test('should create ValidationError from Zod error', () => {
      // Mock Zod error structure
      const zodError = {
        errors: [
          {
            path: ['email'],
            message: 'Invalid email',
            code: 'invalid_string',
          },
          {
            path: ['age'],
            message: 'Expected number, received string',
            code: 'invalid_type',
          },
        ],
      };

      const error = ValidationError.fromZodError(zodError);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.details).toHaveLength(2);
      expect(error.details[0]).toEqual({
        field: 'email',
        message: 'Invalid email',
        code: 'invalid_string',
      });
      expect(error.details[1]).toEqual({
        field: 'age',
        message: 'Expected number, received string',
        code: 'invalid_type',
      });
    });

    test('should handle nested Zod paths', () => {
      const zodError = {
        errors: [
          {
            path: ['user', 'profile', 'email'],
            message: 'Invalid email',
            code: 'invalid_string',
          },
        ],
      };

      const error = ValidationError.fromZodError(zodError);

      expect(error.details[0].field).toBe('user.profile.email');
    });
  });

  describe('NotFoundError', () => {
    test('should create NotFoundError with default message', () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Resource를 찾을 수 없습니다');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    test('should create NotFoundError with resource name', () => {
      const error = new NotFoundError('Center');

      expect(error.message).toBe('Center를 찾을 수 없습니다');
      expect(error.resource).toBe('Center');
      expect(error.identifier).toBeNull();
    });

    test('should create NotFoundError with resource name and ID', () => {
      const error = new NotFoundError('Center', 123);

      expect(error.message).toBe('Center를 찾을 수 없습니다 (ID: 123)');
      expect(error.resource).toBe('Center');
      expect(error.identifier).toBe(123);
    });

    test('should create NotFoundError with string identifier', () => {
      const error = new NotFoundError('Template', 'PHQ-9');

      expect(error.message).toBe('Template를 찾을 수 없습니다 (ID: PHQ-9)');
      expect(error.identifier).toBe('PHQ-9');
    });
  });

  describe('InternalError', () => {
    test('should create InternalError with default message', () => {
      const error = new InternalError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(InternalError);
      expect(error.message).toBe('서버 내부 에러가 발생했습니다');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
    });

    test('should create InternalError with custom message', () => {
      const error = new InternalError('Database connection failed');

      expect(error.message).toBe('Database connection failed');
    });

    test('should store original error', () => {
      const originalError = new Error('Original error');
      const error = new InternalError('Wrapped error', originalError);

      expect(error.originalError).toBe(originalError);
    });

    test('should include original error in JSON (development)', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const originalError = new Error('Database error');
      const error = new InternalError('Internal error', originalError);
      const json = error.toJSON();

      expect(json.error.originalError).toBeDefined();
      expect(json.error.originalError.message).toBe('Database error');
      expect(json.error.originalError.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    test('should hide original error in JSON (production)', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const originalError = new Error('Database error');
      const error = new InternalError('Internal error', originalError);
      const json = error.toJSON();

      expect(json.error.originalError).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    test('should hide detailed message in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const originalError = new Error('Sensitive database error');
      const error = new InternalError('Database connection failed', originalError);

      expect(error.message).toBe('서버 내부 에러가 발생했습니다');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('isOperationalError', () => {
    test('should return true for AppError', () => {
      const error = new AppError('Test error');

      expect(isOperationalError(error)).toBe(true);
    });

    test('should return true for ValidationError', () => {
      const error = new ValidationError();

      expect(isOperationalError(error)).toBe(true);
    });

    test('should return true for NotFoundError', () => {
      const error = new NotFoundError('Resource');

      expect(isOperationalError(error)).toBe(true);
    });

    test('should return true for InternalError', () => {
      const error = new InternalError();

      expect(isOperationalError(error)).toBe(true);
    });

    test('should return false for standard Error', () => {
      const error = new Error('Standard error');

      expect(isOperationalError(error)).toBe(false);
    });

    test('should return false for TypeError', () => {
      const error = new TypeError('Type error');

      expect(isOperationalError(error)).toBe(false);
    });

    test('should return false for null', () => {
      expect(isOperationalError(null)).toBe(false);
    });
  });
});
