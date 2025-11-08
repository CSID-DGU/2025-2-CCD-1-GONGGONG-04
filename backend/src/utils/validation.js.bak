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
 * Center search query schema
 *
 * GET /api/v1/centers?lat=37.5665&lng=126.9780&radius=5
 */
const centerSearchQuerySchema = z.object({
  query: z.object({
    lat: z
      .string()
      .regex(/^-?\d+(\.\d+)?$/, 'Latitude must be a valid number')
      .transform(Number)
      .refine(val => val >= -90 && val <= 90, 'Latitude must be between -90 and 90'),
    lng: z
      .string()
      .regex(/^-?\d+(\.\d+)?$/, 'Longitude must be a valid number')
      .transform(Number)
      .refine(val => val >= -180 && val <= 180, 'Longitude must be between -180 and 180'),
    radius: z
      .string()
      .regex(/^\d+(\.\d+)?$/, 'Radius must be a positive number')
      .transform(Number)
      .refine(val => val >= 1 && val <= 50, 'Radius must be between 1 and 50 km')
      .optional()
      .default('5'),
  }),
});

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
        maxDistance: z.number().positive().max(100).default(10),
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
        }),
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
// Sprint 3: Assessment API Validation Schemas
// ============================================

/**
 * Get template by ID schema (URL params)
 *
 * GET /api/v1/assessments/templates/:id
 */
const getTemplateByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Template ID must be a positive integer').transform(Number),
  }),
});

/**
 * Submit assessment schema
 *
 * POST /api/v1/assessments
 */
const submitAssessmentSchema = z.object({
  body: z.object({
    templateId: z.number().int().positive('Template ID must be a positive integer'),
    answers: z
      .array(
        z.object({
          questionNumber: z.number().int().positive('Question number must be a positive integer'),
          selectedOption: z
            .number()
            .int()
            .min(1, 'Selected option must be between 1 and 4')
            .max(4, 'Selected option must be between 1 and 4'),
        }),
      )
      .length(10, 'Exactly 10 answers are required for K-10 assessment'),
    sessionId: z.string().uuid('Session ID must be a valid UUID').optional(),
  }),
});

/**
 * Get assessment result schema (URL params)
 *
 * GET /api/v1/assessments/:id/result
 */
const getAssessmentResultSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Assessment ID must be a positive integer').transform(Number),
  }),
});

/**
 * Get assessment history schema (Query params)
 *
 * GET /api/v1/assessments/history
 */
const getHistorySchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine(val => val >= 1, 'Page must be >= 1')
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine(val => val >= 1 && val <= 100, 'Limit must be between 1 and 100')
      .optional(),
    templateCode: z.string().min(1).optional(),
    severityCode: z.enum(['LOW', 'MID', 'HIGH']).optional(),
    startDate: z.string().datetime('Invalid start date format').optional(),
    endDate: z.string().datetime('Invalid end date format').optional(),
  }),
});

/**
 * Delete assessment schema (URL params)
 *
 * DELETE /api/v1/assessments/:id
 */
const deleteAssessmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Assessment ID must be a positive integer').transform(Number),
  }),
});

/**
 * Validation middleware factory
 * Creates Express middleware from Zod schema
 *
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
function validateSchema(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Merge validated data back into request
      if (validated.body) {req.body = validated.body;}
      if (validated.query) {req.query = validated.query;}
      if (validated.params) {req.params = validated.params;}

      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}

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
  // Zod Schemas (Sprint 1)
  centerSearchQuerySchema,
  recommendationRequestSchema,
  assessmentSubmitSchema,
  assessmentTemplateQuerySchema,
  locationSchema,

  // Sprint 3: Assessment API Schemas
  getTemplateByIdSchema,
  submitAssessmentSchema,
  getAssessmentResultSchema,
  getHistorySchema,
  deleteAssessmentSchema,
  validateSchema,

  // Legacy Functions
  isPositiveInteger,
  isValidLatitude,
  isValidLongitude,
  createValidationError,
  createNotFoundError,
};
