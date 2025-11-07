/**
 * Assessment Store Unit Tests
 * 자가진단 스토어 단위 테스트
 *
 * Sprint 3 - Task 3.2.2
 *
 * @description
 * Zustand 스토어 단위 테스트 (>90% 커버리지 목표)
 * - startAssessment
 * - setAnswer
 * - 네비게이션 (nextStep, previousStep, goToStep)
 * - 계산된 값 (canGo*, isComplete, getProgress)
 * - 상태 관리 (setSubmitting, setResult, resetAssessment)
 * - 엣지 케이스 (경계값, 유효성 검증)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssessmentStore } from '../assessmentStore';
import type { AssessmentTemplate, AssessmentResult } from '@/lib/api/assessments';

// ============================================
// 테스트 픽스처
// ============================================

/**
 * 테스트용 템플릿 생성
 */
const createMockTemplate = (
  questionCount: number = 10,
  overrides?: Partial<AssessmentTemplate>
): AssessmentTemplate => ({
  id: 1,
  templateCode: 'K10_V1',
  name: 'K-10 정신건강 자가진단',
  description: '간단한 10문항 자가진단 도구',
  questionCount,
  estimatedTimeMinutes: 5,
  questionsJson: Array.from({ length: questionCount }, (_, i) => ({
    questionNumber: i + 1,
    questionText: `질문 ${i + 1}`,
    options: [
      { optionNumber: 1, optionText: '전혀 없음', score: 0 },
      { optionNumber: 2, optionText: '조금', score: 1 },
      { optionNumber: 3, optionText: '보통', score: 2 },
      { optionNumber: 4, optionText: '많이', score: 3 },
      { optionNumber: 5, optionText: '매우 많이', score: 4 },
    ],
  })),
  scoringRulesJson: {
    LOW: { min: 0, max: 15, description: '정상 범위' },
    MID: { min: 16, max: 29, description: '중등도' },
    HIGH: { min: 30, max: 50, description: '심각' },
  },
  interpretationsJson: {
    LOW: {
      title: '정상 범위',
      description: '정신건강 상태가 양호합니다',
      recommendations: ['규칙적인 생활 유지'],
      urgency: 'low',
    },
    MID: {
      title: '중등도',
      description: '전문가 상담을 권장합니다',
      recommendations: ['전문가 상담'],
      urgency: 'moderate',
    },
    HIGH: {
      title: '심각',
      description: '즉시 전문가 상담이 필요합니다',
      recommendations: ['긴급 상담'],
      urgency: 'high',
      contactInfo: {
        suicidePrevention: '1393',
        mentalHealthCrisis: '1577-0199',
        emergency: '119',
      },
    },
  },
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

/**
 * 테스트용 진단 결과 생성
 */
const createMockResult = (
  overrides?: Partial<AssessmentResult>
): AssessmentResult => ({
  assessmentId: 123,
  totalScore: 25,
  severityCode: 'MID',
  interpretation: {
    title: '중등도',
    description: '전문가 상담을 권장합니다',
    recommendations: ['전문가 상담', '규칙적인 운동'],
    urgency: 'moderate',
  },
  completedAt: '2025-01-15T09:30:00Z',
  ...overrides,
});

// ============================================
// 테스트 스위트
// ============================================

describe('AssessmentStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    const { result } = renderHook(() => useAssessmentStore());
    act(() => {
      result.current.resetAssessment();
    });
  });

  // ========================================
  // startAssessment 테스트
  // ========================================
  describe('startAssessment', () => {
    it('템플릿으로 진단을 시작해야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(10);

      act(() => {
        result.current.startAssessment(template);
      });

      expect(result.current.currentTemplateId).toBe(1);
      expect(result.current.currentTemplate).toEqual(template);
      expect(result.current.currentStep).toBe(1);
      expect(result.current.totalSteps).toBe(10);
      expect(result.current.answers).toEqual([]);
      expect(result.current.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('이전 진단 상태를 초기화해야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(10);

      // 첫 번째 진단 시작
      act(() => {
        result.current.startAssessment(template);
        result.current.setAnswer(1, 2);
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);
      expect(result.current.answers).toHaveLength(1);

      // 새 진단 시작 - 상태 초기화 확인
      act(() => {
        result.current.startAssessment(template);
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.answers).toEqual([]);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.currentResult).toBeNull();
    });

    it('고유한 세션 ID를 생성해야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(10);

      act(() => {
        result.current.startAssessment(template);
      });

      const firstSessionId = result.current.sessionId;

      act(() => {
        result.current.startAssessment(template);
      });

      const secondSessionId = result.current.sessionId;

      expect(firstSessionId).toBeTruthy();
      expect(secondSessionId).toBeTruthy();
      expect(firstSessionId).not.toBe(secondSessionId);
    });
  });

  // ========================================
  // setAnswer 테스트
  // ========================================
  describe('setAnswer', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(10);

      act(() => {
        result.current.startAssessment(template);
      });
    });

    it('새 답변을 추가해야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setAnswer(1, 2);
      });

      expect(result.current.answers).toHaveLength(1);
      expect(result.current.answers[0]).toEqual({
        questionNumber: 1,
        selectedOption: 2,
      });
    });

    it('여러 답변을 저장해야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setAnswer(1, 2);
        result.current.setAnswer(2, 3);
        result.current.setAnswer(3, 1);
      });

      expect(result.current.answers).toHaveLength(3);
      expect(result.current.answers[0]).toEqual({
        questionNumber: 1,
        selectedOption: 2,
      });
      expect(result.current.answers[1]).toEqual({
        questionNumber: 2,
        selectedOption: 3,
      });
      expect(result.current.answers[2]).toEqual({
        questionNumber: 3,
        selectedOption: 1,
      });
    });

    it('기존 답변을 업데이트해야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setAnswer(1, 2);
      });

      expect(result.current.answers[0].selectedOption).toBe(2);

      act(() => {
        result.current.setAnswer(1, 4); // 답변 변경
      });

      expect(result.current.answers).toHaveLength(1); // 개수는 그대로
      expect(result.current.answers[0].selectedOption).toBe(4); // 값만 변경
    });

    it('순서와 상관없이 답변을 저장해야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.setAnswer(3, 1);
        result.current.setAnswer(1, 2);
        result.current.setAnswer(2, 3);
      });

      expect(result.current.answers).toHaveLength(3);
      // 순서는 입력 순서대로
      expect(result.current.answers[0].questionNumber).toBe(3);
      expect(result.current.answers[1].questionNumber).toBe(1);
      expect(result.current.answers[2].questionNumber).toBe(2);
    });
  });

  // ========================================
  // 네비게이션 테스트
  // ========================================
  describe('Navigation', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(5);

      act(() => {
        result.current.startAssessment(template);
      });
    });

    describe('nextStep', () => {
      it('다음 단계로 이동해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        expect(result.current.currentStep).toBe(1);

        act(() => {
          result.current.nextStep();
        });

        expect(result.current.currentStep).toBe(2);
      });

      it('마지막 단계에서 더 이상 진행하지 않아야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        // 마지막 단계로 이동
        act(() => {
          result.current.goToStep(5);
        });

        expect(result.current.currentStep).toBe(5);

        // 다음 단계 시도
        act(() => {
          result.current.nextStep();
        });

        expect(result.current.currentStep).toBe(5); // 변경 없음
      });
    });

    describe('previousStep', () => {
      it('이전 단계로 이동해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        act(() => {
          result.current.nextStep(); // step 2
          result.current.nextStep(); // step 3
        });

        expect(result.current.currentStep).toBe(3);

        act(() => {
          result.current.previousStep();
        });

        expect(result.current.currentStep).toBe(2);
      });

      it('첫 단계에서 더 이상 뒤로 가지 않아야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        expect(result.current.currentStep).toBe(1);

        act(() => {
          result.current.previousStep();
        });

        expect(result.current.currentStep).toBe(1); // 변경 없음
      });
    });

    describe('goToStep', () => {
      it('특정 단계로 이동해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        act(() => {
          result.current.goToStep(3);
        });

        expect(result.current.currentStep).toBe(3);
      });

      it('범위 내의 모든 단계로 이동 가능해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        for (let i = 1; i <= 5; i++) {
          act(() => {
            result.current.goToStep(i);
          });

          expect(result.current.currentStep).toBe(i);
        }
      });

      it('범위를 벗어난 단계는 무시해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        act(() => {
          result.current.goToStep(0); // 최소값 미만
        });

        expect(result.current.currentStep).toBe(1); // 변경 없음
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Invalid step 0. Must be between 1 and 5'
        );

        act(() => {
          result.current.goToStep(6); // 최대값 초과
        });

        expect(result.current.currentStep).toBe(1); // 변경 없음
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Invalid step 6. Must be between 1 and 5'
        );

        consoleWarnSpy.mockRestore();
      });
    });
  });

  // ========================================
  // 계산된 값 테스트
  // ========================================
  describe('Computed Values', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(10);

      act(() => {
        result.current.startAssessment(template);
      });
    });

    describe('canGoNext', () => {
      it('마지막 단계 전까지 true를 반환해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        for (let i = 1; i < 10; i++) {
          act(() => {
            result.current.goToStep(i);
          });

          expect(result.current.canGoNext()).toBe(true);
        }
      });

      it('마지막 단계에서 false를 반환해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        act(() => {
          result.current.goToStep(10);
        });

        expect(result.current.canGoNext()).toBe(false);
      });
    });

    describe('canGoPrevious', () => {
      it('첫 단계에서 false를 반환해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        expect(result.current.canGoPrevious()).toBe(false);
      });

      it('첫 단계 이후부터 true를 반환해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        for (let i = 2; i <= 10; i++) {
          act(() => {
            result.current.goToStep(i);
          });

          expect(result.current.canGoPrevious()).toBe(true);
        }
      });
    });

    describe('isComplete', () => {
      it('모든 질문에 답변하지 않았으면 false를 반환해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        expect(result.current.isComplete()).toBe(false);

        act(() => {
          result.current.setAnswer(1, 2);
          result.current.setAnswer(2, 3);
        });

        expect(result.current.isComplete()).toBe(false); // 10개 중 2개만 답변
      });

      it('모든 질문에 답변했으면 true를 반환해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        act(() => {
          for (let i = 1; i <= 10; i++) {
            result.current.setAnswer(i, 2);
          }
        });

        expect(result.current.isComplete()).toBe(true);
      });

      it('템플릿이 없으면 false를 반환해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        act(() => {
          result.current.resetAssessment();
        });

        expect(result.current.isComplete()).toBe(false);
      });
    });

    describe('getProgress', () => {
      it('진행률을 올바르게 계산해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        expect(result.current.getProgress()).toBe(0);

        act(() => {
          result.current.setAnswer(1, 2); // 1/10 = 10%
        });

        expect(result.current.getProgress()).toBe(10);

        act(() => {
          result.current.setAnswer(2, 3); // 2/10 = 20%
        });

        expect(result.current.getProgress()).toBe(20);

        act(() => {
          for (let i = 3; i <= 10; i++) {
            result.current.setAnswer(i, 2);
          }
        });

        expect(result.current.getProgress()).toBe(100);
      });

      it('totalSteps가 0이면 0을 반환해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        act(() => {
          result.current.resetAssessment();
        });

        expect(result.current.getProgress()).toBe(0);
      });

      it('진행률은 반올림되어야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());
        const template = createMockTemplate(3);

        act(() => {
          result.current.startAssessment(template);
          result.current.setAnswer(1, 2); // 1/3 = 33.333...%
        });

        expect(result.current.getProgress()).toBe(33); // 반올림
      });
    });

    describe('getCurrentQuestionAnswer', () => {
      it('현재 질문의 답변을 반환해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        act(() => {
          result.current.setAnswer(1, 2);
          result.current.goToStep(1);
        });

        expect(result.current.getCurrentQuestionAnswer()).toBe(2);
      });

      it('답변이 없으면 undefined를 반환해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        act(() => {
          result.current.goToStep(5);
        });

        expect(result.current.getCurrentQuestionAnswer()).toBeUndefined();
      });

      it('다른 질문으로 이동하면 해당 질문의 답변을 반환해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        act(() => {
          result.current.setAnswer(1, 2);
          result.current.setAnswer(2, 3);
          result.current.setAnswer(3, 4);

          result.current.goToStep(1);
        });

        expect(result.current.getCurrentQuestionAnswer()).toBe(2);

        act(() => {
          result.current.goToStep(2);
        });

        expect(result.current.getCurrentQuestionAnswer()).toBe(3);

        act(() => {
          result.current.goToStep(3);
        });

        expect(result.current.getCurrentQuestionAnswer()).toBe(4);
      });
    });
  });

  // ========================================
  // 상태 관리 테스트
  // ========================================
  describe('State Management', () => {
    describe('setSubmitting', () => {
      it('제출 중 상태를 설정해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());

        expect(result.current.isSubmitting).toBe(false);

        act(() => {
          result.current.setSubmitting(true);
        });

        expect(result.current.isSubmitting).toBe(true);

        act(() => {
          result.current.setSubmitting(false);
        });

        expect(result.current.isSubmitting).toBe(false);
      });
    });

    describe('setResult', () => {
      it('진단 결과를 설정해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());
        const mockResult = createMockResult();

        act(() => {
          result.current.setResult(mockResult);
        });

        expect(result.current.currentResult).toEqual(mockResult);
      });

      it('결과를 null로 설정할 수 있어야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());
        const mockResult = createMockResult();

        act(() => {
          result.current.setResult(mockResult);
        });

        expect(result.current.currentResult).toEqual(mockResult);

        act(() => {
          result.current.setResult(null);
        });

        expect(result.current.currentResult).toBeNull();
      });
    });

    describe('resetAssessment', () => {
      it('모든 상태를 초기화해야 함', () => {
        const { result } = renderHook(() => useAssessmentStore());
        const template = createMockTemplate(10);
        const mockResult = createMockResult();

        // 상태 설정
        act(() => {
          result.current.startAssessment(template);
          result.current.setAnswer(1, 2);
          result.current.setAnswer(2, 3);
          result.current.nextStep();
          result.current.setSubmitting(true);
          result.current.setResult(mockResult);
        });

        // 초기화
        act(() => {
          result.current.resetAssessment();
        });

        // 초기 상태 확인
        expect(result.current.currentTemplateId).toBeNull();
        expect(result.current.currentTemplate).toBeNull();
        expect(result.current.currentStep).toBe(1);
        expect(result.current.totalSteps).toBe(0);
        expect(result.current.answers).toEqual([]);
        expect(result.current.sessionId).toBeNull();
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.currentResult).toBeNull();
      });
    });
  });

  // ========================================
  // 엣지 케이스 테스트
  // ========================================
  describe('Edge Cases', () => {
    it('질문이 1개인 템플릿도 처리해야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(1);

      act(() => {
        result.current.startAssessment(template);
      });

      expect(result.current.totalSteps).toBe(1);
      expect(result.current.canGoNext()).toBe(false);
      expect(result.current.canGoPrevious()).toBe(false);

      act(() => {
        result.current.setAnswer(1, 2);
      });

      expect(result.current.isComplete()).toBe(true);
      expect(result.current.getProgress()).toBe(100);
    });

    it('질문이 많은 템플릿도 처리해야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(50);

      act(() => {
        result.current.startAssessment(template);
      });

      expect(result.current.totalSteps).toBe(50);

      act(() => {
        for (let i = 1; i <= 50; i++) {
          result.current.setAnswer(i, 2);
        }
      });

      expect(result.current.isComplete()).toBe(true);
      expect(result.current.getProgress()).toBe(100);
    });

    it('답변을 변경해도 진행률은 변하지 않아야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(10);

      act(() => {
        result.current.startAssessment(template);
        result.current.setAnswer(1, 2);
      });

      expect(result.current.getProgress()).toBe(10);

      act(() => {
        result.current.setAnswer(1, 4); // 답변 변경
      });

      expect(result.current.getProgress()).toBe(10); // 진행률 동일
    });

    it('중복 질문 번호로 여러 번 답변해도 개수는 1개여야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(10);

      act(() => {
        result.current.startAssessment(template);
        result.current.setAnswer(1, 2);
        result.current.setAnswer(1, 3);
        result.current.setAnswer(1, 4);
      });

      expect(result.current.answers).toHaveLength(1);
      expect(result.current.answers[0].selectedOption).toBe(4); // 마지막 값
    });

    it('순서와 상관없이 모든 질문에 답변하면 완료로 처리해야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(5);

      act(() => {
        result.current.startAssessment(template);
        // 역순으로 답변
        result.current.setAnswer(5, 2);
        result.current.setAnswer(4, 2);
        result.current.setAnswer(3, 2);
        result.current.setAnswer(2, 2);
        result.current.setAnswer(1, 2);
      });

      expect(result.current.isComplete()).toBe(true);
    });
  });

  // ========================================
  // 통합 시나리오 테스트
  // ========================================
  describe('Integration Scenarios', () => {
    it('전체 진단 플로우를 처리해야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(3);
      const mockResult = createMockResult();

      // 1. 진단 시작
      act(() => {
        result.current.startAssessment(template);
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.totalSteps).toBe(3);

      // 2. 질문에 답변하며 진행
      act(() => {
        result.current.setAnswer(1, 2);
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);
      expect(result.current.getProgress()).toBe(33);

      act(() => {
        result.current.setAnswer(2, 3);
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(3);
      expect(result.current.getProgress()).toBe(67);

      act(() => {
        result.current.setAnswer(3, 4);
      });

      expect(result.current.isComplete()).toBe(true);
      expect(result.current.getProgress()).toBe(100);

      // 3. 제출
      act(() => {
        result.current.setSubmitting(true);
      });

      expect(result.current.isSubmitting).toBe(true);

      // 4. 결과 수신
      act(() => {
        result.current.setSubmitting(false);
        result.current.setResult(mockResult);
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.currentResult).toEqual(mockResult);
    });

    it('답변을 수정하고 다시 완료할 수 있어야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(3);

      act(() => {
        result.current.startAssessment(template);
        result.current.setAnswer(1, 2);
        result.current.setAnswer(2, 3);
        result.current.setAnswer(3, 4);
      });

      expect(result.current.isComplete()).toBe(true);

      // 이전 질문으로 돌아가서 답변 수정
      act(() => {
        result.current.goToStep(1);
        result.current.setAnswer(1, 5); // 답변 변경
      });

      expect(result.current.isComplete()).toBe(true); // 여전히 완료 상태
      expect(result.current.answers[0].selectedOption).toBe(5);
    });

    it('진단을 재시작할 수 있어야 함', () => {
      const { result } = renderHook(() => useAssessmentStore());
      const template = createMockTemplate(3);

      // 첫 번째 진단
      act(() => {
        result.current.startAssessment(template);
        result.current.setAnswer(1, 2);
        result.current.setAnswer(2, 3);
        result.current.nextStep();
        result.current.nextStep();
      });

      const firstSessionId = result.current.sessionId;

      // 재시작
      act(() => {
        result.current.startAssessment(template);
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.answers).toEqual([]);
      expect(result.current.sessionId).not.toBe(firstSessionId); // 새 세션
    });
  });
});
