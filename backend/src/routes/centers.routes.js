const express = require('express');
const router = express.Router();
const {
  getCenterDetail,
  getCenterStaff,
  getCenterPrograms,
} = require('../controllers/centersController');
const {
  getOperatingStatus,
  invalidateOperatingStatusCache,
} = require('../controllers/operatingStatus.controller');

/**
 * @swagger
 * /api/v1/centers/{id}:
 *   get:
 *     summary: Get center detail by ID
 *     description: Retrieve detailed information about a specific mental health center. Optionally calculates distance if user location is provided.
 *     tags: [Centers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Center ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *       - in: query
 *         name: user_lat
 *         required: false
 *         description: User's latitude for distance calculation (requires user_lng)
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -90
 *           maximum: 90
 *           example: 37.5665
 *       - in: query
 *         name: user_lng
 *         required: false
 *         description: User's longitude for distance calculation (requires user_lat)
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -180
 *           maximum: 180
 *           example: 126.9780
 *     responses:
 *       200:
 *         description: Center detail retrieved successfully
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
 *                       example: 1
 *                     center_name:
 *                       type: string
 *                       example: 서울시 정신건강복지센터
 *                     center_type:
 *                       type: string
 *                       example: 정신건강복지센터
 *                     contact:
 *                       type: object
 *                       properties:
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                           example: 02-1234-5678
 *                         road_address:
 *                           type: string
 *                           example: 서울특별시 중구 세종대로 110
 *                         jibun_address:
 *                           type: string
 *                           nullable: true
 *                           example: 서울특별시 중구 태평로1가 31
 *                     location:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           format: double
 *                           example: 37.5665
 *                         longitude:
 *                           type: number
 *                           format: double
 *                           example: 126.9780
 *                         distance:
 *                           type: number
 *                           format: double
 *                           description: Distance in kilometers (only if user_lat and user_lng provided)
 *                           example: 2.45
 *                     business_content:
 *                       type: string
 *                       nullable: true
 *                       example: 정신건강 상담 및 치료 지원
 *                     stats:
 *                       type: object
 *                       properties:
 *                         avg_rating:
 *                           type: number
 *                           format: double
 *                           example: 4.5
 *                         review_count:
 *                           type: integer
 *                           example: 42
 *                         favorite_count:
 *                           type: integer
 *                           example: 128
 *                         view_count:
 *                           type: integer
 *                           example: 1537
 *       400:
 *         description: Bad Request - Invalid parameters
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
 *                     message:
 *                       type: string
 *                       example: Invalid center ID. Must be a positive integer.
 *       404:
 *         description: Not Found - Center does not exist
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
 *                     message:
 *                       type: string
 *                       example: Center with ID 999 not found.
 *       500:
 *         description: Internal Server Error
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
 *                     message:
 *                       type: string
 *                       example: Internal Server Error
 */
router.get('/:id', getCenterDetail);

/**
 * @swagger
 * /api/v1/centers/{id}/operating-status:
 *   get:
 *     summary: Get center operating status
 *     description: Retrieve current operating status for a specific center with caching support
 *     tags: [Centers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Center ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *       - in: query
 *         name: date
 *         required: false
 *         description: Target date in YYYY-MM-DD format (defaults to current date)
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-01-25
 *     responses:
 *       200:
 *         description: Operating status retrieved successfully
 *         headers:
 *           X-Cache:
 *             description: Cache status (HIT or MISS)
 *             schema:
 *               type: string
 *           X-Response-Time:
 *             description: Response time in milliseconds
 *             schema:
 *               type: string
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
 *                     current_status:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [OPEN, CLOSING_SOON, CLOSED, HOLIDAY, TEMP_CLOSED, NO_INFO]
 *                           example: OPEN
 *                         message:
 *                           type: string
 *                           example: 운영 중 (~18:00)
 *                         status_color:
 *                           type: string
 *                           example: green
 *                     next_open:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         date:
 *                           type: string
 *                           nullable: true
 *                           example: 2025-01-16
 *                         day_name:
 *                           type: string
 *                           nullable: true
 *                           example: 목요일
 *                         open_time:
 *                           type: string
 *                           nullable: true
 *                           example: 09:00
 *                     weekly_hours:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day_of_week:
 *                             type: integer
 *                             example: 1
 *                           day_name:
 *                             type: string
 *                             example: 월요일
 *                           open_time:
 *                             type: string
 *                             nullable: true
 *                             example: 09:00
 *                           close_time:
 *                             type: string
 *                             nullable: true
 *                             example: 18:00
 *                           is_open:
 *                             type: boolean
 *                             example: true
 *                     upcoming_holidays:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           holiday_date:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-01-01T00:00:00.000Z
 *                           holiday_name:
 *                             type: string
 *                             example: 신정
 *                           is_regular:
 *                             type: boolean
 *                             example: false
 *       400:
 *         description: Bad Request - Invalid parameters
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
 *                       example: Invalid request parameters
 *       404:
 *         description: Not Found - Center does not exist
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
 *                       example: CENTER_NOT_FOUND
 *                     message:
 *                       type: string
 *                       example: Center with ID 1 not found.
 *       500:
 *         description: Internal Server Error
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
 *                       example: An error occurred while calculating operating status.
 */
router.get('/:id/operating-status', getOperatingStatus);

/**
 * @swagger
 * /api/v1/centers/{id}/operating-status/cache:
 *   delete:
 *     summary: Invalidate operating status cache
 *     description: Clear cached operating status for a specific center (admin operation)
 *     tags: [Centers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Center ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: Cache invalidated successfully
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
 *                     centerId:
 *                       type: integer
 *                       example: 1
 *                     invalidated:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad Request - Invalid center ID
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id/operating-status/cache', invalidateOperatingStatusCache);

/**
 * @swagger
 * /api/v1/centers/{id}/staff:
 *   get:
 *     summary: Get center staff information
 *     description: Retrieve staff information for a specific center including staff types, counts, and total
 *     tags: [Centers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Center ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: Staff information retrieved successfully
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
 *                     center_id:
 *                       type: integer
 *                       example: 1
 *                     staff:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           staff_type:
 *                             type: string
 *                             example: 정신건강의학과 전문의
 *                           staff_count:
 *                             type: integer
 *                             example: 2
 *                           description:
 *                             type: string
 *                             nullable: true
 *                             example: 청소년 상담 전문
 *                     total_staff:
 *                       type: integer
 *                       example: 12
 *                     has_data:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad Request - Invalid center ID
 *       404:
 *         description: Not Found - Center does not exist
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id/staff', getCenterStaff);

/**
 * @swagger
 * /api/v1/centers/{id}/programs:
 *   get:
 *     summary: Get center programs
 *     description: Retrieve programs offered by a specific center with optional filtering and pagination
 *     tags: [Centers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Center ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *       - in: query
 *         name: target_group
 *         required: false
 *         description: Filter by target group (e.g., 직장인, 청소년)
 *         schema:
 *           type: string
 *           example: 직장인
 *       - in: query
 *         name: is_online
 *         required: false
 *         description: Filter by online availability
 *         schema:
 *           type: boolean
 *           example: true
 *       - in: query
 *         name: is_free
 *         required: false
 *         description: Filter by free programs
 *         schema:
 *           type: boolean
 *           example: true
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number (default 1)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Items per page (default 10, max 100)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *     responses:
 *       200:
 *         description: Programs retrieved successfully
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
 *                     center_id:
 *                       type: integer
 *                       example: 1
 *                     programs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           program_name:
 *                             type: string
 *                             example: 직장인 스트레스 관리 프로그램
 *                           program_type:
 *                             type: string
 *                             nullable: true
 *                             example: 집단 상담
 *                           target_group:
 *                             type: string
 *                             nullable: true
 *                             example: 직장인
 *                           description:
 *                             type: string
 *                             nullable: true
 *                             example: 주 1회, 8회기 프로그램
 *                           is_online_available:
 *                             type: boolean
 *                             example: true
 *                           is_free:
 *                             type: boolean
 *                             example: true
 *                           fee_amount:
 *                             type: number
 *                             nullable: true
 *                             example: null
 *                           capacity:
 *                             type: integer
 *                             nullable: true
 *                             example: 12
 *                           duration_minutes:
 *                             type: integer
 *                             nullable: true
 *                             example: 90
 *                     total_count:
 *                       type: integer
 *                       example: 5
 *                     has_data:
 *                       type: boolean
 *                       example: true
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 5
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *       400:
 *         description: Bad Request - Invalid parameters
 *       404:
 *         description: Not Found - Center does not exist
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id/programs', getCenterPrograms);

module.exports = router;
