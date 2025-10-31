/**
 * Integration tests for POST /api/v1/recommendations/calculate endpoint
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.14: API 통합 테스트
 *
 * Test Coverage:
 * - Success cases (200 OK)
 * - Validation errors (400 Bad Request)
 * - Edge cases (no centers, far distance)
 * - Performance tests (<500ms)
 */

const request = require('supertest')
const app = require('../../src/app')
const {
  getPrismaClient,
  cleanupDatabase,
  closePrismaConnection
} = require('../helpers/prisma')

let prisma = null
const PERFORMANCE_THRESHOLD_MS = 500

/**
 * Setup: Run before all tests
 */
beforeAll(async () => {
  prisma = getPrismaClient()
  await cleanupDatabase()

  // Seed test data
  await seedRecommendationTestData()
})

/**
 * Teardown: Run after all tests
 */
afterAll(async () => {
  await cleanupDatabase()
  await closePrismaConnection()
})

/**
 * Seed test data for recommendations
 */
async function seedRecommendationTestData () {
  // Create test centers
  const center1 = await prisma.center.create({
    data: {
      centerName: '서울시 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 중구 세종대로 110',
      phoneNumber: '02-3444-9934',
      latitude: 37.5665,
      longitude: 126.9780,
      isActive: true,
      staff: {
        create: [
          { staffType: 'psychiatrist', staffCount: 2 },
          { staffType: 'nurse', staffCount: 3 },
          { staffType: 'social_worker', staffCount: 1 }
        ]
      }
    }
  })

  const center2 = await prisma.center.create({
    data: {
      centerName: '강남구 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 강남구 테헤란로 211',
      phoneNumber: '02-3442-7582',
      latitude: 37.4979,
      longitude: 127.0276,
      isActive: true,
      staff: {
        create: [
          { staffType: 'nurse', staffCount: 2 }
        ]
      }
    }
  })

  const center3 = await prisma.center.create({
    data: {
      centerName: '마포구 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 마포구 월드컵로 212',
      phoneNumber: '02-3153-9070',
      latitude: 37.5665,
      longitude: 126.9018,
      isActive: true,
      staff: {
        create: [
          { staffType: 'social_worker', staffCount: 1 }
        ]
      }
    }
  })

  console.log('✓ Test data seeded: 3 centers with staff')
}

describe('POST /api/v1/recommendations/calculate', () => {

  // ============================================================================
  // SUCCESS CASES (200 OK)
  // ============================================================================

  describe('Success Cases (200 OK)', () => {

    test('should calculate recommendations with valid request', async () => {
      const startTime = Date.now()

      const requestBody = {
        sessionId: 'test-session-123',
        location: {
          latitude: 37.5665,
          longitude: 126.9780
        },
        filters: {
          maxDistance: 50
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect('Content-Type', /json/)

      const responseTime = Date.now() - startTime

      // Debug: Log the response
      console.log('API Response Status:', response.status)
      console.log('API Response:', JSON.stringify(response.body, null, 2))

      // Check for errors first
      if (response.status !== 200) {
        console.error('Error response:', response.body)
        throw new Error(`Expected 200 but got ${response.status}`)
      }

      expect(response.status).toBe(200)

      // Verify response structure
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('recommendations')
      expect(response.body.data).toHaveProperty('totalCount')

      // Verify recommendations array
      expect(Array.isArray(response.body.data.recommendations)).toBe(true)
      expect(response.body.data.totalCount).toBeGreaterThan(0)

      // Verify first recommendation structure
      const firstRec = response.body.data.recommendations[0]
      expect(firstRec).toHaveProperty('centerId')
      expect(firstRec).toHaveProperty('centerName')
      expect(firstRec).toHaveProperty('centerType')
      expect(firstRec).toHaveProperty('roadAddress')
      expect(firstRec).toHaveProperty('distance')
      expect(firstRec).toHaveProperty('totalScore')
      expect(firstRec).toHaveProperty('scores')

      // Verify scores object
      expect(firstRec.scores).toHaveProperty('distance')
      expect(firstRec.scores).toHaveProperty('operating')
      expect(firstRec.scores).toHaveProperty('specialty')
      expect(firstRec.scores).toHaveProperty('program')

      // Verify score types and ranges
      expect(typeof firstRec.totalScore).toBe('number')
      expect(firstRec.totalScore).toBeGreaterThan(0)
      expect(firstRec.totalScore).toBeLessThanOrEqual(100)

      // Performance check
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })

    test('should return recommendations sorted by totalScore descending', async () => {
      const requestBody = {
        sessionId: 'test-session-456',
        location: {
          latitude: 37.5665,
          longitude: 126.9780
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(200)

      const recommendations = response.body.data.recommendations

      // Verify sorting (descending totalScore)
      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].totalScore).toBeGreaterThanOrEqual(
          recommendations[i + 1].totalScore
        )
      }
    })

    test('should return maximum 10 recommendations', async () => {
      const requestBody = {
        sessionId: 'test-session-789',
        location: {
          latitude: 37.5665,
          longitude: 126.9780
        },
        filters: {
          maxDistance: 100
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(200)

      const recommendations = response.body.data.recommendations

      expect(recommendations.length).toBeLessThanOrEqual(10)
    })

    test('should accept userId instead of sessionId', async () => {
      const requestBody = {
        userId: 1,
        location: {
          latitude: 37.5665,
          longitude: 126.9780
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.recommendations).toBeDefined()
    })

    test('should use default maxDistance when not provided', async () => {
      const requestBody = {
        sessionId: 'test-default-distance',
        location: {
          latitude: 37.5665,
          longitude: 126.9780
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(200)

      // Should still return results with default maxDistance
      expect(response.body.data.totalCount).toBeGreaterThan(0)
    })

  })

  // ============================================================================
  // VALIDATION ERRORS (400 Bad Request)
  // ============================================================================

  describe('Validation Errors (400 Bad Request)', () => {

    test('should reject request without userId or sessionId', async () => {
      const requestBody = {
        location: {
          latitude: 37.5665,
          longitude: 126.9780
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(response.body.error.message).toMatch(/userId.*sessionId/i)
    })

    test('should reject request without location', async () => {
      const requestBody = {
        sessionId: 'test-session-123'
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    test('should reject invalid latitude (< -90)', async () => {
      const requestBody = {
        sessionId: 'test-session-123',
        location: {
          latitude: -91,
          longitude: 126.9780
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    test('should reject invalid latitude (> 90)', async () => {
      const requestBody = {
        sessionId: 'test-session-123',
        location: {
          latitude: 91,
          longitude: 126.9780
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    test('should reject invalid longitude (< -180)', async () => {
      const requestBody = {
        sessionId: 'test-session-123',
        location: {
          latitude: 37.5665,
          longitude: -181
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    test('should reject invalid longitude (> 180)', async () => {
      const requestBody = {
        sessionId: 'test-session-123',
        location: {
          latitude: 37.5665,
          longitude: 181
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    test('should reject invalid maxDistance (> 50)', async () => {
      const requestBody = {
        sessionId: 'test-session-123',
        location: {
          latitude: 37.5665,
          longitude: 126.9780
        },
        filters: {
          maxDistance: 100
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    test('should reject negative maxDistance', async () => {
      const requestBody = {
        sessionId: 'test-session-123',
        location: {
          latitude: 37.5665,
          longitude: 126.9780
        },
        filters: {
          maxDistance: -10
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(400)

      expect(response.body.success).toBe(false)
    })

  })

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {

    test('should return empty array when no centers within maxDistance', async () => {
      const requestBody = {
        sessionId: 'test-far-location',
        location: {
          latitude: 33.5100, // Jeju Island
          longitude: 126.5200
        },
        filters: {
          maxDistance: 10 // Only 10km radius
        }
      }

      const response = await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(200)

      expect(response.body.data.recommendations).toEqual([])
      expect(response.body.data.totalCount).toBe(0)
      expect(response.body.data.message).toMatch(/검색 조건에 맞는 센터가 없습니다/)
    })

    test('should handle boundary latitude values (-90, 90)', async () => {
      const requestBody1 = {
        sessionId: 'test-south-pole',
        location: {
          latitude: -90,
          longitude: 0
        }
      }

      await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody1)
        .expect(200)

      const requestBody2 = {
        sessionId: 'test-north-pole',
        location: {
          latitude: 90,
          longitude: 0
        }
      }

      await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody2)
        .expect(200)
    })

    test('should handle boundary longitude values (-180, 180)', async () => {
      const requestBody1 = {
        sessionId: 'test-west',
        location: {
          latitude: 0,
          longitude: -180
        }
      }

      await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody1)
        .expect(200)

      const requestBody2 = {
        sessionId: 'test-east',
        location: {
          latitude: 0,
          longitude: 180
        }
      }

      await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody2)
        .expect(200)
    })

  })

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance Tests', () => {

    test('should respond within performance threshold (<500ms)', async () => {
      const requestBody = {
        sessionId: 'test-performance',
        location: {
          latitude: 37.5665,
          longitude: 126.9780
        }
      }

      const startTime = Date.now()

      await request(app)
        .post('/api/v1/recommendations/calculate')
        .send(requestBody)
        .expect(200)

      const responseTime = Date.now() - startTime

      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
      console.log(`   ⏱️  Response time: ${responseTime}ms`)
    })

  })

})
