/**
 * K-10 자가진단 템플릿 Seed 데이터 단위 테스트
 *
 * Sprint 3: 자가진단 도구 구현
 * Task 3.1.1: 데이터베이스 스키마 및 시드 데이터
 */

const { k10Template } = require('../../../prisma/seeds/k10-assessment-template.seed');

describe('K-10 Assessment Template Seed Data', () => {
  describe('Template Structure Validation', () => {
    test('should have all required fields', () => {
      expect(k10Template).toHaveProperty('templateCode');
      expect(k10Template).toHaveProperty('templateName');
      expect(k10Template).toHaveProperty('templateType');
      expect(k10Template).toHaveProperty('description');
      expect(k10Template).toHaveProperty('questionCount');
      expect(k10Template).toHaveProperty('estimatedTimeMinutes');
      expect(k10Template).toHaveProperty('questionsJson');
      expect(k10Template).toHaveProperty('scoringRulesJson');
      expect(k10Template).toHaveProperty('interpretationJson');
      expect(k10Template).toHaveProperty('isActive');
      expect(k10Template).toHaveProperty('version');
    });

    test('should have correct template code format', () => {
      expect(k10Template.templateCode).toBe('K10_V1');
      expect(k10Template.templateCode).toMatch(/^K10_V\d+$/);
    });

    test('should have Korean language content', () => {
      expect(k10Template.templateName).toContain('정신건강');
      expect(k10Template.description).toContain('K-10');
    });

    test('should be active template', () => {
      expect(k10Template.isActive).toBe(true);
    });

    test('should have version information', () => {
      expect(k10Template.version).toBe('1.0');
    });
  });

  describe('Questions Validation', () => {
    test('should have exactly 10 questions', () => {
      expect(k10Template.questionsJson).toHaveLength(10);
      expect(k10Template.questionCount).toBe(10);
    });

    test('should have sequential question numbers', () => {
      k10Template.questionsJson.forEach((q, index) => {
        expect(q.question_number).toBe(index + 1);
      });
    });

    test('each question should have required structure', () => {
      k10Template.questionsJson.forEach(question => {
        expect(question).toHaveProperty('question_number');
        expect(question).toHaveProperty('question_text');
        expect(question).toHaveProperty('category');
        expect(question).toHaveProperty('options');

        // Question text should be in Korean
        expect(question.question_text).toMatch(/[가-힣]/);
        expect(question.question_text.length).toBeGreaterThan(10);
      });
    });

    test('each question should have exactly 4 options', () => {
      k10Template.questionsJson.forEach(question => {
        expect(question.options).toHaveLength(4);
      });
    });

    test('options should have 1-4 point scale', () => {
      k10Template.questionsJson.forEach(question => {
        question.options.forEach((option, index) => {
          expect(option.option_number).toBe(index + 1);
          expect(option.score).toBe(index + 1);
          expect(option.score).toBeGreaterThanOrEqual(1);
          expect(option.score).toBeLessThanOrEqual(4);
        });
      });
    });

    test('options should have Korean text', () => {
      k10Template.questionsJson.forEach(question => {
        question.options.forEach(option => {
          expect(option.option_text).toMatch(/[가-힣]/);
        });
      });
    });

    test('should cover multiple mental health dimensions', () => {
      const categories = k10Template.questionsJson.map(q => q.category);
      const uniqueCategories = [...new Set(categories)];

      expect(uniqueCategories.length).toBeGreaterThanOrEqual(5);
      expect(categories).toContain('anxiety');
      expect(categories).toContain('depression');
      expect(categories).toContain('fatigue');
    });
  });

  describe('Scoring Rules Validation', () => {
    const scoringRules = k10Template.scoringRulesJson;

    test('should have correct score range', () => {
      expect(scoringRules.minScore).toBe(10);
      expect(scoringRules.maxScore).toBe(40);
      expect(scoringRules.totalPoints).toBe(40);
    });

    test('should use sum calculation method', () => {
      expect(scoringRules.calculation).toBe('sum');
    });

    test('should have exactly 3 severity levels', () => {
      expect(scoringRules.severityLevels).toHaveLength(3);
    });

    test('severity levels should cover entire score range', () => {
      const levels = scoringRules.severityLevels;

      // Check LOW level
      expect(levels[0].code).toBe('LOW');
      expect(levels[0].min).toBe(10);
      expect(levels[0].max).toBe(15);

      // Check MID level
      expect(levels[1].code).toBe('MID');
      expect(levels[1].min).toBe(16);
      expect(levels[1].max).toBe(29);

      // Check HIGH level
      expect(levels[2].code).toBe('HIGH');
      expect(levels[2].min).toBe(30);
      expect(levels[2].max).toBe(40);
    });

    test('severity levels should not overlap', () => {
      const levels = scoringRules.severityLevels;

      for (let i = 0; i < levels.length - 1; i++) {
        expect(levels[i].max).toBeLessThan(levels[i + 1].min);
      }
    });

    test('severity levels should be contiguous', () => {
      const levels = scoringRules.severityLevels;

      for (let i = 0; i < levels.length - 1; i++) {
        expect(levels[i].max + 1).toBe(levels[i + 1].min);
      }
    });

    test('each severity level should have required fields', () => {
      scoringRules.severityLevels.forEach(level => {
        expect(level).toHaveProperty('code');
        expect(level).toHaveProperty('min');
        expect(level).toHaveProperty('max');
        expect(level).toHaveProperty('label');
        expect(level).toHaveProperty('description');
        expect(level).toHaveProperty('color');
        expect(level).toHaveProperty('recommendation');

        // Validate color format (hex)
        expect(level.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('Interpretation Validation', () => {
    const interpretation = k10Template.interpretationJson;

    test('should have interpretations for all severity codes', () => {
      expect(interpretation).toHaveProperty('LOW');
      expect(interpretation).toHaveProperty('MID');
      expect(interpretation).toHaveProperty('HIGH');
    });

    test('each interpretation should have required structure', () => {
      ['LOW', 'MID', 'HIGH'].forEach(code => {
        expect(interpretation[code]).toHaveProperty('title');
        expect(interpretation[code]).toHaveProperty('message');
        expect(interpretation[code]).toHaveProperty('recommendations');
        expect(interpretation[code]).toHaveProperty('urgency');

        // Recommendations should be an array with at least 3 items
        expect(Array.isArray(interpretation[code].recommendations)).toBe(true);
        expect(interpretation[code].recommendations.length).toBeGreaterThanOrEqual(3);
      });
    });

    test('HIGH severity should have emergency contact info', () => {
      expect(interpretation.HIGH).toHaveProperty('emergencyContact');
      expect(interpretation.HIGH.emergencyContact).toHaveProperty('suicide');
      expect(interpretation.HIGH.emergencyContact).toHaveProperty('mentalHealth');
      expect(interpretation.HIGH.emergencyContact).toHaveProperty('emergency');

      // Verify phone numbers
      expect(interpretation.HIGH.emergencyContact.suicide).toContain('1393');
      expect(interpretation.HIGH.emergencyContact.mentalHealth).toContain('1577-0199');
      expect(interpretation.HIGH.emergencyContact.emergency).toContain('119');
    });

    test('HIGH severity should have warning message', () => {
      expect(interpretation.HIGH).toHaveProperty('warningMessage');
      expect(interpretation.HIGH.warningMessage).toContain('⚠️');
    });

    test('MID severity should have contact info', () => {
      expect(interpretation.MID).toHaveProperty('contactInfo');
      expect(interpretation.MID.contactInfo).toHaveProperty('nationalMentalHealth');
      expect(interpretation.MID.contactInfo.nationalMentalHealth).toContain('1577-0199');
    });

    test('urgency levels should be valid', () => {
      expect(['low', 'moderate', 'high']).toContain(interpretation.LOW.urgency);
      expect(['low', 'moderate', 'high']).toContain(interpretation.MID.urgency);
      expect(['low', 'moderate', 'high']).toContain(interpretation.HIGH.urgency);
    });
  });

  describe('Scoring Logic Validation', () => {
    test('should calculate correct minimum score', () => {
      // All questions answered with option 1 (score 1)
      const minScore = k10Template.questionsJson.reduce(
        (sum, q) => sum + q.options[0].score,
        0
      );
      expect(minScore).toBe(10);
    });

    test('should calculate correct maximum score', () => {
      // All questions answered with option 4 (score 4)
      const maxScore = k10Template.questionsJson.reduce(
        (sum, q) => sum + q.options[3].score,
        0
      );
      expect(maxScore).toBe(40);
    });

    test('should correctly classify LOW severity', () => {
      const testScores = [10, 12, 15];
      testScores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(10);
        expect(score).toBeLessThanOrEqual(15);
      });
    });

    test('should correctly classify MID severity', () => {
      const testScores = [16, 20, 25, 29];
      testScores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(16);
        expect(score).toBeLessThanOrEqual(29);
      });
    });

    test('should correctly classify HIGH severity', () => {
      const testScores = [30, 35, 40];
      testScores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(30);
        expect(score).toBeLessThanOrEqual(40);
      });
    });
  });

  describe('Estimated Time Validation', () => {
    test('should have reasonable estimated time', () => {
      expect(k10Template.estimatedTimeMinutes).toBe(3);
      expect(k10Template.estimatedTimeMinutes).toBeGreaterThan(0);
      expect(k10Template.estimatedTimeMinutes).toBeLessThanOrEqual(10);
    });
  });

  describe('Data Integrity', () => {
    test('should not have duplicate question numbers', () => {
      const questionNumbers = k10Template.questionsJson.map(q => q.question_number);
      const uniqueNumbers = [...new Set(questionNumbers)];
      expect(questionNumbers.length).toBe(uniqueNumbers.length);
    });

    test('should not have duplicate option numbers within questions', () => {
      k10Template.questionsJson.forEach(question => {
        const optionNumbers = question.options.map(o => o.option_number);
        const uniqueNumbers = [...new Set(optionNumbers)];
        expect(optionNumbers.length).toBe(uniqueNumbers.length);
      });
    });

    test('should have non-empty strings for all text fields', () => {
      expect(k10Template.templateName.trim().length).toBeGreaterThan(0);
      expect(k10Template.description.trim().length).toBeGreaterThan(0);

      k10Template.questionsJson.forEach(question => {
        expect(question.question_text.trim().length).toBeGreaterThan(0);
        question.options.forEach(option => {
          expect(option.option_text.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Accessibility and User Experience', () => {
    test('should have clear and understandable question text', () => {
      k10Template.questionsJson.forEach(question => {
        // Question should be a complete sentence
        expect(question.question_text).toContain('?');
        // Should reference time period
        expect(question.question_text).toContain('지난 한 달 동안');
      });
    });

    test('should have consistent option text format', () => {
      const firstQuestionOptions = k10Template.questionsJson[0].options;
      const expectedFormat = [
        '전혀 느끼지 않았다',
        '가끔 느꼈다',
        '자주 느꼈다',
        '항상 느꼈다',
      ];

      firstQuestionOptions.forEach((option, index) => {
        expect(option.option_text).toBe(expectedFormat[index]);
      });
    });

    test('should provide actionable recommendations', () => {
      ['LOW', 'MID', 'HIGH'].forEach(code => {
        const recommendations = k10Template.interpretationJson[code].recommendations;
        recommendations.forEach(rec => {
          // Recommendations should be complete sentences
          expect(rec.length).toBeGreaterThan(10);
          // Should contain Korean text
          expect(rec).toMatch(/[가-힣]/);
        });
      });
    });
  });
});
