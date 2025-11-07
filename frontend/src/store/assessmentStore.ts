/**
 * Assessment Store
 * 자가진단 UI 상태 관리
 *
 * Sprint 3 - Task 3.2.2
 *
 * @description
 * Zustand 기반 자가진단 진행 상태 관리
 * - 진행 단계 추적 (currentStep)
 * - 답변 저장 및 관리 (answers)
 * - 진단 결과 보관 (currentResult)
 * - 세션 복구 지원 (localStorage persistence)
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AssessmentTemplate, AssessmentResult, Answer } from '@/lib/api/assessments';

// ============================================
// 타입 정의
// ============================================

/**
 * 자가진단 스토어 상태
 */
interface AssessmentState {
  // ========== 템플릿 정보 ==========
  /** 현재 진행 중인 템플릿 ID */
  currentTemplateId: number | null;

  /** 현재 진행 중인 템플릿 */
  currentTemplate: AssessmentTemplate | null;

  // ========== 진행 상태 ==========
  /** 현재 단계 (1-based: 1부터 totalSteps까지) */
  currentStep: number;

  /** 전체 단계 수 */
  totalSteps: number;

  /** 사용자 답변 목록 */
  answers: Answer[];

  /** 세션 ID (중복 제출 방지) */
  sessionId: string | null;

  // ========== UI 상태 (persist 제외) ==========
  /** 제출 중 여부 */
  isSubmitting: boolean;

  /** 진단 결과 (제출 완료 후) */
  currentResult: AssessmentResult | null;

  // ========== 액션 ==========
  /**
   * 자가진단 시작
   * @param template - 진단 템플릿
   */
  startAssessment: (template: AssessmentTemplate) => void;

  /**
   * 답변 설정/업데이트
   * @param questionNumber - 질문 번호
   * @param selectedOption - 선택한 옵션 번호
   */
  setAnswer: (questionNumber: number, selectedOption: number) => void;

  /**
   * 다음 단계로 이동
   */
  nextStep: () => void;

  /**
   * 이전 단계로 이동
   */
  previousStep: () => void;

  /**
   * 특정 단계로 이동
   * @param step - 이동할 단계 (1-based)
   */
  goToStep: (step: number) => void;

  /**
   * 제출 중 상태 설정
   * @param isSubmitting - 제출 중 여부
   */
  setSubmitting: (isSubmitting: boolean) => void;

  /**
   * 진단 결과 설정
   * @param result - 진단 결과
   */
  setResult: (result: AssessmentResult | null) => void;

  /**
   * 자가진단 초기화 (모든 상태 리셋)
   */
  resetAssessment: () => void;

  // ========== 계산된 값 (Computed) ==========
  /**
   * 다음 단계로 이동 가능한지 확인
   * @returns 다음 단계 이동 가능 여부
   */
  canGoNext: () => boolean;

  /**
   * 이전 단계로 이동 가능한지 확인
   * @returns 이전 단계 이동 가능 여부
   */
  canGoPrevious: () => boolean;

  /**
   * 모든 질문에 답변했는지 확인
   * @returns 완료 여부
   */
  isComplete: () => boolean;

  /**
   * 진행률 계산 (0-100)
   * @returns 진행률 퍼센트
   */
  getProgress: () => number;

  /**
   * 현재 질문의 답변 조회
   * @returns 선택한 옵션 번호 (미응답 시 undefined)
   */
  getCurrentQuestionAnswer: () => number | undefined;
}

/**
 * 초기 상태
 */
const initialState = {
  currentTemplateId: null,
  currentTemplate: null,
  currentStep: 1,
  totalSteps: 0,
  answers: [],
  sessionId: null,
  isSubmitting: false,
  currentResult: null,
};

// ============================================
// Zustand Store
// ============================================

/**
 * 자가진단 스토어
 *
 * @example
 * ```typescript
 * // 진단 시작
 * const { startAssessment } = useAssessmentStore();
 * startAssessment(template);
 *
 * // 답변 저장
 * const { setAnswer, nextStep } = useAssessmentStore();
 * setAnswer(1, 2); // 질문 1에 옵션 2 선택
 * nextStep();
 *
 * // 진행률 확인
 * const { getProgress } = useAssessmentStore();
 * console.log(getProgress()); // 20
 * ```
 */
export const useAssessmentStore = create<AssessmentState>()(
  devtools(
    persist(
      (set, get) => ({
        // ========== 초기 상태 ==========
        ...initialState,

        // ========== 액션 ==========

        /**
         * 자가진단 시작
         */
        startAssessment: (template: AssessmentTemplate) => {
          // 세션 ID 생성 (타임스탬프 + 랜덤)
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

          set({
            currentTemplateId: template.id,
            currentTemplate: template,
            currentStep: 1,
            totalSteps: template.questionCount,
            answers: [],
            sessionId,
            isSubmitting: false,
            currentResult: null,
          });
        },

        /**
         * 답변 설정/업데이트
         */
        setAnswer: (questionNumber: number, selectedOption: number) => {
          const state = get();
          const answers = [...state.answers];

          // 기존 답변이 있는지 확인
          const existingIndex = answers.findIndex(
            (a) => a.questionNumber === questionNumber
          );

          if (existingIndex >= 0) {
            // 기존 답변 업데이트
            answers[existingIndex] = { questionNumber, selectedOption };
          } else {
            // 새 답변 추가
            answers.push({ questionNumber, selectedOption });
          }

          set({ answers });
        },

        /**
         * 다음 단계로 이동
         */
        nextStep: () => {
          const state = get();

          if (!state.canGoNext()) {
            return;
          }

          set({ currentStep: state.currentStep + 1 });
        },

        /**
         * 이전 단계로 이동
         */
        previousStep: () => {
          const state = get();

          if (!state.canGoPrevious()) {
            return;
          }

          set({ currentStep: state.currentStep - 1 });
        },

        /**
         * 특정 단계로 이동
         */
        goToStep: (step: number) => {
          const state = get();

          // 유효성 검사
          if (step < 1 || step > state.totalSteps) {
            console.warn(
              `Invalid step ${step}. Must be between 1 and ${state.totalSteps}`
            );
            return;
          }

          set({ currentStep: step });
        },

        /**
         * 제출 중 상태 설정
         */
        setSubmitting: (isSubmitting: boolean) => {
          set({ isSubmitting });
        },

        /**
         * 진단 결과 설정
         */
        setResult: (result: AssessmentResult | null) => {
          set({ currentResult: result });
        },

        /**
         * 자가진단 초기화
         */
        resetAssessment: () => {
          set(initialState);
        },

        // ========== 계산된 값 (Computed) ==========

        /**
         * 다음 단계로 이동 가능한지 확인
         */
        canGoNext: () => {
          const state = get();
          return state.currentStep < state.totalSteps;
        },

        /**
         * 이전 단계로 이동 가능한지 확인
         */
        canGoPrevious: () => {
          const state = get();
          return state.currentStep > 1;
        },

        /**
         * 모든 질문에 답변했는지 확인
         */
        isComplete: () => {
          const state = get();

          // 템플릿이 없으면 완료되지 않음
          if (!state.currentTemplate) {
            return false;
          }

          // 답변 개수가 전체 질문 개수와 같은지 확인
          return state.answers.length === state.totalSteps;
        },

        /**
         * 진행률 계산 (0-100)
         */
        getProgress: () => {
          const state = get();

          if (state.totalSteps === 0) {
            return 0;
          }

          // 답변 개수 기반 진행률
          return Math.round((state.answers.length / state.totalSteps) * 100);
        },

        /**
         * 현재 질문의 답변 조회
         */
        getCurrentQuestionAnswer: () => {
          const state = get();

          // 현재 질문에 해당하는 답변 찾기
          const currentAnswer = state.answers.find(
            (a) => a.questionNumber === state.currentStep
          );

          return currentAnswer?.selectedOption;
        },
      }),
      {
        name: 'assessment-storage', // localStorage 키
        /**
         * 세션 복구를 위해 필요한 상태만 저장
         * (isSubmitting, currentResult는 transient 상태이므로 제외)
         */
        partialize: (state) => ({
          currentTemplateId: state.currentTemplateId,
          currentTemplate: state.currentTemplate,
          currentStep: state.currentStep,
          totalSteps: state.totalSteps,
          answers: state.answers,
          sessionId: state.sessionId,
        }),
      }
    ),
    {
      name: 'AssessmentStore', // Redux DevTools 이름
    }
  )
);
