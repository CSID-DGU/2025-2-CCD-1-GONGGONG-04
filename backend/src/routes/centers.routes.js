const express = require('express');
const router = express.Router();
const { getCenterDetail } = require('../controllers/centersController');

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

module.exports = router;
