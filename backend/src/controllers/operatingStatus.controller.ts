/**
 * Operating Status Controller
 *
 * Handles HTTP requests for center operating status.
 * Implements caching layer with Redis for performance optimization.
 *
 * @module controllers/operatingStatus
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { calculateOperatingStatus } from '../services/operatingStatus.service';
import { getCachedOperatingStatus, cacheOperatingStatus } from '../utils/cache';
import { parseISO, isValid } from 'date-fns';
import logger from '../utils/logger';

/**
 * Validation schema for operating status request
 */
const operatingStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Center ID must be a positive integer'),
  }),
  query: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
  }),
});

/**
 * Get operating status for a center
 *
 * @route GET /api/v1/centers/:id/operating-status
 * @param {Object} req - Express request object
 * @param {Object} req.params - Path parameters
 * @param {string} req.params.id - Center ID
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.date - Optional date in YYYY-MM-DD format (defaults to current date)
 * @param {Object} res - Express response object
 *
 * @returns {Object} Operating status response
 *
 * @example
 * // Get current operating status
 * GET /api/v1/centers/1/operating-status
 *
 * // Get operating status for specific date
 * GET /api/v1/centers/1/operating-status?date=2025-01-25
 */
export async function getOperatingStatus(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();

  try {
    // Validate request
    const validation = operatingStatusSchema.safeParse({
      params: req.params,
      query: req.query,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: errors,
        },
      });
      return;
    }

    const centerId = parseInt(req.params.id, 10);
    const dateParam = req.query.date as string | undefined;

    // Parse and validate date parameter
    let targetDate: Date;
    let dateKey: string | undefined;

    if (dateParam) {
      targetDate = parseISO(dateParam);

      if (!isValid(targetDate)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE',
            message: 'Invalid date format. Use YYYY-MM-DD format.',
          },
        });
        return;
      }

      dateKey = dateParam;
    } else {
      targetDate = new Date();
      dateKey = undefined; // Current date queries don't use date in cache key
    }

    // Check cache first
    let status = await getCachedOperatingStatus(centerId, dateKey);

    if (status) {
      // Cache hit
      const responseTime = Date.now() - startTime;
      logger.info(`[API] Operating status for center ${centerId} (cached): ${responseTime}ms`);

      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time', `${responseTime}ms`);

      res.status(200).json({
        success: true,
        data: status,
      });
      return;
    }

    // Cache miss - calculate from database
    logger.info(`[API] Cache miss for center ${centerId}, calculating...`);

    status = await calculateOperatingStatus(centerId, targetDate);

    // Cache the result (don't wait for cache write)
    cacheOperatingStatus(centerId, status, undefined, dateKey).catch(err => {
      logger.error('[API] Failed to cache operating status:', err);
    });

    const responseTime = Date.now() - startTime;
    logger.info(`[API] Operating status for center ${centerId} (calculated): ${responseTime}ms`);

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time', `${responseTime}ms`);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    logger.error('[API] Operating status error:', error);

    res.setHeader('X-Response-Time', `${responseTime}ms`);

    // Handle specific error types
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      // Prisma record not found
      res.status(404).json({
        success: false,
        error: {
          code: 'CENTER_NOT_FOUND',
          message: `Center with ID ${req.params.id} not found.`,
        },
      });
      return;
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while calculating operating status.',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
    });
  }
}

/**
 * Invalidate operating status cache for a center
 *
 * @route DELETE /api/v1/centers/:id/operating-status/cache
 * @param {Object} req - Express request object
 * @param {Object} req.params - Path parameters
 * @param {string} req.params.id - Center ID
 * @param {Object} res - Express response object
 *
 * @returns {Object} Cache invalidation response
 *
 * @example
 * DELETE /api/v1/centers/1/operating-status/cache
 */
export async function invalidateOperatingStatusCache(req: Request, res: Response): Promise<void> {
  try {
    const centerId = parseInt(req.params.id, 10);

    if (isNaN(centerId) || centerId <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CENTER_ID',
          message: 'Center ID must be a positive integer',
        },
      });
      return;
    }

    const { invalidateOperatingStatusCache: invalidate } = await import('../utils/cache');
    const invalidated = await invalidate(centerId);

    res.status(200).json({
      success: true,
      data: {
        centerId,
        invalidated,
      },
    });
  } catch (error: unknown) {
    logger.error('[API] Cache invalidation error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while invalidating cache.',
      },
    });
  }
}

// CommonJS export for compatibility
module.exports = {
  getOperatingStatus,
  invalidateOperatingStatusCache,
};
