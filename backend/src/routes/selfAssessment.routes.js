/**
 * Self-Assessment Routes
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.8: API 라우팅 설정
 *
 * 엔드포인트:
 * - GET /api/v1/self-assessments/templates/:templateId - 템플릿 조회
 * - POST /api/v1/self-assessments/submit - 자가진단 제출
 */

const express = require('express');
const router = express.Router();
const selfAssessmentController = require('../controllers/selfAssessmentController');

/**
 * @swagger
 * /api/v1/self-assessments/templates/{templateId}:
 *   get:
 *     summary: Get self-assessment template by ID
 *     description: Retrieve a self-assessment template with questions and scoring rules
 *     tags: [Self-Assessment]
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         description: Template ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     templateId:
 *                       type: integer
 *                       example: 2
 *                     templateName:
 *                       type: string
 *                       example: 우울증 자가진단 (PHQ-9)
 *                     templateType:
 *                       type: string
 *                       example: depression
 *                     description:
 *                       type: string
 *                       example: PHQ-9 기반 우울증 자가진단 도구
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     scoringRules:
 *                       type: object
 *                     version:
 *                       type: string
 *                       example: "1.0"
 *       404:
 *         description: Template not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: NOT_FOUND
 *                     message:
 *                       type: string
 *                       example: 템플릿을 찾을 수 없습니다
 */
router.get('/templates/:templateId', selfAssessmentController.getTemplate);

/**
 * @swagger
 * /api/v1/self-assessments/submit:
 *   post:
 *     summary: Submit self-assessment answers
 *     description: Submit user's answers to a self-assessment template and receive scored results
 *     tags: [Self-Assessment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - answers
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID (optional, for logged-in users)
 *                 example: 1
 *               sessionId:
 *                 type: string
 *                 description: Session ID (required for anonymous users)
 *                 example: test-session-123
 *               templateId:
 *                 type: integer
 *                 description: Template ID
 *                 example: 2
 *               answers:
 *                 type: array
 *                 description: Array of answers (10 items for PHQ-9)
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionId
 *                     - selectedOption
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                       example: 1
 *                     selectedOption:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 3
 *                       example: 2
 *     responses:
 *       200:
 *         description: Assessment submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     assessmentId:
 *                       type: integer
 *                       example: 1
 *                     templateName:
 *                       type: string
 *                       example: 우울증 자가진단 (PHQ-9)
 *                     totalScore:
 *                       type: number
 *                       example: 15
 *                     maxScore:
 *                       type: number
 *                       example: 27
 *                     severity:
 *                       type: string
 *                       enum: [LOW, MID, HIGH]
 *                       example: MID
 *                     result:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: 중간 수준의 우울감이 있습니다
 *                         recommendation:
 *                           type: string
 *                           example: 전문가 상담 권장
 *                     assessedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-31T03:53:41.000Z
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     message:
 *                       type: string
 *                       example: 입력 데이터가 유효하지 않습니다
 */
router.post('/submit', selfAssessmentController.submitAssessment);

module.exports = router;
