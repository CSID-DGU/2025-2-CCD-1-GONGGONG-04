/**
 * Integration Tests for Scoring Service
 *
 * Sprint 3: 자가진단 도구 구현
 * Task 3.1.2: 채점 서비스 구현
 *
 * Test Coverage:
 * - Integration with real K-10 seed data
 * - Multiple scoring scenarios (LOW, MID, HIGH severity)
 * - Validation error scenarios
 * - Performance benchmarks
 */

const { PrismaClient } = require('@prisma/client');
const {
  scoreAssessment,
  calculateTotalScore,
  determineSeverityLevel,
  getInterpretation,
} = require('../../../src/services/scoring.service');

const prisma = new PrismaClient();

describe('Scoring Service Integration Tests', () => {
  let k10Template;

  beforeAll(async () => {
    // Fetch the real K-10 template from database
    k10Template = await prisma.selfAssessmentTemplate.findFirst({
      where: {
        templateCode: 'K10_V1',
        isActive: true,
      },
    });

    // Ensure K-10 template exists
    if (!k10Template) {
      throw new Error(
        'K-10 template not found. Please run seed: npm run seed:assessment'
      );
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Integration with Real K-10 Seed Data', () => {
    test('should load K-10 template successfully', () => {
      expect(k10Template).toBeDefined();
      expect(k10Template.templateCode).toBe('K10_V1');
      expect(k10Template.templateName).toContain('K-10');
      expect(k10Template.questionCount).toBe(10);
      expect(k10Template.questionsJson).toBeDefined();
      expect(k10Template.questionsJson.length).toBe(10);
      expect(k10Template.scoringRulesJson).toBeDefined();
      expect(k10Template.interpretationJson).toBeDefined();
    });

    test('should have correct scoring rules structure', () => {
      const { scoringRulesJson } = k10Template;

      expect(scoringRulesJson.totalPoints).toBe(40);
      expect(scoringRulesJson.minScore).toBe(10);
      expect(scoringRulesJson.maxScore).toBe(40);
      expect(scoringRulesJson.calculation).toBe('sum');
      expect(scoringRulesJson.severityLevels).toHaveLength(3);

      // Verify severity levels
      const levels = scoringRulesJson.severityLevels;
      expect(levels.find(l => l.code === 'LOW')).toBeDefined();
      expect(levels.find(l => l.code === 'MID')).toBeDefined();
      expect(levels.find(l => l.code === 'HIGH')).toBeDefined();
    });

    test('should have correct interpretation structure', () => {
      const { interpretationJson } = k10Template;

      expect(interpretationJson.LOW).toBeDefined();
      expect(interpretationJson.MID).toBeDefined();
      expect(interpretationJson.HIGH).toBeDefined();

      // Verify LOW interpretation
      expect(interpretationJson.LOW.title).toBeDefined();
      expect(interpretationJson.LOW.message).toBeDefined();
      expect(interpretationJson.LOW.recommendations).toBeDefined();
      expect(interpretationJson.LOW.urgency).toBe('low');

      // Verify MID interpretation
      expect(interpretationJson.MID.urgency).toBe('moderate');
      expect(interpretationJson.MID.contactInfo).toBeDefined();

      // Verify HIGH interpretation
      expect(interpretationJson.HIGH.urgency).toBe('high');
      expect(interpretationJson.HIGH.emergencyContact).toBeDefined();
      expect(interpretationJson.HIGH.warningMessage).toBeDefined();
    });
  });

  describe('LOW Severity Scenarios (10-15 points)', () => {
    test('should score as LOW with minimum answers (all option 1)', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: 1,
      }));

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(10);
      expect(result.severityCode).toBe('LOW');
      expect(result.interpretation.urgency).toBe('low');
      expect(result.interpretation.recommendations.length).toBeGreaterThan(0);
    });

    test('should score as LOW with mixed low-range answers (score 13)', () => {
      const answers = [
        { questionId: 1, selectedOption: 1 },
        { questionId: 2, selectedOption: 1 },
        { questionId: 3, selectedOption: 2 },
        { questionId: 4, selectedOption: 1 },
        { questionId: 5, selectedOption: 2 },
        { questionId: 6, selectedOption: 1 },
        { questionId: 7, selectedOption: 1 },
        { questionId: 8, selectedOption: 2 },
        { questionId: 9, selectedOption: 1 },
        { questionId: 10, selectedOption: 1 },
      ];

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(13);
      expect(result.severityCode).toBe('LOW');
    });

    test('should score as LOW at upper boundary (score 15)', () => {
      const answers = [
        { questionId: 1, selectedOption: 2 },
        { questionId: 2, selectedOption: 2 },
        { questionId: 3, selectedOption: 1 },
        { questionId: 4, selectedOption: 2 },
        { questionId: 5, selectedOption: 1 },
        { questionId: 6, selectedOption: 2 },
        { questionId: 7, selectedOption: 1 },
        { questionId: 8, selectedOption: 2 },
        { questionId: 9, selectedOption: 1 },
        { questionId: 10, selectedOption: 1 },
      ];

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(15);
      expect(result.severityCode).toBe('LOW');
    });
  });

  describe('MID Severity Scenarios (16-29 points)', () => {
    test('should score as MID at lower boundary (score 16)', () => {
      const answers = [
        { questionId: 1, selectedOption: 2 },
        { questionId: 2, selectedOption: 2 },
        { questionId: 3, selectedOption: 2 },
        { questionId: 4, selectedOption: 1 },
        { questionId: 5, selectedOption: 2 },
        { questionId: 6, selectedOption: 1 },
        { questionId: 7, selectedOption: 2 },
        { questionId: 8, selectedOption: 1 },
        { questionId: 9, selectedOption: 2 },
        { questionId: 10, selectedOption: 1 },
      ];

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(16);
      expect(result.severityCode).toBe('MID');
      expect(result.interpretation.urgency).toBe('moderate');
      expect(result.interpretation.contactInfo).toBeDefined();
    });

    test('should score as MID in middle range (score 21)', () => {
      const answers = [
        { questionId: 1, selectedOption: 2 },
        { questionId: 2, selectedOption: 3 },
        { questionId: 3, selectedOption: 2 },
        { questionId: 4, selectedOption: 2 },
        { questionId: 5, selectedOption: 2 },
        { questionId: 6, selectedOption: 2 },
        { questionId: 7, selectedOption: 2 },
        { questionId: 8, selectedOption: 2 },
        { questionId: 9, selectedOption: 2 },
        { questionId: 10, selectedOption: 2 },
      ];

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(21);
      expect(result.severityCode).toBe('MID');
    });

    test('should score as MID at upper boundary (score 29)', () => {
      const answers = [
        { questionId: 1, selectedOption: 3 },
        { questionId: 2, selectedOption: 3 },
        { questionId: 3, selectedOption: 3 },
        { questionId: 4, selectedOption: 3 },
        { questionId: 5, selectedOption: 3 },
        { questionId: 6, selectedOption: 3 },
        { questionId: 7, selectedOption: 3 },
        { questionId: 8, selectedOption: 3 },
        { questionId: 9, selectedOption: 3 },
        { questionId: 10, selectedOption: 2 },
      ];

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(29);
      expect(result.severityCode).toBe('MID');
    });
  });

  describe('HIGH Severity Scenarios (30-40 points)', () => {
    test('should score as HIGH at lower boundary (score 30)', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: 3,
      }));

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(30);
      expect(result.severityCode).toBe('HIGH');
      expect(result.interpretation.urgency).toBe('high');
      expect(result.interpretation.emergencyContact).toBeDefined();
      expect(result.interpretation.warningMessage).toBeDefined();
    });

    test('should score as HIGH in middle range (score 35)', () => {
      const answers = [
        { questionId: 1, selectedOption: 4 },
        { questionId: 2, selectedOption: 4 },
        { questionId: 3, selectedOption: 4 },
        { questionId: 4, selectedOption: 3 },
        { questionId: 5, selectedOption: 4 },
        { questionId: 6, selectedOption: 3 },
        { questionId: 7, selectedOption: 4 },
        { questionId: 8, selectedOption: 3 },
        { questionId: 9, selectedOption: 3 },
        { questionId: 10, selectedOption: 3 },
      ];

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(35);
      expect(result.severityCode).toBe('HIGH');
    });

    test('should score as HIGH at maximum (score 40)', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: 4,
      }));

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(40);
      expect(result.severityCode).toBe('HIGH');
    });
  });

  describe('Validation Error Scenarios', () => {
    test('should reject incomplete answers (missing questions)', () => {
      const answers = [
        { questionId: 1, selectedOption: 2 },
        { questionId: 2, selectedOption: 3 },
        { questionId: 3, selectedOption: 1 },
      ];

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('Expected 10 answers'))).toBe(true);
    });

    test('should reject invalid question IDs', () => {
      const answers = [
        ...Array.from({ length: 9 }, (_, i) => ({
          questionId: i + 1,
          selectedOption: 2,
        })),
        { questionId: 999, selectedOption: 2 }, // Invalid question ID
      ];

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Question 999 not found'))).toBe(
        true
      );
    });

    test('should reject invalid option values', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: i === 0 ? 99 : 2, // Invalid option for question 1
      }));

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(err => err.includes('option 99 does not exist'))
      ).toBe(true);
    });

    test('should reject out-of-range option values', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: i === 0 ? 5 : 2, // Out of range (1-4)
      }));

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('out of range'))).toBe(true);
    });

    test('should reject duplicate answers for same question', () => {
      const answers = [
        { questionId: 1, selectedOption: 2 },
        { questionId: 1, selectedOption: 3 }, // Duplicate
        ...Array.from({ length: 8 }, (_, i) => ({
          questionId: i + 2,
          selectedOption: 2,
        })),
      ];

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Duplicate'))).toBe(true);
    });
  });

  describe('Performance Benchmarks', () => {
    test('should score assessment in under 10ms', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: 2,
      }));

      const startTime = performance.now();
      const result = scoreAssessment(answers, k10Template);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(10); // Should complete in under 10ms
    });

    test('should handle multiple concurrent scoring requests', async () => {
      const answersArray = Array.from({ length: 100 }, () =>
        Array.from({ length: 10 }, (_, i) => ({
          questionId: i + 1,
          selectedOption: Math.floor(Math.random() * 4) + 1,
        }))
      );

      const startTime = performance.now();
      const results = answersArray.map(answers => scoreAssessment(answers, k10Template));
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results.every(r => r.isValid)).toBe(true);
      expect(duration).toBeLessThan(100); // 100 requests in under 100ms
    });
  });

  describe('Component Integration', () => {
    test('should integrate calculateTotalScore with real template', () => {
      const answers = [
        { questionId: 1, selectedOption: 2 },
        { questionId: 2, selectedOption: 3 },
        { questionId: 3, selectedOption: 1 },
        { questionId: 4, selectedOption: 4 },
        { questionId: 5, selectedOption: 2 },
        { questionId: 6, selectedOption: 3 },
        { questionId: 7, selectedOption: 1 },
        { questionId: 8, selectedOption: 2 },
        { questionId: 9, selectedOption: 3 },
        { questionId: 10, selectedOption: 2 },
      ];

      const score = calculateTotalScore(answers, k10Template);
      expect(score).toBe(23);
    });

    test('should integrate determineSeverityLevel with real scoring rules', () => {
      const { scoringRulesJson } = k10Template;

      expect(determineSeverityLevel(10, scoringRulesJson)).toBe('LOW');
      expect(determineSeverityLevel(15, scoringRulesJson)).toBe('LOW');
      expect(determineSeverityLevel(16, scoringRulesJson)).toBe('MID');
      expect(determineSeverityLevel(29, scoringRulesJson)).toBe('MID');
      expect(determineSeverityLevel(30, scoringRulesJson)).toBe('HIGH');
      expect(determineSeverityLevel(40, scoringRulesJson)).toBe('HIGH');
    });

    test('should integrate getInterpretation with real interpretation data', () => {
      const { interpretationJson } = k10Template;

      const lowInterpretation = getInterpretation('LOW', interpretationJson);
      expect(lowInterpretation.title).toBeDefined();
      expect(lowInterpretation.urgency).toBe('low');

      const midInterpretation = getInterpretation('MID', interpretationJson);
      expect(midInterpretation.urgency).toBe('moderate');
      expect(midInterpretation.contactInfo).toBeDefined();

      const highInterpretation = getInterpretation('HIGH', interpretationJson);
      expect(highInterpretation.urgency).toBe('high');
      expect(highInterpretation.emergencyContact).toBeDefined();
    });
  });

  describe('Real-World User Scenarios', () => {
    test('Scenario 1: User with mild stress (LOW)', () => {
      // User occasionally feels nervous but mostly okay
      const answers = [
        { questionId: 1, selectedOption: 2 }, // Sometimes nervous
        { questionId: 2, selectedOption: 1 }, // Rarely anxious
        { questionId: 3, selectedOption: 1 }, // Rarely restless
        { questionId: 4, selectedOption: 2 }, // Sometimes depressed
        { questionId: 5, selectedOption: 1 }, // Rarely tired
        { questionId: 6, selectedOption: 1 }, // No hopelessness
        { questionId: 7, selectedOption: 1 }, // Not worthless
        { questionId: 8, selectedOption: 2 }, // Sometimes fatigued
        { questionId: 9, selectedOption: 1 }, // Social is fine
        { questionId: 10, selectedOption: 1 }, // Not useless
      ];

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(12);
      expect(result.severityCode).toBe('LOW');
      expect(result.interpretation.recommendations).toBeDefined();
    });

    test('Scenario 2: User with moderate stress (MID)', () => {
      // User frequently feels overwhelmed but functioning
      const answers = [
        { questionId: 1, selectedOption: 3 }, // Often nervous
        { questionId: 2, selectedOption: 2 }, // Sometimes anxious
        { questionId: 3, selectedOption: 3 }, // Often restless
        { questionId: 4, selectedOption: 2 }, // Sometimes depressed
        { questionId: 5, selectedOption: 3 }, // Often tired
        { questionId: 6, selectedOption: 2 }, // Sometimes hopeless
        { questionId: 7, selectedOption: 1 }, // Not worthless
        { questionId: 8, selectedOption: 2 }, // Sometimes fatigued
        { questionId: 9, selectedOption: 2 }, // Sometimes social difficulty
        { questionId: 10, selectedOption: 1 }, // Not useless
      ];

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(21);
      expect(result.severityCode).toBe('MID');
      expect(result.interpretation.contactInfo).toBeDefined();
    });

    test('Scenario 3: User with severe distress (HIGH)', () => {
      // User constantly struggling with mental health
      const answers = [
        { questionId: 1, selectedOption: 4 }, // Always nervous
        { questionId: 2, selectedOption: 4 }, // Always anxious
        { questionId: 3, selectedOption: 3 }, // Often restless
        { questionId: 4, selectedOption: 4 }, // Always depressed
        { questionId: 5, selectedOption: 4 }, // Everything is effort
        { questionId: 6, selectedOption: 3 }, // Often hopeless
        { questionId: 7, selectedOption: 3 }, // Often worthless
        { questionId: 8, selectedOption: 4 }, // Always fatigued
        { questionId: 9, selectedOption: 3 }, // Often social difficulty
        { questionId: 10, selectedOption: 3 }, // Often useless
      ];

      const result = scoreAssessment(answers, k10Template);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(35);
      expect(result.severityCode).toBe('HIGH');
      expect(result.interpretation.emergencyContact).toBeDefined();
      expect(result.interpretation.warningMessage).toContain('119');
    });
  });
});
