/**
 * Program Service
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.4: Program Service 구현
 *
 * 기능:
 * 1. 자가진단 결과 기반 프로그램 매칭
 * 2. 프로그램 매칭도 기반 점수 계산 (0-100점, 20% 가중치)
 */

/**
 * 자가진단 결과 기반 프로그램 매칭
 *
 * @param {Array<Object>} programs - 센터 프로그램 배열
 *   [ { programName, category, targetSeverity, targetAge }, ... ]
 * @param {Object} assessmentResult - 자가진단 결과
 *   { severity: 'LOW'|'MID'|'HIGH', category: 'depression'|'anxiety'|'stress' }
 * @returns {Array<Object>} - 매칭된 프로그램 배열 (점수순 정렬)
 *
 * @example
 * const programs = [
 *   { programName: '우울증 집단치료', category: 'depression', targetSeverity: ['MID', 'HIGH'] },
 *   { programName: '불안 완화 프로그램', category: 'anxiety', targetSeverity: ['LOW', 'MID'] }
 * ];
 * const result = { severity: 'MID', category: 'depression' };
 * matchProgramsByAssessment(programs, result); // [우울증 집단치료]
 */
function matchProgramsByAssessment(programs, assessmentResult) {
  // 입력 검증
  if (!Array.isArray(programs)) {
    throw new TypeError('programs must be an array');
  }

  if (
    !assessmentResult ||
    typeof assessmentResult !== 'object' ||
    !assessmentResult.severity ||
    !assessmentResult.category
  ) {
    throw new TypeError('assessmentResult must have severity and category');
  }

  const { severity, category } = assessmentResult;

  // 매칭 로직: category 일치 우선, severity 포함 여부 확인
  const matched = programs
    .map(program => {
      let matchScore = 0;

      // Category 완전 일치 (우선순위 높음)
      if (program.category === category) {
        matchScore += 10;
      } else if (program.category === 'general') {
        matchScore += 3; // 일반 프로그램
      }

      // Severity 매칭 (targetSeverity가 배열이거나 null)
      if (
        program.targetSeverity &&
        Array.isArray(program.targetSeverity) &&
        program.targetSeverity.includes(severity)
      ) {
        matchScore += 5;
      } else if (!program.targetSeverity) {
        matchScore += 1; // severity 제한 없음
      }

      return {
        ...program,
        matchScore,
      };
    })
    .filter(program => program.matchScore > 0) // 매칭되지 않은 프로그램 제외
    .sort((a, b) => b.matchScore - a.matchScore); // 점수 높은 순 정렬

  return matched;
}

/**
 * 프로그램 매칭도 기반 점수 계산
 *
 * 점수 계산 로직:
 * - 완전 일치 (category + severity + age): 100점
 * - 유사 프로그램 (category 일치): 70점
 * - 일반 프로그램 (general): 50점
 * - 프로그램 정보 없음: 30점
 *
 * @param {Array<Object>} programs - 센터 프로그램 배열
 * @param {Object} userProfile - 사용자 프로필
 *   { age: number, assessmentResult: { severity, category } }
 * @returns {number} - 프로그램 점수 (0-100)
 *
 * @example
 * const programs = [
 *   { programName: '우울증 치료', category: 'depression', targetSeverity: ['MID'], targetAge: { min: 20, max: 40 } }
 * ];
 * const userProfile = { age: 25, assessmentResult: { severity: 'MID', category: 'depression' } };
 * calculateProgramScore(programs, userProfile); // 100 (완전 일치)
 */
function calculateProgramScore(programs, userProfile) {
  // 입력 검증
  if (!Array.isArray(programs)) {
    throw new TypeError('programs must be an array');
  }

  if (!userProfile || typeof userProfile !== 'object') {
    throw new TypeError('userProfile must be an object');
  }

  const { age, assessmentResult } = userProfile;

  // assessmentResult 없으면 기본 점수
  if (!assessmentResult || !assessmentResult.severity || !assessmentResult.category) {
    // 프로그램이 있으면 일반 프로그램 점수, 없으면 정보 없음 점수
    return programs.length > 0 ? 50 : 30;
  }

  // 프로그램 정보 없음
  if (programs.length === 0) {
    return 30;
  }

  const { severity, category } = assessmentResult;

  // 완전 일치 프로그램 찾기
  const exactMatch = programs.some(program => {
    const categoryMatch = program.category === category;
    const severityMatch =
      program.targetSeverity &&
      Array.isArray(program.targetSeverity) &&
      program.targetSeverity.includes(severity);

    let ageMatch = true;
    if (age && program.targetAge) {
      ageMatch = age >= program.targetAge.min && age <= program.targetAge.max;
    }

    return categoryMatch && severityMatch && ageMatch;
  });

  if (exactMatch) {
    return 100; // 완전 일치
  }

  // 유사 프로그램 찾기 (category 일치)
  const similarMatch = programs.some(program => program.category === category);

  if (similarMatch) {
    return 70; // 유사 프로그램
  }

  // 일반 프로그램 찾기
  const generalProgram = programs.some(program => program.category === 'general');

  if (generalProgram) {
    return 50; // 일반 프로그램
  }

  // 프로그램은 있지만 매칭되지 않음
  return 30;
}

module.exports = {
  matchProgramsByAssessment,
  calculateProgramScore,
};
