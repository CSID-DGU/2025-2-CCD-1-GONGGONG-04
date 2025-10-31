/**
 * Validation utilities and Zod schemas for API endpoints
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.5: Validation Schemas 작성
 */

const { z } = require('zod');

// ============================================
// Zod Schemas (Sprint 1)
// ============================================

/**
 * 추천 요청 스키마
 *
 * POST /api/v1/recommendations/calculate
 */
const recommendationRequestSchema = z
  .object({
    userId: z.number().int().positive().optional(),
    sessionId: z.string().min(1).optional(),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
    filters: z
      .object({
        maxDistance: z.number().positive().max(50).default(10),
        preferredTimes: z.array(z.string()).optional(),
        centerTypes: z.array(z.string()).optional(),
      })
      .optional(),
    assessmentId: z.number().int().positive().optional(),
  })
  .refine(data => data.userId || data.sessionId, {
    message: 'userId 또는 sessionId 중 하나는 필수입니다',
  });

/**
 * 자가진단 제출 스키마
 *
 * POST /api/v1/self-assessments/submit
 */
const assessmentSubmitSchema = z
  .object({
    userId: z.number().int().positive().optional(),
    sessionId: z.string().min(1).optional(),
    templateId: z.number().int().positive(),
    answers: z
      .array(
        z.object({
          questionId: z.number().int().positive(),
          selectedOption: z.number().int().min(0).max(3), // 0-3 (전혀~매우)
        })
      )
      .min(1), // 최소 1개 답변 필요
  })
  .refine(data => data.userId || data.sessionId, {
    message: 'userId 또는 sessionId 중 하나는 필수입니다',
  });

/**
 * 자가진단 템플릿 조회 스키마 (Query Params)
 *
 * GET /api/v1/self-assessments/templates/:templateId
 */
const assessmentTemplateQuerySchema = z.object({
  templateId: z.string().regex(/^\d+$/).transform(Number),
});

/**
 * 위치 정보 스키마 (재사용 가능)
 */
const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// ============================================
// Legacy Validation Functions (기존 코드 유지)
// ============================================

/**
 * Validate if a value is a positive integer
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid positive integer
 */
const isPositiveInteger = value => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
};

/**
 * Validate latitude value (-90 to 90)
 * @param {*} value - Latitude value to validate
 * @returns {boolean} True if valid latitude
 */
const isValidLatitude = value => {
  const num = Number(value);
  return !isNaN(num) && num >= -90 && num <= 90;
};

/**
 * Validate longitude value (-180 to 180)
 * @param {*} value - Longitude value to validate
 * @returns {boolean} True if valid longitude
 */
const isValidLongitude = value => {
  const num = Number(value);
  return !isNaN(num) && num >= -180 && num <= 180;
};

/**
 * Create validation error response
 * @param {string} message - Error message
 * @param {string} field - Field name that failed validation
 * @returns {Object} Validation error object
 */
const createValidationError = (message, field = null) => {
  const error = new Error(message);
  error.statusCode = 400;
  error.field = field;
  return error;
};

/**
 * Create not found error response
 * @param {string} message - Error message
 * @returns {Object} Not found error object
 */
const createNotFoundError = message => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

module.exports = {
  // Zod Schemas
  recommendationRequestSchema,
  assessmentSubmitSchema,
  assessmentTemplateQuerySchema,
  locationSchema,

  // Legacy Functions
  isPositiveInteger,
  isValidLatitude,
  isValidLongitude,
  createValidationError,
  createNotFoundError,
};
