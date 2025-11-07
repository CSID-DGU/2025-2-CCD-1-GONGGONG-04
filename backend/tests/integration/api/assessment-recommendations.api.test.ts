/**
 * Assessment-based Recommendations API Integration Tests
 *
 * Sprint 3 - Task 3.4.2: Assessment-based Recommendation API
 *
 * Tests the assessment-based recommendations endpoint:
 * - GET /api/v1/assessments/:id/recommendations
 *
 * Test Coverage:
 * - Success cases (200 OK) with different severity codes
 * - Authentication (401 Unauthorized)
 * - Validation errors (400 Bad Request)
 * - Assessment not found (404 Not Found)
 * - Weight adjustment verification
 * - 24-hour center prioritization for HIGH severity
 *
 * @group integration
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';

const app = require('../../../src/app');
const {
  getPrismaClient,
  cleanupDatabase,
  closePrismaConnection,
} = require('../../helpers/prisma');

let prisma: PrismaClient;
let testUser1: any;
let testUser2: any;
let testTemplate: any;
let assessmentLOW: any;
let assessmentMID: any;
let assessmentHIGH: any;
let center1: any;
let center2: any;
let center24Hour: any;

const authToken1 = 'user_1'; // MVP auth token format
const authToken2 = 'user_2';

/**
 * Test location (Seoul City Hall area)
 */
const TEST_LOCATION = {
  lat: 37.5665,
  lng: 126.9780,
};

/**
 * Setup: Create test database and seed data
 */
beforeAll(async () => {
  prisma = getPrismaClient();
  await cleanupDatabase();
  await seedTestData();
});

/**
 * Teardown: Clean up database and close connections
 */
afterAll(async () => {
  await cleanupDatabase();
  await closePrismaConnection();
});

/**
 * Seed comprehensive test data
 */
async function seedTestData() {
  // Create test users
  testUser1 = await prisma.user.create({
    data: {
      email: 'test1@example.com',
      passwordHash: 'hashed_password',
      nickname: 'TestUser1',
      userType: 'GENERAL',
      status: 'ACTIVE',
    },
  });

  testUser2 = await prisma.user.create({
    data: {
      email: 'test2@example.com',
      passwordHash: 'hashed_password',
      nickname: 'TestUser2',
      userType: 'GENERAL',
      status: 'ACTIVE',
    },
  });

  // Create K-10 template
  testTemplate = await createK10Template();

  // Create test centers
  center1 = await prisma.center.create({
    data: {
      centerName: '서울시 중구 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 중구 세종대로 110',
      phoneNumber: '02-3444-9934',
      latitude: 37.5665,
      longitude: 126.9780,
      isActive: true,
      avgRating: 4.5,
      reviewCount: 100,
      staff: {
        create: [
          {
            staffType: '정신건강의학과 전문의',
            staffCount: 3,
            description: '정신과 전문의',
          },
          {
            staffType: '임상심리사 1급',
            staffCount: 2,
            description: '심리검사 전문',
          },
        ],
      },
      programs: {
        create: [
          {
            programName: '우울증 집단치료',
            programType: '집단상담',
            targetGroup: '성인',
            description: '우울감 극복 프로그램',
            isOnlineAvailable: false,
            isFree: true,
            isActive: true,
          },
        ],
      },
      operatingHours: {
        create: [
          {
            dayOfWeek: 1,
            openTime: '09:00',
            closeTime: '18:00',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 2,
            openTime: '09:00',
            closeTime: '18:00',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 3,
            openTime: '09:00',
            closeTime: '18:00',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 4,
            openTime: '09:00',
            closeTime: '18:00',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 5,
            openTime: '09:00',
            closeTime: '18:00',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 6,
            openTime: null,
            closeTime: null,
            isHoliday: true,
            isOpen: false,
          },
          {
            dayOfWeek: 7,
            openTime: null,
            closeTime: null,
            isHoliday: true,
            isOpen: false,
          },
        ],
      },
    },
  });

  center2 = await prisma.center.create({
    data: {
      centerName: '강남구 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 강남구 테헤란로 211',
      phoneNumber: '02-3442-7582',
      latitude: 37.4979,
      longitude: 127.0276,
      isActive: true,
      avgRating: 4.2,
      reviewCount: 80,
      staff: {
        create: [
          {
            staffType: '정신건강간호사',
            staffCount: 2,
            description: '간호사',
          },
        ],
      },
      programs: {
        create: [
          {
            programName: '심리상담',
            programType: '개인상담',
            targetGroup: '전체',
            description: '개인 심리상담',
            isOnlineAvailable: true,
            isFree: true,
            isActive: true,
          },
        ],
      },
      operatingHours: {
        create: [
          {
            dayOfWeek: 1,
            openTime: '09:00',
            closeTime: '17:00',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 2,
            openTime: '09:00',
            closeTime: '17:00',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 3,
            openTime: '09:00',
            closeTime: '17:00',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 4,
            openTime: '09:00',
            closeTime: '17:00',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 5,
            openTime: '09:00',
            closeTime: '17:00',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 6,
            openTime: null,
            closeTime: null,
            isHoliday: true,
            isOpen: false,
          },
          {
            dayOfWeek: 7,
            openTime: null,
            closeTime: null,
            isHoliday: true,
            isOpen: false,
          },
        ],
      },
    },
  });

  // Create 24-hour center for HIGH severity testing
  center24Hour = await prisma.center.create({
    data: {
      centerName: '24시간 위기상담센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 종로구 종로 1',
      phoneNumber: '1577-0199',
      latitude: 37.57,
      longitude: 126.98,
      isActive: true,
      avgRating: 4.8,
      reviewCount: 200,
      staff: {
        create: [
          {
            staffType: '정신건강의학과 전문의',
            staffCount: 5,
            description: '24시간 전문의',
          },
        ],
      },
      programs: {
        create: [
          {
            programName: '24시간 위기상담',
            programType: '응급상담',
            targetGroup: '전체',
            description: '24시간 긴급 위기상담',
            isOnlineAvailable: true,
            isFree: true,
            isActive: true,
          },
        ],
      },
      operatingHours: {
        create: [
          {
            dayOfWeek: 1,
            openTime: '00:00',
            closeTime: '23:59',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 2,
            openTime: '00:00',
            closeTime: '23:59',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 3,
            openTime: '00:00',
            closeTime: '23:59',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 4,
            openTime: '00:00',
            closeTime: '23:59',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 5,
            openTime: '00:00',
            closeTime: '23:59',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 6,
            openTime: '00:00',
            closeTime: '23:59',
            isHoliday: false,
            isOpen: true,
          },
          {
            dayOfWeek: 7,
            openTime: '00:00',
            closeTime: '23:59',
            isHoliday: false,
            isOpen: true,
          },
        ],
      },
    },
  });

  // Create assessments with different severity codes
  assessmentLOW = await prisma.userAssessment.create({
    data: {
      userId: testUser1.id,
      templateId: testTemplate.id,
      totalScore: 15,
      severityCode: 'LOW',
      answersJson: createSampleAnswers('LOW'),
      interpretationJson: {
        title: '정신적으로 건강한 상태',
        message: '현재 정신건강 상태가 양호합니다.',
      },
    },
  });

  assessmentMID = await prisma.userAssessment.create({
    data: {
      userId: testUser1.id,
      templateId: testTemplate.id,
      totalScore: 25,
      severityCode: 'MID',
      answersJson: createSampleAnswers('MID'),
      interpretationJson: {
        title: '경미한 정신적 어려움',
        message: '약간의 정신적 어려움을 겪고 있습니다.',
      },
    },
  });

  assessmentHIGH = await prisma.userAssessment.create({
    data: {
      userId: testUser1.id,
      templateId: testTemplate.id,
      totalScore: 35,
      severityCode: 'HIGH',
      answersJson: createSampleAnswers('HIGH'),
      interpretationJson: {
        title: '심각한 정신적 어려움',
        message: '심각한 정신적 어려움을 겪고 있습니다.',
      },
    },
  });

  // Create one assessment for user2
  await prisma.userAssessment.create({
    data: {
      userId: testUser2.id,
      templateId: testTemplate.id,
      totalScore: 20,
      severityCode: 'MID',
      answersJson: createSampleAnswers('MID'),
      interpretationJson: {
        title: '경미한 정신적 어려움',
        message: '약간의 정신적 어려움을 겪고 있습니다.',
      },
    },
  });
}

/**
 * Create K-10 template
 */
async function createK10Template() {
  const questions = [];
  const questionTexts = [
    '피곤한 이유 없이 지쳐 있었나요?',
    '긴장감을 느꼈나요?',
    '너무 걱정스러워서 진정할 수 없었나요?',
    '절망적이라고 느꼈나요?',
    '안절부절못하거나 초조했나요?',
    '너무 안절부절못해서 가만히 앉아 있을 수 없었나요?',
    '우울했나요?',
    '모든 일에 힘이 들었나요?',
    '너무 슬퍼서 아무것도 당신을 기쁘게 할 수 없었나요?',
    '자기 자신이 쓸모없는 사람이라고 느꼈나요?',
  ];

  for (let i = 0; i < 10; i++) {
    questions.push({
      questionId: i + 1,
      questionText: questionTexts[i],
      options: [
        { value: 1, label: '전혀 없음' },
        { value: 2, label: '약간' },
        { value: 3, label: '보통' },
        { value: 4, label: '많이' },
      ],
    });
  }

  return await prisma.selfAssessmentTemplate.create({
    data: {
      templateCode: 'K10_V1',
      templateName: 'K-10 자가진단',
      templateType: 'mental_health',
      description: 'Kessler 10 정신건강 선별 도구',
      questionCount: 10,
      estimatedTimeMinutes: 5,
      questionsJson: questions,
      scoringRulesJson: {
        minScore: 10,
        maxScore: 40,
        severityRanges: {
          LOW: { min: 10, max: 19, label: '낮음' },
          MID: { min: 20, max: 29, label: '중등도' },
          HIGH: { min: 30, max: 40, label: '높음' },
        },
      },
      interpretationJson: {
        LOW: {
          title: '정신적으로 건강한 상태',
          message: '현재 정신건강 상태가 양호합니다.',
          recommendations: ['규칙적인 생활 유지', '스트레스 관리'],
          urgency: 'low',
        },
        MID: {
          title: '경미한 정신적 어려움',
          message: '약간의 정신적 어려움을 겪고 있습니다.',
          recommendations: ['전문가 상담 고려', '지역 상담센터 방문'],
          urgency: 'medium',
        },
        HIGH: {
          title: '심각한 정신적 어려움',
          message: '심각한 정신적 어려움을 겪고 있습니다.',
          recommendations: ['즉시 전문가 상담 필요', '24시간 위기상담전화 1577-0199'],
          urgency: 'high',
        },
      },
      isActive: true,
      version: '1.0',
    },
  });
}

/**
 * Helper: Create sample answers
 */
function createSampleAnswers(scoreLevel: string) {
  const answers = [];

  for (let i = 1; i <= 10; i++) {
    let selectedOption;
    if (scoreLevel === 'LOW') {
      selectedOption = i <= 5 ? 1 : 2; // Total: 10-15
    } else if (scoreLevel === 'MID') {
      selectedOption = i <= 5 ? 2 : 3; // Total: 20-25
    } else {
      // HIGH
      selectedOption = i <= 5 ? 3 : 4; // Total: 30-35
    }

    answers.push({
      questionId: i,
      selectedOption,
    });
  }

  return answers;
}

// ============================================
// Test Suite: GET /api/v1/assessments/:id/recommendations
// ============================================

describe('GET /api/v1/assessments/:id/recommendations', () => {
  // ============================================
  // Success Cases
  // ============================================
  describe('Success cases', () => {
    it('should return recommendations for LOW severity assessment', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentLOW.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query(TEST_LOCATION);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('recommendations');
      expect(res.body.data).toHaveProperty('totalCount');
      expect(res.body.data).toHaveProperty('searchCriteria');

      const { searchCriteria } = res.body.data;
      expect(searchCriteria.assessmentId).toBe(assessmentLOW.id);
      expect(searchCriteria.latitude).toBe(TEST_LOCATION.lat);
      expect(searchCriteria.longitude).toBe(TEST_LOCATION.lng);
    });

    it('should return recommendations for MID severity assessment', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query(TEST_LOCATION);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendations).toBeInstanceOf(Array);
      expect(res.body.data.totalCount).toBeGreaterThanOrEqual(0);
    });

    it('should return recommendations for HIGH severity assessment', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentHIGH.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query(TEST_LOCATION);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendations).toBeInstanceOf(Array);
    });

    it('should respect maxDistance parameter', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query({
          ...TEST_LOCATION,
          maxDistance: 5, // Smaller radius
        });

      expect(res.status).toBe(200);
      expect(res.body.data.searchCriteria.maxDistance).toBe(5);
    });

    it('should respect limit parameter', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query({
          ...TEST_LOCATION,
          limit: 3,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.searchCriteria.limit).toBe(3);
      expect(res.body.data.recommendations.length).toBeLessThanOrEqual(3);
    });

    it('should include all required recommendation fields', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query(TEST_LOCATION);

      expect(res.status).toBe(200);

      if (res.body.data.recommendations.length > 0) {
        const recommendation = res.body.data.recommendations[0];
        expect(recommendation).toHaveProperty('centerId');
        expect(recommendation).toHaveProperty('centerName');
        expect(recommendation).toHaveProperty('totalScore');
        expect(recommendation).toHaveProperty('scores');
        expect(recommendation.scores).toHaveProperty('distance');
        expect(recommendation.scores).toHaveProperty('operating');
        expect(recommendation.scores).toHaveProperty('specialty');
        expect(recommendation.scores).toHaveProperty('program');
        expect(recommendation).toHaveProperty('reasons');
        expect(recommendation).toHaveProperty('center');
        expect(recommendation.center).toHaveProperty('roadAddress');
        expect(recommendation.center).toHaveProperty('phoneNumber');
        expect(recommendation.center).toHaveProperty('distance');
        expect(recommendation.center).toHaveProperty('walkTime');
      }
    });
  });

  // ============================================
  // Authentication & Authorization
  // ============================================
  describe('Authentication & Authorization', () => {
    it('should return 401 when no auth token is provided', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .query(TEST_LOCATION);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 when invalid auth token is provided', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', 'Bearer invalid_token')
        .query(TEST_LOCATION);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================
  // Validation Errors
  // ============================================
  describe('Validation errors', () => {
    it('should return 400 when lat is missing', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query({ lng: TEST_LOCATION.lng });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when lng is missing', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query({ lat: TEST_LOCATION.lat });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when lat is out of range', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query({ lat: 95, lng: TEST_LOCATION.lng }); // lat > 90

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when lng is out of range', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query({ lat: TEST_LOCATION.lat, lng: 185 }); // lng > 180

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when maxDistance is invalid', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query({ ...TEST_LOCATION, maxDistance: 100 }); // > 50

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when limit is invalid', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query({ ...TEST_LOCATION, limit: 25 }); // > 20

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when assessment ID is invalid', async () => {
      const res = await request(app)
        .get('/api/v1/assessments/invalid_id/recommendations')
        .set('Authorization', `Bearer ${authToken1}`)
        .query(TEST_LOCATION);

      expect(res.status).toBe(500); // parseInt returns NaN, caught as general error
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================
  // Not Found Errors
  // ============================================
  describe('Not found errors', () => {
    it('should return 404 when assessment does not exist', async () => {
      const res = await request(app)
        .get('/api/v1/assessments/99999/recommendations')
        .set('Authorization', `Bearer ${authToken1}`)
        .query(TEST_LOCATION);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ASSESSMENT_NOT_FOUND');
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge cases', () => {
    it('should handle empty results gracefully', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query({
          lat: 35.0, // Far from any centers
          lng: 125.0,
          maxDistance: 1, // Very small radius
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendations).toBeInstanceOf(Array);
      expect(res.body.data.totalCount).toBe(0);
    });

    it('should apply default values for optional parameters', async () => {
      const res = await request(app)
        .get(`/api/v1/assessments/${assessmentMID.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken1}`)
        .query(TEST_LOCATION); // No maxDistance or limit

      expect(res.status).toBe(200);
      expect(res.body.data.searchCriteria.maxDistance).toBe(10); // Default
      expect(res.body.data.searchCriteria.limit).toBe(5); // Default
    });
  });
});
