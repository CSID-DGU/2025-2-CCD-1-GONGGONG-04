/**
 * Assessment API Integration Tests
 *
 * Sprint 3: 자가진단 도구 구현 및 추천 시스템 연동
 * Task 3.1.4: API 엔드포인트 구현
 *
 * Tests all 7 assessment API endpoints with authentication, validation, and authorization.
 *
 * Endpoints Tested:
 * - GET  /api/v1/assessments/templates          - Public
 * - GET  /api/v1/assessments/templates/:id      - Public
 * - POST /api/v1/assessments                    - Protected
 * - GET  /api/v1/assessments/:id/result         - Protected
 * - GET  /api/v1/assessments/history            - Protected
 * - GET  /api/v1/assessments/latest             - Protected
 * - DELETE /api/v1/assessments/:id              - Protected
 */

const request = require('supertest');
const app = require('../../../src/app');
const { getPrismaClient, cleanupDatabase, closePrismaConnection } = require('../../helpers/prisma');

let prisma = null;
let testTemplate = null;
let testUser1 = null;
let testUser2 = null;
let authToken1 = 'user_1'; // MVP auth token format
let authToken2 = 'user_2';

/**
 * Setup: Run before all tests
 */
beforeAll(async () => {
  prisma = getPrismaClient();
  await cleanupDatabase();

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

  // Seed K-10 template
  testTemplate = await seedK10Template();
});

/**
 * Teardown: Run after all tests
 */
afterAll(async () => {
  await cleanupDatabase();
  await closePrismaConnection();
});

/**
 * Seed K-10 self-assessment template
 */
async function seedK10Template() {
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
          warningMessage: '전문가의 도움이 필요합니다.',
          emergencyContact: '1577-0199',
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
function createSampleAnswers(scoreLevel = 'MID') {
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
// Test Suite: GET /api/v1/assessments/templates
// ============================================
describe('GET /api/v1/assessments/templates', () => {
  it('should return all active templates (public endpoint)', async () => {
    const res = await request(app).get('/api/v1/assessments/templates');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);

    const template = res.body.data[0];
    expect(template).toHaveProperty('id');
    expect(template).toHaveProperty('templateCode');
    expect(template).toHaveProperty('name');
    expect(template).toHaveProperty('questionCount');
  });

  it('should not include questions in template list', async () => {
    const res = await request(app).get('/api/v1/assessments/templates');

    expect(res.status).toBe(200);
    const template = res.body.data[0];
    expect(template).not.toHaveProperty('questions');
    expect(template).not.toHaveProperty('scoringRules');
  });
});

// ============================================
// Test Suite: GET /api/v1/assessments/templates/:id
// ============================================
describe('GET /api/v1/assessments/templates/:id', () => {
  it('should return template with questions (public endpoint)', async () => {
    const res = await request(app).get(`/api/v1/assessments/templates/${testTemplate.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('questions');
    expect(res.body.data).toHaveProperty('scoringRules');
    expect(res.body.data).toHaveProperty('interpretations');
    expect(res.body.data.questions).toBeInstanceOf(Array);
    expect(res.body.data.questions.length).toBe(10);
  });

  it('should return 404 for non-existent template', async () => {
    const res = await request(app).get('/api/v1/assessments/templates/99999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('TEMPLATE_NOT_FOUND');
  });

  it('should return 400 for invalid template ID format', async () => {
    const res = await request(app).get('/api/v1/assessments/templates/invalid');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ============================================
// Test Suite: POST /api/v1/assessments
// ============================================
describe('POST /api/v1/assessments', () => {
  it('should submit assessment and return result (authenticated)', async () => {
    const res = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${authToken1}`)
      .send({
        templateId: Number(testTemplate.id),
        answers: createSampleAnswers('MID'),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('assessmentId');
    expect(res.body.data).toHaveProperty('totalScore');
    expect(res.body.data).toHaveProperty('severityCode');
    expect(res.body.data).toHaveProperty('interpretation');
    expect(res.body.data).toHaveProperty('completedAt');
    expect(res.body.data.severityCode).toBe('MID');
    expect(res.body.data.totalScore).toBeGreaterThanOrEqual(20);
    expect(res.body.data.totalScore).toBeLessThanOrEqual(29);
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/v1/assessments')
      .send({
        templateId: Number(testTemplate.id),
        answers: createSampleAnswers('LOW'),
      });

    expect(res.status).toBe(401);
  });

  it('should return 400 with invalid answers (not 10)', async () => {
    const res = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${authToken1}`)
      .send({
        templateId: Number(testTemplate.id),
        answers: [
          { questionId: 1, selectedOption: 2 },
          // Only 1 answer instead of 10
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 with invalid selectedOption range', async () => {
    const invalidAnswers = createSampleAnswers('MID');
    invalidAnswers[0].selectedOption = 5; // Invalid: should be 1-4

    const res = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${authToken1}`)
      .send({
        templateId: Number(testTemplate.id),
        answers: invalidAnswers,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should calculate LOW severity correctly', async () => {
    const res = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${authToken1}`)
      .send({
        templateId: Number(testTemplate.id),
        answers: createSampleAnswers('LOW'),
      });

    expect(res.status).toBe(201);
    expect(res.body.data.severityCode).toBe('LOW');
    expect(res.body.data.totalScore).toBeLessThan(20);
  });

  it('should calculate HIGH severity correctly', async () => {
    const res = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${authToken1}`)
      .send({
        templateId: Number(testTemplate.id),
        answers: createSampleAnswers('HIGH'),
      });

    expect(res.status).toBe(201);
    expect(res.body.data.severityCode).toBe('HIGH');
    expect(res.body.data.totalScore).toBeGreaterThanOrEqual(30);
  });
});

// ============================================
// Test Suite: GET /api/v1/assessments/:id/result
// ============================================
describe('GET /api/v1/assessments/:id/result', () => {
  let testAssessmentId;

  beforeAll(async () => {
    // Create a test assessment
    const res = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${authToken1}`)
      .send({
        templateId: Number(testTemplate.id),
        answers: createSampleAnswers('MID'),
      });

    testAssessmentId = res.body.data.assessmentId;
  });

  it('should return assessment result (owner)', async () => {
    const res = await request(app)
      .get(`/api/v1/assessments/${testAssessmentId}/result`)
      .set('Authorization', `Bearer ${authToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testAssessmentId);
    expect(res.body.data).toHaveProperty('totalScore');
    expect(res.body.data).toHaveProperty('severityCode');
    expect(res.body.data).toHaveProperty('interpretation');
    expect(res.body.data).toHaveProperty('template');
  });

  it('should return 403 when accessing another user\'s assessment', async () => {
    const res = await request(app)
      .get(`/api/v1/assessments/${testAssessmentId}/result`)
      .set('Authorization', `Bearer ${authToken2}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED_ACCESS');
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app).get(`/api/v1/assessments/${testAssessmentId}/result`);

    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent assessment', async () => {
    const res = await request(app)
      .get('/api/v1/assessments/99999/result')
      .set('Authorization', `Bearer ${authToken1}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ASSESSMENT_NOT_FOUND');
  });
});

// ============================================
// Test Suite: GET /api/v1/assessments/history
// ============================================
describe('GET /api/v1/assessments/history', () => {
  beforeAll(async () => {
    // Create multiple assessments for user1
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/assessments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          templateId: Number(testTemplate.id),
          answers: createSampleAnswers(i < 2 ? 'LOW' : i < 4 ? 'MID' : 'HIGH'),
        });

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  });

  it('should return paginated assessment history', async () => {
    const res = await request(app)
      .get('/api/v1/assessments/history')
      .set('Authorization', `Bearer ${authToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('assessments');
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('page');
    expect(res.body.data).toHaveProperty('totalPages');
    expect(res.body.data).toHaveProperty('summary');
    expect(res.body.data.assessments).toBeInstanceOf(Array);
    expect(res.body.data.total).toBeGreaterThanOrEqual(5);
  });

  it('should support pagination', async () => {
    const res = await request(app)
      .get('/api/v1/assessments/history?page=1&limit=3')
      .set('Authorization', `Bearer ${authToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.assessments.length).toBeLessThanOrEqual(3);
  });

  it('should filter by severity code', async () => {
    const res = await request(app)
      .get('/api/v1/assessments/history?severityCode=LOW')
      .set('Authorization', `Bearer ${authToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.assessments.every(a => a.severityCode === 'LOW')).toBe(true);
  });

  it('should return empty array for user with no assessments', async () => {
    const res = await request(app)
      .get('/api/v1/assessments/history')
      .set('Authorization', `Bearer ${authToken2}`);

    expect(res.status).toBe(200);
    expect(res.body.data.assessments).toEqual([]);
    expect(res.body.data.total).toBe(0);
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app).get('/api/v1/assessments/history');

    expect(res.status).toBe(401);
  });
});

// ============================================
// Test Suite: GET /api/v1/assessments/latest
// ============================================
describe('GET /api/v1/assessments/latest', () => {
  it('should return latest assessment', async () => {
    const res = await request(app)
      .get('/api/v1/assessments/latest')
      .set('Authorization', `Bearer ${authToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('totalScore');
    expect(res.body.data).toHaveProperty('severityCode');
    expect(res.body.data).toHaveProperty('completedAt');
  });

  it('should return null for user with no assessments', async () => {
    const res = await request(app)
      .get('/api/v1/assessments/latest')
      .set('Authorization', `Bearer ${authToken2}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeNull();
  });

  it('should filter by template code', async () => {
    const res = await request(app)
      .get('/api/v1/assessments/latest?templateCode=K10_V1')
      .set('Authorization', `Bearer ${authToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.templateCode).toBe('K10_V1');
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app).get('/api/v1/assessments/latest');

    expect(res.status).toBe(401);
  });
});

// ============================================
// Test Suite: DELETE /api/v1/assessments/:id
// ============================================
describe('DELETE /api/v1/assessments/:id', () => {
  let assessmentToDeleteId;

  beforeEach(async () => {
    // Create a test assessment
    const res = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${authToken1}`)
      .send({
        templateId: Number(testTemplate.id),
        answers: createSampleAnswers('MID'),
      });

    // Use 'id' instead of 'assessmentId' for the DELETE tests
    assessmentToDeleteId = res.body.data.id || res.body.data.assessmentId;
  });

  it('should delete assessment (owner)', async () => {
    const res = await request(app)
      .delete(`/api/v1/assessments/${assessmentToDeleteId}`)
      .set('Authorization', `Bearer ${authToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Assessment deleted successfully');

    // Verify assessment is soft deleted (userId set to null)
    const deletedAssessment = await prisma.userAssessment.findUnique({
      where: { id: BigInt(assessmentToDeleteId) },
    });
    expect(deletedAssessment.userId).toBeNull();
  });

  it('should return 403 when deleting another user\'s assessment', async () => {
    const res = await request(app)
      .delete(`/api/v1/assessments/${assessmentToDeleteId}`)
      .set('Authorization', `Bearer ${authToken2}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('UNAUTHORIZED_ACCESS');
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app).delete(`/api/v1/assessments/${assessmentToDeleteId}`);

    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent assessment', async () => {
    const res = await request(app)
      .delete('/api/v1/assessments/99999')
      .set('Authorization', `Bearer ${authToken1}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ASSESSMENT_NOT_FOUND');
  });
});

// ============================================
// Performance Tests
// ============================================
describe('Performance Tests', () => {
  it('should respond within 500ms for template list', async () => {
    const start = Date.now();
    await request(app).get('/api/v1/assessments/templates');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(500);
  });

  it('should respond within 500ms for assessment submission', async () => {
    const start = Date.now();
    await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${authToken1}`)
      .send({
        templateId: Number(testTemplate.id),
        answers: createSampleAnswers('MID'),
      });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(500);
  });
});
