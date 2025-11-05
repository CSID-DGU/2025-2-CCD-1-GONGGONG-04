/**
 * Reviews Controller
 *
 * Handles HTTP requests for review operations.
 * Validates request parameters and formats responses.
 *
 * @module controllers/reviews
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  fetchReviews,
  SortOption,
  createReviewWithRatingUpdate,
  updateReviewWithRatingUpdate,
  deleteReviewWithRatingUpdate,
  upsertReaction,
} from '../services/reviews.service';
import { ValidationError, AppError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Validation schema for GET /api/centers/:id/reviews
 */
const getReviewsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Center ID must be a positive integer'),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a positive integer').optional().default('1'),
    limit: z.string().regex(/^\d+$/, 'Limit must be a positive integer').optional().default('10'),
    sort: z.enum(['latest', 'helpful', 'rating_desc', 'rating_asc']).optional().default('latest'),
  }),
});

/**
 * Validation schema for POST /api/centers/:id/reviews
 */
const createReviewSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Center ID must be a positive integer'),
  }),
  body: z.object({
    rating: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be between 1 and 5')
      .max(5, 'Rating must be between 1 and 5'),
    title: z
      .string()
      .min(2, 'Title must be at least 2 characters')
      .max(200, 'Title must be at most 200 characters')
      .optional(),
    content: z
      .string()
      .min(10, 'Content must be at least 10 characters')
      .max(1000, 'Content must be at most 1000 characters'),
    visit_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Visit date must be in YYYY-MM-DD format')
      .optional(),
  }),
});

/**
 * Validation schema for PUT /api/reviews/:id
 */
const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Review ID must be a positive integer'),
  }),
  body: z.object({
    rating: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be between 1 and 5')
      .max(5, 'Rating must be between 1 and 5')
      .optional(),
    title: z
      .string()
      .min(2, 'Title must be at least 2 characters')
      .max(200, 'Title must be at most 200 characters')
      .optional(),
    content: z
      .string()
      .min(10, 'Content must be at least 10 characters')
      .max(1000, 'Content must be at most 1000 characters')
      .optional(),
    visit_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Visit date must be in YYYY-MM-DD format')
      .optional(),
  }),
});

/**
 * Validation schema for DELETE /api/reviews/:id
 */
const deleteReviewSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Review ID must be a positive integer'),
  }),
});

/**
 * Validation schema for POST /api/reviews/:id/reactions
 */
const addReactionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Review ID must be a positive integer'),
  }),
  body: z.object({
    reaction: z.enum(['helpful', 'unhelpful']).nullable(),
  }),
});

/**
 * Get reviews for a center
 *
 * @route GET /api/centers/:id/reviews
 * @param {Object} req - Express request object
 * @param {Object} req.params - Path parameters
 * @param {string} req.params.id - Center ID
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.page - Page number (default: 1)
 * @param {string} req.query.limit - Items per page (default: 10, max: 50)
 * @param {string} req.query.sort - Sort option: latest|helpful|rating_desc|rating_asc (default: latest)
 * @param {Object} req.user - Authenticated user (optional, from JWT middleware)
 * @param {number} req.user.id - User ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Object} Review list response with pagination and summary
 *
 * @example
 * // Get first page with default sort (latest)
 * GET /api/centers/123/reviews
 *
 * // Get second page with helpful sort
 * GET /api/centers/123/reviews?page=2&limit=20&sort=helpful
 *
 * @throws {ValidationError} 400 - Invalid request parameters
 * @throws {NotFoundError} 404 - Center not found
 */
export async function getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  const startTime = Date.now();

  try {
    // 1. Validate request
    const validation = getReviewsSchema.safeParse({
      params: req.params,
      query: req.query,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new ValidationError('Invalid request parameters', errors);
    }

    const centerId = parseInt(req.params.id, 10);
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = Math.min(parseInt((req.query.limit as string) || '10', 10), 50); // Max 50 items per page
    const sort = (req.query.sort as SortOption) || 'latest';

    // 2. Get authenticated user ID (optional)
    // Assuming JWT middleware sets req.user if authenticated
    const userId = (req as { user?: { id: number } }).user?.id as number | undefined;

    // 3. Fetch reviews from service
    const result = await fetchReviews(centerId, {
      page,
      limit,
      sort,
      userId,
    });

    // 4. Send response
    const responseTime = Date.now() - startTime;
    logger.info(`[API] GET /api/centers/${centerId}/reviews - ${responseTime}ms`);

    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.status(200).json(result);
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);

    // Pass error to error handling middleware
    next(error);
  }
}

/**
 * Create review for a center
 *
 * @route POST /api/centers/:id/reviews
 * @param {Object} req - Express request object
 * @param {Object} req.params - Path parameters
 * @param {string} req.params.id - Center ID
 * @param {Object} req.body - Request body
 * @param {number} req.body.rating - Rating (1-5)
 * @param {string} req.body.title - Review title (optional)
 * @param {string} req.body.content - Review content (10-1000 characters)
 * @param {string} req.body.visit_date - Visit date in YYYY-MM-DD format (optional)
 * @param {Object} req.user - Authenticated user (from JWT middleware)
 * @param {number} req.user.id - User ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Object} Created review
 *
 * @throws {ValidationError} 400 - Invalid request body
 * @throws {UnauthorizedError} 401 - Not authenticated
 * @throws {ConflictError} 409 - Duplicate review
 * @throws {NotFoundError} 404 - Center not found
 */
export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  const startTime = Date.now();

  try {
    // 1. Validate request
    const validation = createReviewSchema.safeParse({
      params: req.params,
      body: req.body,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new ValidationError('Invalid request body', errors);
    }

    const centerId = parseInt(req.params.id, 10);
    const userId = (req as { user: { id: number } }).user.id as number;

    // 2. Parse visit_date if provided
    const visitDate = req.body.visit_date ? new Date(req.body.visit_date) : undefined;

    // 3. Create review
    const review = await createReviewWithRatingUpdate(userId, centerId, {
      rating: req.body.rating,
      title: req.body.title,
      content: req.body.content,
      visit_date: visitDate,
    });

    // 4. Send response
    const responseTime = Date.now() - startTime;
    logger.info(`[API] POST /api/centers/${centerId}/reviews - ${responseTime}ms`);

    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.status(201).json(review);
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    next(error);
  }
}

/**
 * Update review
 *
 * @route PUT /api/reviews/:id
 * @param {Object} req - Express request object
 * @param {Object} req.params - Path parameters
 * @param {string} req.params.id - Review ID
 * @param {Object} req.body - Request body (partial)
 * @param {number} req.body.rating - Rating (1-5) (optional)
 * @param {string} req.body.title - Review title (optional)
 * @param {string} req.body.content - Review content (optional)
 * @param {string} req.body.visit_date - Visit date in YYYY-MM-DD format (optional)
 * @param {Object} req.user - Authenticated user (from JWT middleware)
 * @param {number} req.user.id - User ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Object} Updated review
 *
 * @throws {ValidationError} 400 - Invalid request body
 * @throws {UnauthorizedError} 401 - Not authenticated
 * @throws {ForbiddenError} 403 - Not owner or 7-day limit exceeded
 * @throws {NotFoundError} 404 - Review not found
 */
export async function updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  const startTime = Date.now();

  try {
    // 1. Validate request
    const validation = updateReviewSchema.safeParse({
      params: req.params,
      body: req.body,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new ValidationError('Invalid request body', errors);
    }

    const reviewId = parseInt(req.params.id, 10);
    const userId = (req as { user: { id: number } }).user.id as number;

    // 2. Parse visit_date if provided
    let visitDate: Date | undefined = undefined;
    if (req.body.visit_date !== undefined) {
      visitDate = req.body.visit_date ? new Date(req.body.visit_date) : undefined;
    }

    // 3. Update review
    const review = await updateReviewWithRatingUpdate(reviewId, userId, {
      rating: req.body.rating,
      title: req.body.title,
      content: req.body.content,
      visit_date: visitDate,
    });

    // 4. Send response
    const responseTime = Date.now() - startTime;
    logger.info(`[API] PUT /api/reviews/${reviewId} - ${responseTime}ms`);

    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.status(200).json(review);
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    next(error);
  }
}

/**
 * Delete review (Soft Delete)
 *
 * @route DELETE /api/reviews/:id
 * @param {Object} req - Express request object
 * @param {Object} req.params - Path parameters
 * @param {string} req.params.id - Review ID
 * @param {Object} req.user - Authenticated user (from JWT middleware)
 * @param {number} req.user.id - User ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {void} 204 No Content
 *
 * @throws {UnauthorizedError} 401 - Not authenticated
 * @throws {ForbiddenError} 403 - Not owner
 * @throws {NotFoundError} 404 - Review not found
 */
export async function deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  const startTime = Date.now();

  try {
    // 1. Validate request
    const validation = deleteReviewSchema.safeParse({
      params: req.params,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new ValidationError('Invalid request parameters', errors);
    }

    const reviewId = parseInt(req.params.id, 10);
    const userId = (req as { user: { id: number } }).user.id as number;

    // 2. Delete review
    await deleteReviewWithRatingUpdate(reviewId, userId);

    // 3. Send response
    const responseTime = Date.now() - startTime;
    logger.info(`[API] DELETE /api/reviews/${reviewId} - ${responseTime}ms`);

    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.status(204).send();
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    next(error);
  }
}

/**
 * Add or update reaction to review
 *
 * @route POST /api/reviews/:id/reactions
 * @param {Object} req - Express request object
 * @param {Object} req.params - Path parameters
 * @param {string} req.params.id - Review ID
 * @param {Object} req.body - Request body
 * @param {string|null} req.body.reaction - 'helpful' | 'unhelpful' | null
 * @param {Object} req.user - Authenticated user (from JWT middleware)
 * @param {number} req.user.id - User ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Object} Updated reaction counts and my_reaction
 *
 * @throws {ValidationError} 400 - Invalid request body
 * @throws {UnauthorizedError} 401 - Not authenticated
 * @throws {NotFoundError} 404 - Review not found
 */
export async function addReaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  const startTime = Date.now();

  try {
    // 1. Validate request
    const validation = addReactionSchema.safeParse({
      params: req.params,
      body: req.body,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new ValidationError('Invalid request body', errors);
    }

    const reviewId = parseInt(req.params.id, 10);
    const userId = (req as { user: { id: number } }).user.id as number;

    // 2. Convert 'helpful'/'unhelpful' to 'HELPFUL'/'UNHELPFUL'
    const reactionType = req.body.reaction
      ? req.body.reaction === 'helpful'
        ? ('HELPFUL' as const)
        : ('UNHELPFUL' as const)
      : null;

    // 3. Upsert reaction
    const result = await upsertReaction(userId, reviewId, reactionType);

    // 4. Send response
    const responseTime = Date.now() - startTime;
    logger.info(`[API] POST /api/reviews/${reviewId}/reactions - ${responseTime}ms`);

    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.status(200).json(result);
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    next(error);
  }
}

/**
 * Express error handling middleware
 * Converts AppError instances to appropriate HTTP responses
 *
 * @param err - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error('[Error]', { name: err.name, message: err.message, stack: err.stack });

  // Handle custom API errors
  if (err instanceof AppError) {
    const statusCode = err.statusCode;
    const response: { error: string; message: string; details?: unknown; existing_review_id?: number } = {
      error: err.name.replace('Error', '').toUpperCase(),
      message: err.message,
    };

    // Add additional fields for specific error types
    if (err instanceof ValidationError && err.details) {
      response.details = err.details;
    }

    // Add existing_review_id for ConflictError
    if (err.name === 'ConflictError' && 'existingId' in err) {
      response.existing_review_id = (err as ConflictError).existingId;
    }

    res.status(statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code: string };

    if (prismaError.code === 'P2025') {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Resource not found',
      });
      return;
    }
  }

  // Default 500 error
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: '서버 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
}

// CommonJS export for compatibility
module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  addReaction,
  errorHandler,
};
