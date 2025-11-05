/**
 * Sentry Error Tracking Configuration (Frontend)
 *
 * Sprint 2 - Task 4.4.3
 * Next.js 클라이언트 및 서버 사이드 Sentry 설정
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Sentry 환경 설정
 */
interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  enabled: boolean;
}

/**
 * Sentry 설정 가져오기
 *
 * @returns Sentry 설정 객체
 */
function getSentryConfig(): SentryConfig {
  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development',
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    replaysSessionSampleRate: parseFloat(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0.1'
    ),
    replaysOnErrorSampleRate: parseFloat(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '1.0'
    ),
    enabled:
      process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true' &&
      !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  };
}

/**
 * Sentry 클라이언트 초기화
 *
 * @description
 * - Next.js 클라이언트 사이드에서 Sentry 초기화
 * - Session Replay 활성화
 * - 민감 정보 자동 마스킹
 */
export function initSentry(): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    console.log('[Sentry] Disabled - skipping initialization');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,

    // Performance Monitoring
    tracesSampleRate: config.tracesSampleRate,

    // Session Replay
    replaysSessionSampleRate: config.replaysSessionSampleRate,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,

    // BeforeSend 훅: 민감 정보 제거
    beforeSend(event, hint) {
      // 1. URL 쿼리 파라미터에서 민감 정보 제거
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url);
          // token, password 등 파라미터 제거
          ['token', 'password', 'access_token', 'refresh_token'].forEach((param) => {
            if (url.searchParams.has(param)) {
              url.searchParams.set(param, '[FILTERED]');
            }
          });
          event.request.url = url.toString();
        } catch (e) {
          // URL 파싱 실패 시 무시
        }
      }

      // 2. 로컬스토리지/세션스토리지 데이터 제거
      if (event.contexts?.storage) {
        delete event.contexts.storage;
      }

      // 3. 개발 환경에서는 일부 에러 무시
      if (config.environment === 'development') {
        // Hydration 에러 무시 (개발 환경에서 흔함)
        if (event.message?.includes('Hydration')) {
          return null;
        }

        // 네트워크 에러 무시
        if (event.message?.includes('NetworkError')) {
          return null;
        }
      }

      return event;
    },

    // BeforeBreadcrumb 훅: 민감 정보가 포함된 breadcrumb 제거
    beforeBreadcrumb(breadcrumb, hint) {
      // Console 로그에서 민감 정보 제거
      if (breadcrumb.category === 'console') {
        if (breadcrumb.message?.includes('token') || breadcrumb.message?.includes('password')) {
          return null;
        }
      }

      // XHR/Fetch 요청에서 민감 정보 제거
      if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
        if (breadcrumb.data?.url) {
          try {
            const url = new URL(breadcrumb.data.url);
            ['token', 'password'].forEach((param) => {
              if (url.searchParams.has(param)) {
                url.searchParams.set(param, '[FILTERED]');
              }
            });
            breadcrumb.data.url = url.toString();
          } catch (e) {
            // URL 파싱 실패 시 무시
          }
        }
      }

      return breadcrumb;
    },

    // Integrations
    integrations: [
      // Session Replay (에러 발생 시 세션 녹화)
      new Sentry.Replay({
        maskAllText: true, // 모든 텍스트 마스킹
        blockAllMedia: true, // 모든 미디어 블록
        maskAllInputs: true, // 모든 입력 필드 마스킹
      }),

      // Next.js 통합
      // new Sentry.BrowserTracing({
      //   tracingOrigins: ['localhost', /^https:\/\/api\.mindconnect\.kr/],
      // }),
    ],
  });

  console.log(
    `[Sentry] Initialized (environment: ${config.environment}, release: ${config.release})`
  );
}

/**
 * 사용자 정보 설정
 *
 * @param userId - 사용자 ID
 * @param userEmail - 사용자 이메일 (선택)
 *
 * @description
 * 로그인한 사용자 정보를 Sentry에 설정
 */
export function setSentryUser(userId: string, userEmail?: string): void {
  if (!getSentryConfig().enabled) return;

  Sentry.setUser({
    id: userId,
    email: userEmail,
  });
}

/**
 * 사용자 정보 초기화 (로그아웃 시)
 */
export function clearSentryUser(): void {
  if (!getSentryConfig().enabled) return;

  Sentry.setUser(null);
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
 *   captureError(error, { component: 'RecommendationCard', centerId: '123' });
 * }
 * ```
 */
export function captureError(error: Error, context?: Record<string, any>): void {
  if (!getSentryConfig().enabled) {
    console.error('[Sentry Disabled] Error:', error);
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
 * captureMessage('Recommendation API request failed after 3 retries', 'warning');
 * ```
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (!getSentryConfig().enabled) {
    console.log(`[Sentry Disabled] ${level.toUpperCase()}: ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * 페이지뷰 추적
 *
 * @param pageName - 페이지 이름
 *
 * @description
 * Next.js 라우터 변경 시 호출하여 페이지 이동 추적
 */
export function trackPageView(pageName: string): void {
  if (!getSentryConfig().enabled) return;

  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Navigated to ${pageName}`,
    level: 'info',
  });
}

// Export Sentry for advanced usage
export { Sentry };
