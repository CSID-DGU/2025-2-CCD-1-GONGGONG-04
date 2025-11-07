/**
 * Assessment Service
 *
 * Sprint 3: 자가진단 도구 구현
 * Task 3.1.3: 진단 서비스 구현
 *
 * 기능:
 * 1. 진단 템플릿 조회 (활성화된 템플릿 목록)
 * 2. 자가진단 제출 및 채점 (scoring.service 연동)
 * 3. 진단 결과 조회 (해석 및 권장사항 포함)
 * 4. 진단 이력 관리 (페이지네이션, 필터링)
 * 5. 권한 검증 (사용자별 진단 데이터 접근 제어)
 */

const { PrismaClient } = require('@prisma/client');
const { scoreAssessment } = require('./scoring.service');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Custom error classes
class AssessmentNotFoundError extends Error {
  constructor(message = 'Assessment not found') {
    super(message);
    this.name = 'AssessmentNotFoundError';
  }
}

class UnauthorizedAccessError extends Error {
  constructor(message = 'Unauthorized access to assessment') {
    super(message);
    this.name = 'UnauthorizedAccessError';
  }
}

class InvalidTemplateError extends Error {
  constructor(message = 'Invalid or inactive template') {
    super(message);
    this.name = 'InvalidTemplateError';
  }
}

class SubmissionError extends Error {
  constructor(message = 'Assessment submission failed', errors = []) {
    super(message);
    this.name = 'SubmissionError';
    this.errors = errors;
  }
}

/**
 * Get all available assessment templates
 *
 * @returns {Promise<Array>} List of active templates
 *
 * @example
 * const templates = await getTemplates();
 * // [{ id: 1, templateCode: 'K10_V1', templateName: 'K-10 자가진단', ... }]
 */
async function getTemplates() {
  try {
    const templates = await prisma.selfAssessmentTemplate.findMany({
      where: {
        isActive: true,
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return templates;
  } catch (error) {
    throw new Error(`Failed to retrieve templates: ${error.message}`);
  }
}

/**
 * Get a specific template by ID
 *
 * @param {number} templateId - Template ID
 * @returns {Promise<Object>} Template with questions and scoring rules
 * @throws {InvalidTemplateError} If template not found or inactive
 *
 * @example
 * const template = await getTemplateById(1);
 * // { id: 1, questionsJson: [...], scoringRulesJson: {...}, ... }
 */
async function getTemplateById(templateId) {
  if (!templateId || typeof templateId !== 'number') {
    throw new TypeError('Template ID must be a number');
  }

  try {
    const template = await prisma.selfAssessmentTemplate.findUnique({
      where: {
        id: templateId,
      },
    });

    if (!template) {
      throw new InvalidTemplateError(`Template with ID ${templateId} not found`);
    }

    if (!template.isActive) {
      throw new InvalidTemplateError(`Template with ID ${templateId} is not active`);
    }

    // Convert JSON fields to camelCase for scoring.service compatibility
    const { keysToCamel } = require('../utils/caseConverter');

    return {
      ...template,
      questionsJson: keysToCamel(template.questionsJson),
      scoringRulesJson: keysToCamel(template.scoringRulesJson),
      interpretationJson: keysToCamel(template.interpretationJson),
    };
  } catch (error) {
    if (error instanceof InvalidTemplateError) {
      throw error;
    }
    throw new Error(`Failed to retrieve template: ${error.message}`);
  }
}

/**
 * Get template by code (e.g., 'K10_V1')
 *
 * @param {string} templateCode - Template code
 * @returns {Promise<Object>} Template details
 * @throws {InvalidTemplateError} If template not found or inactive
 *
 * @example
 * const template = await getTemplateByCode('K10_V1');
 */
async function getTemplateByCode(templateCode) {
  if (!templateCode || typeof templateCode !== 'string') {
    throw new TypeError('Template code must be a string');
  }

  try {
    const template = await prisma.selfAssessmentTemplate.findUnique({
      where: {
        templateCode,
      },
    });

    if (!template) {
      throw new InvalidTemplateError(`Template with code ${templateCode} not found`);
    }

    if (!template.isActive) {
      throw new InvalidTemplateError(`Template with code ${templateCode} is not active`);
    }

    return template;
  } catch (error) {
    if (error instanceof InvalidTemplateError) {
      throw error;
    }
    throw new Error(`Failed to retrieve template: ${error.message}`);
  }
}

/**
 * Submit a user assessment
 *
 * @param {number} userId - User ID
 * @param {number} templateId - Template ID
 * @param {Array} answers - User answers [{questionId, selectedOption}, ...]
 * @param {string} sessionId - Session ID (optional, will generate if not provided)
 * @returns {Promise<Object>} Assessment result with ID, score, severity
 * @throws {InvalidTemplateError} If template not found or inactive
 * @throws {SubmissionError} If answers validation fails
 *
 * @example
 * const result = await submitAssessment(42, 1, [
 *   { questionId: 1, selectedOption: 2 },
 *   { questionId: 2, selectedOption: 3 }
 * ]);
 * // {
 * //   assessmentId: 123,
 * //   totalScore: 21,
 * //   severityCode: 'MID',
 * //   interpretation: { ... },
 * //   completedAt: '2025-01-06T12:00:00Z'
 * // }
 */
async function submitAssessment(userId, templateId, answers, sessionId = null) {
  // Input validation
  if (userId !== null && typeof userId !== 'number') {
    throw new TypeError('User ID must be a number or null');
  }

  if (!templateId || typeof templateId !== 'number') {
    throw new TypeError('Template ID must be a number');
  }

  if (!Array.isArray(answers)) {
    throw new TypeError('Answers must be an array');
  }

  try {
    // Verify user exists (only if userId is provided)
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
    }

    // Get template and validate
    const template = await getTemplateById(templateId);

    // Score the assessment using scoring.service
    const scoringResult = scoreAssessment(answers, template);

    if (!scoringResult.isValid) {
      throw new SubmissionError('Invalid answers provided', scoringResult.errors);
    }

    // Generate session ID if not provided
    const finalSessionId = sessionId || uuidv4();

    // Store assessment in database
    const assessment = await prisma.userAssessment.create({
      data: {
        userId,
        templateId,
        sessionId: finalSessionId,
        answersJson: answers,
        totalScore: scoringResult.totalScore,
        severityCode: scoringResult.severityCode,
        resultSummary: scoringResult.interpretation.message,
        recommendedAction: JSON.stringify(scoringResult.interpretation.recommendations),
        completedAt: new Date(),
      },
    });

    // Return assessment result
    return {
      assessmentId: Number(assessment.id),
      totalScore: Number(assessment.totalScore),
      severityCode: assessment.severityCode,
      interpretation: scoringResult.interpretation,
      completedAt: assessment.completedAt.toISOString(),
    };
  } catch (error) {
    if (error instanceof InvalidTemplateError || error instanceof SubmissionError) {
      throw error;
    }
    throw new Error(`Assessment submission failed: ${error.message}`);
  }
}

/**
 * Get assessment result by ID
 *
 * @param {number} assessmentId - Assessment ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<Object>} Full assessment result with interpretation
 * @throws {AssessmentNotFoundError} If assessment not found
 * @throws {UnauthorizedAccessError} If user doesn't own the assessment
 *
 * @example
 * const result = await getAssessmentResult(123, 42);
 * // {
 * //   id: 123,
 * //   totalScore: 21,
 * //   severityCode: 'MID',
 * //   interpretation: { ... },
 * //   template: { name: 'K-10 자가진단', ... },
 * //   completedAt: '2025-01-06T12:00:00Z'
 * // }
 */
async function getAssessmentResult(assessmentId, userId) {
  if (!assessmentId || typeof assessmentId !== 'number') {
    throw new TypeError('Assessment ID must be a number');
  }

  if (!userId || typeof userId !== 'number') {
    throw new TypeError('User ID must be a number');
  }

  try {
    const assessment = await prisma.userAssessment.findUnique({
      where: {
        id: assessmentId,
      },
      include: {
        template: {
          select: {
            id: true,
            templateCode: true,
            templateName: true,
            templateType: true,
            description: true,
            questionCount: true,
            interpretationJson: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new AssessmentNotFoundError(`Assessment with ID ${assessmentId} not found`);
    }

    // Authorization check
    if (Number(assessment.userId) !== userId) {
      throw new UnauthorizedAccessError(
        'You do not have permission to access this assessment'
      );
    }

    // Get full interpretation from template
    const interpretation = assessment.template.interpretationJson[assessment.severityCode];

    return {
      id: Number(assessment.id),
      totalScore: Number(assessment.totalScore),
      severityCode: assessment.severityCode,
      interpretation: {
        title: interpretation.title,
        message: interpretation.message,
        recommendations: interpretation.recommendations || [],
        urgency: interpretation.urgency || 'low',
        contactInfo: interpretation.contactInfo || null,
        emergencyContact: interpretation.emergencyContact || null,
        warningMessage: interpretation.warningMessage || null,
      },
      template: {
        id: Number(assessment.template.id),
        code: assessment.template.templateCode,
        name: assessment.template.templateName,
        type: assessment.template.templateType,
        description: assessment.template.description,
        questionCount: assessment.template.questionCount,
      },
      completedAt: assessment.completedAt.toISOString(),
    };
  } catch (error) {
    if (
      error instanceof AssessmentNotFoundError ||
      error instanceof UnauthorizedAccessError
    ) {
      throw error;
    }
    throw new Error(`Failed to retrieve assessment result: ${error.message}`);
  }
}

/**
 * Get user's assessment history
 *
 * @param {number} userId - User ID
 * @param {Object} options - Pagination and filter options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.templateCode - Filter by template code
 * @param {string} options.severityCode - Filter by severity (LOW/MID/HIGH)
 * @param {Date} options.startDate - Filter by date range (start)
 * @param {Date} options.endDate - Filter by date range (end)
 * @returns {Promise<Object>} {assessments: Array, total: number, page: number, totalPages: number}
 *
 * @example
 * const history = await getUserAssessmentHistory(42, { page: 1, limit: 10 });
 * // {
 * //   assessments: [ ... ],
 * //   total: 5,
 * //   page: 1,
 * //   totalPages: 1,
 * //   summary: { LOW: 2, MID: 2, HIGH: 1 }
 * // }
 */
async function getUserAssessmentHistory(userId, options = {}) {
  if (!userId || typeof userId !== 'number') {
    throw new TypeError('User ID must be a number');
  }

  const {
    page = 1,
    limit = 10,
    templateCode = null,
    severityCode = null,
    startDate = null,
    endDate = null,
  } = options;

  // Build where clause
  const whereClause = {
    userId,
  };

  if (templateCode) {
    whereClause.template = {
      templateCode,
    };
  }

  if (severityCode) {
    whereClause.severityCode = severityCode;
  }

  if (startDate || endDate) {
    whereClause.completedAt = {};
    if (startDate) {
      whereClause.completedAt.gte = new Date(startDate);
    }
    if (endDate) {
      whereClause.completedAt.lte = new Date(endDate);
    }
  }

  try {
    // Get total count
    const total = await prisma.userAssessment.count({
      where: whereClause,
    });

    // Get assessments with pagination
    const assessments = await prisma.userAssessment.findMany({
      where: whereClause,
      include: {
        template: {
          select: {
            templateCode: true,
            templateName: true,
            templateType: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get summary statistics
    const allAssessments = await prisma.userAssessment.findMany({
      where: { userId },
      select: {
        severityCode: true,
      },
    });

    const summary = allAssessments.reduce((acc, assessment) => {
      const severity = assessment.severityCode;
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});

    return {
      assessments: assessments.map(assessment => ({
        id: Number(assessment.id),
        templateCode: assessment.template.templateCode,
        templateName: assessment.template.templateName,
        totalScore: Number(assessment.totalScore),
        severityCode: assessment.severityCode,
        completedAt: assessment.completedAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary,
    };
  } catch (error) {
    throw new Error(`Failed to retrieve assessment history: ${error.message}`);
  }
}

/**
 * Get latest assessment for a user
 *
 * @param {number} userId - User ID
 * @param {string} templateCode - Optional template code filter
 * @returns {Promise<Object|null>} Latest assessment or null
 *
 * @example
 * const latest = await getLatestAssessment(42, 'K10_V1');
 * // { id: 123, totalScore: 21, severityCode: 'MID', ... }
 */
async function getLatestAssessment(userId, templateCode = null) {
  if (!userId || typeof userId !== 'number') {
    throw new TypeError('User ID must be a number');
  }

  const whereClause = {
    userId,
  };

  if (templateCode) {
    whereClause.template = {
      templateCode,
    };
  }

  try {
    const assessment = await prisma.userAssessment.findFirst({
      where: whereClause,
      include: {
        template: {
          select: {
            templateCode: true,
            templateName: true,
            templateType: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    if (!assessment) {
      return null;
    }

    return {
      id: Number(assessment.id),
      templateCode: assessment.template.templateCode,
      templateName: assessment.template.templateName,
      totalScore: Number(assessment.totalScore),
      severityCode: assessment.severityCode,
      completedAt: assessment.completedAt.toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to retrieve latest assessment: ${error.message}`);
  }
}

/**
 * Delete an assessment (soft delete by setting userId to null)
 *
 * @param {number} assessmentId - Assessment ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 * @throws {AssessmentNotFoundError} If assessment not found
 * @throws {UnauthorizedAccessError} If user doesn't own the assessment
 *
 * @example
 * const success = await deleteAssessment(123, 42);
 * // true
 */
async function deleteAssessment(assessmentId, userId) {
  if (!assessmentId || typeof assessmentId !== 'number') {
    throw new TypeError('Assessment ID must be a number');
  }

  if (!userId || typeof userId !== 'number') {
    throw new TypeError('User ID must be a number');
  }

  try {
    // Check if assessment exists and belongs to user
    const assessment = await prisma.userAssessment.findUnique({
      where: {
        id: assessmentId,
      },
    });

    if (!assessment) {
      throw new AssessmentNotFoundError(`Assessment with ID ${assessmentId} not found`);
    }

    // Authorization check
    if (Number(assessment.userId) !== userId) {
      throw new UnauthorizedAccessError(
        'You do not have permission to delete this assessment'
      );
    }

    // Soft delete by setting userId to null
    await prisma.userAssessment.update({
      where: {
        id: assessmentId,
      },
      data: {
        userId: null,
      },
    });

    return true;
  } catch (error) {
    if (
      error instanceof AssessmentNotFoundError ||
      error instanceof UnauthorizedAccessError
    ) {
      throw error;
    }
    throw new Error(`Failed to delete assessment: ${error.message}`);
  }
}

module.exports = {
  getTemplates,
  getTemplateById,
  getTemplateByCode,
  submitAssessment,
  getAssessmentResult,
  getUserAssessmentHistory,
  getLatestAssessment,
  deleteAssessment,
  // Export error classes for testing
  AssessmentNotFoundError,
  UnauthorizedAccessError,
  InvalidTemplateError,
  SubmissionError,
};
