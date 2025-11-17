/**
 * Hybrid Recommendation Validation Schemas
 *
 * Phase 2 Sprint 5: 하이브리드 추천 API 입력 검증
 * Zod를 사용한 타입 안전 검증
 */

import { z } from 'zod';

/**
 * 하이브리드 추천 요청 스키마
 */
export const hybridRecommendationRequestSchema = z.object({
  // 위치 정보 (필수)
  latitude: z
    .number()
    .min(-90, '위도는 -90 이상이어야 합니다')
    .max(90, '위도는 90 이하여야 합니다'),

  longitude: z
    .number()
    .min(-180, '경도는 -180 이상이어야 합니다')
    .max(180, '경도는 180 이하여야 합니다'),

  // 검색 반경
  maxDistance: z
    .number()
    .min(1, '최대 거리는 1km 이상이어야 합니다')
    .max(50, '최대 거리는 50km 이하여야 합니다')
    .optional()
    .default(10),

  // 사용자 쿼리 (선택 - 의미론적 검색용, 없으면 규칙 기반만 사용)
  userQuery: z
    .string()
    .min(1, '사용자 쿼리는 최소 1자 이상이어야 합니다')
    .max(5000, '사용자 쿼리는 최대 5000자까지 가능합니다')
    .trim()
    .optional(),

  // 자가진단 ID (선택)
  assessmentId: z
    .number()
    .int()
    .positive()
    .optional(),

  // 전문 분야 필터 (선택)
  specialties: z
    .array(z.string())
    .max(10, '전문 분야는 최대 10개까지 선택 가능합니다')
    .optional(),

  // 선호 요일 (선택)
  preferredDays: z
    .array(z.enum(['월', '화', '수', '목', '금', '토', '일']))
    .max(7)
    .optional(),

  // 선호 시간대 (선택)
  preferredTimes: z
    .array(z.enum(['morning', 'afternoon', 'evening', 'night']))
    .max(4)
    .optional(),

  // 가중치 조정 (선택, A/B 테스트용)
  weights: z
    .object({
      embedding: z
        .number()
        .min(0, '임베딩 가중치는 0 이상이어야 합니다')
        .max(1, '임베딩 가중치는 1 이하여야 합니다'),

      rule: z
        .number()
        .min(0, '규칙 기반 가중치는 0 이상이어야 합니다')
        .max(1, '규칙 기반 가중치는 1 이하여야 합니다')
    })
    .refine(
      (weights) => Math.abs(weights.embedding + weights.rule - 1.0) < 0.001,
      {
        message: '가중치의 합은 1.0이어야 합니다'
      }
    )
    .optional(),

  // 결과 개수 제한
  limit: z
    .number()
    .int()
    .min(1, '최소 1개 이상의 결과를 요청해야 합니다')
    .max(50, '최대 50개까지 요청 가능합니다')
    .optional()
    .default(10),

  // 세션 ID (로그용, 선택)
  sessionId: z
    .string()
    .max(255)
    .optional(),

  // 사용자 ID (로그용, 선택)
  userId: z
    .bigint()
    .positive()
    .optional()
});

/**
 * 배치 임베딩 생성 요청 스키마
 */
export const batchEmbeddingRequestSchema = z.object({
  centerIds: z
    .array(z.number().int().positive())
    .min(1, '최소 1개 이상의 센터 ID가 필요합니다')
    .max(1000, '최대 1000개까지 처리 가능합니다')
    .optional(),

  force: z
    .boolean()
    .optional()
    .default(false)
});

/**
 * 가중치 업데이트 요청 스키마 (관리자용)
 */
export const updateWeightsRequestSchema = z.object({
  embedding: z
    .number()
    .min(0)
    .max(1),

  rule: z
    .number()
    .min(0)
    .max(1)
}).refine(
  (weights) => Math.abs(weights.embedding + weights.rule - 1.0) < 0.001,
  {
    message: '가중치의 합은 1.0이어야 합니다'
  }
);

/**
 * 타입 추출
 */
export type HybridRecommendationRequest = z.infer<typeof hybridRecommendationRequestSchema>;
export type BatchEmbeddingRequest = z.infer<typeof batchEmbeddingRequestSchema>;
export type UpdateWeightsRequest = z.infer<typeof updateWeightsRequestSchema>;
