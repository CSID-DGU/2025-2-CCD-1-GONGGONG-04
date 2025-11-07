/**
 * useAssessments Hooks Tests
 * 자가진단 훅 테스트
 *
 * Sprint 3 - Task 3.2.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useTemplates,
  useTemplate,
  useSubmitAssessment,
  useAssessmentResult,
  useAssessmentHistory,
  useLatestAssessment,
  useDeleteAssessment,
  assessmentKeys,
} from '../useAssessments';
import * as assessmentsApi from '@/lib/api/assessments';
import type {
  AssessmentTemplate,
  AssessmentResult,
  AssessmentHistoryResponse,
} from '@/lib/api/assessments';

// API 모킹
vi.mock('@/lib/api/assessments');

// Toast 모킹
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// 테스트용 데이터
const mockTemplate: AssessmentTemplate = {
  id: 1,
  templateCode: 'K10_V1',
  name: 'K-10 자가진단',
  description: '정신건강 자가진단 도구',
  questionCount: 10,
  estimatedTimeMinutes: 5,
  questionsJson: [
    {
      questionNumber: 1,
      questionText: '지난 한 달 동안 우울감을 느낀 적이 있습니까?',
      options: [
        { optionNumber: 1, optionText: '전혀 없음', score: 1 },
        { optionNumber: 2, optionText: '가끔', score: 2 },
        { optionNumber: 3, optionText: '자주', score: 3 },
        { optionNumber: 4, optionText: '항상', score: 4 },
      ],
    },
  ],
  scoringRulesJson: {
    LOW: { min: 10, max: 19, description: '경미한 수준' },
    MID: { min: 20, max: 29, description: '중등도' },
    HIGH: { min: 30, max: 40, description: '심각한 수준' },
  },
  interpretationsJson: {
    LOW: {
      title: '경미한 수준',
      description: '현재 정신건강 상태가 양호합니다',
      recommendations: ['스트레스 관리', '규칙적인 운동'],
      urgency: 'low',
    },
    MID: {
      title: '중등도',
      description: '전문가 상담을 권장합니다',
      recommendations: ['전문 상담', '정기적인 모니터링'],
      urgency: 'moderate',
    },
    HIGH: {
      title: '심각한 수준',
      description: '즉시 전문가 도움이 필요합니다',
      recommendations: ['즉시 상담', '위기 개입'],
      urgency: 'high',
      contactInfo: {
        suicidePrevention: '109',
        mentalHealthCrisis: '1577-0199',
        emergency: '119',
      },
    },
  },
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockResult: AssessmentResult = {
  assessmentId: 123,
  totalScore: 25,
  severityCode: 'MID',
  interpretation: {
    title: '중등도',
    description: '전문가 상담을 권장합니다',
    recommendations: ['전문 상담', '정기적인 모니터링'],
    urgency: 'moderate',
  },
  completedAt: '2025-01-15T09:30:00Z',
};

const mockHistory: AssessmentHistoryResponse = {
  assessments: [
    {
      assessmentId: 123,
      templateId: 1,
      templateName: 'K-10 자가진단',
      totalScore: 25,
      severityCode: 'MID',
      completedAt: '2025-01-15T09:30:00Z',
    },
  ],
  total: 1,
  page: 1,
  totalPages: 1,
  summary: {
    total: 1,
    bySeverity: {
      LOW: 0,
      MID: 1,
      HIGH: 0,
    },
  },
};

// QueryClient 래퍼
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useTemplates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('템플릿 목록을 성공적으로 조회한다', async () => {
    vi.mocked(assessmentsApi.getTemplates).mockResolvedValue([mockTemplate]);

    const { result } = renderHook(() => useTemplates(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(assessmentsApi.getTemplates).toHaveBeenCalledTimes(1);
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('K-10 자가진단');
  });

  it('API 호출 실패 시 에러를 반환한다', async () => {
    const error = new assessmentsApi.AssessmentApiError(
      'Failed to fetch templates',
      500,
      'SERVER_ERROR'
    );
    vi.mocked(assessmentsApi.getTemplates).mockRejectedValue(error);

    const { result } = renderHook(() => useTemplates(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});

describe('useTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('특정 템플릿을 성공적으로 조회한다', async () => {
    vi.mocked(assessmentsApi.getTemplateById).mockResolvedValue(mockTemplate);

    const { result } = renderHook(() => useTemplate(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(assessmentsApi.getTemplateById).toHaveBeenCalledWith(1);
    expect(result.current.data?.name).toBe('K-10 자가진단');
    expect(result.current.data?.questionCount).toBe(10);
  });

  it('id가 0일 경우 쿼리가 비활성화된다', () => {
    vi.mocked(assessmentsApi.getTemplateById).mockResolvedValue(mockTemplate);

    const { result } = renderHook(() => useTemplate(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(assessmentsApi.getTemplateById).not.toHaveBeenCalled();
  });
});

describe('useSubmitAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('진단을 성공적으로 제출한다', async () => {
    vi.mocked(assessmentsApi.submitAssessment).mockResolvedValue(mockResult);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useSubmitAssessment({ onSuccess }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        templateId: 1,
        answers: [
          { questionNumber: 1, selectedOption: 2 },
          { questionNumber: 2, selectedOption: 3 },
        ],
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(assessmentsApi.submitAssessment).toHaveBeenCalledWith({
      templateId: 1,
      answers: [
        { questionNumber: 1, selectedOption: 2 },
        { questionNumber: 2, selectedOption: 3 },
      ],
    });
    expect(result.current.data).toEqual(mockResult);
    expect(onSuccess).toHaveBeenCalledWith(mockResult);
  });

  it('제출 실패 시 에러 콜백을 호출한다', async () => {
    const error = new assessmentsApi.AssessmentApiError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      [{ field: 'answers', message: '답변이 올바르지 않습니다' }]
    );
    vi.mocked(assessmentsApi.submitAssessment).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHook(() => useSubmitAssessment({ onError }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        templateId: 1,
        answers: [],
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });
});

describe('useAssessmentResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('진단 결과를 성공적으로 조회한다', async () => {
    vi.mocked(assessmentsApi.getAssessmentResult).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useAssessmentResult(123), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(assessmentsApi.getAssessmentResult).toHaveBeenCalledWith(123);
    expect(result.current.data?.assessmentId).toBe(123);
    expect(result.current.data?.severityCode).toBe('MID');
  });

  it('id가 0일 경우 쿼리가 비활성화된다', () => {
    vi.mocked(assessmentsApi.getAssessmentResult).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useAssessmentResult(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(assessmentsApi.getAssessmentResult).not.toHaveBeenCalled();
  });
});

describe('useAssessmentHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('진단 이력을 성공적으로 조회한다', async () => {
    vi.mocked(assessmentsApi.getAssessmentHistory).mockResolvedValue(mockHistory);

    const { result } = renderHook(
      () =>
        useAssessmentHistory({
          page: 1,
          limit: 10,
          severityCode: 'MID',
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(assessmentsApi.getAssessmentHistory).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      severityCode: 'MID',
    });
    expect(result.current.data?.total).toBe(1);
    expect(result.current.data?.assessments).toHaveLength(1);
  });

  it('파라미터 없이도 조회할 수 있다', async () => {
    vi.mocked(assessmentsApi.getAssessmentHistory).mockResolvedValue(mockHistory);

    const { result } = renderHook(() => useAssessmentHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(assessmentsApi.getAssessmentHistory).toHaveBeenCalledWith({});
  });
});

describe('useLatestAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('최근 진단 결과를 성공적으로 조회한다', async () => {
    vi.mocked(assessmentsApi.getLatestAssessment).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useLatestAssessment('K10_V1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(assessmentsApi.getLatestAssessment).toHaveBeenCalledWith('K10_V1');
    expect(result.current.data?.assessmentId).toBe(123);
  });

  it('진단 이력이 없으면 null을 반환한다', async () => {
    vi.mocked(assessmentsApi.getLatestAssessment).mockResolvedValue(null);

    const { result } = renderHook(() => useLatestAssessment(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });
});

describe('useDeleteAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('진단 결과를 성공적으로 삭제한다', async () => {
    vi.mocked(assessmentsApi.deleteAssessment).mockResolvedValue(undefined);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useDeleteAssessment({ onSuccess }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(123);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(assessmentsApi.deleteAssessment).toHaveBeenCalledWith(123);
    expect(onSuccess).toHaveBeenCalled();
  });

  it('삭제 실패 시 에러 콜백을 호출한다', async () => {
    const error = new assessmentsApi.AssessmentApiError(
      'Not found',
      404,
      'NOT_FOUND'
    );
    vi.mocked(assessmentsApi.deleteAssessment).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHook(() => useDeleteAssessment({ onError }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(999);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });
});

describe('assessmentKeys', () => {
  it('쿼리 키가 올바르게 생성된다', () => {
    expect(assessmentKeys.all).toEqual(['assessments']);
    expect(assessmentKeys.templates()).toEqual(['assessments', 'templates']);
    expect(assessmentKeys.template(1)).toEqual(['assessments', 'template', 1]);
    expect(assessmentKeys.result(123)).toEqual(['assessments', 'result', 123]);
    expect(assessmentKeys.history({ page: 1 })).toEqual([
      'assessments',
      'history',
      { page: 1 },
    ]);
    expect(assessmentKeys.latest('K10_V1')).toEqual([
      'assessments',
      'latest',
      'K10_V1',
    ]);
  });
});
