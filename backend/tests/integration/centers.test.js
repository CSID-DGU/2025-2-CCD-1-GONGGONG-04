/**
 * Integration tests for GET /api/v1/centers/:id endpoint
 *
 * Test Coverage:
 * - Success cases (200 OK)
 * - Validation errors (400 Bad Request)
 * - Not found errors (404 Not Found)
 * - Edge cases (boundary values, null fields)
 * - Performance tests
 */

const request = require('supertest');
const app = require('../../src/app');
const { getPrismaClient, cleanupDatabase, closePrismaConnection } = require('../helpers/prisma');
const { seedComprehensiveTestData, calculateDistance } = require('../helpers/testData');

// Test data references
let testData = null;
let prisma = null;

// Performance tracking
const PERFORMANCE_THRESHOLD_MS = 500;

/**
 * Setup: Run before all tests
 * Initialize database connection and seed test data
 */
beforeAll(async () => {
  prisma = getPrismaClient();

  // Clean database and seed test data
  await cleanupDatabase();
  testData = await seedComprehensiveTestData();

  console.log(
    `✓ Test data seeded: ${testData.centers.length} centers, ${testData.reviews.length} reviews`
  );
});

/**
 * Teardown: Run after all tests
 * Clean up database and close connections
 */
afterAll(async () => {
  await cleanupDatabase();
  await closePrismaConnection();
});

describe('GET /api/v1/centers/:id', () => {
  // ============================================================================
  // SUCCESS CASES (200 OK)
  // ============================================================================

  describe('Success Cases (200 OK)', () => {
    test('should return center detail without user location', async () => {
      const centerId = Number(testData.centers[0].id);
      const startTime = Date.now();

      const response = await request(app)
        .get(`/api/v1/centers/${centerId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const responseTime = Date.now() - startTime;

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');

      const { data } = response.body;

      // Verify all required fields are present
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('center_name');
      expect(data).toHaveProperty('center_type');
      expect(data).toHaveProperty('contact');
      expect(data).toHaveProperty('location');
      expect(data).toHaveProperty('business_content');
      expect(data).toHaveProperty('stats');

      // Verify data types and values
      expect(typeof data.id).toBe('number');
      expect(data.id).toBe(centerId);
      expect(typeof data.center_name).toBe('string');
      expect(data.center_name).toBe('서울시 정신건강복지센터');
      expect(typeof data.center_type).toBe('string');

      // Verify contact object
      expect(data.contact).toHaveProperty('phone');
      expect(data.contact).toHaveProperty('road_address');
      expect(data.contact).toHaveProperty('jibun_address');
      expect(typeof data.contact.road_address).toBe('string');

      // Verify location object (no distance without user location)
      expect(data.location).toHaveProperty('latitude');
      expect(data.location).toHaveProperty('longitude');
      expect(typeof data.location.latitude).toBe('number');
      expect(typeof data.location.longitude).toBe('number');
      expect(data.location).not.toHaveProperty('distance');

      // Verify stats object
      expect(data.stats).toHaveProperty('avg_rating');
      expect(data.stats).toHaveProperty('review_count');
      expect(data.stats).toHaveProperty('favorite_count');
      expect(data.stats).toHaveProperty('view_count');
      expect(typeof data.stats.avg_rating).toBe('number');
      expect(typeof data.stats.review_count).toBe('number');
      expect(typeof data.stats.favorite_count).toBe('number');
      expect(typeof data.stats.view_count).toBe('number');

      // Performance check
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    test('should return center detail with valid user location (includes distance)', async () => {
      const centerId = Number(testData.centers[1].id); // Gangnam center
      const userLat = 37.5665; // Seoul City Hall
      const userLng = 126.978;

      const response = await request(app)
        .get(`/api/v1/centers/${centerId}`)
        .query({ user_lat: userLat, user_lng: userLng })
        .expect('Content-Type', /json/)
        .expect(200);

      const { data } = response.body;

      // Verify distance is included
      expect(data.location).toHaveProperty('distance');
      expect(typeof data.location.distance).toBe('number');
      expect(data.location.distance).toBeGreaterThan(0);

      // Verify distance calculation accuracy (within 1% tolerance)
      const expectedDistance = calculateDistance(
        userLat,
        userLng,
        Number(testData.centers[1].latitude),
        Number(testData.centers[1].longitude)
      );
      const tolerance = expectedDistance * 0.01; // 1% tolerance
      expect(data.location.distance).toBeCloseTo(expectedDistance, 2);
      expect(Math.abs(data.location.distance - expectedDistance)).toBeLessThan(tolerance);
    });

    test('should handle center with null optional fields', async () => {
      const centerId = Number(testData.centers[2].id); // Mapo center (has nulls)

      const response = await request(app).get(`/api/v1/centers/${centerId}`).expect(200);

      const { data } = response.body;

      // Verify null fields are properly returned
      expect(data.contact.phone).toBeNull();
      expect(data.contact.jibun_address).toBeNull();
      expect(data.business_content).toBeNull();

      // Verify other fields are still present
      expect(data.contact.road_address).toBeTruthy();
      expect(data.location.latitude).toBeTruthy();
      expect(data.location.longitude).toBeTruthy();
    });

    test('should return stats with accurate review counts', async () => {
      const centerId = Number(testData.centers[0].id); // Has 2 reviews

      const response = await request(app).get(`/api/v1/centers/${centerId}`).expect(200);

      const { data } = response.body;

      // Verify review count matches seeded data
      expect(data.stats.review_count).toBe(2);

      // Verify average rating calculation (5 + 4) / 2 = 4.5
      expect(data.stats.avg_rating).toBe(4.5);

      // Verify favorite count (user favorited this center)
      expect(data.stats.favorite_count).toBe(1);
    });
  });

  // ============================================================================
  // VALIDATION ERRORS (400 Bad Request)
  // ============================================================================

  describe('Validation Errors (400 Bad Request)', () => {
    describe('Invalid Center ID Formats', () => {
      test('should reject negative center ID', async () => {
        const response = await request(app)
          .get('/api/v1/centers/-1')
          .expect('Content-Type', /json/)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('message');
        expect(response.body.error.message).toMatch(/invalid.*center.*id/i);
      });

      test('should reject zero as center ID', async () => {
        const response = await request(app).get('/api/v1/centers/0').expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/invalid.*center.*id/i);
      });

      test('should reject decimal center ID', async () => {
        const response = await request(app).get('/api/v1/centers/1.5').expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/invalid.*center.*id/i);
      });

      test('should reject non-numeric center ID', async () => {
        const response = await request(app).get('/api/v1/centers/abc').expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/invalid.*center.*id/i);
      });

      test('should reject special characters in center ID', async () => {
        const response = await request(app).get('/api/v1/centers/123@#$').expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('Coordinate Validation', () => {
      test('should reject user_lat without user_lng', async () => {
        const centerId = Number(testData.centers[0].id);

        const response = await request(app)
          .get(`/api/v1/centers/${centerId}`)
          .query({ user_lat: 37.5665 })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/both.*user_lat.*user_lng/i);
      });

      test('should reject user_lng without user_lat', async () => {
        const centerId = Number(testData.centers[0].id);

        const response = await request(app)
          .get(`/api/v1/centers/${centerId}`)
          .query({ user_lng: 126.978 })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/both.*user_lat.*user_lng/i);
      });

      test('should reject latitude less than -90', async () => {
        const centerId = Number(testData.centers[0].id);

        const response = await request(app)
          .get(`/api/v1/centers/${centerId}`)
          .query({ user_lat: -91, user_lng: 126.978 })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/invalid.*latitude/i);
      });

      test('should reject latitude greater than 90', async () => {
        const centerId = Number(testData.centers[0].id);

        const response = await request(app)
          .get(`/api/v1/centers/${centerId}`)
          .query({ user_lat: 91, user_lng: 126.978 })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/invalid.*latitude/i);
      });

      test('should reject longitude less than -180', async () => {
        const centerId = Number(testData.centers[0].id);

        const response = await request(app)
          .get(`/api/v1/centers/${centerId}`)
          .query({ user_lat: 37.5665, user_lng: -181 })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/invalid.*longitude/i);
      });

      test('should reject longitude greater than 180', async () => {
        const centerId = Number(testData.centers[0].id);

        const response = await request(app)
          .get(`/api/v1/centers/${centerId}`)
          .query({ user_lat: 37.5665, user_lng: 181 })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/invalid.*longitude/i);
      });

      test('should reject non-numeric latitude', async () => {
        const centerId = Number(testData.centers[0].id);

        const response = await request(app)
          .get(`/api/v1/centers/${centerId}`)
          .query({ user_lat: 'abc', user_lng: 126.978 })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/invalid.*latitude/i);
      });

      test('should reject non-numeric longitude', async () => {
        const centerId = Number(testData.centers[0].id);

        const response = await request(app)
          .get(`/api/v1/centers/${centerId}`)
          .query({ user_lat: 37.5665, user_lng: 'xyz' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/invalid.*longitude/i);
      });
    });
  });

  // ============================================================================
  // NOT FOUND ERRORS (404 Not Found)
  // ============================================================================

  describe('Not Found Errors (404 Not Found)', () => {
    test('should return 404 for non-existent center ID', async () => {
      const nonExistentId = 999999;

      const response = await request(app)
        .get(`/api/v1/centers/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toMatch(/center.*not found/i);
      expect(response.body.error.message).toContain(nonExistentId.toString());
    });

    test('should return 404 for very large center ID', async () => {
      const largeId = 2147483647; // Max 32-bit integer

      const response = await request(app).get(`/api/v1/centers/${largeId}`).expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/not found/i);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    test('should accept boundary latitude values (-90, 90)', async () => {
      const centerId = Number(testData.centers[0].id);

      // Test -90 latitude (South Pole)
      const response1 = await request(app)
        .get(`/api/v1/centers/${centerId}`)
        .query({ user_lat: -90, user_lng: 0 })
        .expect(200);

      expect(response1.body.data.location).toHaveProperty('distance');
      expect(response1.body.data.location.distance).toBeGreaterThan(0);

      // Test 90 latitude (North Pole)
      const response2 = await request(app)
        .get(`/api/v1/centers/${centerId}`)
        .query({ user_lat: 90, user_lng: 0 })
        .expect(200);

      expect(response2.body.data.location).toHaveProperty('distance');
      expect(response2.body.data.location.distance).toBeGreaterThan(0);
    });

    test('should accept boundary longitude values (-180, 180)', async () => {
      const centerId = Number(testData.centers[0].id);

      // Test -180 longitude
      const response1 = await request(app)
        .get(`/api/v1/centers/${centerId}`)
        .query({ user_lat: 0, user_lng: -180 })
        .expect(200);

      expect(response1.body.data.location).toHaveProperty('distance');

      // Test 180 longitude
      const response2 = await request(app)
        .get(`/api/v1/centers/${centerId}`)
        .query({ user_lat: 0, user_lng: 180 })
        .expect(200);

      expect(response2.body.data.location).toHaveProperty('distance');
    });

    test('should calculate zero distance for same coordinates', async () => {
      const center = testData.centers[0];
      const centerId = Number(center.id);

      const response = await request(app)
        .get(`/api/v1/centers/${centerId}`)
        .query({
          user_lat: Number(center.latitude),
          user_lng: Number(center.longitude),
        })
        .expect(200);

      expect(response.body.data.location.distance).toBe(0);
    });

    test('should calculate maximum distance for opposite sides of Earth', async () => {
      const centerId = Number(testData.centers[0].id); // Seoul area (37.5665, 126.9780)

      // Opposite coordinates (roughly -37.5665, -53.022)
      const response = await request(app)
        .get(`/api/v1/centers/${centerId}`)
        .query({ user_lat: -37.5665, user_lng: -53.022 })
        .expect(200);

      // Distance should be significant (around half Earth's circumference)
      expect(response.body.data.location.distance).toBeGreaterThan(15000); // > 15,000 km
      expect(response.body.data.location.distance).toBeLessThan(21000); // < 21,000 km (max possible)
    });

    test('should handle decimal precision in coordinates', async () => {
      const centerId = Number(testData.centers[0].id);

      const response = await request(app)
        .get(`/api/v1/centers/${centerId}`)
        .query({ user_lat: 37.5665123456789, user_lng: 126.9780123456789 })
        .expect(200);

      expect(response.body.data.location).toHaveProperty('distance');
      expect(typeof response.body.data.location.distance).toBe('number');

      // Verify distance is rounded to 2 decimal places
      const distanceStr = response.body.data.location.distance.toString();
      const decimalPlaces = distanceStr.includes('.') ? distanceStr.split('.')[1].length : 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance Tests', () => {
    test('should respond within performance threshold (<500ms)', async () => {
      const centerId = Number(testData.centers[0].id);
      const startTime = Date.now();

      await request(app).get(`/api/v1/centers/${centerId}`).expect(200);

      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      console.log(`   ⏱️  Response time: ${responseTime}ms`);
    });

    test('should respond quickly even with distance calculation', async () => {
      const centerId = Number(testData.centers[0].id);
      const startTime = Date.now();

      await request(app)
        .get(`/api/v1/centers/${centerId}`)
        .query({ user_lat: 37.5665, user_lng: 126.978 })
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      console.log(`   ⏱️  Response time (with distance): ${responseTime}ms`);
    });

    test('should increment view count asynchronously', async () => {
      const center = testData.centers[3]; // Use 4th center (less likely to have views)
      const centerId = Number(center.id);

      // Get initial view count
      const initialResponse = await request(app).get(`/api/v1/centers/${centerId}`).expect(200);

      const initialViewCount = initialResponse.body.data.stats.view_count;

      // Make another request
      await request(app).get(`/api/v1/centers/${centerId}`).expect(200);

      // Wait a bit for async update to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify view count was incremented in database
      const updatedCenter = await prisma.center.findUnique({
        where: { id: center.id },
        select: { viewCount: true },
      });

      expect(Number(updatedCenter.viewCount)).toBeGreaterThan(initialViewCount);
    });
  });

  // ============================================================================
  // RESPONSE SCHEMA VALIDATION
  // ============================================================================

  describe('Response Schema Validation', () => {
    test('should match exact response schema without user location', async () => {
      const centerId = Number(testData.centers[0].id);

      const response = await request(app).get(`/api/v1/centers/${centerId}`).expect(200);

      const { data } = response.body;

      // Verify exact schema structure
      const expectedKeys = [
        'id',
        'center_name',
        'center_type',
        'contact',
        'location',
        'business_content',
        'stats',
      ];
      expect(Object.keys(data).sort()).toEqual(expectedKeys.sort());

      const expectedContactKeys = ['phone', 'road_address', 'jibun_address'];
      expect(Object.keys(data.contact).sort()).toEqual(expectedContactKeys.sort());

      const expectedLocationKeys = ['latitude', 'longitude'];
      expect(Object.keys(data.location).sort()).toEqual(expectedLocationKeys.sort());

      const expectedStatsKeys = ['avg_rating', 'review_count', 'favorite_count', 'view_count'];
      expect(Object.keys(data.stats).sort()).toEqual(expectedStatsKeys.sort());
    });

    test('should match exact response schema with user location', async () => {
      const centerId = Number(testData.centers[0].id);

      const response = await request(app)
        .get(`/api/v1/centers/${centerId}`)
        .query({ user_lat: 37.5665, user_lng: 126.978 })
        .expect(200);

      const { data } = response.body;

      // Verify location includes distance
      const expectedLocationKeys = ['latitude', 'longitude', 'distance'];
      expect(Object.keys(data.location).sort()).toEqual(expectedLocationKeys.sort());
    });
  });
});
