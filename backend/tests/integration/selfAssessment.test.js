/**
 * Integration tests for Self-Assessment API endpoints
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.14: API 통합 테스트
 *
 * Endpoints:
 * - GET /api/v1/self-assessments/templates/:templateId
 * - POST /api/v1/self-assessments/submit
 *
 * Test Coverage:
 * - Success cases (200 OK)
 * - Validation errors (400 Bad Request)
 * - Not found errors (404 Not Found)
 * - Edge cases
 * - Performance tests (<500ms)
 */

const request = require('supertest');
const app = require('../../src/app');
const { getPrismaClient, cleanupDatabase, closePrismaConnection } = require('../helpers/prisma');

let prisma = null;
let testTemplate = null;
const PERFORMANCE_THRESHOLD_MS = 500;

/**
 * Setup: Run before all tests
 */
beforeAll(async () => {
  prisma = getPrismaClient();
  await cleanupDatabase();

  // Seed test template
  testTemplate = await seedSelfAssessmentTemplate();
});

/**
 * Teardown: Run after all tests
 */
afterAll(async () => {
  await cleanupDatabase();
  await closePrismaConnection();
});

/**
 * Seed test self-assessment template (PHQ-9)
 */
async function seedSelfAssessmentTemplate() {
  const template = await prisma.selfAssessmentTemplate.create({
    data: {
      templateName: 'PHQ-9 우울증 선별검사',
      templateType: 'PHQ-9',
      description: '9개 항목으로 구성된 우울증 선별 검사',
      questionsJson: [
        {
          questionId: 1,
          questionText: '기분이 가라앉거나, 우울하거나, 희망이 없다고 느꼈다',
          options: [
            { value: 0, label: '전혀 그렇지 않다' },
            { value: 1, label: '며칠 동안' },
            { value: 2, label: '7일 이상' },
            { value: 3, label: '거의 매일' },
          ],
        },
        {
          questionId: 2,
          questionText: '평소 하던 일에 대한 흥미나 즐거움이 거의 없었다',
          options: [
            { value: 0, label: '전혀 그렇지 않다' },
            { value: 1, label: '며칠 동안' },
            { value: 2, label: '7일 이상' },
            { value: 3, label: '거의 매일' },
          ],
        },
      ],
      scoringRulesJson: {
        totalPoints: 27,
        severityRanges: {
          LOW: [0, 8],
          MID: [9, 17],
          HIGH: [18, 27],
        },
      },
      interpretationJson: {
        lowSeverity: {
          message: '경미한 수준',
          recommendation: '일상생활 관리로 충분합니다',
        },
        midSeverity: {
          message: '중간 수준',
          recommendation: '전문가 상담을 고려해보세요',
        },
        highSeverity: {
          message: '높은 수준',
          recommendation: '전문가 상담이 필요합니다',
        },
      },
      isActive: true,
      version: 1,
    },
  });

  console.log(`✓ Test template seeded: ${template.templateName}`);
  return template;
}

// ============================================================================
// GET /api/v1/self-assessments/templates/:templateId
// ============================================================================

describe('GET /api/v1/self-assessments/templates/:templateId', () => {
  describe('Success Cases (200 OK)', () => {
    test('should return template with valid templateId', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get(`/api/v1/self-assessments/templates/${testTemplate.templateId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const responseTime = Date.now() - startTime;

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');

      const { data } = response.body;

      // Verify all required fields
      expect(data).toHaveProperty('templateId', testTemplate.templateId);
      expect(data).toHaveProperty('templateName', 'PHQ-9 우울증 선별검사');
      expect(data).toHaveProperty('templateType', 'PHQ-9');
      expect(data).toHaveProperty('description');
      expect(data).toHaveProperty('questions');
      expect(data).toHaveProperty('scoringRules');
      expect(data).toHaveProperty('version', 1);

      // Verify questions array
      expect(Array.isArray(data.questions)).toBe(true);
      expect(data.questions.length).toBe(2);
      expect(data.questions[0]).toHaveProperty('questionId', 1);
      expect(data.questions[0]).toHaveProperty('questionText');
      expect(data.questions[0]).toHaveProperty('options');

      // Verify scoringRules
      expect(data.scoringRules).toHaveProperty('totalPoints', 27);
      expect(data.scoringRules).toHaveProperty('severityRanges');

      // Performance check
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });
  });

  describe('Validation Errors (400 Bad Request)', () => {
    test('should reject negative templateId', async () => {
      const response = await request(app).get('/api/v1/self-assessments/templates/-1').expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject zero as templateId', async () => {
      const response = await request(app).get('/api/v1/self-assessments/templates/0').expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject non-numeric templateId', async () => {
      const response = await request(app).get('/api/v1/self-assessments/templates/abc').expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Not Found Errors (404 Not Found)', () => {
    test('should return 404 for non-existent templateId', async () => {
      const response = await request(app)
        .get('/api/v1/self-assessments/templates/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toMatch(/템플릿을 찾을 수 없습니다/);
    });
  });
});

// ============================================================================
// POST /api/v1/self-assessments/submit
// ============================================================================

describe('POST /api/v1/self-assessments/submit', () => {
  describe('Success Cases (200 OK)', () => {
    test('should submit assessment with valid data (LOW severity)', async () => {
      const startTime = Date.now();

      const requestBody = {
        sessionId: 'test-session-low',
        templateId: testTemplate.templateId,
        answers: [
          { questionId: 1, selectedOption: 0 },
          { questionId: 2, selectedOption: 1 },
        ],
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect('Content-Type', /json/)
        .expect(200);

      const responseTime = Date.now() - startTime;

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');

      const { data } = response.body;

      // Verify all required fields
      expect(data).toHaveProperty('assessmentId');
      expect(data).toHaveProperty('templateName', 'PHQ-9 우울증 선별검사');
      expect(data).toHaveProperty('totalScore', 1); // 0 + 1 = 1
      expect(data).toHaveProperty('maxScore', 27);
      expect(data).toHaveProperty('severity', 'LOW');
      expect(data).toHaveProperty('result');
      expect(data).toHaveProperty('assessedAt');

      // Verify result object
      expect(data.result).toHaveProperty('message');
      expect(data.result).toHaveProperty('recommendation');
      expect(data.result.message).toMatch(/경미한 수준/);

      // Performance check
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    test('should submit assessment with MID severity', async () => {
      const requestBody = {
        sessionId: 'test-session-mid',
        templateId: testTemplate.templateId,
        answers: [
          { questionId: 1, selectedOption: 2 },
          { questionId: 2, selectedOption: 2 },
        ],
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect(200);

      const { data } = response.body;

      expect(data.totalScore).toBe(4); // 2 + 2 = 4
      expect(data.severity).toBe('LOW'); // Still LOW (< 9 points)
    });

    test('should submit assessment with HIGH severity', async () => {
      const requestBody = {
        sessionId: 'test-session-high',
        templateId: testTemplate.templateId,
        answers: [
          { questionId: 1, selectedOption: 3 },
          { questionId: 2, selectedOption: 3 },
        ],
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect(200);

      const { data } = response.body;

      expect(data.totalScore).toBe(6); // 3 + 3 = 6
      expect(data.severity).toBe('LOW'); // Still LOW (< 9 points)
    });

    test('should accept userId instead of sessionId', async () => {
      const requestBody = {
        userId: 1,
        templateId: testTemplate.templateId,
        answers: [
          { questionId: 1, selectedOption: 1 },
          { questionId: 2, selectedOption: 1 },
        ],
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assessmentId).toBeDefined();
    });

    test('should create record in database', async () => {
      const requestBody = {
        sessionId: 'test-db-check',
        templateId: testTemplate.templateId,
        answers: [
          { questionId: 1, selectedOption: 2 },
          { questionId: 2, selectedOption: 1 },
        ],
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect(200);

      const assessmentId = response.body.data.assessmentId;

      // Verify record exists in database
      const dbRecord = await prisma.userAssessment.findUnique({
        where: { assessmentId },
      });

      expect(dbRecord).toBeTruthy();
      expect(dbRecord.totalScore).toBe(3);
      expect(dbRecord.severity).toBe('LOW');
      expect(dbRecord.sessionId).toBe('test-db-check');
    });
  });

  describe('Validation Errors (400 Bad Request)', () => {
    test('should reject request without userId or sessionId', async () => {
      const requestBody = {
        templateId: testTemplate.templateId,
        answers: [{ questionId: 1, selectedOption: 0 }],
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toMatch(/userId.*sessionId/i);
    });

    test('should reject request without templateId', async () => {
      const requestBody = {
        sessionId: 'test-session',
        answers: [{ questionId: 1, selectedOption: 0 }],
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject request without answers', async () => {
      const requestBody = {
        sessionId: 'test-session',
        templateId: testTemplate.templateId,
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject empty answers array', async () => {
      const requestBody = {
        sessionId: 'test-session',
        templateId: testTemplate.templateId,
        answers: [],
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject invalid selectedOption (< 0)', async () => {
      const requestBody = {
        sessionId: 'test-session',
        templateId: testTemplate.templateId,
        answers: [{ questionId: 1, selectedOption: -1 }],
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject invalid selectedOption (> 3)', async () => {
      const requestBody = {
        sessionId: 'test-session',
        templateId: testTemplate.templateId,
        answers: [{ questionId: 1, selectedOption: 4 }],
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject negative templateId', async () => {
      const requestBody = {
        sessionId: 'test-session',
        templateId: -1,
        answers: [{ questionId: 1, selectedOption: 0 }],
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Not Found Errors (404 Not Found)', () => {
    test('should return 404 for non-existent templateId', async () => {
      const requestBody = {
        sessionId: 'test-session',
        templateId: 999999,
        answers: [{ questionId: 1, selectedOption: 0 }],
      };

      const response = await request(app)
        .post('/api/v1/self-assessments/submit')
        .send(requestBody)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toMatch(/템플릿을 찾을 수 없습니다/);
    });
  });

  describe('Performance Tests', () => {
    test('should respond within performance threshold (<500ms)', async () => {
      const requestBody = {
        sessionId: 'test-performance',
        templateId: testTemplate.templateId,
        answers: [
          { questionId: 1, selectedOption: 1 },
          { questionId: 2, selectedOption: 1 },
        ],
      };

      const startTime = Date.now();

      await request(app).post('/api/v1/self-assessments/submit').send(requestBody).expect(200);

      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      console.log(`   ⏱️  Response time: ${responseTime}ms`);
    });
  });
});
