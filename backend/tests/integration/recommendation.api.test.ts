/**
 * Integration Tests for Recommendation API
 *
 * Sprint 2 - Task 4.1.5: API 통합 테스트 작성
 *
 * Tests the new TypeScript recommendation API:
 * - POST /api/v1/recommendations
 *
 * Test Coverage:
 * - Success cases (200 OK)
 * - Input validation (400 Bad Request)
 * - Edge cases (no centers, empty results)
 * - Performance requirements (<3 seconds)
 *
 * @group integration
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';

const app = require('../../src/app');
const { getPrismaClient, cleanupDatabase, closePrismaConnection } = require('../helpers/prisma');
const { createCenter, createStaff, createProgram, createOperatingHour, createHoliday } = require('../fixtures/factories');

let prisma: PrismaClient;

const PERFORMANCE_THRESHOLD_MS = 3000; // 3 seconds as per requirements

/**
 * Test user location (Seoul City Hall area)
 */
const TEST_LOCATION = {
  latitude: 37.5665,
  longitude: 126.9780,
};

/**
 * Setup: Create test database and seed data
 */
beforeAll(async () => {
  prisma = getPrismaClient();
  await cleanupDatabase();
  await seedRecommendationTestData();
});

/**
 * Teardown: Clean up database and close connections
 */
afterAll(async () => {
  await cleanupDatabase();
  await closePrismaConnection();
});

/**
 * Seed comprehensive test data for recommendations
 */
async function seedRecommendationTestData() {
  // Center 1: Very close, excellent specialty, currently open
  const center1 = await prisma.center.create({
    data: {
      centerName: '서울시 중구 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 중구 세종대로 110',
      phoneNumber: '02-3444-9934',
      latitude: 37.5665, // Same as test location (0m away)
      longitude: 126.9780,
      isActive: true,
      avgRating: 4.5,
      reviewCount: 100,
      staff: {
        create: [
          { staffType: '정신건강의학과 전문의', staffCount: 3, description: '정신과 전문의' },
          { staffType: '임상심리사 1급', staffCount: 2, description: '심리검사 전문' },
          { staffType: '정신건강간호사', staffCount: 4, description: '정신건강 간호' },
        ],
      },
      programs: {
        create: [
          {
            programName: '개인상담',
            programType: '개인상담',
            targetGroup: '20대,30대,성인',
            description: '1:1 개인 심리상담',
            isOnlineAvailable: false,
            isFree: true,
            isActive: true,
          },
          {
            programName: '우울증 집단치료',
            programType: '집단상담',
            targetGroup: '성인',
            description: '우울감 극복을 위한 집단 프로그램',
            isOnlineAvailable: false,
            isFree: true,
            isActive: true,
          },
          {
            programName: '심리검사',
            programType: '심리검사',
            targetGroup: '전체',
            description: '종합심리검사',
            isOnlineAvailable: false,
            isFree: false,
            feeAmount: 50000,
            isActive: true,
          },
        ],
      },
      operatingHours: {
        create: [
          { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 3, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 4, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 5, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 6, openTime: null, closeTime: null, isHoliday: true, isOpen: false },
          { dayOfWeek: 7, openTime: null, closeTime: null, isHoliday: true, isOpen: false },
        ],
      },
    },
  });

  // Center 2: Moderate distance, good programs
  const center2 = await prisma.center.create({
    data: {
      centerName: '강남구 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 강남구 테헤란로 211',
      phoneNumber: '02-3442-7582',
      latitude: 37.4979, // ~8km away
      longitude: 127.0276,
      isActive: true,
      avgRating: 4.2,
      reviewCount: 80,
      staff: {
        create: [
          { staffType: '정신건강간호사', staffCount: 2, description: '간호사' },
          { staffType: '정신건강사회복지사', staffCount: 1, description: '사회복지사' },
        ],
      },
      programs: {
        create: [
          {
            programName: '온라인 상담',
            programType: '개인상담',
            targetGroup: '전체',
            description: '온라인 화상 상담',
            isOnlineAvailable: true,
            isFree: true,
            isActive: true,
          },
          {
            programName: '불안장애 치료',
            programType: '인지행동치료',
            targetGroup: '성인',
            description: '불안 증상 완화 프로그램',
            isOnlineAvailable: false,
            isFree: true,
            isActive: true,
          },
        ],
      },
      operatingHours: {
        create: [
          { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 3, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 4, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 5, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 6, openTime: null, closeTime: null, isHoliday: true, isOpen: false },
          { dayOfWeek: 7, openTime: null, closeTime: null, isHoliday: true, isOpen: false },
        ],
      },
    },
  });

  // Center 3: Far away (>10km), should not appear in default results
  const center3 = await prisma.center.create({
    data: {
      centerName: '인천시 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '인천광역시 남동구 구월로 100',
      phoneNumber: '032-468-9345',
      latitude: 37.4563, // ~30km away
      longitude: 126.7052,
      isActive: true,
      avgRating: 4.0,
      reviewCount: 50,
      staff: {
        create: [{ staffType: '정신건강간호사', staffCount: 1, description: '간호사' }],
      },
      programs: {
        create: [
          {
            programName: '가족상담',
            programType: '가족상담',
            targetGroup: '전체',
            description: '가족 단위 상담',
            isOnlineAvailable: false,
            isFree: true,
            isActive: true,
          },
        ],
      },
      operatingHours: {
        create: [
          { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 3, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 4, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 5, openTime: '09:00', closeTime: '18:00', isHoliday: false, isOpen: true },
          { dayOfWeek: 6, openTime: null, closeTime: null, isHoliday: true, isOpen: false },
          { dayOfWeek: 7, openTime: null, closeTime: null, isHoliday: true, isOpen: false },
        ],
      },
    },
  });

  console.log('✓ Test data seeded: 3 centers with staff, programs, and operating hours');
}

// ============================================================================
// SUCCESS CASES (200 OK)
// ============================================================================

describe('POST /api/v1/recommendations - Success Cases', () => {
  it('should return 200 with recommendations when only location is provided', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
      })
      .expect('Content-Type', /json/)
      .expect(200);

    const duration = Date.now() - startTime;

    // Verify response structure
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('recommendations');
    expect(response.body.data).toHaveProperty('totalCount');
    expect(response.body.data).toHaveProperty('searchCriteria');

    // Verify recommendations
    const recommendations = response.body.data.recommendations;
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.length).toBeLessThanOrEqual(5); // Default limit

    // Verify first recommendation structure
    const first = recommendations[0];
    expect(first).toHaveProperty('centerId');
    expect(first).toHaveProperty('centerName');
    expect(first).toHaveProperty('totalScore');
    expect(first).toHaveProperty('scores');
    expect(first).toHaveProperty('reasons');
    expect(first).toHaveProperty('center');

    // Verify scores structure
    expect(first.scores).toHaveProperty('distance');
    expect(first.scores).toHaveProperty('operating');
    expect(first.scores).toHaveProperty('specialty');
    expect(first.scores).toHaveProperty('program');

    // Verify center info
    expect(first.center).toHaveProperty('roadAddress');
    expect(first.center).toHaveProperty('phoneNumber');
    expect(first.center).toHaveProperty('distance');
    expect(first.center).toHaveProperty('walkTime');

    // Verify performance (<3 seconds)
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);

    console.log(`✓ Performance: ${duration}ms (threshold: ${PERFORMANCE_THRESHOLD_MS}ms)`);
  });

  it('should return 200 with personalized recommendations when userProfile is provided', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        userProfile: {
          symptoms: ['우울감', '불안'],
          preferredCategory: '개인상담',
          ageGroup: '20대',
          preferOnline: false,
          preferFree: true,
        },
      })
      .expect(200);

    const recommendations = response.body.data.recommendations;
    expect(recommendations.length).toBeGreaterThan(0);

    // First recommendation should have high program score (profile matching)
    const first = recommendations[0];
    expect(first.scores.program).toBeGreaterThan(50); // Should match some programs
  });

  it('should respect the limit parameter', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        limit: 2,
      })
      .expect(200);

    const recommendations = response.body.data.recommendations;
    expect(recommendations.length).toBeLessThanOrEqual(2);
    expect(response.body.data.totalCount).toBe(recommendations.length);
  });

  it('should respect the maxDistance parameter', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        maxDistance: 50, // 50km radius (should include Incheon center)
        limit: 10,
      })
      .expect(200);

    const recommendations = response.body.data.recommendations;
    expect(recommendations.length).toBeGreaterThanOrEqual(2); // Should find more centers
  });

  it('should return centers sorted by totalScore in descending order', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        limit: 5,
      })
      .expect(200);

    const recommendations = response.body.data.recommendations;

    // Verify scores are in descending order
    for (let i = 0; i < recommendations.length - 1; i++) {
      expect(recommendations[i].totalScore).toBeGreaterThanOrEqual(recommendations[i + 1].totalScore);
    }
  });
});

// ============================================================================
// INPUT VALIDATION (400 Bad Request)
// ============================================================================

describe('POST /api/v1/recommendations - Validation Errors', () => {
  it('should return 400 when latitude is missing', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        longitude: TEST_LOCATION.longitude,
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toContain('입력값이 올바르지 않습니다');
  });

  it('should return 400 when longitude is missing', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when latitude is out of range', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: 100, // Invalid (> 90)
        longitude: TEST_LOCATION.longitude,
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when longitude is out of range', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: -200, // Invalid (< -180)
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when symptoms array exceeds limit', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        userProfile: {
          symptoms: Array(15).fill('증상'), // 15 symptoms (max is 10)
        },
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when limit is out of range', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        limit: 50, // Exceeds max (20)
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when maxDistance is out of range', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        maxDistance: 100, // Exceeds max (50km)
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when request body is empty', async () => {
    const response = await request(app).post('/api/v1/recommendations').send({}).expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('POST /api/v1/recommendations - Edge Cases', () => {
  it('should return empty array when no centers are within maxDistance', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: 35.0, // Very far south (Jeju area)
        longitude: 126.5,
        maxDistance: 10,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.recommendations).toEqual([]);
    expect(response.body.data.totalCount).toBe(0);
  });

  it('should handle userProfile with only some fields', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        userProfile: {
          preferOnline: true, // Only one field
        },
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.recommendations.length).toBeGreaterThan(0);
  });

  it('should handle valid sessionId UUID', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('should return 400 for invalid sessionId format', async () => {
    const response = await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        sessionId: 'invalid-uuid',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('POST /api/v1/recommendations - Performance', () => {
  it('should respond within 3 seconds for location-only request', async () => {
    const startTime = Date.now();

    await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
      })
      .expect(200);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
  });

  it('should respond within 3 seconds for complex userProfile request', async () => {
    const startTime = Date.now();

    await request(app)
      .post('/api/v1/recommendations')
      .send({
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        userProfile: {
          symptoms: ['우울감', '불안', '스트레스', '불면증'],
          preferredCategory: '개인상담',
          ageGroup: '20대',
          preferOnline: false,
          preferFree: true,
        },
        maxDistance: 20,
        limit: 10,
      })
      .expect(200);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
  });
});
