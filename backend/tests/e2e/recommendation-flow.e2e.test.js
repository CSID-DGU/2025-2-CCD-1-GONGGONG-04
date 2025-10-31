/**
 * E2E Tests for Recommendation Flow
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.15: E2E 테스트 작성
 *
 * 전체 플로우 테스트:
 * 1. 자가진단 템플릿 조회
 * 2. 자가진단 제출
 * 3. 추천 계산 (자가진단 결과 활용)
 */

const request = require('supertest');
const app = require('../../src/app');
const {
  getPrismaClient,
  cleanupDatabase,
  closePrismaConnection,
} = require('../helpers/prisma');

let prisma = null;
let createdTemplateId = null;

/**
 * Setup: Run before all tests
 */
beforeAll(async () => {
  prisma = getPrismaClient();
  await cleanupDatabase();

  // Seed test data for E2E flow
  createdTemplateId = await seedE2ETestData();
});

/**
 * Teardown: Run after all tests
 */
afterAll(async () => {
  await cleanupDatabase();
  await closePrismaConnection();
});

/**
 * Seed test data for E2E tests
 */
async function seedE2ETestData() {
  // Create self-assessment template (JSON format)
  const template = await prisma.selfAssessmentTemplate.create({
    data: {
      templateName: 'PHQ-9 간단 버전',
      templateType: 'depression',
      description: 'PHQ-9 기반 우울증 자가진단 (간단 버전)',
      questionsJson: [
        {
          id: 1,
          questionText: '기분이 가라앉거나 우울하거나 희망이 없다고 느꼈다',
          questionOrder: 1,
          options: [
            { value: 0, label: '전혀 그렇지 않다' },
            { value: 1, label: '며칠 동안' },
            { value: 2, label: '일주일 이상' },
            { value: 3, label: '거의 매일' },
          ],
        },
        {
          id: 2,
          questionText: '평소 하던 일에 대한 흥미나 즐거움이 없어졌다',
          questionOrder: 2,
          options: [
            { value: 0, label: '전혀 그렇지 않다' },
            { value: 1, label: '며칠 동안' },
            { value: 2, label: '일주일 이상' },
            { value: 3, label: '거의 매일' },
          ],
        },
      ],
      scoringRulesJson: {
        totalPoints: 6,
        calculation: 'sum',
        severityLevels: [
          { range: [0, 2], code: 'LOW', label: '정상' },
          { range: [3, 4], code: 'MID', label: '중간' },
          { range: [5, 6], code: 'HIGH', label: '심각' },
        ],
      },
      interpretationJson: {
        lowSeverity: {
          title: '정상',
          message: '우울 증상이 거의 없습니다.',
        },
        midSeverity: {
          title: '중간 정도 우울',
          message: '전문가 상담을 권장합니다.',
        },
        highSeverity: {
          title: '심한 우울',
          message: '즉시 전문의 상담이 필요합니다.',
        },
      },
      isActive: true,
      version: '1.0',
    },
  });

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
        ],
      },
      programs: {
        create: [
          { programName: '우울증 상담', programType: 'COUNSELING' },
          { programName: '가족 치료', programType: 'FAMILY_THERAPY' },
        ],
      },
    },
  });

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
        create: [{ staffType: 'social_worker', staffCount: 2 }],
      },
      programs: {
        create: [{ programName: '심리 상담', programType: 'COUNSELING' }],
      },
    },
  });

  console.log('✓ E2E test data seeded: 1 template, 2 centers');
  console.log(`  Template ID: ${template.id}`);

  // Return template ID for tests to use
  return Number(template.id);
}

describe('E2E: Complete Recommendation Flow', () => {
  // ============================================================================
  // E2E Test 1: Self-Assessment → Recommendation (Full Flow)
  // ============================================================================

  test('should complete full flow: get template → submit assessment → get recommendations', async () => {
    // Step 1: Get self-assessment template
    const templateResponse = await request(app)
      .get(`/api/v1/self-assessments/templates/${createdTemplateId}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(templateResponse.body.success).toBe(true);
    expect(templateResponse.body.data).toBeDefined();
    expect(templateResponse.body.data.templateName).toBe('PHQ-9 간단 버전');
    expect(templateResponse.body.data.questions).toHaveLength(2);

    // Step 2: Submit self-assessment
    const assessmentData = {
      sessionId: 'e2e-test-session-123',
      templateId: createdTemplateId,
      answers: [
        { questionId: 1, selectedOption: 2 }, // Score: 2
        { questionId: 2, selectedOption: 1 }, // Score: 1
      ],
    };

    const assessmentResponse = await request(app)
      .post('/api/v1/self-assessments/submit')
      .send(assessmentData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(assessmentResponse.body.success).toBe(true);
    expect(assessmentResponse.body.data).toBeDefined();
    expect(assessmentResponse.body.data.totalScore).toBe(3);
    expect(assessmentResponse.body.data.severity).toBe('MID');

    const assessmentId = assessmentResponse.body.data.assessmentId;

    // Step 3: Get recommendations using assessment result
    const recommendationData = {
      sessionId: 'e2e-test-session-123',
      location: {
        latitude: 37.5665,
        longitude: 126.9780,
      },
      filters: {
        maxDistance: 50,
      },
      assessmentId: assessmentId,
    };

    const recommendationResponse = await request(app)
      .post('/api/v1/recommendations/calculate')
      .send(recommendationData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(recommendationResponse.body.success).toBe(true);
    expect(recommendationResponse.body.data.recommendations).toBeDefined();
    expect(recommendationResponse.body.data.totalCount).toBeGreaterThan(0);

    // Verify recommendation structure
    const firstRecommendation = recommendationResponse.body.data.recommendations[0];
    expect(firstRecommendation).toHaveProperty('centerId');
    expect(firstRecommendation).toHaveProperty('centerName');
    expect(firstRecommendation).toHaveProperty('totalScore');
    expect(firstRecommendation).toHaveProperty('scores');
    expect(firstRecommendation.scores).toHaveProperty('distance');
    expect(firstRecommendation.scores).toHaveProperty('operating');
    expect(firstRecommendation.scores).toHaveProperty('specialty');
    expect(firstRecommendation.scores).toHaveProperty('program');

    // Verify recommendations are sorted by totalScore
    const recommendations = recommendationResponse.body.data.recommendations;
    for (let i = 0; i < recommendations.length - 1; i++) {
      expect(recommendations[i].totalScore).toBeGreaterThanOrEqual(
        recommendations[i + 1].totalScore
      );
    }

    console.log('✓ E2E Test 1: Full flow completed successfully');
    console.log(`  - Template retrieved: ${templateResponse.body.data.templateName}`);
    console.log(`  - Assessment submitted: Score ${assessmentResponse.body.data.totalScore}, Severity ${assessmentResponse.body.data.severity}`);
    console.log(`  - Recommendations received: ${recommendationResponse.body.data.totalCount} centers`);
  }, 10000); // 10 second timeout for E2E test

  // ============================================================================
  // E2E Test 2: Recommendation Only (Without Assessment)
  // ============================================================================

  test('should get recommendations without prior assessment (sessionId only)', async () => {
    const recommendationData = {
      sessionId: 'e2e-test-session-456',
      location: {
        latitude: 37.5665,
        longitude: 126.9780,
      },
      filters: {
        maxDistance: 50,
      },
    };

    const response = await request(app)
      .post('/api/v1/recommendations/calculate')
      .send(recommendationData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.recommendations).toBeDefined();
    expect(response.body.data.totalCount).toBeGreaterThan(0);

    // Verify recommendation structure
    const recommendations = response.body.data.recommendations;
    expect(recommendations.length).toBeGreaterThan(0);

    recommendations.forEach((rec) => {
      expect(rec).toHaveProperty('centerId');
      expect(rec).toHaveProperty('centerName');
      expect(rec).toHaveProperty('totalScore');
      expect(rec.totalScore).toBeGreaterThan(0);
      expect(rec.totalScore).toBeLessThanOrEqual(100);
    });

    console.log('✓ E2E Test 2: Recommendation-only flow completed');
    console.log(`  - Recommendations received: ${response.body.data.totalCount} centers`);
  }, 10000);
});
