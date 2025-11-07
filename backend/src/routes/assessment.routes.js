/**
 * Assessment Routes
 *
 * Sprint 3: 자가진단 도구 구현 및 추천 시스템 연동
 * Task 3.1.4: API 엔드포인트 구현
 *
 * Endpoints:
 * - GET    /api/v1/assessments/templates          - Get all active templates (public)
 * - GET    /api/v1/assessments/templates/:id      - Get template by ID (public)
 * - POST   /api/v1/assessments                    - Submit assessment (protected)
 * - GET    /api/v1/assessments/:id/result         - Get assessment result (protected)
 * - GET    /api/v1/assessments/:id/recommendations - Get recommendations based on assessment (protected, Sprint 3 Task 3.4.2)
 * - GET    /api/v1/assessments/history            - Get user's history (protected)
 * - GET    /api/v1/assessments/latest             - Get latest assessment (protected)
 * - DELETE /api/v1/assessments/:id                - Delete assessment (protected)
 */

const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessment.controller');
const { getByAssessment } = require('../controllers/recommendationController.ts');
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  validateSchema,
  getTemplateByIdSchema,
  submitAssessmentSchema,
  getAssessmentResultSchema,
  getHistorySchema,
  deleteAssessmentSchema,
} = require('../utils/validation');

// ============================================
// Public Routes (No Authentication Required)
// ============================================

/**
 * @swagger
 * /assessments/templates:
 *   get:
 *     summary: Get all active assessment templates
 *     description: Retrieve a list of all available assessment templates
 *     tags: [Assessments]
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       templateCode:
 *                         type: string
 *                         example: K10_V1
 *                       name:
 *                         type: string
 *                         example: K-10 자가진단
 *                       description:
 *                         type: string
 *                       questionCount:
 *                         type: integer
 *                         example: 10
 */
router.get('/templates', assessmentController.getTemplates);

/**
 * @swagger
 * /assessments/templates/{id}:
 *   get:
 *     summary: Get assessment template by ID
 *     description: Retrieve a specific assessment template with questions and scoring rules
 *     tags: [Assessments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
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
 *                     id:
 *                       type: integer
 *                     templateCode:
 *                       type: string
 *                     name:
 *                       type: string
 *                     questions:
 *                       type: array
 *                     scoringRules:
 *                       type: object
 *                     interpretations:
 *                       type: object
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
 *                       example: TEMPLATE_NOT_FOUND
 *                     message:
 *                       type: string
 */
router.get(
  '/templates/:id',
  validateSchema(getTemplateByIdSchema),
  assessmentController.getTemplateById
);

/**
 * @swagger
 * /assessments:
 *   post:
 *     summary: Submit a new assessment
 *     description: Submit user answers and receive scored results (Anonymous or authenticated)
 *     tags: [Assessments]
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
 *               templateId:
 *                 type: integer
 *                 example: 1
 *               answers:
 *                 type: array
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
 *                       minimum: 1
 *                       maximum: 4
 *                       example: 2
 *               sessionId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional session ID for tracking
 *     responses:
 *       201:
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
 *                     totalScore:
 *                       type: number
 *                     severityCode:
 *                       type: string
 *                       enum: [LOW, MID, HIGH]
 *                     interpretation:
 *                       type: object
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or submission error
 */
router.post(
  '/',
  validateSchema(submitAssessmentSchema),
  assessmentController.submitAssessment
);

// ============================================
// Protected Routes (Authentication Required)
// ============================================

// Apply auth middleware to all routes below
router.use(authMiddleware);

/**
 * @swagger
 * /assessments/{id}/result:
 *   get:
 *     summary: Get assessment result by ID
 *     description: Retrieve full assessment result with interpretation
 *     tags: [Assessments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Assessment result retrieved successfully
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
 *                     id:
 *                       type: integer
 *                     totalScore:
 *                       type: number
 *                     severityCode:
 *                       type: string
 *                     interpretation:
 *                       type: object
 *                     template:
 *                       type: object
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - assessment belongs to another user
 *       404:
 *         description: Assessment not found
 */
router.get(
  '/:id/result',
  validateSchema(getAssessmentResultSchema),
  assessmentController.getAssessmentResult
);

/**
 * @swagger
 * /assessments/{id}/recommendations:
 *   get:
 *     summary: Get recommendations based on assessment
 *     description: Retrieve personalized center recommendations using assessment results (Sprint 3 - Task 3.4.2)
 *     tags: [Assessments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assessment ID
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -90
 *           maximum: 90
 *         description: User's latitude
 *         example: 37.5665
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -180
 *           maximum: 180
 *         description: User's longitude
 *         example: 126.9780
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum search radius in kilometers
 *         example: 10
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 5
 *         description: Maximum number of recommendations
 *         example: 5
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
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
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           centerId:
 *                             type: string
 *                           centerName:
 *                             type: string
 *                           totalScore:
 *                             type: number
 *                           scores:
 *                             type: object
 *                             properties:
 *                               distance:
 *                                 type: number
 *                               operating:
 *                                 type: number
 *                               specialty:
 *                                 type: number
 *                               program:
 *                                 type: number
 *                           reasons:
 *                             type: array
 *                             items:
 *                               type: string
 *                           center:
 *                             type: object
 *                             properties:
 *                               roadAddress:
 *                                 type: string
 *                               phoneNumber:
 *                                 type: string
 *                                 nullable: true
 *                               distance:
 *                                 type: number
 *                               walkTime:
 *                                 type: string
 *                     totalCount:
 *                       type: integer
 *                     searchCriteria:
 *                       type: object
 *                       properties:
 *                         assessmentId:
 *                           type: integer
 *                         latitude:
 *                           type: number
 *                         longitude:
 *                           type: number
 *                         maxDistance:
 *                           type: number
 *                         limit:
 *                           type: integer
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/recommendations', getByAssessment);

/**
 * @swagger
 * /assessments/history:
 *   get:
 *     summary: Get user's assessment history
 *     description: Retrieve paginated list of user's assessments with optional filters
 *     tags: [Assessments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: templateCode
 *         schema:
 *           type: string
 *         description: Filter by template code
 *       - in: query
 *         name: severityCode
 *         schema:
 *           type: string
 *           enum: [LOW, MID, HIGH]
 *         description: Filter by severity
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by date range (start)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by date range (end)
 *     responses:
 *       200:
 *         description: History retrieved successfully
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
 *                     assessments:
 *                       type: array
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     summary:
 *                       type: object
 *                       description: Count by severity
 *       401:
 *         description: Unauthorized
 */
router.get('/history', validateSchema(getHistorySchema), assessmentController.getAssessmentHistory);

/**
 * @swagger
 * /assessments/latest:
 *   get:
 *     summary: Get user's latest assessment
 *     description: Retrieve the most recent assessment for the user
 *     tags: [Assessments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: templateCode
 *         schema:
 *           type: string
 *         description: Optional template code filter
 *     responses:
 *       200:
 *         description: Latest assessment retrieved successfully (null if no assessments)
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
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                     templateCode:
 *                       type: string
 *                     templateName:
 *                       type: string
 *                     totalScore:
 *                       type: number
 *                     severityCode:
 *                       type: string
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/latest', assessmentController.getLatestAssessment);

/**
 * @swagger
 * /assessments/{id}:
 *   delete:
 *     summary: Delete an assessment
 *     description: Soft delete an assessment (sets userId to null)
 *     tags: [Assessments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Assessment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Assessment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - assessment belongs to another user
 *       404:
 *         description: Assessment not found
 */
router.delete(
  '/:id',
  validateSchema(deleteAssessmentSchema),
  assessmentController.deleteAssessment
);

module.exports = router;
