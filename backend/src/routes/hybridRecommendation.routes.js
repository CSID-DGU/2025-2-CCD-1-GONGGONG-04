/**
 * Hybrid Recommendation Routes
 *
 * Phase 2 Sprint 5: 하이브리드 추천 API 라우트
 * Base Path: /api/v2/recommendations
 */

const express = require('express');
const router = express.Router();
const hybridController = require('../controllers/hybridRecommendation.controller');

/**
 * @route   POST /api/v2/recommendations/hybrid
 * @desc    하이브리드 추천 계산 (Phase 1 규칙 기반 70% + Phase 2 의미론적 30%)
 * @access  Public
 *
 * @body {
 *   latitude: number,       // 필수
 *   longitude: number,      // 필수
 *   userQuery: string,      // 필수 (예: "우울증 상담이 필요해요")
 *   maxDistance?: number,   // 선택 (기본: 10km)
 *   assessmentId?: number,  // 선택 (자가진단 ID)
 *   specialties?: string[], // 선택 (전문 분야)
 *   weights?: {             // 선택 (A/B 테스트용)
 *     embedding: number,    // 0~1
 *     rule: number          // 0~1
 *   },
 *   limit?: number          // 선택 (기본: 10)
 * }
 *
 * @returns {
 *   success: true,
 *   data: {
 *     recommendations: [{
 *       centerId: bigint,
 *       centerName: string,
 *       totalScore: number,      // 0~100 (하이브리드 점수)
 *       scores: {
 *         total: number,          // 최종 점수
 *         ruleBasedScore: number, // 규칙 기반 점수
 *         embeddingScore: number, // 임베딩 유사도 점수
 *         breakdown: {
 *           distance: number,
 *           operating: number,
 *           specialty: number,
 *           program: number
 *         }
 *       },
 *       reasons: string[],        // 추천 이유
 *       matchedKeywords: string[], // 의미론적 매칭 키워드
 *       center: {
 *         roadAddress: string,
 *         phoneNumber: string,
 *         distance: number,       // 미터
 *         walkTime: string
 *       }
 *     }],
 *     metadata: {
 *       totalCount: number,
 *       queryTime: number,        // ms
 *       cacheHit: boolean,
 *       algorithm: string,        // 'hybrid_v1' | 'rule_based_fallback'
 *       weights: {
 *         embedding: number,
 *         rule: number
 *       },
 *       fallbackMode: boolean,
 *       fallbackReason?: string
 *     }
 *   }
 * }
 */
router.post('/hybrid', hybridController.getHybridRecommendations);

/**
 * @route   GET /api/v2/recommendations/hybrid/health
 * @desc    하이브리드 추천 시스템 헬스 체크
 * @access  Public
 *
 * @returns {
 *   status: 'healthy' | 'unhealthy',
 *   components: {
 *     llm: { status: string, ... },
 *     vectorDB: { status: string, ... }
 *   },
 *   timestamp: string
 * }
 */
router.get('/hybrid/health', hybridController.healthCheck);

/**
 * @route   GET /api/v2/recommendations/hybrid/weights
 * @desc    현재 가중치 조회
 * @access  Public
 *
 * @returns {
 *   success: true,
 *   data: {
 *     weights: {
 *       embedding: number,
 *       rule: number
 *     },
 *     updatedAt: string
 *   }
 * }
 */
router.get('/hybrid/weights', hybridController.getWeights);

/**
 * @route   DELETE /api/v2/recommendations/hybrid/cache
 * @desc    하이브리드 추천 캐시 삭제 (관리자용)
 * @access  Admin (TODO: 인증 미들웨어 추가 필요)
 *
 * @returns {
 *   success: true,
 *   message: string
 * }
 */
router.delete('/hybrid/cache', hybridController.clearCache);

module.exports = router;
