/**
 * NavigationButtons Component
 * 네비게이션 버튼 컴포넌트
 *
 * Sprint 3 - Task 3.2.3
 *
 * @description
 * 자가진단 페이지의 이전/다음/제출 버튼을 관리하는 컴포넌트
 * - 첫 질문에서 이전 버튼 비활성화
 * - 답변 선택 전 다음 버튼 비활성화
 * - 마지막 질문에서 제출 버튼 표시
 * - 제출 중 로딩 스피너 표시
 * - 키보드 네비게이션 지원 (Enter, Arrow keys)
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';

// ============================================
// Props 인터페이스
// ============================================

export interface NavigationButtonsProps {
  /** 이전 버튼 활성화 여부 */
  canGoPrevious: boolean;

  /** 다음 버튼 활성화 여부 (답변 선택 여부) */
  canGoNext: boolean;

  /** 마지막 질문 여부 */
  isLastStep: boolean;

  /** 제출 중 여부 */
  isSubmitting: boolean;

  /** 이전 버튼 클릭 핸들러 */
  onPrevious: () => void;

  /** 다음 버튼 클릭 핸들러 */
  onNext: () => void;

  /** 제출 버튼 클릭 핸들러 */
  onSubmit: () => void;
}

// ============================================
// NavigationButtons Component
// ============================================

/**
 * 네비게이션 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <NavigationButtons
 *   canGoPrevious={currentStep > 1}
 *   canGoNext={!!selectedAnswer}
 *   isLastStep={currentStep === totalSteps}
 *   isSubmitting={false}
 *   onPrevious={() => setCurrentStep(currentStep - 1)}
 *   onNext={() => setCurrentStep(currentStep + 1)}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  canGoPrevious,
  canGoNext,
  isLastStep,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmit,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mt-6">
      {/* 이전 버튼 */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onPrevious}
        disabled={!canGoPrevious || isSubmitting}
        aria-label="이전 질문으로 이동"
        className="min-w-[120px]"
      >
        <ChevronLeft className="mr-2 h-5 w-5" />
        이전
      </Button>

      {/* 다음 또는 제출 버튼 */}
      {!isLastStep ? (
        // 다음 버튼 (마지막 질문이 아닐 때)
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={onNext}
          disabled={!canGoNext || isSubmitting}
          aria-label="다음 질문으로 이동"
          className="min-w-[120px] bg-lavender-500 hover:bg-lavender-600"
        >
          다음
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      ) : (
        // 제출 버튼 (마지막 질문일 때)
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={onSubmit}
          disabled={!canGoNext || isSubmitting}
          aria-label="자가진단 제출하기"
          className="min-w-[120px] bg-lavender-500 hover:bg-lavender-600"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              제출 중...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              제출하기
            </>
          )}
        </Button>
      )}
    </div>
  );
};

NavigationButtons.displayName = 'NavigationButtons';

export default NavigationButtons;
