/**
 * Assessments API Client Integration Tests
 * 자가진단 API 클라이언트 통합 테스트
 *
 * Sprint 3 - Task 3.2.1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTemplates,
  getTemplateById,
  submitAssessment,
  getAssessmentResult,
  getAssessmentHistory,
  getLatestAssessment,
  deleteAssessment,
  AssessmentApiError,
  type AssessmentTemplate,
  type AssessmentResult,
  type AssessmentHistoryResponse,
} from '../assessments';

// Fetch 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

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
      questionText: '우울감을 느낀 적이 있습니까?',
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

describe('getTemplates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('템플릿 목록을 성공적으로 조회한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [mockTemplate],
      }),
    });

    const templates = await getTemplates();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/assessments/templates'),
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(templates).toHaveLength(1);
    expect(templates[0].name).toBe('K-10 자가진단');
  });

  it('서버 오류 시 AssessmentApiError를 던진다', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: '서버 오류가 발생했습니다',
        },
      }),
    });

    await expect(getTemplates()).rejects.toThrow(AssessmentApiError);
    await expect(getTemplates()).rejects.toThrow('서버 오류가 발생했습니다');
  });

  it('네트워크 오류 시 NETWORK_ERROR를 던진다', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(getTemplates()).rejects.toThrow(AssessmentApiError);
    await expect(getTemplates()).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
  });
});

describe('getTemplateById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('특정 템플릿을 성공적으로 조회한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockTemplate,
      }),
    });

    const template = await getTemplateById(1);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/assessments/templates/1'),
      expect.any(Object)
    );
    expect(template.id).toBe(1);
    expect(template.questionCount).toBe(10);
  });

  it('404 오류 시 NOT_FOUND 에러를 던진다', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '템플릿을 찾을 수 없습니다',
        },
      }),
    });

    await expect(getTemplateById(999)).rejects.toThrow(AssessmentApiError);
    await expect(getTemplateById(999)).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  });
});

describe('submitAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('진단을 성공적으로 제출하고 결과를 받는다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockResult,
      }),
    });

    const result = await submitAssessment({
      templateId: 1,
      answers: [
        { questionNumber: 1, selectedOption: 2 },
        { questionNumber: 2, selectedOption: 3 },
      ],
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/assessments'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('templateId'),
      })
    );
    expect(result.assessmentId).toBe(123);
    expect(result.totalScore).toBe(25);
    expect(result.severityCode).toBe('MID');
  });

  it('유효성 검증 실패 시 VALIDATION_ERROR를 던진다', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '입력값이 올바르지 않습니다',
          details: [
            { field: 'answers', message: '모든 질문에 답변해주세요' },
          ],
        },
      }),
    });

    try {
      await submitAssessment({
        templateId: 1,
        answers: [],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AssessmentApiError);
      expect((error as AssessmentApiError).statusCode).toBe(400);
      expect((error as AssessmentApiError).code).toBe('VALIDATION_ERROR');
      expect((error as AssessmentApiError).details).toBeDefined();
      expect((error as AssessmentApiError).details?.[0].field).toBe('answers');
    }
  });
});

describe('getAssessmentResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('진단 결과를 성공적으로 조회한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockResult,
      }),
    });

    const result = await getAssessmentResult(123);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/assessments/123/result'),
      expect.any(Object)
    );
    expect(result.assessmentId).toBe(123);
    expect(result.interpretation.title).toBe('중등도');
  });
});

describe('getAssessmentHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('진단 이력을 성공적으로 조회한다', async () => {
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

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockHistory,
      }),
    });

    const history = await getAssessmentHistory({
      page: 1,
      limit: 10,
      severityCode: 'MID',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('page=1'),
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=10'),
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('severityCode=MID'),
      expect.any(Object)
    );
    expect(history.total).toBe(1);
    expect(history.assessments).toHaveLength(1);
  });

  it('파라미터 없이도 조회할 수 있다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          assessments: [],
          total: 0,
          page: 1,
          totalPages: 0,
          summary: {
            total: 0,
            bySeverity: { LOW: 0, MID: 0, HIGH: 0 },
          },
        },
      }),
    });

    const history = await getAssessmentHistory();

    expect(mockFetch).toHaveBeenCalled();
    expect(history.total).toBe(0);
  });
});

describe('getLatestAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('최근 진단 결과를 성공적으로 조회한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockResult,
      }),
    });

    const result = await getLatestAssessment('K10_V1');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('latest?templateCode=K10_V1'),
      expect.any(Object)
    );
    expect(result?.assessmentId).toBe(123);
  });

  it('진단 이력이 없으면 null을 반환한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await getLatestAssessment();

    expect(result).toBeNull();
  });
});

describe('deleteAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('진단 결과를 성공적으로 삭제한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
      }),
    });

    await expect(deleteAssessment(123)).resolves.toBeUndefined();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/assessments/123'),
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('삭제 실패 시 에러를 던진다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '진단 결과를 찾을 수 없습니다',
        },
      }),
    });

    await expect(deleteAssessment(999)).rejects.toThrow(AssessmentApiError);
  });
});
