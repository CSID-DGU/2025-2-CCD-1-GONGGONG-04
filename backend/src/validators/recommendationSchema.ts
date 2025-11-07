/**
 * Recommendation API Validation Schemas
 *
 * 추천 API 입력 검증 스키마
 * Sprint 2 - Task 4.1.3: Input Validation Schema
 *
 * @module validators/recommendationSchema
 * @created 2025-01-27
 */

import { z } from 'zod';

/**
 * 위도 검증 스키마
 * -90 ~ 90 범위
 */
const latitudeSchema = z
  .number()
  .min(-90, '위도는 -90 이상이어야 합니다')
  .max(90, '위도는 90 이하여야 합니다');

/**
 * 경도 검증 스키마
 * -180 ~ 180 범위
 */
const longitudeSchema = z
  .number()
  .min(-180, '경도는 -180 이상이어야 합니다')
  .max(180, '경도는 180 이하여야 합니다');

/**
 * 사용자 프로필 스키마
 *
 * 프로그램 매칭에 사용되는 사용자 선호도 및 특성
 */
export const userProfileSchema = z
  .object({
    /** 증상 목록 (최대 10개) */
    symptoms: z
      .array(z.string().min(1).max(20))
      .max(10, '증상은 최대 10개까지 입력할 수 있습니다')
      .optional(),

    /** 선호 카테고리 */
    preferredCategory: z.string().min(1).max(50).optional(),

    /** 연령대 */
    ageGroup: z
      .enum(['아동', '청소년', '20대', '30대', '40대', '50대', '60대 이상', '성인'])
      .optional(),

    /** 온라인 상담 선호 여부 */
    preferOnline: z.boolean().optional(),

    /** 무료 프로그램 선호 여부 */
    preferFree: z.boolean().optional(),
  })
  .optional();

/**
 * 추천 요청 바디 스키마
 *
 * POST /api/v1/recommendations
 */
export const recommendationRequestSchema = z.object({
  /** 사용자 위도 */
  latitude: latitudeSchema,

  /** 사용자 경도 */
  longitude: longitudeSchema,

  /** 사용자 프로필 (선택적) */
  userProfile: userProfileSchema,

  /** 최대 추천 개수 (기본값: 5, 최대: 20) */
  limit: z
    .number()
    .int('정수여야 합니다')
    .min(1, '최소 1개 이상이어야 합니다')
    .max(20, '최대 20개까지 조회할 수 있습니다')
    .default(5)
    .optional(),

  /** 최대 검색 반경 (km, 기본값: 10km, 최대: 50km) */
  maxDistance: z
    .number()
    .min(1, '최소 1km 이상이어야 합니다')
    .max(50, '최대 50km까지 검색할 수 있습니다')
    .default(10)
    .optional(),

  /** 세션 ID (추천 로그 저장용, 선택적) */
  sessionId: z.string().uuid('유효한 UUID여야 합니다').optional(),

  /** 사용자 ID (추천 로그 저장용, 선택적) */
  userId: z.bigint().positive('양수여야 합니다').optional(),
});

/**
 * 추천 요청 타입
 */
export type RecommendationRequest = z.infer<typeof recommendationRequestSchema>;

/**
 * 사용자 프로필 타입
 */
export type UserProfileInput = z.infer<typeof userProfileSchema>;

/**
 * 추천 응답 스키마 (문서화용)
 */
export const recommendationResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    /** 추천 센터 목록 */
    recommendations: z.array(
      z.object({
        /** 센터 ID */
        centerId: z.bigint(),

        /** 센터명 */
        centerName: z.string(),

        /** 총점 (0-100) */
        totalScore: z.number(),

        /** 세부 점수 */
        scores: z.object({
          distance: z.number(),
          operating: z.number(),
          specialty: z.number(),
          program: z.number(),
        }),

        /** 추천 이유 (상위 3개) */
        reasons: z.array(z.string()),

        /** 센터 기본 정보 */
        center: z.object({
          roadAddress: z.string(),
          phoneNumber: z.string().nullable(),
          distance: z.number(), // 미터 단위
          walkTime: z.string(),
        }),
      }),
    ),

    /** 총 추천 개수 */
    totalCount: z.number(),

    /** 검색 조건 */
    searchCriteria: z.object({
      latitude: z.number(),
      longitude: z.number(),
      maxDistance: z.number(),
      limit: z.number(),
    }),
  }),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

/**
 * 추천 응답 타입
 */
export type RecommendationResponse = z.infer<typeof recommendationResponseSchema>;

// ============================================
// Sprint 3 - Task 3.4.2: Assessment-based Recommendation API
// ============================================

/**
 * Assessment 기반 추천 요청 쿼리 파라미터 스키마
 *
 * GET /api/v1/assessments/:id/recommendations
 */
export const assessmentRecommendationQuerySchema = z.object({
  /** 사용자 위도 (필수) */
  lat: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(latitudeSchema),

  /** 사용자 경도 (필수) */
  lng: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(longitudeSchema),

  /** 최대 검색 반경 (km, 기본값: 10km, 최대: 50km) */
  maxDistance: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : 10))
    .pipe(
      z
        .number()
        .min(1, '최소 1km 이상이어야 합니다')
        .max(50, '최대 50km까지 검색할 수 있습니다'),
    ),

  /** 최대 추천 개수 (기본값: 5, 최대: 20) */
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 5))
    .pipe(
      z
        .number()
        .int('정수여야 합니다')
        .min(1, '최소 1개 이상이어야 합니다')
        .max(20, '최대 20개까지 조회할 수 있습니다'),
    ),
});

/**
 * Assessment 기반 추천 요청 파라미터 타입
 */
export type AssessmentRecommendationQuery = z.infer<typeof assessmentRecommendationQuerySchema>;
