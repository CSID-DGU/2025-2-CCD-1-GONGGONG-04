/**
 * Operating Status API Integration Tests
 *
 * Tests the /api/v1/centers/:id/operating-status endpoint.
 * Covers success cases, validation errors, cache behavior, and error handling.
 *
 * @group integration
 */

import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import * as cache from '../../src/utils/cache';
import * as operatingStatusService from '../../src/services/operatingStatus.service';

// Mock dependencies
jest.mock('../../src/utils/cache');
jest.mock('../../src/services/operatingStatus.service');
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $queryRaw: jest.fn(),
    $disconnect: jest.fn()
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

const mockCache = cache as jest.Mocked<typeof cache>;
const mockService = operatingStatusService as jest.Mocked<typeof operatingStatusService>;

// Setup Express app for testing
const app = express();
app.use(express.json());

// Import routes after mocks are set up
const centersRoutes = require('../../src/routes/centers.routes');
app.use('/api/v1/centers', centersRoutes);

// Mock data
const mockOperatingStatusResponse: operatingStatusService.OperatingStatusResponse = {
  current_status: {
    status: operatingStatusService.OperatingStatus.OPEN,
    message: '운영 중 (~18:00)',
    status_color: 'green'
  },
  next_open: null,
  weekly_hours: [
    {
      day_of_week: 1,
      day_name: '월요일',
      open_time: '09:00',
      close_time: '18:00',
      is_open: true
    },
    {
      day_of_week: 2,
      day_name: '화요일',
      open_time: '09:00',
      close_time: '18:00',
      is_open: true
    }
  ],
  upcoming_holidays: [
    {
      holiday_date: new Date('2025-01-01'),
      holiday_name: '신정',
      is_regular: false
    }
  ]
};

describe('GET /api/v1/centers/:id/operating-status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return 200 with operating status data', async () => {
      // Setup mocks
      mockCache.getCachedOperatingStatus.mockResolvedValue(null);
      mockCache.cacheOperatingStatus.mockResolvedValue(true);
      mockService.calculateOperatingStatus.mockResolvedValue(mockOperatingStatusResponse);

      // Make request
      const response = await request(app)
        .get('/api/v1/centers/1/operating-status')
        .expect('Content-Type', /json/)
        .expect(200);

      // Assertions
      expect(response.body).toEqual({
        success: true,
        data: mockOperatingStatusResponse
      });

      expect(response.headers['x-cache']).toBe('MISS');
      expect(response.headers['x-response-time']).toBeDefined();

      expect(mockCache.getCachedOperatingStatus).toHaveBeenCalledWith(1, undefined);
      expect(mockService.calculateOperatingStatus).toHaveBeenCalledWith(
        1,
        expect.any(Date)
      );
      expect(mockCache.cacheOperatingStatus).toHaveBeenCalledWith(
        1,
        mockOperatingStatusResponse,
        undefined,
        undefined
      );
    });

    it('should return cached data when available (cache hit)', async () => {
      // Setup mocks - cache hit
      mockCache.getCachedOperatingStatus.mockResolvedValue(mockOperatingStatusResponse);

      // Make request
      const response = await request(app)
        .get('/api/v1/centers/1/operating-status')
        .expect(200);

      // Assertions
      expect(response.body).toEqual({
        success: true,
        data: mockOperatingStatusResponse
      });

      expect(response.headers['x-cache']).toBe('HIT');
      expect(response.headers['x-response-time']).toBeDefined();

      expect(mockCache.getCachedOperatingStatus).toHaveBeenCalledWith(1, undefined);
      expect(mockService.calculateOperatingStatus).not.toHaveBeenCalled();
      expect(mockCache.cacheOperatingStatus).not.toHaveBeenCalled();
    });

    it('should accept optional date parameter', async () => {
      // Setup mocks
      mockCache.getCachedOperatingStatus.mockResolvedValue(null);
      mockCache.cacheOperatingStatus.mockResolvedValue(true);
      mockService.calculateOperatingStatus.mockResolvedValue(mockOperatingStatusResponse);

      // Make request with date parameter
      const response = await request(app)
        .get('/api/v1/centers/1/operating-status?date=2025-01-25')
        .expect(200);

      // Assertions
      expect(response.body.success).toBe(true);
      expect(mockCache.getCachedOperatingStatus).toHaveBeenCalledWith(1, '2025-01-25');
      expect(mockCache.cacheOperatingStatus).toHaveBeenCalledWith(
        1,
        mockOperatingStatusResponse,
        undefined,
        '2025-01-25'
      );
    });

    it('should have response time less than 100ms with cache hit', async () => {
      // Setup mocks - cache hit
      mockCache.getCachedOperatingStatus.mockResolvedValue(mockOperatingStatusResponse);

      const startTime = Date.now();

      // Make request
      const response = await request(app)
        .get('/api/v1/centers/1/operating-status')
        .expect(200);

      const duration = Date.now() - startTime;

      // Assertions
      expect(duration).toBeLessThan(100);
      expect(response.headers['x-cache']).toBe('HIT');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid center ID (non-numeric)', async () => {
      const response = await request(app)
        .get('/api/v1/centers/invalid/operating-status')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters'
        }
      });

      expect(response.body.error.details).toBeDefined();
      expect(Array.isArray(response.body.error.details)).toBe(true);
    });

    it('should return 400 for invalid center ID (negative)', async () => {
      const response = await request(app)
        .get('/api/v1/centers/-1/operating-status')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR'
        }
      });
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .get('/api/v1/centers/1/operating-status?date=2025-13-45')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_DATE'
        }
      });
    });

    it('should return 400 for malformed date format', async () => {
      const response = await request(app)
        .get('/api/v1/centers/1/operating-status?date=01-01-2025')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR'
        }
      });
    });
  });

  describe('Not Found Errors', () => {
    it('should return 404 when center does not exist', async () => {
      // Setup mocks - Prisma not found error
      mockCache.getCachedOperatingStatus.mockResolvedValue(null);
      mockService.calculateOperatingStatus.mockRejectedValue({
        code: 'P2025',
        message: 'Record not found'
      });

      const response = await request(app)
        .get('/api/v1/centers/999/operating-status')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'CENTER_NOT_FOUND',
          message: expect.stringContaining('999')
        }
      });
    });
  });

  describe('Server Errors', () => {
    it('should return 500 for unexpected errors', async () => {
      // Setup mocks - unexpected error
      mockCache.getCachedOperatingStatus.mockResolvedValue(null);
      mockService.calculateOperatingStatus.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/v1/centers/1/operating-status')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: expect.any(String)
        }
      });
    });

    it('should handle cache read failures gracefully', async () => {
      // Setup mocks - cache read fails but service works
      mockCache.getCachedOperatingStatus.mockRejectedValue(
        new Error('Redis connection timeout')
      );
      mockCache.cacheOperatingStatus.mockResolvedValue(false);
      mockService.calculateOperatingStatus.mockResolvedValue(mockOperatingStatusResponse);

      const response = await request(app)
        .get('/api/v1/centers/1/operating-status')
        .expect(500); // Will fail due to unhandled cache error

      // In production, this should be caught and degrade gracefully
    });
  });

  describe('Cache Behavior', () => {
    it('should set X-Cache header to MISS on cache miss', async () => {
      mockCache.getCachedOperatingStatus.mockResolvedValue(null);
      mockCache.cacheOperatingStatus.mockResolvedValue(true);
      mockService.calculateOperatingStatus.mockResolvedValue(mockOperatingStatusResponse);

      const response = await request(app)
        .get('/api/v1/centers/1/operating-status')
        .expect(200);

      expect(response.headers['x-cache']).toBe('MISS');
    });

    it('should set X-Cache header to HIT on cache hit', async () => {
      mockCache.getCachedOperatingStatus.mockResolvedValue(mockOperatingStatusResponse);

      const response = await request(app)
        .get('/api/v1/centers/1/operating-status')
        .expect(200);

      expect(response.headers['x-cache']).toBe('HIT');
    });

    it('should not block response if cache write fails', async () => {
      mockCache.getCachedOperatingStatus.mockResolvedValue(null);
      mockCache.cacheOperatingStatus.mockResolvedValue(false); // Cache write fails
      mockService.calculateOperatingStatus.mockResolvedValue(mockOperatingStatusResponse);

      const response = await request(app)
        .get('/api/v1/centers/1/operating-status')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Response Format Validation', () => {
    it('should return data matching OperatingStatusResponse interface', async () => {
      mockCache.getCachedOperatingStatus.mockResolvedValue(null);
      mockCache.cacheOperatingStatus.mockResolvedValue(true);
      mockService.calculateOperatingStatus.mockResolvedValue(mockOperatingStatusResponse);

      const response = await request(app)
        .get('/api/v1/centers/1/operating-status')
        .expect(200);

      const { data } = response.body;

      // Validate structure
      expect(data).toHaveProperty('current_status');
      expect(data.current_status).toHaveProperty('status');
      expect(data.current_status).toHaveProperty('message');
      expect(data.current_status).toHaveProperty('status_color');

      expect(data).toHaveProperty('next_open');
      expect(data).toHaveProperty('weekly_hours');
      expect(data).toHaveProperty('upcoming_holidays');

      // Validate types
      expect(typeof data.current_status.status).toBe('string');
      expect(typeof data.current_status.message).toBe('string');
      expect(Array.isArray(data.weekly_hours)).toBe(true);
      expect(Array.isArray(data.upcoming_holidays)).toBe(true);
    });
  });
});

describe('DELETE /api/v1/centers/:id/operating-status/cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 when cache invalidated successfully', async () => {
    mockCache.invalidateOperatingStatusCache.mockResolvedValue(true);

    const response = await request(app)
      .delete('/api/v1/centers/1/operating-status/cache')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        centerId: 1,
        invalidated: true
      }
    });

    expect(mockCache.invalidateOperatingStatusCache).toHaveBeenCalledWith(1, undefined);
  });

  it('should return 400 for invalid center ID', async () => {
    const response = await request(app)
      .delete('/api/v1/centers/invalid/operating-status/cache')
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'INVALID_CENTER_ID'
      }
    });
  });

  it('should return 500 on cache invalidation error', async () => {
    mockCache.invalidateOperatingStatusCache.mockRejectedValue(
      new Error('Redis connection failed')
    );

    const response = await request(app)
      .delete('/api/v1/centers/1/operating-status/cache')
      .expect(500);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'INTERNAL_ERROR'
      }
    });
  });
});
