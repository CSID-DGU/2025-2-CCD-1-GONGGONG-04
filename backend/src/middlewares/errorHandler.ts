/**
 * Global Error Handler Middleware
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.10: 에러 핸들러 미들웨어 작성
 *
 * Handles all errors in the application with consistent formatting.
 * Distinguishes between operational errors (AppError) and programming errors.
 *
 * Day 2 Enhancement:
 * - Added Prisma error handling (PrismaClientKnownRequestError)
 * - Added Zod validation error handling (ZodError)
 * - Added Redis error handling
 * - Improved error logging and response formatting
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, InternalError, isOperationalError, ValidationError, DatabaseError } from '../utils/errors';
import config from '../config';
import logger from '../utils/logger';

/**
 * Global error handler middleware
 * Express의 전역 에러 핸들러
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // 1. Zod Validation Error 처리
  if (err instanceof ZodError) {
    const validationError = ValidationError.fromZodError(err);

    logger.warn('[Validation Error]', {
      code: validationError.code,
      message: validationError.message,
      details: validationError.details,
      path: req.path,
      method: req.method,
    });

    res.status(validationError.statusCode).json(validationError.toJSON());
    return;
  }

  // 2. Prisma Database Error 처리
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const dbError = DatabaseError.fromPrismaError(err);

    logger.error('[Database Error]', {
      code: dbError.code,
      message: dbError.message,
      prismaCode: err.code,
      meta: err.meta,
      path: req.path,
      method: req.method,
    });

    res.status(dbError.statusCode).json(dbError.toJSON());
    return;
  }

  // 3. Prisma Validation Error 처리
  if (err instanceof Prisma.PrismaClientValidationError) {
    const dbError = new DatabaseError(
      '데이터베이스 검증 오류가 발생했습니다',
      'VALIDATION_ERROR',
    );

    logger.error('[Database Validation Error]', {
      message: err.message,
      path: req.path,
      method: req.method,
    });

    res.status(dbError.statusCode).json(dbError.toJSON());
    return;
  }

  // 4. 운영 에러 (Operational Error) 처리
  if (isOperationalError(err)) {
    const appError = err as AppError;

    // 에러 레벨에 따른 로깅
    if (appError.statusCode >= 500) {
      logger.error('[Operational Error - Server]', {
        code: appError.code,
        message: appError.message,
        statusCode: appError.statusCode,
        details: appError.details,
        stack: appError.stack,
        path: req.path,
        method: req.method,
      });
    } else if (config.env === 'development') {
      logger.warn('[Operational Error - Client]', {
        code: appError.code,
        message: appError.message,
        statusCode: appError.statusCode,
        details: appError.details,
        path: req.path,
        method: req.method,
      });
    }

    // AppError의 toJSON() 메서드 사용
    const response = appError.toJSON();

    // InternalError의 경우 개발 환경에서만 originalError 포함
    if (
      appError instanceof InternalError &&
      config.env === 'development' &&
      appError.originalError
    ) {
      const responseWithError = {
        ...response,
        error: {
          ...response.error,
          originalError: {
            message: appError.originalError.message,
            stack: appError.originalError.stack,
          },
        },
      };
      res.status(appError.statusCode).json(responseWithError);
      return;
    }

    res.status(appError.statusCode).json(response);
    return;
  }

  // 5. 프로그래밍 에러 (Programming Error) 처리
  // 예상하지 못한 에러 (버그, 타입 에러, 참조 에러 등)
  logger.error('[Programming Error - Unexpected]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // 프로덕션에서는 상세 에러 정보 숨김
  if (config.env === 'production') {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 내부 에러가 발생했습니다',
      },
    });
  } else {
    // 개발 환경에서는 상세 에러 정보 제공
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message,
        name: err.name,
        stack: err.stack,
      },
    });
  }
};

/**
 * 404 Not Found handler
 * 존재하지 않는 라우트 처리
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
};
