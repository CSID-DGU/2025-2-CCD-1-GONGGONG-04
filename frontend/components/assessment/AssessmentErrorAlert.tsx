/**
 * AssessmentErrorAlert Component
 * 자가진단 에러 알림 컴포넌트
 *
 * Sprint 3 - Task 3.3.2
 *
 * @description
 * 자가진단 과정에서 발생하는 에러를 사용자 친화적으로 표시
 * - 에러 타입별 맞춤 메시지
 * - 해결 방법 안내
 * - 재시도 버튼 제공
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  WifiOff,
  ServerCrash,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';

// ============================================
// Props 인터페이스
// ============================================

export type ErrorType =
  | 'network' // 네트워크 오류
  | 'server' // 서버 오류
  | 'not_found' // 템플릿 없음
  | 'unauthorized' // 인증 필요
  | 'unknown'; // 알 수 없는 오류

export interface AssessmentErrorAlertProps {
  /** 에러 타입 */
  type: ErrorType;

  /** 에러 메시지 (선택사항, 기본 메시지 사용) */
  message?: string;

  /** 재시도 버튼 표시 여부 */
  showRetry?: boolean;

  /** 재시도 핸들러 */
  onRetry?: () => void;

  /** 로그인 버튼 표시 여부 (unauthorized일 때) */
  showLogin?: boolean;

  /** 로그인 핸들러 */
  onLogin?: () => void;
}

// ============================================
// 에러 타입별 설정
// ============================================

const ERROR_CONFIG: Record<
  ErrorType,
  {
    icon: React.ReactNode;
    title: string;
    defaultMessage: string;
    solution: string;
  }
> = {
  network: {
    icon: <WifiOff className="h-5 w-5" />,
    title: '네트워크 연결 오류',
    defaultMessage: '인터넷 연결이 불안정합니다.',
    solution: '네트워크 연결을 확인하고 다시 시도해주세요.',
  },
  server: {
    icon: <ServerCrash className="h-5 w-5" />,
    title: '서버 오류',
    defaultMessage: '일시적인 서버 오류가 발생했습니다.',
    solution: '잠시 후 다시 시도해주세요. 문제가 계속되면 고객센터로 문의해주세요.',
  },
  not_found: {
    icon: <AlertCircle className="h-5 w-5" />,
    title: '진단 템플릿을 찾을 수 없습니다',
    defaultMessage: '요청하신 자가진단 템플릿을 찾을 수 없습니다.',
    solution: '잠시 후 다시 시도하거나 홈 페이지로 돌아가주세요.',
  },
  unauthorized: {
    icon: <ShieldAlert className="h-5 w-5" />,
    title: '로그인이 필요합니다',
    defaultMessage: '진단 결과를 저장하려면 로그인이 필요합니다.',
    solution: '로그인 후 진단을 계속하시거나, 비회원으로 진행할 수 있습니다.',
  },
  unknown: {
    icon: <AlertCircle className="h-5 w-5" />,
    title: '오류가 발생했습니다',
    defaultMessage: '알 수 없는 오류가 발생했습니다.',
    solution: '페이지를 새로고침하거나 잠시 후 다시 시도해주세요.',
  },
};

// ============================================
// AssessmentErrorAlert Component
// ============================================

/**
 * 자가진단 에러 알림 컴포넌트
 *
 * @example
 * ```tsx
 * <AssessmentErrorAlert
 *   type="network"
 *   showRetry
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export const AssessmentErrorAlert: React.FC<AssessmentErrorAlertProps> = ({
  type,
  message,
  showRetry = false,
  onRetry,
  showLogin = false,
  onLogin,
}) => {
  const config = ERROR_CONFIG[type];

  return (
    <Alert variant="destructive" className="mb-6">
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
          {config.icon}
        </div>

        {/* 내용 */}
        <div className="flex-1 space-y-2">
          {/* 제목 */}
          <AlertTitle className="text-base font-semibold">
            {config.title}
          </AlertTitle>

          {/* 메시지 */}
          <AlertDescription className="text-sm">
            <p className="mb-2">{message || config.defaultMessage}</p>
            <p className="text-sm opacity-90">{config.solution}</p>
          </AlertDescription>

          {/* 액션 버튼 */}
          {(showRetry || showLogin) && (
            <div className="flex items-center gap-3 mt-4">
              {showRetry && onRetry && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="bg-white hover:bg-gray-50 border-gray-300"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  다시 시도
                </Button>
              )}

              {showLogin && onLogin && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onLogin}
                  className="bg-white hover:bg-gray-50 border-gray-300"
                >
                  로그인하기
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};

AssessmentErrorAlert.displayName = 'AssessmentErrorAlert';

export default AssessmentErrorAlert;
