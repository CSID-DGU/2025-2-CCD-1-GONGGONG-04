/**
 * Sentry Error Tracking Configuration
 *
 * Sprint 2 - Task 4.4.3
 * Sentry SDK 초기화 및 에러 추적 설정
 */

import { Request } from 'express';
import logger from '../utils/logger';

// Sentry imports - optional (will be loaded dynamically if available)
let Sentry: any = null;
let nodeProfilingIntegration: any = null;

try {
  Sentry = require('@sentry/node');
  nodeProfilingIntegration = require('@sentry/profiling-node').nodeProfilingIntegration;
} catch (error) {
  logger.warn('[Sentry] @sentry/node not installed - error tracking disabled');
}

/**
 * Sentry 환경 설정
 */
interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  enabled: boolean;
}

/**
 * Sentry 설정 가져오기
 *
 * @returns Sentry 설정 객체
 */
function getSentryConfig(): SentryConfig {
  return {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || 'unknown',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1.0'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '1.0'),
    enabled: process.env.SENTRY_ENABLED === 'true' && !!process.env.SENTRY_DSN,
  };
}

/**
 * Sentry 초기화
 *
 * @description
 * - DSN이 제공되고 SENTRY_ENABLED=true일 때만 초기화
 * - 성능 추적 및 프로파일링 활성화
 * - beforeSend 훅으로 민감 정보 제거
 */
export function initSentry(): void {
  if (!Sentry) {
    logger.warn('[Sentry] SDK not available - skipping initialization');
    return;
  }

  const config = getSentryConfig();

  if (!config.enabled) {
    logger.info('[Sentry] Disabled - skipping initialization');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,

    // Performance Monitoring
    tracesSampleRate: config.tracesSampleRate,

    // Profiling
    profilesSampleRate: config.profilesSampleRate,
    integrations: [
      // Profiling integration
      nodeProfilingIntegration(),
    ],

    // BeforeSend 훅: 민감 정보 제거
    beforeSend(event, _hint) {
      // 1. 요청 헤더에서 민감 정보 제거
      if (event.request?.headers) {
        const headers = event.request.headers;
        delete headers.authorization;
        delete headers.cookie;
        delete headers['x-api-key'];
      }

      // 2. 요청 바디에서 민감 정보 제거
      if (event.request?.data) {
        const data = event.request.data as Record<string, unknown>;
        if ('password' in data) {delete data.password;}
        if ('token' in data) {delete data.token;}
        if ('accessToken' in data) {delete data.accessToken;}
        if ('refreshToken' in data) {delete data.refreshToken;}
      }

      // 3. Extra 데이터에서 민감 정보 제거
      if (event.extra) {
        const extra = event.extra as Record<string, unknown>;
        if (extra.body && typeof extra.body === 'object') {
          const body = extra.body as Record<string, unknown>;
          if ('password' in body) {delete body.password;}
          if ('token' in body) {delete body.token;}
        }
      }

      // 4. 개발 환경에서는 일부 에러 무시
      if (config.environment === 'development') {
        // CORS 에러 무시
        if (event.message?.includes('CORS')) {
          return null;
        }

        // 타임아웃 에러 무시 (개발 환경에서 흔함)
        if (event.message?.includes('timeout')) {
          return null;
        }
      }

      return event;
    },

    // BeforeBreadcrumb 훅: 민감 정보가 포함된 breadcrumb 제거
    beforeBreadcrumb(breadcrumb, _hint) {
      // HTTP 요청 breadcrumb에서 민감 정보 제거
      if (breadcrumb.category === 'http') {
        if (breadcrumb.data?.headers) {
          delete breadcrumb.data.headers.authorization;
          delete breadcrumb.data.headers.cookie;
        }
      }

      return breadcrumb;
    },
  });

  logger.info(`[Sentry] Initialized (environment: ${config.environment}, release: ${config.release})`);
}

/**
 * Express 요청에서 Sentry 컨텍스트 설정
 *
 * @param req - Express Request
 *
 * @description
 * 요청 정보를 Sentry 컨텍스트에 추가하여 에러 발생 시 상세 정보 제공
 */
export function setSentryContext(req: Request): void {
  if (!Sentry || !getSentryConfig().enabled) {return;}

  Sentry.setContext('request', {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    ip: req.ip,
    user_agent: req.get('user-agent'),
  });

  // 사용자 ID가 있으면 설정 (인증된 요청)
  // Note: req.user는 JWT 인증 미들웨어에서 설정됨 (향후 구현 예정)
  const user = (req as { user?: { id: number } }).user;
  if (user && typeof user === 'object' && 'id' in user) {
    Sentry.setUser({
      id: user.id.toString(),
    });
  }
}

/**
 * 에러를 Sentry에 수동으로 캡처
 *
 * @param error - 에러 객체
 * @param context - 추가 컨텍스트 정보
 *
 * @example
 * ```typescript
 * try {
 *   // ...
 * } catch (error) {
 *   captureError(error, { operation: 'recommendation', centerId: '123' });
 * }
 * ```
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (!Sentry || !getSentryConfig().enabled) {
    logger.error('[Sentry Disabled] Error:', error);
    return;
  }

  if (context) {
    Sentry.setContext('custom', context);
  }

  Sentry.captureException(error);
}

/**
 * 커스텀 메시지를 Sentry에 캡처
 *
 * @param message - 메시지
 * @param level - 로그 레벨 (info, warning, error)
 *
 * @example
 * ```typescript
 * captureMessage('Recommendation cache miss rate is high', 'warning');
 * ```
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
): void {
  if (!Sentry || !getSentryConfig().enabled) {
    logger.log(level, `[Sentry Disabled] ${level.toUpperCase()}: ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Sentry 트랜잭션 시작 (성능 추적)
 *
 * @param name - 트랜잭션 이름
 * @param op - 오퍼레이션 타입
 * @returns Sentry 트랜잭션 객체
 *
 * @example
 * ```typescript
 * const transaction = startTransaction('GET /api/v1/recommendations', 'http.server');
 * try {
 *   // ...
 * } finally {
 *   transaction?.finish();
 * }
 * ```
 */
export function startTransaction(_name: string, _op: string) {
  if (!getSentryConfig().enabled) {return null;}

  // Sentry v8에서는 startTransaction이 제거되었으므로 null 반환
  // 성능 추적은 Sentry의 자동 계측(requestHandler, tracingHandler)으로 처리됨
  logger.warn('[Sentry] startTransaction is deprecated in Sentry v8. Use automatic instrumentation instead.');
  return null;
}

// Export Sentry for advanced usage
export { Sentry };
