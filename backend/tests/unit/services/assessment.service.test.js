/**
 * Assessment Service Unit Tests
 *
 * Sprint 3: 자가진단 도구 구현
 * Task 3.1.3: 진단 서비스 구현 - 단위 테스트
 */

// Mock modules before importing service
const mockPrisma = {
  selfAssessmentTemplate: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  userAssessment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../../../src/services/scoring.service');

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-12345'),
}));

const {
  getTemplates,
  getTemplateById,
  getTemplateByCode,
  submitAssessment,
  getAssessmentResult,
  getUserAssessmentHistory,
  getLatestAssessment,
  deleteAssessment,
  AssessmentNotFoundError,
  UnauthorizedAccessError,
  InvalidTemplateError,
  SubmissionError,
} = require('../../../src/services/assessment.service');

const { scoreAssessment } = require('../../../src/services/scoring.service');

describe('Assessment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTemplates()', () => {
    it('should return list of active templates', async () => {
      const mockTemplates = [
        {
          id: 1n,
          templateCode: 'K10_V1',
          templateName: 'K-10 자가진단',
          templateType: 'mental_health',
          description: 'K-10 설명',
          questionCount: 10,
          estimatedTimeMinutes: 5,
          version: '1.0',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
      ];

      mockPrisma.selfAssessmentTemplate.findMany.mockResolvedValue(mockTemplates);

      const result = await getTemplates();

      expect(result).toEqual(mockTemplates);
      expect(mockPrisma.selfAssessmentTemplate.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: {
          id: true,
          templateCode: true,
          templateName: true,
          templateType: true,
          description: true,
          questionCount: true,
          estimatedTimeMinutes: true,
          version: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array if no active templates', async () => {
      mockPrisma.selfAssessmentTemplate.findMany.mockResolvedValue([]);

      const result = await getTemplates();

      expect(result).toEqual([]);
    });

    it('should throw error if database query fails', async () => {
      mockPrisma.selfAssessmentTemplate.findMany.mockRejectedValue(
        new Error('Database error')
      );

      await expect(getTemplates()).rejects.toThrow('Failed to retrieve templates');
    });
  });

  describe('getTemplateById()', () => {
    it('should return template with all details', async () => {
      const mockTemplate = {
        id: 1n,
        templateCode: 'K10_V1',
        templateName: 'K-10 자가진단',
        isActive: true,
        questionsJson: [{ question_number: 1 }],
        scoringRulesJson: { severityLevels: [] },
        interpretationJson: { LOW: { title: '정상' } },
      };

      mockPrisma.selfAssessmentTemplate.findUnique.mockResolvedValue(mockTemplate);

      const result = await getTemplateById(1);

      expect(result).toEqual(mockTemplate);
      expect(mockPrisma.selfAssessmentTemplate.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw InvalidTemplateError if template not found', async () => {
      mockPrisma.selfAssessmentTemplate.findUnique.mockResolvedValue(null);

      await expect(getTemplateById(1)).rejects.toThrow(InvalidTemplateError);
      await expect(getTemplateById(1)).rejects.toThrow('Template with ID 1 not found');
    });

    it('should throw InvalidTemplateError if template is inactive', async () => {
      const mockTemplate = {
        id: 1n,
        templateCode: 'K10_V1',
        isActive: false,
      };

      mockPrisma.selfAssessmentTemplate.findUnique.mockResolvedValue(mockTemplate);

      await expect(getTemplateById(1)).rejects.toThrow(InvalidTemplateError);
      await expect(getTemplateById(1)).rejects.toThrow('is not active');
    });

    it('should throw TypeError if templateId is not a number', async () => {
      await expect(getTemplateById('invalid')).rejects.toThrow(TypeError);
      await expect(getTemplateById(null)).rejects.toThrow(TypeError);
    });
  });

  describe('getTemplateByCode()', () => {
    it('should return template by code', async () => {
      const mockTemplate = {
        id: 1n,
        templateCode: 'K10_V1',
        templateName: 'K-10 자가진단',
        isActive: true,
      };

      mockPrisma.selfAssessmentTemplate.findUnique.mockResolvedValue(mockTemplate);

      const result = await getTemplateByCode('K10_V1');

      expect(result).toEqual(mockTemplate);
      expect(mockPrisma.selfAssessmentTemplate.findUnique).toHaveBeenCalledWith({
        where: { templateCode: 'K10_V1' },
      });
    });

    it('should throw InvalidTemplateError if template not found', async () => {
      mockPrisma.selfAssessmentTemplate.findUnique.mockResolvedValue(null);

      await expect(getTemplateByCode('INVALID_CODE')).rejects.toThrow(
        InvalidTemplateError
      );
    });

    it('should throw TypeError if templateCode is not a string', async () => {
      await expect(getTemplateByCode(123)).rejects.toThrow(TypeError);
      await expect(getTemplateByCode(null)).rejects.toThrow(TypeError);
    });
  });

  describe('submitAssessment()', () => {
    const mockUser = { id: 42n, email: 'test@example.com' };
    const mockTemplate = {
      id: 1n,
      templateCode: 'K10_V1',
      isActive: true,
      questionsJson: [
        {
          question_number: 1,
          options: [
            { option_number: 1, score: 1 },
            { option_number: 2, score: 2 },
          ],
        },
      ],
      scoringRulesJson: {
        severityLevels: [
          { code: 'LOW', min: 10, max: 15 },
          { code: 'MID', min: 16, max: 29 },
        ],
      },
      interpretationJson: {
        MID: {
          title: '중등도',
          message: '전문가 상담 권장',
          recommendations: ['상담 받기'],
          urgency: 'medium',
        },
      },
    };

    const mockAnswers = [{ questionId: 1, selectedOption: 2 }];

    const mockScoringResult = {
      isValid: true,
      errors: [],
      totalScore: 21,
      severityCode: 'MID',
      interpretation: {
        title: '중등도',
        message: '전문가 상담 권장',
        recommendations: ['상담 받기'],
        urgency: 'medium',
      },
    };

    beforeEach(() => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.selfAssessmentTemplate.findUnique.mockResolvedValue(mockTemplate);
      scoreAssessment.mockReturnValue(mockScoringResult);
    });

    it('should submit assessment and return result', async () => {
      const mockCreatedAssessment = {
        id: 123n,
        userId: 42n,
        templateId: 1n,
        sessionId: 'test-uuid-12345',
        answersJson: mockAnswers,
        totalScore: 21,
        severityCode: 'MID',
        resultSummary: '전문가 상담 권장',
        recommendedAction: JSON.stringify(['상담 받기']),
        completedAt: new Date('2025-01-06T12:00:00Z'),
      };

      mockPrisma.userAssessment.create.mockResolvedValue(mockCreatedAssessment);

      const result = await submitAssessment(42, 1, mockAnswers);

      expect(result).toEqual({
        assessmentId: 123,
        totalScore: 21,
        severityCode: 'MID',
        interpretation: mockScoringResult.interpretation,
        completedAt: '2025-01-06T12:00:00.000Z',
      });

      expect(mockPrisma.userAssessment.create).toHaveBeenCalledWith({
        data: {
          userId: 42,
          templateId: 1,
          sessionId: 'test-uuid-12345',
          answersJson: mockAnswers,
          totalScore: 21,
          severityCode: 'MID',
          resultSummary: '전문가 상담 권장',
          recommendedAction: JSON.stringify(['상담 받기']),
          completedAt: expect.any(Date),
        },
      });
    });

    it('should use provided sessionId', async () => {
      const mockCreatedAssessment = {
        id: 123n,
        sessionId: 'custom-session-id',
        totalScore: 21,
        severityCode: 'MID',
        completedAt: new Date(),
      };

      mockPrisma.userAssessment.create.mockResolvedValue(mockCreatedAssessment);

      await submitAssessment(42, 1, mockAnswers, 'custom-session-id');

      expect(mockPrisma.userAssessment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sessionId: 'custom-session-id',
          }),
        })
      );
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(submitAssessment(999, 1, mockAnswers)).rejects.toThrow(
        'User with ID 999 not found'
      );
    });

    it('should throw SubmissionError if answers are invalid', async () => {
      scoreAssessment.mockReturnValue({
        isValid: false,
        errors: ['Question 1 not found'],
        totalScore: null,
        severityCode: null,
        interpretation: null,
      });

      await expect(submitAssessment(42, 1, mockAnswers)).rejects.toThrow(
        SubmissionError
      );
      await expect(submitAssessment(42, 1, mockAnswers)).rejects.toThrow(
        'Invalid answers provided'
      );
    });

    it('should throw TypeError if inputs are invalid', async () => {
      await expect(submitAssessment('invalid', 1, mockAnswers)).rejects.toThrow(
        TypeError
      );
      await expect(submitAssessment(42, 'invalid', mockAnswers)).rejects.toThrow(
        TypeError
      );
      await expect(submitAssessment(42, 1, 'not-array')).rejects.toThrow(TypeError);
    });
  });

  describe('getAssessmentResult()', () => {
    const mockAssessment = {
      id: 123n,
      userId: 42n,
      totalScore: 21,
      severityCode: 'MID',
      completedAt: new Date('2025-01-06T12:00:00Z'),
      template: {
        id: 1n,
        templateCode: 'K10_V1',
        templateName: 'K-10 자가진단',
        templateType: 'mental_health',
        description: 'K-10 설명',
        questionCount: 10,
        interpretationJson: {
          MID: {
            title: '중등도',
            message: '전문가 상담 권장',
            recommendations: ['상담 받기'],
            urgency: 'medium',
            contactInfo: null,
            emergencyContact: null,
            warningMessage: null,
          },
        },
      },
    };

    it('should return full assessment result', async () => {
      mockPrisma.userAssessment.findUnique.mockResolvedValue(mockAssessment);

      const result = await getAssessmentResult(123, 42);

      expect(result).toEqual({
        id: 123,
        totalScore: 21,
        severityCode: 'MID',
        interpretation: {
          title: '중등도',
          message: '전문가 상담 권장',
          recommendations: ['상담 받기'],
          urgency: 'medium',
          contactInfo: null,
          emergencyContact: null,
          warningMessage: null,
        },
        template: {
          id: 1,
          code: 'K10_V1',
          name: 'K-10 자가진단',
          type: 'mental_health',
          description: 'K-10 설명',
          questionCount: 10,
        },
        completedAt: '2025-01-06T12:00:00.000Z',
      });
    });

    it('should throw AssessmentNotFoundError if assessment not found', async () => {
      mockPrisma.userAssessment.findUnique.mockResolvedValue(null);

      await expect(getAssessmentResult(999, 42)).rejects.toThrow(
        AssessmentNotFoundError
      );
    });

    it('should throw UnauthorizedAccessError if user does not own assessment', async () => {
      mockPrisma.userAssessment.findUnique.mockResolvedValue({
        ...mockAssessment,
        userId: 99n, // Different user
      });

      await expect(getAssessmentResult(123, 42)).rejects.toThrow(
        UnauthorizedAccessError
      );
      await expect(getAssessmentResult(123, 42)).rejects.toThrow(
        'You do not have permission to access this assessment'
      );
    });

    it('should throw TypeError if inputs are invalid', async () => {
      await expect(getAssessmentResult('invalid', 42)).rejects.toThrow(TypeError);
      await expect(getAssessmentResult(123, 'invalid')).rejects.toThrow(TypeError);
    });
  });

  describe('getUserAssessmentHistory()', () => {
    const mockAssessments = [
      {
        id: 123n,
        totalScore: 21,
        severityCode: 'MID',
        completedAt: new Date('2025-01-06T12:00:00Z'),
        template: {
          templateCode: 'K10_V1',
          templateName: 'K-10 자가진단',
          templateType: 'mental_health',
        },
      },
      {
        id: 122n,
        totalScore: 15,
        severityCode: 'LOW',
        completedAt: new Date('2025-01-05T12:00:00Z'),
        template: {
          templateCode: 'K10_V1',
          templateName: 'K-10 자가진단',
          templateType: 'mental_health',
        },
      },
    ];

    const mockAllAssessments = [
      { severityCode: 'LOW' },
      { severityCode: 'LOW' },
      { severityCode: 'MID' },
      { severityCode: 'HIGH' },
    ];

    it('should return paginated assessment history', async () => {
      mockPrisma.userAssessment.count.mockResolvedValue(2);
      mockPrisma.userAssessment.findMany
        .mockResolvedValueOnce(mockAssessments)
        .mockResolvedValueOnce(mockAllAssessments);

      const result = await getUserAssessmentHistory(42, { page: 1, limit: 10 });

      expect(result).toEqual({
        assessments: [
          {
            id: 123,
            templateCode: 'K10_V1',
            templateName: 'K-10 자가진단',
            totalScore: 21,
            severityCode: 'MID',
            completedAt: '2025-01-06T12:00:00.000Z',
          },
          {
            id: 122,
            templateCode: 'K10_V1',
            templateName: 'K-10 자가진단',
            totalScore: 15,
            severityCode: 'LOW',
            completedAt: '2025-01-05T12:00:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
        summary: {
          LOW: 2,
          MID: 1,
          HIGH: 1,
        },
      });
    });

    it('should filter by templateCode', async () => {
      mockPrisma.userAssessment.count.mockResolvedValue(1);
      mockPrisma.userAssessment.findMany
        .mockResolvedValueOnce([mockAssessments[0]])
        .mockResolvedValueOnce([mockAllAssessments[0]]);

      await getUserAssessmentHistory(42, { templateCode: 'K10_V1' });

      expect(mockPrisma.userAssessment.count).toHaveBeenCalledWith({
        where: {
          userId: 42,
          template: { templateCode: 'K10_V1' },
        },
      });
    });

    it('should filter by severityCode', async () => {
      mockPrisma.userAssessment.count.mockResolvedValue(1);
      mockPrisma.userAssessment.findMany
        .mockResolvedValueOnce([mockAssessments[1]])
        .mockResolvedValueOnce([mockAllAssessments[0]]);

      await getUserAssessmentHistory(42, { severityCode: 'LOW' });

      expect(mockPrisma.userAssessment.count).toHaveBeenCalledWith({
        where: {
          userId: 42,
          severityCode: 'LOW',
        },
      });
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      mockPrisma.userAssessment.count.mockResolvedValue(1);
      mockPrisma.userAssessment.findMany
        .mockResolvedValueOnce([mockAssessments[0]])
        .mockResolvedValueOnce([mockAllAssessments[0]]);

      await getUserAssessmentHistory(42, { startDate, endDate });

      expect(mockPrisma.userAssessment.count).toHaveBeenCalledWith({
        where: {
          userId: 42,
          completedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
    });

    it('should throw TypeError if userId is invalid', async () => {
      await expect(getUserAssessmentHistory('invalid')).rejects.toThrow(TypeError);
    });
  });

  describe('getLatestAssessment()', () => {
    const mockAssessment = {
      id: 123n,
      totalScore: 21,
      severityCode: 'MID',
      completedAt: new Date('2025-01-06T12:00:00Z'),
      template: {
        templateCode: 'K10_V1',
        templateName: 'K-10 자가진단',
        templateType: 'mental_health',
      },
    };

    it('should return latest assessment', async () => {
      mockPrisma.userAssessment.findFirst.mockResolvedValue(mockAssessment);

      const result = await getLatestAssessment(42);

      expect(result).toEqual({
        id: 123,
        templateCode: 'K10_V1',
        templateName: 'K-10 자가진단',
        totalScore: 21,
        severityCode: 'MID',
        completedAt: '2025-01-06T12:00:00.000Z',
      });

      expect(mockPrisma.userAssessment.findFirst).toHaveBeenCalledWith({
        where: { userId: 42 },
        include: {
          template: {
            select: {
              templateCode: true,
              templateName: true,
              templateType: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
      });
    });

    it('should filter by templateCode', async () => {
      mockPrisma.userAssessment.findFirst.mockResolvedValue(mockAssessment);

      await getLatestAssessment(42, 'K10_V1');

      expect(mockPrisma.userAssessment.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 42,
          template: { templateCode: 'K10_V1' },
        },
        include: {
          template: {
            select: {
              templateCode: true,
              templateName: true,
              templateType: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
      });
    });

    it('should return null if no assessment found', async () => {
      mockPrisma.userAssessment.findFirst.mockResolvedValue(null);

      const result = await getLatestAssessment(42);

      expect(result).toBeNull();
    });

    it('should throw TypeError if userId is invalid', async () => {
      await expect(getLatestAssessment('invalid')).rejects.toThrow(TypeError);
    });
  });

  describe('deleteAssessment()', () => {
    const mockAssessment = {
      id: 123n,
      userId: 42n,
    };

    it('should delete assessment successfully', async () => {
      mockPrisma.userAssessment.findUnique.mockResolvedValue(mockAssessment);
      mockPrisma.userAssessment.update.mockResolvedValue({ ...mockAssessment, userId: null });

      const result = await deleteAssessment(123, 42);

      expect(result).toBe(true);
      expect(mockPrisma.userAssessment.update).toHaveBeenCalledWith({
        where: { id: 123 },
        data: { userId: null },
      });
    });

    it('should throw AssessmentNotFoundError if assessment not found', async () => {
      mockPrisma.userAssessment.findUnique.mockResolvedValue(null);

      await expect(deleteAssessment(999, 42)).rejects.toThrow(
        AssessmentNotFoundError
      );
    });

    it('should throw UnauthorizedAccessError if user does not own assessment', async () => {
      mockPrisma.userAssessment.findUnique.mockResolvedValue({
        ...mockAssessment,
        userId: 99n,
      });

      await expect(deleteAssessment(123, 42)).rejects.toThrow(
        UnauthorizedAccessError
      );
    });

    it('should throw TypeError if inputs are invalid', async () => {
      await expect(deleteAssessment('invalid', 42)).rejects.toThrow(TypeError);
      await expect(deleteAssessment(123, 'invalid')).rejects.toThrow(TypeError);
    });
  });
});
