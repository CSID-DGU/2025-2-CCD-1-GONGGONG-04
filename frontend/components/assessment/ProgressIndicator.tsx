/**
 * ProgressIndicator Component
 * 진행률 표시 컴포넌트
 *
 * Sprint 3 - Task 3.2.3
 *
 * @description
 * 자가진단 진행률을 표시하는 컴포넌트
 * - Progress bar (shadcn Progress 사용)
 * - "질문 3/10" 형식의 텍스트
 * - ARIA 접근성 지원 (progressbar role)
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';

// ============================================
// Props 인터페이스
// ============================================

export interface ProgressIndicatorProps {
  /** 현재 단계 (1-based) */
  currentStep: number;

  /** 전체 단계 수 */
  totalSteps: number;
}

// ============================================
// ProgressIndicator Component
// ============================================

/**
 * 진행률 표시 컴포넌트
 *
 * @example
 * ```tsx
 * <ProgressIndicator currentStep={3} totalSteps={10} />
 * // 출력: "질문 3/10" + 30% progress bar
 * ```
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  // 진행률 계산 (0-100)
  const progressPercentage =
    totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  return (
    <div className="mb-6">
      {/* 진행 상태 텍스트 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-caption text-gray-600">
          질문 {currentStep}/{totalSteps}
        </span>
        <span className="text-caption text-gray-600 font-medium">
          {progressPercentage}%
        </span>
      </div>

      {/* 진행률 바 */}
      <Progress
        value={progressPercentage}
        className="h-2"
        aria-label={`진행률 ${progressPercentage}%`}
        aria-valuenow={progressPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};

ProgressIndicator.displayName = 'ProgressIndicator';

export default ProgressIndicator;
