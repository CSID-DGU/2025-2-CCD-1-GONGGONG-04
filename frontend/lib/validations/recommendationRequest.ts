/**
 * Recommendation Request Form Validation Schema
 *
 * Sprint 2 - Task 4.3.4: 추천 요청 폼 검증 스키마
 *
 * @module validations/recommendationRequest
 */

import { z } from 'zod';

/**
 * 위치 정보 스키마
 */
export const locationSchema = z.object({
  latitude: z
    .number({ required_error: '위도를 입력해주세요' })
    .min(-90, '위도는 -90 이상이어야 합니다')
    .max(90, '위도는 90 이하여야 합니다'),
  longitude: z
    .number({ required_error: '경도를 입력해주세요' })
    .min(-180, '경도는 -180 이상이어야 합니다')
    .max(180, '경도는 180 이하여야 합니다'),
  address: z.string().optional(),
});

/**
 * 필터 옵션 스키마
 */
export const filterOptionsSchema = z.object({
  maxDistance: z
    .number()
    .int('정수여야 합니다')
    .min(1, '최소 1km 이상이어야 합니다')
    .max(50, '최대 50km까지 검색할 수 있습니다')
    .default(10),
  limit: z
    .number()
    .int('정수여야 합니다')
    .min(1, '최소 1개 이상이어야 합니다')
    .max(20, '최대 20개까지 조회할 수 있습니다')
    .default(5),
  centerTypes: z
    .array(
      z.enum([
        '정신건강복지센터',
        '자살예방센터',
        '중독관리통합지원센터',
        '청소년상담복지센터',
        '아동보호전문기관',
      ])
    )
    .optional(),
  operatingHours: z
    .enum(['weekday', 'weekend', 'night', 'all'])
    .optional()
    .default('all'),
  onlineAvailable: z.boolean().optional().default(false),
});

/**
 * 사용자 프로필 스키마
 */
export const userProfileSchema = z.object({
  ageGroup: z
    .enum([
      '아동',
      '청소년',
      '20대',
      '30대',
      '40대',
      '50대',
      '60대 이상',
      '성인',
    ])
    .optional(),
  symptoms: z
    .array(
      z.enum([
        '우울감',
        '불안',
        '스트레스',
        '불면증',
        '중독',
        '자살/자해',
        '대인관계',
        '트라우마',
        '분노조절',
        '기타',
      ])
    )
    .max(10, '증상은 최대 10개까지 선택할 수 있습니다')
    .optional(),
  preferredCounseling: z
    .enum(['개인상담', '집단상담', '가족상담', '상관없음'])
    .optional(),
  preferFree: z.boolean().optional().default(false),
});

/**
 * 추천 요청 폼 전체 스키마
 */
export const recommendationRequestFormSchema = z.object({
  location: locationSchema,
  filters: filterOptionsSchema,
  userProfile: userProfileSchema.optional(),
});

/**
 * 추천 요청 폼 타입
 */
export type RecommendationRequestFormData = z.infer<
  typeof recommendationRequestFormSchema
>;

/**
 * 위치 타입
 */
export type LocationData = z.infer<typeof locationSchema>;

/**
 * 필터 옵션 타입
 */
export type FilterOptionsData = z.infer<typeof filterOptionsSchema>;

/**
 * 사용자 프로필 타입
 */
export type UserProfileData = z.infer<typeof userProfileSchema>;

/**
 * 에러 메시지 정의
 */
export const errorMessages = {
  location: {
    required: '위치를 선택해주세요',
    invalid: '올바른 위치를 선택해주세요',
    gpsError: 'GPS 위치를 가져올 수 없습니다',
  },
  filters: {
    distance: {
      min: '검색 반경은 최소 1km 이상이어야 합니다',
      max: '검색 반경은 최대 50km까지 가능합니다',
    },
    limit: {
      min: '추천 개수는 최소 1개 이상이어야 합니다',
      max: '추천 개수는 최대 20개까지 가능합니다',
    },
  },
  userProfile: {
    symptoms: {
      max: '증상은 최대 10개까지 선택할 수 있습니다',
    },
  },
};
