/**
 * Recommendation Routes
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.8: API 라우팅 설정
 *
 * 엔드포인트:
 * - POST /api/v1/recommendations/calculate - 추천 센터 계산
 */

const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

/**
 * @swagger
 * /api/v1/recommendations/calculate:
 *   post:
 *     summary: Calculate recommended centers
 *     description: Calculate and return recommended mental health centers based on user location and preferences
 *     tags: [Recommendations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID (optional, for logged-in users)
 *                 example: 1
 *               sessionId:
 *                 type: string
 *                 description: Session ID (required for anonymous users)
 *                 example: test-session-456
 *               location:
 *                 type: object
 *                 required:
 *                   - latitude
 *                   - longitude
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     format: double
 *                     minimum: -90
 *                     maximum: 90
 *                     description: User's latitude
 *                     example: 37.5665
 *                   longitude:
 *                     type: number
 *                     format: double
 *                     minimum: -180
 *                     maximum: 180
 *                     description: User's longitude
 *                     example: 126.9780
 *               filters:
 *                 type: object
 *                 properties:
 *                   maxDistance:
 *                     type: number
 *                     minimum: 0.1
 *                     maximum: 100
 *                     description: Maximum distance in kilometers
 *                     example: 10
 *               assessmentId:
 *                 type: integer
 *                 description: Self-assessment ID for program matching
 *                 example: 1
 *     responses:
 *       200:
 *         description: Recommendations calculated successfully
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
 *                             type: integer
 *                             example: 1
 *                           centerName:
 *                             type: string
 *                             example: 서울시 중구 정신건강복지센터
 *                           centerType:
 *                             type: string
 *                             example: 정신건강복지센터
 *                           roadAddress:
 *                             type: string
 *                             example: 서울특별시 중구 세종대로 110
 *                           phoneNumber:
 *                             type: string
 *                             example: 02-1234-5678
 *                           distance:
 *                             type: number
 *                             description: Distance in kilometers
 *                             example: 0.8
 *                           totalScore:
 *                             type: number
 *                             description: Total recommendation score (0-100)
 *                             example: 87.5
 *                           scores:
 *                             type: object
 *                             properties:
 *                               distance:
 *                                 type: number
 *                                 example: 35.0
 *                               operating:
 *                                 type: number
 *                                 example: 25.0
 *                               specialty:
 *                                 type: number
 *                                 example: 15.0
 *                               program:
 *                                 type: number
 *                                 example: 12.5
 *                           isOpen:
 *                             type: boolean
 *                             example: true
 *                     totalCount:
 *                       type: integer
 *                       example: 5
 *                     message:
 *                       type: string
 *                       description: Message when no centers found
 *                       example: 검색 조건에 맞는 센터가 없습니다
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
router.post('/calculate', recommendationController.calculateRecommendations);

module.exports = router;
