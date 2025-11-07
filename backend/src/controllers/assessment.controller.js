/**
 * Assessment Controller
 *
 * Sprint 3: 자가진단 도구 구현 및 추천 시스템 연동
 * Task 3.1.4: API 엔드포인트 구현
 *
 * Provides RESTful API handlers for the assessment service.
 * Handles HTTP request/response, validation, and error formatting.
 *
 * Security:
 * - Templates: Public (no auth required)
 * - Assessments: Protected (auth required)
 * - Authorization: Users can only access their own assessments
 */

const assessmentService = require('../services/assessment.service');
const { keysToCamel } = require('../utils/caseConverter');

/**
 * Get all active assessment templates
 *
 * GET /api/v1/assessments/templates
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 *
 * @returns {Object} {success: true, data: [templates]}
 *
 * @example
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "templateCode": "K10_V1",
 *       "name": "K-10 자가진단",
 *       "description": "...",
 *       "questionCount": 10
 *     }
 *   ]
 * }
 */
async function getTemplates(req, res, next) {
  try {
    const templates = await assessmentService.getTemplates();

    res.json({
      success: true,
      data: templates.map(template => ({
        id: template.id,
        templateCode: template.templateCode,
        name: template.templateName,
        type: template.templateType,
        description: template.description,
        questionCount: template.questionCount,
        estimatedTimeMinutes: template.estimatedTimeMinutes,
        version: template.version,
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific template by ID
 *
 * GET /api/v1/assessments/templates/:id
 *
 * @param {Object} req - Express request
 * @param {Object} req.params.id - Template ID (from URL)
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 *
 * @returns {Object} {success: true, data: {template with questions}}
 *
 * @example
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "templateCode": "K10_V1",
 *     "name": "K-10 자가진단",
 *     "questions": [...],
 *     "scoringRules": {...},
 *     "interpretations": {...}
 *   }
 * }
 */
async function getTemplateById(req, res, next) {
  try {
    // Template ID validation is handled by Zod middleware
    const templateId = Number(req.params.id);

    const template = await assessmentService.getTemplateById(templateId);

    res.json({
      success: true,
      data: {
        id: template.id,
        templateCode: template.templateCode,
        name: template.templateName,
        type: template.templateType,
        description: template.description,
        questionCount: template.questionCount,
        estimatedTimeMinutes: template.estimatedTimeMinutes,
        questionsJson: keysToCamel(template.questionsJson),
        scoringRulesJson: keysToCamel(template.scoringRulesJson),
        interpretationsJson: keysToCamel(template.interpretationJson),
        version: template.version,
        isActive: template.isActive,
      },
    });
  } catch (error) {
    if (error instanceof assessmentService.InvalidTemplateError) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: error.message,
        },
      });
    }
    next(error);
  }
}

/**
 * Submit a new assessment
 *
 * POST /api/v1/assessments
 *
 * @param {Object} req - Express request
 * @param {number} req.user.id - User ID (from auth middleware)
 * @param {Object} req.body - Request body
 * @param {number} req.body.templateId - Template ID
 * @param {Array} req.body.answers - User answers
 * @param {string} req.body.sessionId - Optional session ID
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 *
 * @returns {Object} {success: true, data: {assessment result}}
 *
 * @example
 * Request:
 * {
 *   "templateId": 1,
 *   "answers": [
 *     {"questionId": 1, "selectedOption": 2},
 *     ...
 *   ],
 *   "sessionId": "optional-uuid"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "assessmentId": 123,
 *     "totalScore": 21,
 *     "severityCode": "MID",
 *     "interpretation": {...},
 *     "completedAt": "2025-01-06T12:00:00Z"
 *   }
 * }
 */
async function submitAssessment(req, res, next) {
  try {
    // User ID comes from auth middleware (optional - can be anonymous)
    const userId = req.user?.id || null;

    // Request body validation is handled by Zod middleware
    const { templateId, answers, sessionId } = req.body;

    const result = await assessmentService.submitAssessment(
      userId,
      templateId,
      answers,
      sessionId,
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof assessmentService.InvalidTemplateError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TEMPLATE',
          message: error.message,
        },
      });
    }

    if (error instanceof assessmentService.SubmissionError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SUBMISSION_ERROR',
          message: error.message,
          details: error.errors,
        },
      });
    }

    next(error);
  }
}

/**
 * Get assessment result by ID
 *
 * GET /api/v1/assessments/:id/result
 *
 * @param {Object} req - Express request
 * @param {Object} req.params.id - Assessment ID
 * @param {number} req.user.id - User ID (from auth middleware)
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 *
 * @returns {Object} {success: true, data: {full assessment result}}
 *
 * @example
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "totalScore": 21,
 *     "severityCode": "MID",
 *     "interpretation": {...},
 *     "template": {...},
 *     "completedAt": "2025-01-06T12:00:00Z"
 *   }
 * }
 */
async function getAssessmentResult(req, res, next) {
  try {
    const assessmentId = Number(req.params.id);
    const userId = req.user.id;

    const result = await assessmentService.getAssessmentResult(assessmentId, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof assessmentService.AssessmentNotFoundError) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ASSESSMENT_NOT_FOUND',
          message: error.message,
        },
      });
    }

    if (error instanceof assessmentService.UnauthorizedAccessError) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_ACCESS',
          message: error.message,
        },
      });
    }

    next(error);
  }
}

/**
 * Get user's assessment history
 *
 * GET /api/v1/assessments/history
 *
 * @param {Object} req - Express request
 * @param {number} req.user.id - User ID (from auth middleware)
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.page - Page number (default: 1)
 * @param {number} req.query.limit - Items per page (default: 10)
 * @param {string} req.query.templateCode - Filter by template
 * @param {string} req.query.severityCode - Filter by severity
 * @param {string} req.query.startDate - Filter by date range start
 * @param {string} req.query.endDate - Filter by date range end
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 *
 * @returns {Object} {success: true, data: {assessments, pagination, summary}}
 *
 * @example
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "assessments": [...],
 *     "total": 25,
 *     "page": 1,
 *     "totalPages": 3,
 *     "summary": {
 *       "LOW": 10,
 *       "MID": 12,
 *       "HIGH": 3
 *     }
 *   }
 * }
 */
async function getAssessmentHistory(req, res, next) {
  try {
    const userId = req.user.id;

    // Query parameters validation is handled by Zod middleware
    const options = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      templateCode: req.query.templateCode || null,
      severityCode: req.query.severityCode || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const history = await assessmentService.getUserAssessmentHistory(userId, options);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user's latest assessment
 *
 * GET /api/v1/assessments/latest
 *
 * @param {Object} req - Express request
 * @param {number} req.user.id - User ID (from auth middleware)
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.templateCode - Optional template filter
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 *
 * @returns {Object} {success: true, data: {latest assessment or null}}
 *
 * @example
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "templateCode": "K10_V1",
 *     "templateName": "K-10 자가진단",
 *     "totalScore": 21,
 *     "severityCode": "MID",
 *     "completedAt": "2025-01-06T12:00:00Z"
 *   }
 * }
 */
async function getLatestAssessment(req, res, next) {
  try {
    const userId = req.user.id;
    const templateCode = req.query.templateCode || null;

    const latest = await assessmentService.getLatestAssessment(userId, templateCode);

    res.json({
      success: true,
      data: latest,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an assessment (soft delete)
 *
 * DELETE /api/v1/assessments/:id
 *
 * @param {Object} req - Express request
 * @param {Object} req.params.id - Assessment ID
 * @param {number} req.user.id - User ID (from auth middleware)
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 *
 * @returns {Object} {success: true, message}
 *
 * @example
 * Response:
 * {
 *   "success": true,
 *   "message": "Assessment deleted successfully"
 * }
 */
async function deleteAssessment(req, res, next) {
  try {
    const assessmentId = Number(req.params.id);
    const userId = req.user.id;

    await assessmentService.deleteAssessment(assessmentId, userId);

    res.json({
      success: true,
      message: 'Assessment deleted successfully',
    });
  } catch (error) {
    if (error instanceof assessmentService.AssessmentNotFoundError) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ASSESSMENT_NOT_FOUND',
          message: error.message,
        },
      });
    }

    if (error instanceof assessmentService.UnauthorizedAccessError) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_ACCESS',
          message: error.message,
        },
      });
    }

    next(error);
  }
}

module.exports = {
  getTemplates,
  getTemplateById,
  submitAssessment,
  getAssessmentResult,
  getAssessmentHistory,
  getLatestAssessment,
  deleteAssessment,
};
