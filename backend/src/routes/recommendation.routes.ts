/**
 * Recommendation Routes
 *
 * Sprint 2: 규칙 기반 추천 시스템
 * Task 4.1.4: API 라우터 등록
 *
 * 엔드포인트:
 * - POST /api/v1/recommendations - 추천 센터 계산
 */

import express, { Router } from 'express';
import { calculateRecommendations } from '../controllers/recommendationController';

const router: Router = express.Router();

/**
 * @swagger
 * /recommendations:
 *   post:
 *     summary: Calculate recommended centers
 *     description: Calculate and return recommended mental health centers based on user location and profile
 *     tags: [Recommendations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 format: double
 *                 minimum: -90
 *                 maximum: 90
 *                 description: User's latitude
 *                 example: 37.5665
 *               longitude:
 *                 type: number
 *                 format: double
 *                 minimum: -180
 *                 maximum: 180
 *                 description: User's longitude
 *                 example: 126.9780
 *               userProfile:
 *                 type: object
 *                 properties:
 *                   symptoms:
 *                     type: array
 *                     items:
 *                       type: string
 *                     maxItems: 10
 *                     description: User's symptoms (max 10)
 *                     example: ["우울감", "불안"]
 *                   preferredCategory:
 *                     type: string
 *                     description: Preferred program category
 *                     example: 개인상담
 *                   ageGroup:
 *                     type: string
 *                     enum: [아동, 청소년, 20대, 30대, 40대, 50대, 60대 이상, 성인]
 *                     description: User's age group
 *                     example: 20대
 *                   preferOnline:
 *                     type: boolean
 *                     description: Prefer online programs
 *                     example: false
 *                   preferFree:
 *                     type: boolean
 *                     description: Prefer free programs
 *                     example: true
 *               maxDistance:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 50
 *                 default: 10
 *                 description: Maximum search radius in kilometers
 *                 example: 10
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 default: 5
 *                 description: Maximum number of recommendations
 *                 example: 5
 *               sessionId:
 *                 type: string
 *                 format: uuid
 *                 description: Session ID for anonymous users (optional)
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               userId:
 *                 type: string
 *                 description: User ID for logged-in users (optional)
 *                 example: "123"
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
 *                             type: string
 *                             description: Center ID (bigint as string)
 *                             example: "1"
 *                           centerName:
 *                             type: string
 *                             example: 서울 정신건강센터
 *                           totalScore:
 *                             type: number
 *                             format: double
 *                             description: Total recommendation score (0-100)
 *                             example: 87.45
 *                           scores:
 *                             type: object
 *                             properties:
 *                               distance:
 *                                 type: number
 *                                 description: Distance score (0-100)
 *                                 example: 95
 *                               operating:
 *                                 type: number
 *                                 description: Operating hours score (0-100)
 *                                 example: 100
 *                               specialty:
 *                                 type: number
 *                                 description: Specialty score (0-100)
 *                                 example: 80
 *                               program:
 *                                 type: number
 *                                 description: Program matching score (0-100)
 *                                 example: 60
 *                           reasons:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: Top 3 recommendation reasons
 *                             example: ["현재 운영 중", "정신건강의학과 전문의 보유", "가까운 거리 (500m)"]
 *                           center:
 *                             type: object
 *                             properties:
 *                               roadAddress:
 *                                 type: string
 *                                 example: 서울시 강남구 테헤란로 123
 *                               phoneNumber:
 *                                 type: string
 *                                 nullable: true
 *                                 example: 02-1234-5678
 *                               distance:
 *                                 type: number
 *                                 description: Distance in meters
 *                                 example: 500
 *                               walkTime:
 *                                 type: string
 *                                 description: Estimated walking time
 *                                 example: 7분
 *                     totalCount:
 *                       type: integer
 *                       description: Number of recommendations returned
 *                       example: 5
 *                     searchCriteria:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           example: 37.5665
 *                         longitude:
 *                           type: number
 *                           example: 126.9780
 *                         maxDistance:
 *                           type: number
 *                           example: 10
 *                         limit:
 *                           type: integer
 *                           example: 5
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
 *                       example: 입력값이 올바르지 않습니다
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           path:
 *                             type: string
 *                             example: latitude
 *                           message:
 *                             type: string
 *                             example: 위도는 -90 이상이어야 합니다
 *       500:
 *         description: Internal server error
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
 *                       example: INTERNAL_ERROR
 *                     message:
 *                       type: string
 *                       example: 서버 내부 오류가 발생했습니다
 */
router.post('/', calculateRecommendations);

export default router;
