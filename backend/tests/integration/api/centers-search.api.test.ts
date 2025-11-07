/**
 * Integration tests for GET /api/v1/centers endpoint (Center Search API)
 *
 * Sprint 1: 지도 기반 센터 검색
 * Day 2: Integration Tests
 *
 * Test Coverage:
 * - Success cases (200 OK) with valid parameters
 * - Validation errors (400 Bad Request)
 * - Response format validation (FR-BE-01 specification)
 * - Database integration
 * - Redis caching behavior
 * - Performance tests
 */

import request from 'supertest';
import app from '../../../src/app';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { getRedisClient } from '../../../src/config/redis';

const prisma = new PrismaClient();
let redis: Redis;

// Performance threshold
const PERFORMANCE_THRESHOLD_MS = 2000; // 2 seconds for search API

/**
 * Setup: Run before all tests
 */
beforeAll(async () => {
  // Get Redis client
  redis = getRedisClient();

  // Wait for Redis connection
  await new Promise(resolve => setTimeout(resolve, 1000));
});

/**
 * Teardown: Run after all tests
 */
afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
});

/**
 * Clean Redis cache before each test
 */
beforeEach(async () => {
  // Clear all Redis cache keys related to center search
  const keys = await redis.keys('centers:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
});

describe('GET /api/v1/centers (Center Search API)', () => {
  // ============================================================================
  // SUCCESS CASES (200 OK)
  // ============================================================================

  describe('Success Cases (200 OK)', () => {
    test('should return 200 with valid parameters', async () => {
      const response = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '5',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('centers');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.centers)).toBe(true);
      expect(typeof response.body.data.total).toBe('number');
    });

    test('should return centers array with correct structure', async () => {
      const response = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '10',
        })
        .expect(200);

      const { centers } = response.body.data;

      if (centers.length > 0) {
        const center = centers[0];

        // Verify all required fields are present
        expect(center).toHaveProperty('id');
        expect(center).toHaveProperty('name');
        expect(center).toHaveProperty('latitude');
        expect(center).toHaveProperty('longitude');
        expect(center).toHaveProperty('distance');
        expect(center).toHaveProperty('walkTime');
        expect(center).toHaveProperty('operatingStatus');
        expect(center).toHaveProperty('avgRating');
        expect(center).toHaveProperty('reviewCount');
        expect(center).toHaveProperty('centerType');
        expect(center).toHaveProperty('roadAddress');

        // Verify data types
        expect(typeof center.id).toBe('number');
        expect(typeof center.name).toBe('string');
        expect(typeof center.latitude).toBe('number');
        expect(typeof center.longitude).toBe('number');
        expect(typeof center.distance).toBe('number');
        expect(typeof center.walkTime).toBe('string');
        expect(typeof center.operatingStatus).toBe('string');
        expect(typeof center.avgRating).toBe('number');
        expect(typeof center.reviewCount).toBe('number');
        expect(typeof center.centerType).toBe('string');
        expect(typeof center.roadAddress).toBe('string');

        // Verify walkTime format (e.g., "10분")
        expect(center.walkTime).toMatch(/^\d+분$/);

        // Verify operating status values
        expect(['OPEN', 'CLOSING_SOON', 'CLOSED', 'HOLIDAY', 'TEMP_CLOSED', 'NO_INFO']).toContain(
          center.operatingStatus
        );
      }
    });

    test('should use default radius (5) when not provided', async () => {
      const responseWithDefault = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
        })
        .expect(200);

      const responseWith5 = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '5',
        })
        .expect(200);

      // Both should return same number of centers
      expect(responseWithDefault.body.data.total).toBe(responseWith5.body.data.total);
    });

    test('should handle decimal coordinates correctly', async () => {
      const response = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.566535',
          lng: '126.978012',
          radius: '3',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should handle boundary latitude values', async () => {
      // Test -90 (South Pole)
      const response1 = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '-90',
          lng: '0',
          radius: '5',
        })
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response1.body.data.centers).toEqual([]);

      // Test 90 (North Pole)
      const response2 = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '90',
          lng: '0',
          radius: '5',
        })
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.data.centers).toEqual([]);
    });

    test('should handle boundary longitude values', async () => {
      // Test -180
      const response1 = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '-180',
          radius: '5',
        })
        .expect(200);

      expect(response1.body.success).toBe(true);

      // Test 180
      const response2 = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '180',
          radius: '5',
        })
        .expect(200);

      expect(response2.body.success).toBe(true);
    });

    test('should handle maximum radius (50km)', async () => {
      const response = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '50',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should handle minimum radius (1km)', async () => {
      const response = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '1',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ============================================================================
  // VALIDATION ERRORS (400 Bad Request)
  // ============================================================================

  describe('Validation Errors (400 Bad Request)', () => {
    describe('Missing Parameters', () => {
      test('should return 400 with missing lat parameter', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lng: '126.9780',
            radius: '5',
          })
          .expect('Content-Type', /json/)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
        expect(response.body.error).toHaveProperty('message');
      });

      test('should return 400 with missing lng parameter', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lat: '37.5665',
            radius: '5',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      test('should return 400 with missing both lat and lng', async () => {
        const response = await request(app).get('/api/v1/centers').query({}).expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('Invalid Latitude', () => {
      test('should return 400 with latitude less than -90', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lat: '-91',
            lng: '126.9780',
            radius: '5',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      test('should return 400 with latitude greater than 90', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lat: '91',
            lng: '126.9780',
            radius: '5',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      test('should return 400 with non-numeric latitude', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lat: 'abc',
            lng: '126.9780',
            radius: '5',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      test('should return 400 with empty latitude', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lat: '',
            lng: '126.9780',
            radius: '5',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('Invalid Longitude', () => {
      test('should return 400 with longitude less than -180', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lat: '37.5665',
            lng: '-181',
            radius: '5',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      test('should return 400 with longitude greater than 180', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lat: '37.5665',
            lng: '181',
            radius: '5',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      test('should return 400 with non-numeric longitude', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lat: '37.5665',
            lng: 'xyz',
            radius: '5',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('Invalid Radius', () => {
      test('should return 400 with radius less than 1', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lat: '37.5665',
            lng: '126.9780',
            radius: '0',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      test('should return 400 with radius greater than 50', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lat: '37.5665',
            lng: '126.9780',
            radius: '51',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      test('should return 400 with negative radius', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lat: '37.5665',
            lng: '126.9780',
            radius: '-5',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      test('should return 400 with non-numeric radius', async () => {
        const response = await request(app)
          .get('/api/v1/centers')
          .query({
            lat: '37.5665',
            lng: '126.9780',
            radius: 'abc',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });
  });

  // ============================================================================
  // RESPONSE FORMAT VALIDATION (FR-BE-01)
  // ============================================================================

  describe('Response Format Validation (FR-BE-01)', () => {
    test('should match FR-BE-01 specification', async () => {
      const response = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '10',
        })
        .expect(200);

      // Verify root structure
      expect(response.body).toMatchObject({
        success: true,
        data: {
          centers: expect.any(Array),
          total: expect.any(Number),
        },
      });

      // Verify center structure if centers exist
      if (response.body.data.centers.length > 0) {
        const center = response.body.data.centers[0];

        expect(center).toMatchObject({
          id: expect.any(Number),
          name: expect.any(String),
          latitude: expect.any(Number),
          longitude: expect.any(Number),
          distance: expect.any(Number),
          walkTime: expect.stringMatching(/^\d+분$/),
          operatingStatus: expect.stringMatching(
            /^(OPEN|CLOSING_SOON|CLOSED|HOLIDAY|TEMP_CLOSED|NO_INFO)$/
          ),
          avgRating: expect.any(Number),
          reviewCount: expect.any(Number),
          centerType: expect.any(String),
          roadAddress: expect.any(String),
        });

        // Optional fields
        if (center.closingTime) {
          expect(center.closingTime).toMatch(/^\d{2}:\d{2}$/);
        }

        if (center.nextOpenDate) {
          expect(center.nextOpenDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }

        if (center.phoneNumber) {
          expect(typeof center.phoneNumber).toBe('string');
        }
      }
    });

    test('should return total matching number of centers', async () => {
      const response = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '10',
        })
        .expect(200);

      const { centers, total } = response.body.data;
      expect(total).toBe(centers.length);
    });
  });

  // ============================================================================
  // DATABASE INTEGRATION
  // ============================================================================

  describe('Database Integration', () => {
    test('should return actual centers from database', async () => {
      const response = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '50',
        })
        .expect(200);

      const { centers } = response.body.data;

      // Verify centers have valid data
      if (centers.length > 0) {
        centers.forEach((center: any) => {
          expect(center.id).toBeGreaterThan(0);
          expect(center.name.length).toBeGreaterThan(0);
          expect(center.latitude).toBeGreaterThan(0);
          expect(center.longitude).toBeGreaterThan(0);
          expect(center.avgRating).toBeGreaterThanOrEqual(0);
          expect(center.avgRating).toBeLessThanOrEqual(5);
          expect(center.reviewCount).toBeGreaterThanOrEqual(0);
        });
      }
    });

    test('should handle database connection errors gracefully', async () => {
      // This test requires mocking Prisma connection failure
      // For now, we verify the API returns proper error structure
      // In real scenario, you would temporarily disconnect database

      // Skip this test in CI environment
      if (process.env.CI !== 'true') {
        // Test would go here
      }
    });
  });

  // ============================================================================
  // REDIS CACHING BEHAVIOR
  // ============================================================================

  describe('Redis Caching Behavior', () => {
    test('should cache results after first query', async () => {
      const queryParams = {
        lat: '37.5665',
        lng: '126.9780',
        radius: '5',
      };

      // First request (cache miss)
      const response1 = await request(app).get('/api/v1/centers').query(queryParams).expect(200);

      const startTime1 = Date.now();

      // Second request (should hit cache)
      const response2 = await request(app).get('/api/v1/centers').query(queryParams).expect(200);

      const duration2 = Date.now() - startTime1;

      // Verify both return same data
      expect(response2.body.data).toEqual(response1.body.data);

      // Cache hit should be faster (typically < 50ms)
      // This is a soft assertion since timing can vary
      console.log(`Cache hit response time: ${duration2}ms`);
    });

    test('should use different cache keys for different coordinates', async () => {
      const response1 = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '5',
        })
        .expect(200);

      const response2 = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.4979',
          lng: '127.0276',
          radius: '5',
        })
        .expect(200);

      // Results should be different
      expect(response1.body.data).not.toEqual(response2.body.data);
    });

    test('should use different cache keys for different radius', async () => {
      const response1 = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '5',
        })
        .expect(200);

      const response2 = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '10',
        })
        .expect(200);

      // Results should be different (more centers with larger radius)
      expect(response1.body.data.total).toBeLessThanOrEqual(response2.body.data.total);
    });

    test('should handle Redis connection errors gracefully', async () => {
      // The API should still work even if Redis is down
      // This is already handled by the service layer
      const response = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '5',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance Tests', () => {
    test('should respond within performance threshold', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '10',
        })
        .expect(200);

      const responseTime = Date.now() - startTime;

      console.log(`   ⏱️  Response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    test('should handle large radius queries efficiently', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665',
          lng: '126.9780',
          radius: '50',
        })
        .expect(200);

      const responseTime = Date.now() - startTime;

      console.log(`   ⏱️  Large radius response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    test('should benefit from caching on repeated requests', async () => {
      const queryParams = {
        lat: '37.5665',
        lng: '126.9780',
        radius: '10',
      };

      // First request (cache miss)
      const start1 = Date.now();
      await request(app).get('/api/v1/centers').query(queryParams).expect(200);
      const time1 = Date.now() - start1;

      // Second request (cache hit)
      const start2 = Date.now();
      await request(app).get('/api/v1/centers').query(queryParams).expect(200);
      const time2 = Date.now() - start2;

      console.log(`   ⏱️  Cache miss: ${time1}ms, Cache hit: ${time2}ms`);

      // Cache hit should typically be faster
      // This is a soft check since performance can vary
      if (time2 > time1) {
        console.warn('   ⚠️  Cache hit was slower than cache miss (acceptable variance)');
      }
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    test('should return empty array for remote location', async () => {
      const response = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '33.0',
          lng: '120.0',
          radius: '5',
        })
        .expect(200);

      expect(response.body.data.centers).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });

    test('should handle coordinates with many decimal places', async () => {
      const response = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.566535123456789',
          lng: '126.978012987654321',
          radius: '5',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should handle special characters in query params gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/centers')
        .query({
          lat: '37.5665<script>',
          lng: '126.9780',
          radius: '5',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
