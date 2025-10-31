/**
 * Global Error Handler Middleware
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.10: 에러 핸들러 미들웨어 작성
 *
 * Handles all errors in the application with consistent formatting.
 * Distinguishes between operational errors (AppError) and programming errors.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, InternalError, isOperationalError } from '../utils/errors';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('../config');

/**
 * Global error handler middleware
 * Express의 전역 에러 핸들러
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. 운영 에러 (Operational Error) 처리
  if (isOperationalError(err)) {
    const appError = err as AppError;

    // 개발 환경에서는 콘솔에 로그 출력
    if (config.env === 'development') {
      console.error('[Operational Error]', {
        code: appError.code,
        message: appError.message,
        statusCode: appError.statusCode,
        details: appError.details,
        stack: appError.stack,
      });
    }

    // AppError의 toJSON() 메서드 사용
    const response = appError.toJSON();

    // InternalError의 경우 개발 환경에서만 originalError 포함
    if (appError instanceof InternalError && config.env === 'development' && appError.originalError) {
      response.error.originalError = {
        message: appError.originalError.message,
        stack: appError.originalError.stack,
      };
    }

    res.status(appError.statusCode).json(response);
    return;
  }

  // 2. 프로그래밍 에러 (Programming Error) 처리
  // 예상하지 못한 에러 (버그, 타입 에러, 참조 에러 등)
  console.error('[Programming Error - Unexpected]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
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
