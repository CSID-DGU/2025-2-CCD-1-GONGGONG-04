/**
 * Scoring Service
 *
 * Sprint 3: 자가진단 도구 구현
 * Task 3.1.2: 채점 서비스 구현
 *
 * 기능:
 * 1. 사용자 응답 기반 총점 계산
 * 2. 총점 기반 심각도 분류 (LOW/MID/HIGH)
 * 3. 심각도에 따른 해석 및 권장사항 제공
 * 4. 응답 검증 (필수 답변, 유효성 체크)
 */

/**
 * Calculate total score from user answers
 *
 * @param {Array<{questionId: number, selectedOption: number}>} answers - User answers array
 * @param {Object} template - Assessment template with questions_json
 * @returns {number} Total score
 *
 * @throws {TypeError} If answers is not an array or template is missing
 * @throws {Error} If question or option not found in template
 *
 * @example
 * const answers = [
 *   { questionId: 1, selectedOption: 2 },
 *   { questionId: 2, selectedOption: 3 }
 * ];
 * const score = calculateTotalScore(answers, template);
 * // returns: 5 (2 + 3)
 */
function calculateTotalScore(answers, template) {
  // Input validation
  if (!Array.isArray(answers)) {
    throw new TypeError('Answers must be an array');
  }

  if (!template || !template.questionsJson) {
    throw new TypeError('Template must include questionsJson');
  }

  const questions = template.questionsJson;
  let totalScore = 0;

  for (const answer of answers) {
    const { questionNumber, selectedOption } = answer;

    // Find the question in template (questionsJson is already in camelCase from keysToCamel)
    const question = questions.find(q => q.questionNumber === questionNumber);
    if (!question) {
      throw new Error(`Question ${questionNumber} not found in template`);
    }

    // Find the selected option in question
    const option = question.options.find(opt => opt.optionNumber === selectedOption);
    if (!option) {
      throw new Error(
        `Option ${selectedOption} not found for question ${questionNumber}`
      );
    }

    // Add the score
    totalScore += option.score;
  }

  return totalScore;
}

/**
 * Determine severity level based on total score
 *
 * @param {number} totalScore - Total assessment score
 * @param {Object} scoringRules - Scoring rules from template (scoringRulesJson)
 * @returns {string} Severity code: 'LOW', 'MID', or 'HIGH'
 *
 * @throws {TypeError} If totalScore is not a number or scoringRules is missing
 * @throws {Error} If no matching severity level found
 *
 * @example
 * const scoringRules = {
 *   severityLevels: [
 *     { code: 'LOW', min: 10, max: 15 },
 *     { code: 'MID', min: 16, max: 29 },
 *     { code: 'HIGH', min: 30, max: 40 }
 *   ]
 * };
 * determineSeverityLevel(21, scoringRules); // returns: 'MID'
 */
function determineSeverityLevel(totalScore, scoringRules) {
  // Input validation
  if (typeof totalScore !== 'number') {
    throw new TypeError('Total score must be a number');
  }

  if (!scoringRules || !Array.isArray(scoringRules.severityLevels)) {
    throw new TypeError('Scoring rules must include severityLevels array');
  }

  // Find matching severity level
  const severityLevel = scoringRules.severityLevels.find(
    level => totalScore >= level.min && totalScore <= level.max
  );

  if (!severityLevel) {
    throw new Error(
      `No severity level found for score ${totalScore}. Score must be within defined ranges.`
    );
  }

  return severityLevel.code;
}

/**
 * Get interpretation for severity level
 *
 * @param {string} severityCode - 'LOW', 'MID', or 'HIGH'
 * @param {Object} interpretations - Interpretations from template (interpretationJson)
 * @returns {Object} Interpretation with title, message, recommendations, urgency
 *
 * @throws {TypeError} If severityCode is not a string or interpretations is missing
 * @throws {Error} If interpretation not found for severity code
 *
 * @example
 * const interpretations = {
 *   LOW: {
 *     title: '정상 범위',
 *     message: '현재 정신적 고통이 거의 없는 상태입니다.',
 *     recommendations: ['건강한 생활습관을 유지하세요'],
 *     urgency: 'low'
 *   }
 * };
 * getInterpretation('LOW', interpretations);
 * // returns: { title: '정상 범위', message: '...', recommendations: [...], urgency: 'low' }
 */
function getInterpretation(severityCode, interpretations) {
  // Input validation
  if (typeof severityCode !== 'string') {
    throw new TypeError('Severity code must be a string');
  }

  if (!interpretations || typeof interpretations !== 'object') {
    throw new TypeError('Interpretations must be an object');
  }

  // Get interpretation for severity code
  const interpretation = interpretations[severityCode];

  if (!interpretation) {
    throw new Error(`Interpretation not found for severity code: ${severityCode}`);
  }

  return {
    title: interpretation.title,
    message: interpretation.message,
    recommendations: interpretation.recommendations || [],
    urgency: interpretation.urgency || 'low',
    contactInfo: interpretation.contactInfo || null,
    emergencyContact: interpretation.emergencyContact || null,
    warningMessage: interpretation.warningMessage || null,
  };
}

/**
 * Validate answers against template
 *
 * @param {Array<{questionId: number, selectedOption: number}>} answers - User answers
 * @param {Object} template - Assessment template
 * @returns {Object} { valid: boolean, errors: Array<string> }
 *
 * @example
 * const result = validateAnswers(answers, template);
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 */
function validateAnswers(answers, template) {
  const errors = [];

  // Check if answers is an array
  if (!Array.isArray(answers)) {
    errors.push('Answers must be an array');
    return { valid: false, errors };
  }

  // Check if template exists
  if (!template || !template.questionsJson) {
    errors.push('Template is missing or invalid');
    return { valid: false, errors };
  }

  const questions = template.questionsJson;
  const expectedQuestionCount = template.questionCount || questions.length;

  // Check if all questions are answered
  if (answers.length !== expectedQuestionCount) {
    errors.push(
      `Expected ${expectedQuestionCount} answers, but received ${answers.length}`
    );
  }

  // Validate each answer
  const answeredQuestionIds = new Set();

  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];

    // Check answer structure
    if (!answer || typeof answer !== 'object') {
      errors.push(`Answer at index ${i} must be an object`);
      continue;
    }

    const { questionNumber, selectedOption } = answer;

    // Check questionNumber
    if (typeof questionNumber !== 'number') {
      errors.push(`Answer at index ${i}: questionNumber must be a number`);
      continue;
    }

    // Check for duplicate answers
    if (answeredQuestionIds.has(questionNumber)) {
      errors.push(`Duplicate answer for question ${questionNumber}`);
      continue;
    }
    answeredQuestionIds.add(questionNumber);

    // Find question in template (questionsJson is already in camelCase from keysToCamel)
    const question = questions.find(q => q.questionNumber === questionNumber);
    if (!question) {
      errors.push(`Question ${questionNumber} not found in template`);
      continue;
    }

    // Check selectedOption
    if (typeof selectedOption !== 'number') {
      errors.push(
        `Answer for question ${questionNumber}: selectedOption must be a number`
      );
      continue;
    }

    // Validate option exists
    const option = question.options.find(opt => opt.optionNumber === selectedOption);
    if (!option) {
      errors.push(
        `Answer for question ${questionNumber}: option ${selectedOption} does not exist`
      );
      continue;
    }

    // Validate option range (typically 1-4 for K-10)
    const minOption = Math.min(...question.options.map(opt => opt.optionNumber));
    const maxOption = Math.max(...question.options.map(opt => opt.optionNumber));

    if (selectedOption < minOption || selectedOption > maxOption) {
      errors.push(
        `Answer for question ${questionNumber}: option ${selectedOption} is out of range (${minOption}-${maxOption})`
      );
    }
  }

  // Check if all required questions are answered
  const missingQuestions = questions
    .filter(q => !answeredQuestionIds.has(q.questionNumber))
    .map(q => q.questionNumber);

  if (missingQuestions.length > 0) {
    errors.push(`Missing answers for questions: ${missingQuestions.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Score a complete assessment
 *
 * Main function that orchestrates validation, scoring, and interpretation
 *
 * @param {Array<{questionId: number, selectedOption: number}>} answers - User answers
 * @param {Object} template - Assessment template
 * @returns {Object} {
 *   isValid: boolean,
 *   errors: Array<string>,
 *   totalScore: number | null,
 *   severityCode: string | null,
 *   interpretation: Object | null
 * }
 *
 * @example
 * const result = scoreAssessment(answers, template);
 * if (result.isValid) {
 *   console.log('Total Score:', result.totalScore);
 *   console.log('Severity:', result.severityCode);
 *   console.log('Interpretation:', result.interpretation);
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 */
function scoreAssessment(answers, template) {
  // Step 1: Validate answers
  const validation = validateAnswers(answers, template);

  if (!validation.valid) {
    return {
      isValid: false,
      errors: validation.errors,
      totalScore: null,
      severityCode: null,
      interpretation: null,
    };
  }

  try {
    // Step 2: Calculate total score
    const totalScore = calculateTotalScore(answers, template);

    // Step 3: Determine severity level
    const severityCode = determineSeverityLevel(totalScore, template.scoringRulesJson);

    // Step 4: Get interpretation
    const interpretation = getInterpretation(severityCode, template.interpretationJson);

    return {
      isValid: true,
      errors: [],
      totalScore,
      severityCode,
      interpretation,
    };
  } catch (error) {
    // Handle any unexpected errors during scoring
    return {
      isValid: false,
      errors: [error.message],
      totalScore: null,
      severityCode: null,
      interpretation: null,
    };
  }
}

module.exports = {
  calculateTotalScore,
  determineSeverityLevel,
  getInterpretation,
  validateAnswers,
  scoreAssessment,
};
