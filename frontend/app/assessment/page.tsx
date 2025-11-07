/**
 * Assessment Page
 * 자가진단 페이지
 *
 * Sprint 3 - Task 3.2.3
 *
 * @description
 * 정신건강 자가진단 페이지
 * - K-10 템플릿 자동 로드
 * - 순차적 질문 표시 및 답변 수집
 * - 진행률 추적
 * - 중도 이탈 시 확인 모달
 * - 완료 시 결과 페이지로 이동
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplate, useSubmitAssessment } from '@/hooks/useAssessments';
import { useAssessmentStore } from '@/store/assessmentStore';
import { AssessmentHeader } from '@/components/assessment/AssessmentHeader';
import { ProgressIndicator } from '@/components/assessment/ProgressIndicator';
import { QuestionCard } from '@/components/assessment/QuestionCard';
import { NavigationButtons } from '@/components/assessment/NavigationButtons';
import { ExitConfirmModal } from '@/components/assessment/ExitConfirmModal';
import { AssessmentSkeleton } from '@/components/assessment/AssessmentSkeleton';
import { AssessmentErrorAlert, ErrorType } from '@/components/assessment/AssessmentErrorAlert';

// ============================================
// AssessmentPage Component
// ============================================

/**
 * 자가진단 페이지
 */
export default function AssessmentPage() {
  const router = useRouter();

  // ========== 상태 관리 ==========

  // 중도 이탈 확인 모달 상태
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // ========== Hooks ==========

  // K-10 템플릿 조회 (templateId = 1)
  const {
    data: template,
    isLoading,
    isError,
    error,
  } = useTemplate(1);

  // Zustand 스토어
  const {
    currentStep,
    totalSteps,
    answers,
    currentTemplate,
    startAssessment,
    setAnswer,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    isComplete,
    getCurrentQuestionAnswer,
    setResult,
  } = useAssessmentStore();

  // 진단 제출 Mutation
  const submitMutation = useSubmitAssessment();

  // ========== Effects ==========

  /**
   * 템플릿 로드 시 진단 시작
   */
  useEffect(() => {
    if (template && !currentTemplate) {
      startAssessment(template);
    }
  }, [template, currentTemplate, startAssessment]);

  /**
   * 브라우저 뒤로가기 방지 (진행 중일 때)
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep > 1 && currentStep <= totalSteps) {
        e.preventDefault();
        e.returnValue = ''; // Chrome 필수
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentStep, totalSteps]);

  // ========== 이벤트 핸들러 ==========

  /**
   * 답변 선택 핸들러
   */
  const handleSelectOption = (optionNumber: number) => {
    setAnswer(currentStep, optionNumber);
  };

  /**
   * 다음 버튼 클릭
   */
  const handleNext = () => {
    nextStep();
  };

  /**
   * 이전 버튼 클릭
   */
  const handlePrevious = () => {
    previousStep();
  };

  /**
   * 제출 핸들러
   */
  const handleSubmit = async () => {
    if (!template || !isComplete()) {
      return;
    }

    try {
      const result = await submitMutation.mutateAsync({
        templateId: template.id,
        answers,
      });

      // SubmitAssessmentResponse를 AssessmentResult 형태로 변환하여 store에 저장
      // (익명 사용자를 위해 결과 페이지에서 사용)
      const assessmentResult = {
        id: result.assessmentId,
        assessmentId: result.assessmentId, // alias for compatibility
        userId: 0, // 익명 사용자
        templateId: template.id,
        totalScore: result.totalScore,
        maxScore: template.questions.length * 4, // K-10: 10문항 * 4점 = 40점
        severityCode: result.severityCode,
        interpretation: result.interpretation,
        completedAt: result.completedAt,
        answers,
      };

      setResult(assessmentResult);

      // 결과 페이지로 이동
      router.push(`/assessment/result/${result.assessmentId}`);
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    }
  };

  /**
   * 페이지 이탈 확인
   */
  const handleExit = () => {
    setIsExitModalOpen(true);
  };

  /**
   * 이탈 확정
   */
  const confirmExit = () => {
    router.push('/');
  };

  // ========== 현재 질문 가져오기 ==========

  const getCurrentQuestion = () => {
    if (!template || !template.questions || currentStep < 1 || currentStep > template.questionCount) {
      return null;
    }

    return template.questions.find(
      (q: any) => q.questionNumber === currentStep
    );
  };

  const currentQuestion = getCurrentQuestion();
  const selectedAnswer = getCurrentQuestionAnswer();

  // ========== Helper Functions ==========

  /**
   * 에러 타입 결정
   */
  const getErrorType = (): ErrorType => {
    if (!error) return 'unknown';

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'network';
    }
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return 'not_found';
    }
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return 'unauthorized';
    }
    if (errorMessage.includes('500') || errorMessage.includes('server')) {
      return 'server';
    }

    return 'unknown';
  };

  // ========== 렌더링 ==========

  // 로딩 상태 - 개선된 스켈레톤 UI
  if (isLoading) {
    return <AssessmentSkeleton />;
  }

  // 에러 상태 - 사용자 친화적인 에러 메시지
  if (isError) {
    const errorType = getErrorType();
    const errorMessage = error instanceof Error ? error.message : undefined;

    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <AssessmentErrorAlert
          type={errorType}
          message={errorMessage}
          showRetry
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // 템플릿 없음
  if (!template || !currentQuestion) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <AssessmentErrorAlert
          type="not_found"
          showRetry
          onRetry={() => router.push('/')}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <AssessmentHeader
        templateName={template.title}
        description={template.description}
        estimatedMinutes={template.estimatedMinutes}
      />

      {/* 진행률 */}
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      {/* 질문 카드 */}
      <QuestionCard
        questionNumber={currentQuestion.questionNumber}
        questionText={currentQuestion.questionText}
        options={currentQuestion.options}
        selectedOption={selectedAnswer}
        onSelectOption={handleSelectOption}
      />

      {/* 네비게이션 버튼 */}
      <NavigationButtons
        canGoPrevious={canGoPrevious()}
        canGoNext={canGoNext()}
        isLastStep={currentStep === totalSteps}
        isSubmitting={submitMutation.isPending}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />

      {/* 제출 에러 메시지 */}
      {submitMutation.isError && (
        <div className="mt-4">
          <AssessmentErrorAlert
            type={getErrorType()}
            message="진단 결과 제출에 실패했습니다."
            showRetry
            onRetry={() => submitMutation.reset()}
          />
        </div>
      )}

      {/* 중도 이탈 확인 모달 */}
      <ExitConfirmModal
        open={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirmExit={confirmExit}
      />
    </div>
  );
}
