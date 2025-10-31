/**
 * Self-Assessment Controller
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.7: Self-Assessment Controller 구현
 *
 * 기능:
 * 1. 자가진단 템플릿 조회
 * 2. 자가진단 제출 및 채점
 */

const { assessmentSubmitSchema, assessmentTemplateQuerySchema } = require('../utils/validation');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * 자가진단 템플릿 조회
 *
 * GET /api/v1/self-assessments/templates/:templateId
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
exports.getTemplate = async (req, res, next) => {
  try {
    // 1. 입력 검증
    const validated = assessmentTemplateQuerySchema.parse({
      templateId: req.params.templateId,
    });
    const { templateId } = validated;

    // 2. 템플릿 조회 (활성화된 것만)
    const template = await prisma.selfAssessmentTemplate.findFirst({
      where: {
        id: BigInt(templateId),
        isActive: true,
      },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '템플릿을 찾을 수 없습니다',
        },
      });
    }

    // 3. 응답 포맷팅
    res.json({
      success: true,
      data: {
        templateId: Number(template.id), // Convert BigInt to Number
        templateName: template.templateName,
        templateType: template.templateType,
        description: template.description,
        questions: template.questionsJson,
        scoringRules: template.scoringRulesJson,
        version: template.version,
      },
    });
  } catch (error) {
    // Zod 검증 에러
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '잘못된 템플릿 ID입니다',
          details: error.errors,
        },
      });
    }

    next(error);
  }
};

/**
 * 자가진단 제출 및 채점
 *
 * POST /api/v1/self-assessments/submit
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
exports.submitAssessment = async (req, res, next) => {
  try {
    // 1. 입력 검증
    const validated = assessmentSubmitSchema.parse(req.body);
    const { userId, sessionId, templateId, answers } = validated;

    // 2. 템플릿 조회
    const template = await prisma.selfAssessmentTemplate.findFirst({
      where: {
        id: BigInt(templateId),
        isActive: true,
      },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '템플릿을 찾을 수 없습니다',
        },
      });
    }

    // 3. 점수 계산
    const totalScore = answers.reduce((sum, answer) => {
      return sum + answer.selectedOption;
    }, 0);

    // 4. 심각도 판정 (scoringRulesJson 기준)
    const scoringRules = template.scoringRulesJson;
    const totalPoints = scoringRules.totalPoints || 27; // PHQ-9 기준

    let severity = 'LOW';
    if (totalScore >= totalPoints * 0.67) {
      severity = 'HIGH'; // 18점 이상
    } else if (totalScore >= totalPoints * 0.33) {
      severity = 'MID'; // 9-17점
    }

    // 5. 해석 결과 조회
    const interpretation = template.interpretationJson;
    let resultMessage = '';
    let recommendation = '';

    if (severity === 'HIGH') {
      resultMessage = interpretation.highSeverity?.message || '높은 수준';
      recommendation = interpretation.highSeverity?.recommendation || '전문가 상담 권장';
    } else if (severity === 'MID') {
      resultMessage = interpretation.midSeverity?.message || '중간 수준';
      recommendation = interpretation.midSeverity?.recommendation || '관리 필요';
    } else {
      resultMessage = interpretation.lowSeverity?.message || '낮은 수준';
      recommendation = interpretation.lowSeverity?.recommendation || '양호';
    }

    // 6. DB 저장
    const assessment = await prisma.userAssessment.create({
      data: {
        userId: userId ? BigInt(userId) : null,
        sessionId: sessionId || null,
        templateId: BigInt(templateId),
        totalScore: totalScore,
        severityCode: severity, // Use severityCode field
        answersJson: answers,
        resultSummary: resultMessage, // Add result summary
        recommendedAction: recommendation, // Add recommended action
      },
    });

    // 7. 응답 포맷팅
    res.json({
      success: true,
      data: {
        assessmentId: Number(assessment.id), // Convert BigInt to Number
        templateName: template.templateName,
        totalScore: Number(assessment.totalScore), // Convert Decimal to Number
        maxScore: totalPoints,
        severity: severity,
        result: {
          message: resultMessage,
          recommendation: recommendation,
        },
        assessedAt: assessment.completedAt, // Use completedAt field
      },
    });
  } catch (error) {
    // Zod 검증 에러
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '입력 데이터가 유효하지 않습니다',
          details: error.errors,
        },
      });
    }

    next(error);
  }
};
