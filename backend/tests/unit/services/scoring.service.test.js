/**
 * Unit Tests for Scoring Service
 *
 * Sprint 3: 자가진단 도구 구현
 * Task 3.1.2: 채점 서비스 구현
 *
 * Test Coverage:
 * - calculateTotalScore(): Score calculation with various answer combinations
 * - determineSeverityLevel(): Severity determination for LOW/MID/HIGH ranges
 * - getInterpretation(): Interpretation retrieval for each severity level
 * - validateAnswers(): Answer validation (complete, incomplete, invalid)
 * - scoreAssessment(): Complete scoring workflow integration
 * - Edge cases: empty arrays, null values, invalid IDs, out-of-range scores
 */

const {
  calculateTotalScore,
  determineSeverityLevel,
  getInterpretation,
  validateAnswers,
  scoreAssessment,
} = require('../../../src/services/scoring.service');

// Mock K-10 template for testing
const mockTemplate = {
  id: 1,
  templateCode: 'K10_V1',
  templateName: '정신건강 자가진단 (K-10)',
  questionCount: 10,
  questionsJson: [
    {
      question_number: 1,
      question_text: '질문 1',
      category: 'anxiety',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 2,
      question_text: '질문 2',
      category: 'anxiety',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 3,
      question_text: '질문 3',
      category: 'restlessness',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 4,
      question_text: '질문 4',
      category: 'depression',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 5,
      question_text: '질문 5',
      category: 'fatigue',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 6,
      question_text: '질문 6',
      category: 'hopelessness',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 7,
      question_text: '질문 7',
      category: 'worthlessness',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 8,
      question_text: '질문 8',
      category: 'fatigue',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 9,
      question_text: '질문 9',
      category: 'social_withdrawal',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 10,
      question_text: '질문 10',
      category: 'worthlessness',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
  ],
  scoringRulesJson: {
    totalPoints: 40,
    minScore: 10,
    maxScore: 40,
    calculation: 'sum',
    severityLevels: [
      {
        code: 'LOW',
        min: 10,
        max: 15,
        label: '정상',
        description: '정신적 고통이 거의 없는 상태입니다.',
      },
      {
        code: 'MID',
        min: 16,
        max: 29,
        label: '중간 정도 고통',
        description: '중간 수준의 정신적 고통을 경험하고 있습니다.',
      },
      {
        code: 'HIGH',
        min: 30,
        max: 40,
        label: '심각한 고통',
        description: '심각한 수준의 정신적 고통을 경험하고 있습니다.',
      },
    ],
  },
  interpretationJson: {
    LOW: {
      title: '정상 범위',
      message: '현재 정신적 고통이 거의 없는 상태입니다.',
      recommendations: ['건강한 생활습관을 유지하세요'],
      urgency: 'low',
    },
    MID: {
      title: '중간 정도의 정신적 고통',
      message: '중간 수준의 정신적 고통을 경험하고 있습니다.',
      recommendations: ['전문가 상담을 고려해보세요'],
      urgency: 'moderate',
      contactInfo: {
        nationalMentalHealth: '1577-0199',
      },
    },
    HIGH: {
      title: '심각한 정신적 고통',
      message: '심각한 수준의 정신적 고통을 경험하고 있습니다.',
      recommendations: ['즉시 정신건강의학과 전문의 진료를 받으세요'],
      urgency: 'high',
      emergencyContact: {
        suicide: '1393',
        mentalHealth: '1577-0199',
      },
      warningMessage: '즉각적인 위험이 있다면 119에 연락하세요',
    },
  },
};

describe('Scoring Service', () => {
  describe('calculateTotalScore()', () => {
    test('should calculate correct total score for all minimum answers (10 points)', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: 1,
      }));

      const score = calculateTotalScore(answers, mockTemplate);
      expect(score).toBe(10);
    });

    test('should calculate correct total score for all maximum answers (40 points)', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: 4,
      }));

      const score = calculateTotalScore(answers, mockTemplate);
      expect(score).toBe(40);
    });

    test('should calculate correct total score for mixed answers', () => {
      const answers = [
        { questionId: 1, selectedOption: 2 }, // 2 points
        { questionId: 2, selectedOption: 3 }, // 3 points
        { questionId: 3, selectedOption: 1 }, // 1 point
        { questionId: 4, selectedOption: 4 }, // 4 points
        { questionId: 5, selectedOption: 2 }, // 2 points
        { questionId: 6, selectedOption: 3 }, // 3 points
        { questionId: 7, selectedOption: 1 }, // 1 point
        { questionId: 8, selectedOption: 2 }, // 2 points
        { questionId: 9, selectedOption: 3 }, // 3 points
        { questionId: 10, selectedOption: 2 }, // 2 points
      ];

      const score = calculateTotalScore(answers, mockTemplate);
      expect(score).toBe(23); // Total: 23 points
    });

    test('should throw TypeError if answers is not an array', () => {
      expect(() => {
        calculateTotalScore('not an array', mockTemplate);
      }).toThrow(TypeError);
      expect(() => {
        calculateTotalScore('not an array', mockTemplate);
      }).toThrow('Answers must be an array');
    });

    test('should throw TypeError if template is missing questionsJson', () => {
      expect(() => {
        calculateTotalScore([], {});
      }).toThrow(TypeError);
      expect(() => {
        calculateTotalScore([], {});
      }).toThrow('Template must include questionsJson');
    });

    test('should throw Error if question not found in template', () => {
      const answers = [{ questionId: 999, selectedOption: 1 }];

      expect(() => {
        calculateTotalScore(answers, mockTemplate);
      }).toThrow('Question 999 not found in template');
    });

    test('should throw Error if option not found for question', () => {
      const answers = [{ questionId: 1, selectedOption: 99 }];

      expect(() => {
        calculateTotalScore(answers, mockTemplate);
      }).toThrow('Option 99 not found for question 1');
    });
  });

  describe('determineSeverityLevel()', () => {
    test('should return LOW for scores 10-15', () => {
      expect(determineSeverityLevel(10, mockTemplate.scoringRulesJson)).toBe('LOW');
      expect(determineSeverityLevel(12, mockTemplate.scoringRulesJson)).toBe('LOW');
      expect(determineSeverityLevel(15, mockTemplate.scoringRulesJson)).toBe('LOW');
    });

    test('should return MID for scores 16-29', () => {
      expect(determineSeverityLevel(16, mockTemplate.scoringRulesJson)).toBe('MID');
      expect(determineSeverityLevel(21, mockTemplate.scoringRulesJson)).toBe('MID');
      expect(determineSeverityLevel(29, mockTemplate.scoringRulesJson)).toBe('MID');
    });

    test('should return HIGH for scores 30-40', () => {
      expect(determineSeverityLevel(30, mockTemplate.scoringRulesJson)).toBe('HIGH');
      expect(determineSeverityLevel(35, mockTemplate.scoringRulesJson)).toBe('HIGH');
      expect(determineSeverityLevel(40, mockTemplate.scoringRulesJson)).toBe('HIGH');
    });

    test('should throw TypeError if totalScore is not a number', () => {
      expect(() => {
        determineSeverityLevel('20', mockTemplate.scoringRulesJson);
      }).toThrow(TypeError);
      expect(() => {
        determineSeverityLevel('20', mockTemplate.scoringRulesJson);
      }).toThrow('Total score must be a number');
    });

    test('should throw TypeError if scoringRules is missing severityLevels', () => {
      expect(() => {
        determineSeverityLevel(20, {});
      }).toThrow(TypeError);
      expect(() => {
        determineSeverityLevel(20, {});
      }).toThrow('Scoring rules must include severityLevels array');
    });

    test('should throw Error if score is out of defined ranges', () => {
      expect(() => {
        determineSeverityLevel(5, mockTemplate.scoringRulesJson);
      }).toThrow('No severity level found for score 5');

      expect(() => {
        determineSeverityLevel(50, mockTemplate.scoringRulesJson);
      }).toThrow('No severity level found for score 50');
    });
  });

  describe('getInterpretation()', () => {
    test('should return correct interpretation for LOW severity', () => {
      const interpretation = getInterpretation('LOW', mockTemplate.interpretationJson);

      expect(interpretation.title).toBe('정상 범위');
      expect(interpretation.message).toContain('정신적 고통이 거의 없는 상태');
      expect(interpretation.recommendations).toEqual(['건강한 생활습관을 유지하세요']);
      expect(interpretation.urgency).toBe('low');
      expect(interpretation.contactInfo).toBeNull();
      expect(interpretation.emergencyContact).toBeNull();
    });

    test('should return correct interpretation for MID severity', () => {
      const interpretation = getInterpretation('MID', mockTemplate.interpretationJson);

      expect(interpretation.title).toBe('중간 정도의 정신적 고통');
      expect(interpretation.message).toContain('중간 수준의 정신적 고통');
      expect(interpretation.recommendations).toContain('전문가 상담을 고려해보세요');
      expect(interpretation.urgency).toBe('moderate');
      expect(interpretation.contactInfo).toEqual({
        nationalMentalHealth: '1577-0199',
      });
    });

    test('should return correct interpretation for HIGH severity', () => {
      const interpretation = getInterpretation('HIGH', mockTemplate.interpretationJson);

      expect(interpretation.title).toBe('심각한 정신적 고통');
      expect(interpretation.message).toContain('심각한 수준의 정신적 고통');
      expect(interpretation.recommendations[0]).toContain('즉시 정신건강의학과');
      expect(interpretation.urgency).toBe('high');
      expect(interpretation.emergencyContact).toEqual({
        suicide: '1393',
        mentalHealth: '1577-0199',
      });
      expect(interpretation.warningMessage).toContain('119');
    });

    test('should throw TypeError if severityCode is not a string', () => {
      expect(() => {
        getInterpretation(123, mockTemplate.interpretationJson);
      }).toThrow(TypeError);
      expect(() => {
        getInterpretation(123, mockTemplate.interpretationJson);
      }).toThrow('Severity code must be a string');
    });

    test('should throw TypeError if interpretations is missing', () => {
      expect(() => {
        getInterpretation('LOW', null);
      }).toThrow(TypeError);
      expect(() => {
        getInterpretation('LOW', null);
      }).toThrow('Interpretations must be an object');
    });

    test('should throw Error if interpretation not found for severity code', () => {
      expect(() => {
        getInterpretation('INVALID', mockTemplate.interpretationJson);
      }).toThrow('Interpretation not found for severity code: INVALID');
    });
  });

  describe('validateAnswers()', () => {
    test('should return valid for complete and correct answers', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: 2,
      }));

      const result = validateAnswers(answers, mockTemplate);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should return invalid if answers is not an array', () => {
      const result = validateAnswers('not an array', mockTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Answers must be an array');
    });

    test('should return invalid if template is missing', () => {
      const result = validateAnswers([], null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template is missing or invalid');
    });

    test('should return invalid if answer count does not match', () => {
      const answers = [
        { questionId: 1, selectedOption: 2 },
        { questionId: 2, selectedOption: 3 },
      ];

      const result = validateAnswers(answers, mockTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expected 10 answers, but received 2');
    });

    test('should return invalid if answer is not an object', () => {
      const answers = [null, { questionId: 2, selectedOption: 2 }];
      const result = validateAnswers(answers, mockTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Answer at index 0 must be an object');
    });

    test('should return invalid if questionId is not a number', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i === 0 ? '1' : i + 1,
        selectedOption: 2,
      }));

      const result = validateAnswers(answers, mockTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Answer at index 0: questionId must be a number');
    });

    test('should return invalid if selectedOption is not a number', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: i === 0 ? '2' : 2,
      }));

      const result = validateAnswers(answers, mockTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Answer for question 1: selectedOption must be a number'
      );
    });

    test('should return invalid if question not found in template', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i === 0 ? 999 : i + 1,
        selectedOption: 2,
      }));

      const result = validateAnswers(answers, mockTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Question 999 not found in template');
    });

    test('should return invalid if option does not exist for question', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: i === 0 ? 99 : 2,
      }));

      const result = validateAnswers(answers, mockTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Answer for question 1: option 99 does not exist'
      );
    });

    test('should return invalid if option is out of range', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: i === 0 ? 5 : 2,
      }));

      const result = validateAnswers(answers, mockTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors.some(err =>
        err.includes('Answer for question 1') && err.includes('option 5')
      )).toBe(true);
    });

    test('should return invalid if duplicate answers exist', () => {
      const answers = [
        { questionId: 1, selectedOption: 2 },
        { questionId: 1, selectedOption: 3 }, // Duplicate
        ...Array.from({ length: 8 }, (_, i) => ({
          questionId: i + 2,
          selectedOption: 2,
        })),
      ];

      const result = validateAnswers(answers, mockTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duplicate answer for question 1');
    });

    test('should return invalid if missing answers for questions', () => {
      const answers = [
        { questionId: 1, selectedOption: 2 },
        { questionId: 3, selectedOption: 2 },
        // Missing question 2
      ];

      const result = validateAnswers(answers, mockTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expected 10 answers, but received 2');
      expect(result.errors.some(err => err.includes('Missing answers'))).toBe(true);
    });
  });

  describe('scoreAssessment()', () => {
    test('should return valid result with LOW severity', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: 1,
      }));

      const result = scoreAssessment(answers, mockTemplate);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.totalScore).toBe(10);
      expect(result.severityCode).toBe('LOW');
      expect(result.interpretation).toBeDefined();
      expect(result.interpretation.title).toBe('정상 범위');
      expect(result.interpretation.urgency).toBe('low');
    });

    test('should return valid result with MID severity', () => {
      const answers = [
        { questionId: 1, selectedOption: 2 }, // 2
        { questionId: 2, selectedOption: 2 }, // 2
        { questionId: 3, selectedOption: 2 }, // 2
        { questionId: 4, selectedOption: 2 }, // 2
        { questionId: 5, selectedOption: 2 }, // 2
        { questionId: 6, selectedOption: 3 }, // 3
        { questionId: 7, selectedOption: 3 }, // 3
        { questionId: 8, selectedOption: 3 }, // 3
        { questionId: 9, selectedOption: 1 }, // 1
        { questionId: 10, selectedOption: 1 }, // 1
      ];

      const result = scoreAssessment(answers, mockTemplate);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(21);
      expect(result.severityCode).toBe('MID');
      expect(result.interpretation.title).toBe('중간 정도의 정신적 고통');
      expect(result.interpretation.urgency).toBe('moderate');
      expect(result.interpretation.contactInfo).toBeDefined();
    });

    test('should return valid result with HIGH severity', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: i < 5 ? 4 : 3,
      }));

      const result = scoreAssessment(answers, mockTemplate);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(35); // 5*4 + 5*3 = 35
      expect(result.severityCode).toBe('HIGH');
      expect(result.interpretation.title).toBe('심각한 정신적 고통');
      expect(result.interpretation.urgency).toBe('high');
      expect(result.interpretation.emergencyContact).toBeDefined();
      expect(result.interpretation.warningMessage).toContain('119');
    });

    test('should return invalid result if validation fails', () => {
      const answers = [{ questionId: 1, selectedOption: 2 }]; // Incomplete

      const result = scoreAssessment(answers, mockTemplate);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.totalScore).toBeNull();
      expect(result.severityCode).toBeNull();
      expect(result.interpretation).toBeNull();
    });

    test('should handle empty answers array', () => {
      const result = scoreAssessment([], mockTemplate);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expected 10 answers, but received 0');
      expect(result.totalScore).toBeNull();
      expect(result.severityCode).toBeNull();
      expect(result.interpretation).toBeNull();
    });

    test('should handle null answers', () => {
      const result = scoreAssessment(null, mockTemplate);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Answers must be an array');
      expect(result.totalScore).toBeNull();
    });

    test('should handle null template', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: 2,
      }));

      const result = scoreAssessment(answers, null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Template is missing or invalid');
      expect(result.totalScore).toBeNull();
    });

    test('should handle scoring errors gracefully', () => {
      // Create invalid template with missing scoringRulesJson
      const invalidTemplate = {
        ...mockTemplate,
        scoringRulesJson: null,
      };

      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: 2,
      }));

      const result = scoreAssessment(answers, invalidTemplate);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.totalScore).toBeNull();
      expect(result.severityCode).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('should handle edge case: minimum score boundary (10)', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: 1,
      }));

      const result = scoreAssessment(answers, mockTemplate);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(10);
      expect(result.severityCode).toBe('LOW');
    });

    test('should handle edge case: LOW-MID boundary (15-16)', () => {
      // Score 15 (LOW)
      let answers = [
        ...Array.from({ length: 5 }, (_, i) => ({
          questionId: i + 1,
          selectedOption: 1,
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          questionId: i + 6,
          selectedOption: 2,
        })),
      ];
      expect(scoreAssessment(answers, mockTemplate).severityCode).toBe('LOW');

      // Score 16 (MID)
      answers = [
        ...Array.from({ length: 4 }, (_, i) => ({
          questionId: i + 1,
          selectedOption: 1,
        })),
        ...Array.from({ length: 6 }, (_, i) => ({
          questionId: i + 5,
          selectedOption: 2,
        })),
      ];
      expect(scoreAssessment(answers, mockTemplate).severityCode).toBe('MID');
    });

    test('should handle edge case: MID-HIGH boundary (29-30)', () => {
      // Score 29 (MID)
      let answers = [
        ...Array.from({ length: 1 }, (_, i) => ({
          questionId: i + 1,
          selectedOption: 1,
        })),
        ...Array.from({ length: 9 }, (_, i) => ({
          questionId: i + 2,
          selectedOption: 3.11,
        })),
      ];
      // Adjust to exactly 29
      answers = [
        { questionId: 1, selectedOption: 2 },
        { questionId: 2, selectedOption: 3 },
        { questionId: 3, selectedOption: 3 },
        { questionId: 4, selectedOption: 3 },
        { questionId: 5, selectedOption: 3 },
        { questionId: 6, selectedOption: 3 },
        { questionId: 7, selectedOption: 3 },
        { questionId: 8, selectedOption: 3 },
        { questionId: 9, selectedOption: 3 },
        { questionId: 10, selectedOption: 3 },
      ];
      expect(scoreAssessment(answers, mockTemplate).totalScore).toBe(29);
      expect(scoreAssessment(answers, mockTemplate).severityCode).toBe('MID');

      // Score 30 (HIGH)
      answers[0].selectedOption = 3;
      expect(scoreAssessment(answers, mockTemplate).totalScore).toBe(30);
      expect(scoreAssessment(answers, mockTemplate).severityCode).toBe('HIGH');
    });

    test('should handle edge case: maximum score boundary (40)', () => {
      const answers = Array.from({ length: 10 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: 4,
      }));

      const result = scoreAssessment(answers, mockTemplate);

      expect(result.isValid).toBe(true);
      expect(result.totalScore).toBe(40);
      expect(result.severityCode).toBe('HIGH');
    });
  });
});
