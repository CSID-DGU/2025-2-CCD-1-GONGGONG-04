/**
 * Assessment Service Integration Tests
 *
 * Sprint 3: 자가진단 도구 구현
 * Task 3.1.3: 진단 서비스 구현 - 통합 테스트
 *
 * Tests end-to-end assessment workflow:
 * 1. Get templates
 * 2. Submit assessment with valid answers
 * 3. Get assessment result
 * 4. Verify score and severity
 * 5. Get user history
 */

const { PrismaClient } = require('@prisma/client');
const {
  getTemplates,
  getTemplateById,
  getTemplateByCode,
  submitAssessment,
  getAssessmentResult,
  getUserAssessmentHistory,
  getLatestAssessment,
  deleteAssessment,
} = require('../../../src/services/assessment.service');

const prisma = new PrismaClient();

describe('Assessment Service Integration Tests', () => {
  let testUserId;
  let testTemplateId;
  let testAssessmentId;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-assessment-${Date.now()}@example.com`,
        passwordHash: 'hashed_password',
        nickname: 'Test Assessment User',
        userType: 'GENERAL',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });
    testUserId = Number(user.id);

    // Create test template (K-10 based)
    const template = await prisma.selfAssessmentTemplate.create({
      data: {
        templateCode: `TEST_K10_${Date.now()}`,
        templateName: 'Test K-10 자가진단',
        templateType: 'mental_health',
        description: '테스트용 K-10 자가진단 도구',
        questionCount: 10,
        estimatedTimeMinutes: 5,
        questionsJson: [
          {
            question_number: 1,
            question_text: '지난 4주 동안 피곤한 이유 없이 지친 적이 얼마나 자주 있었나요?',
            options: [
              { option_number: 1, option_text: '전혀 없었다', score: 1 },
              { option_number: 2, option_text: '조금 있었다', score: 2 },
              { option_number: 3, option_text: '어느 정도 있었다', score: 3 },
              { option_number: 4, option_text: '자주 있었다', score: 4 },
              { option_number: 5, option_text: '항상 그랬다', score: 5 },
            ],
          },
          {
            question_number: 2,
            question_text: '지난 4주 동안 신경이 예민해진 적이 얼마나 자주 있었나요?',
            options: [
              { option_number: 1, option_text: '전혀 없었다', score: 1 },
              { option_number: 2, option_text: '조금 있었다', score: 2 },
              { option_number: 3, option_text: '어느 정도 있었다', score: 3 },
              { option_number: 4, option_text: '자주 있었다', score: 4 },
              { option_number: 5, option_text: '항상 그랬다', score: 5 },
            ],
          },
          {
            question_number: 3,
            question_text: '지난 4주 동안 초조하거나 불안한 느낌이 있었나요?',
            options: [
              { option_number: 1, option_text: '전혀 없었다', score: 1 },
              { option_number: 2, option_text: '조금 있었다', score: 2 },
              { option_number: 3, option_text: '어느 정도 있었다', score: 3 },
              { option_number: 4, option_text: '자주 있었다', score: 4 },
              { option_number: 5, option_text: '항상 그랬다', score: 5 },
            ],
          },
          {
            question_number: 4,
            question_text: '지난 4주 동안 절망적이라고 느낀 적이 있었나요?',
            options: [
              { option_number: 1, option_text: '전혀 없었다', score: 1 },
              { option_number: 2, option_text: '조금 있었다', score: 2 },
              { option_number: 3, option_text: '어느 정도 있었다', score: 3 },
              { option_number: 4, option_text: '자주 있었다', score: 4 },
              { option_number: 5, option_text: '항상 그랬다', score: 5 },
            ],
          },
          {
            question_number: 5,
            question_text: '지난 4주 동안 안절부절못하거나 가만히 있기 힘든 적이 있었나요?',
            options: [
              { option_number: 1, option_text: '전혀 없었다', score: 1 },
              { option_number: 2, option_text: '조금 있었다', score: 2 },
              { option_number: 3, option_text: '어느 정도 있었다', score: 3 },
              { option_number: 4, option_text: '자주 있었다', score: 4 },
              { option_number: 5, option_text: '항상 그랬다', score: 5 },
            ],
          },
          {
            question_number: 6,
            question_text: '지난 4주 동안 우울하거나 슬펐던 적이 있었나요?',
            options: [
              { option_number: 1, option_text: '전혀 없었다', score: 1 },
              { option_number: 2, option_text: '조금 있었다', score: 2 },
              { option_number: 3, option_text: '어느 정도 있었다', score: 3 },
              { option_number: 4, option_text: '자주 있었다', score: 4 },
              { option_number: 5, option_text: '항상 그랬다', score: 5 },
            ],
          },
          {
            question_number: 7,
            question_text: '지난 4주 동안 모든 일에 노력이 들어간다고 느낀 적이 있었나요?',
            options: [
              { option_number: 1, option_text: '전혀 없었다', score: 1 },
              { option_number: 2, option_text: '조금 있었다', score: 2 },
              { option_number: 3, option_text: '어느 정도 있었다', score: 3 },
              { option_number: 4, option_text: '자주 있었다', score: 4 },
              { option_number: 5, option_text: '항상 그랬다', score: 5 },
            ],
          },
          {
            question_number: 8,
            question_text: '지난 4주 동안 아무 이유 없이 불안하고 두려웠던 적이 있었나요?',
            options: [
              { option_number: 1, option_text: '전혀 없었다', score: 1 },
              { option_number: 2, option_text: '조금 있었다', score: 2 },
              { option_number: 3, option_text: '어느 정도 있었다', score: 3 },
              { option_number: 4, option_text: '자주 있었다', score: 4 },
              { option_number: 5, option_text: '항상 그랬다', score: 5 },
            ],
          },
          {
            question_number: 9,
            question_text: '지난 4주 동안 무가치하다고 느낀 적이 있었나요?',
            options: [
              { option_number: 1, option_text: '전혀 없었다', score: 1 },
              { option_number: 2, option_text: '조금 있었다', score: 2 },
              { option_number: 3, option_text: '어느 정도 있었다', score: 3 },
              { option_number: 4, option_text: '자주 있었다', score: 4 },
              { option_number: 5, option_text: '항상 그랬다', score: 5 },
            ],
          },
          {
            question_number: 10,
            question_text: '지난 4주 동안 집중하기 어려웠던 적이 있었나요?',
            options: [
              { option_number: 1, option_text: '전혀 없었다', score: 1 },
              { option_number: 2, option_text: '조금 있었다', score: 2 },
              { option_number: 3, option_text: '어느 정도 있었다', score: 3 },
              { option_number: 4, option_text: '자주 있었다', score: 4 },
              { option_number: 5, option_text: '항상 그랬다', score: 5 },
            ],
          },
        ],
        scoringRulesJson: {
          severityLevels: [
            { code: 'LOW', min: 10, max: 15, label: '정상 범위' },
            { code: 'MID', min: 16, max: 29, label: '중등도' },
            { code: 'HIGH', min: 30, max: 50, label: '고위험' },
          ],
        },
        interpretationJson: {
          LOW: {
            title: '정상 범위',
            message: '현재 정신적 고통이 거의 없는 상태입니다.',
            recommendations: [
              '건강한 생활습관을 유지하세요',
              '규칙적인 운동과 충분한 수면을 취하세요',
            ],
            urgency: 'low',
          },
          MID: {
            title: '중등도',
            message: '현재 정신적 고통이 있으며, 전문가 상담이 권장됩니다.',
            recommendations: [
              '가까운 정신건강복지센터를 방문하세요',
              '스트레스 관리 방법을 찾아보세요',
              '신뢰할 수 있는 사람과 대화를 나누세요',
            ],
            urgency: 'medium',
            contactInfo: '정신건강복지센터: 1577-0199',
          },
          HIGH: {
            title: '고위험',
            message: '심각한 정신적 고통을 겪고 있으며, 즉시 전문가 상담이 필요합니다.',
            recommendations: [
              '즉시 정신건강 전문가와 상담하세요',
              '24시간 운영 센터를 방문하세요',
              '위기 상담 전화를 이용하세요',
            ],
            urgency: 'high',
            emergencyContact: '자살예방 상담전화: 1393',
            warningMessage: '위급한 상황에서는 119에 전화하세요.',
          },
        },
        isActive: true,
        version: '1.0',
      },
    });
    testTemplateId = Number(template.id);
  });

  afterAll(async () => {
    // Clean up test data
    if (testAssessmentId) {
      await prisma.userAssessment.deleteMany({
        where: { userId: testUserId },
      });
    }

    if (testTemplateId) {
      await prisma.selfAssessmentTemplate.delete({
        where: { id: testTemplateId },
      });
    }

    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      });
    }

    await prisma.$disconnect();
  });

  describe('End-to-End Assessment Workflow', () => {
    it('should complete full assessment workflow', async () => {
      // Step 1: Get templates
      const templates = await getTemplates();
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);

      const k10Template = templates.find(t => Number(t.id) === testTemplateId);
      expect(k10Template).toBeDefined();
      expect(k10Template.templateName).toBe('Test K-10 자가진단');
      expect(k10Template.questionCount).toBe(10);

      // Step 2: Get template by ID with full details
      const templateDetails = await getTemplateById(testTemplateId);
      expect(templateDetails.questionsJson).toBeInstanceOf(Array);
      expect(templateDetails.questionsJson.length).toBe(10);
      expect(templateDetails.scoringRulesJson).toBeDefined();
      expect(templateDetails.interpretationJson).toBeDefined();

      // Step 3: Submit assessment with LOW severity answers (score: 12)
      const lowAnswers = [
        { questionId: 1, selectedOption: 1 }, // 1
        { questionId: 2, selectedOption: 1 }, // 1
        { questionId: 3, selectedOption: 2 }, // 2
        { questionId: 4, selectedOption: 1 }, // 1
        { questionId: 5, selectedOption: 1 }, // 1
        { questionId: 6, selectedOption: 2 }, // 2
        { questionId: 7, selectedOption: 1 }, // 1
        { questionId: 8, selectedOption: 1 }, // 1
        { questionId: 9, selectedOption: 1 }, // 1
        { questionId: 10, selectedOption: 1 }, // 1
      ];

      const lowResult = await submitAssessment(
        testUserId,
        testTemplateId,
        lowAnswers,
        'test-session-low'
      );

      expect(lowResult.assessmentId).toBeDefined();
      expect(lowResult.totalScore).toBe(12);
      expect(lowResult.severityCode).toBe('LOW');
      expect(lowResult.interpretation.title).toBe('정상 범위');
      expect(lowResult.interpretation.urgency).toBe('low');
      expect(lowResult.completedAt).toBeDefined();

      testAssessmentId = lowResult.assessmentId;

      // Step 4: Get assessment result
      const assessmentResult = await getAssessmentResult(testAssessmentId, testUserId);
      expect(assessmentResult.id).toBe(testAssessmentId);
      expect(assessmentResult.totalScore).toBe(12);
      expect(assessmentResult.severityCode).toBe('LOW');
      expect(assessmentResult.template.name).toBe('Test K-10 자가진단');

      // Step 5: Submit MID severity assessment (score: 21)
      const midAnswers = [
        { questionId: 1, selectedOption: 2 }, // 2
        { questionId: 2, selectedOption: 2 }, // 2
        { questionId: 3, selectedOption: 3 }, // 3
        { questionId: 4, selectedOption: 2 }, // 2
        { questionId: 5, selectedOption: 2 }, // 2
        { questionId: 6, selectedOption: 3 }, // 3
        { questionId: 7, selectedOption: 2 }, // 2
        { questionId: 8, selectedOption: 2 }, // 2
        { questionId: 9, selectedOption: 1 }, // 1
        { questionId: 10, selectedOption: 2 }, // 2
      ];

      const midResult = await submitAssessment(
        testUserId,
        testTemplateId,
        midAnswers,
        'test-session-mid'
      );

      expect(midResult.totalScore).toBe(21);
      expect(midResult.severityCode).toBe('MID');
      expect(midResult.interpretation.title).toBe('중등도');
      expect(midResult.interpretation.urgency).toBe('medium');
      expect(midResult.interpretation.contactInfo).toBeDefined();

      // Step 6: Submit HIGH severity assessment (score: 42)
      const highAnswers = [
        { questionId: 1, selectedOption: 4 }, // 4
        { questionId: 2, selectedOption: 5 }, // 5
        { questionId: 3, selectedOption: 4 }, // 4
        { questionId: 4, selectedOption: 5 }, // 5
        { questionId: 5, selectedOption: 4 }, // 4
        { questionId: 6, selectedOption: 4 }, // 4
        { questionId: 7, selectedOption: 4 }, // 4
        { questionId: 8, selectedOption: 4 }, // 4
        { questionId: 9, selectedOption: 4 }, // 4
        { questionId: 10, selectedOption: 4 }, // 4
      ];

      const highResult = await submitAssessment(
        testUserId,
        testTemplateId,
        highAnswers,
        'test-session-high'
      );

      expect(highResult.totalScore).toBe(42);
      expect(highResult.severityCode).toBe('HIGH');
      expect(highResult.interpretation.title).toBe('고위험');
      expect(highResult.interpretation.urgency).toBe('high');
      expect(highResult.interpretation.emergencyContact).toBeDefined();
      expect(highResult.interpretation.warningMessage).toBeDefined();

      // Step 7: Get user history
      const history = await getUserAssessmentHistory(testUserId, {
        page: 1,
        limit: 10,
      });

      expect(history.assessments).toBeInstanceOf(Array);
      expect(history.assessments.length).toBe(3);
      expect(history.total).toBe(3);
      expect(history.totalPages).toBe(1);
      expect(history.summary).toEqual({
        LOW: 1,
        MID: 1,
        HIGH: 1,
      });

      // Verify assessments are sorted by most recent first
      expect(history.assessments[0].severityCode).toBe('HIGH');
      expect(history.assessments[1].severityCode).toBe('MID');
      expect(history.assessments[2].severityCode).toBe('LOW');

      // Step 8: Get latest assessment
      const latest = await getLatestAssessment(testUserId);
      expect(latest).toBeDefined();
      expect(latest.severityCode).toBe('HIGH');
      expect(latest.totalScore).toBe(42);

      // Step 9: Get template by code
      const templateByCode = await getTemplateByCode(templateDetails.templateCode);
      expect(templateByCode.id).toEqual(templateDetails.id);
      expect(templateByCode.templateName).toBe(templateDetails.templateName);
    });

    it('should handle pagination correctly', async () => {
      // Get first page
      const page1 = await getUserAssessmentHistory(testUserId, {
        page: 1,
        limit: 2,
      });

      expect(page1.assessments.length).toBe(2);
      expect(page1.total).toBe(3);
      expect(page1.totalPages).toBe(2);

      // Get second page
      const page2 = await getUserAssessmentHistory(testUserId, {
        page: 2,
        limit: 2,
      });

      expect(page2.assessments.length).toBe(1);
      expect(page2.total).toBe(3);
      expect(page2.totalPages).toBe(2);
    });

    it('should filter history by severity', async () => {
      const midHistory = await getUserAssessmentHistory(testUserId, {
        severityCode: 'MID',
      });

      expect(midHistory.assessments.length).toBe(1);
      expect(midHistory.assessments[0].severityCode).toBe('MID');
    });

    it('should prevent unauthorized access to assessments', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: `test-other-${Date.now()}@example.com`,
          passwordHash: 'hashed_password',
          nickname: 'Other User',
          userType: 'GENERAL',
          status: 'ACTIVE',
          emailVerified: true,
        },
      });

      const otherUserId = Number(otherUser.id);

      // Try to access another user's assessment
      await expect(
        getAssessmentResult(testAssessmentId, otherUserId)
      ).rejects.toThrow('You do not have permission to access this assessment');

      // Try to delete another user's assessment
      await expect(deleteAssessment(testAssessmentId, otherUserId)).rejects.toThrow(
        'You do not have permission to delete this assessment'
      );

      // Clean up
      await prisma.user.delete({
        where: { id: otherUser.id },
      });
    });

    it('should delete assessment successfully', async () => {
      const result = await deleteAssessment(testAssessmentId, testUserId);
      expect(result).toBe(true);

      // Verify assessment is soft deleted
      const deletedAssessment = await prisma.userAssessment.findUnique({
        where: { id: testAssessmentId },
      });

      expect(deletedAssessment.userId).toBeNull();

      // Restore for other tests
      await prisma.userAssessment.update({
        where: { id: testAssessmentId },
        data: { userId: testUserId },
      });
    });
  });
});
