/**
 * Specialty Service
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.3: Specialty Service 구현
 *
 * 기능:
 * 1. 센터 전문 인력 기반 전문성 점수 계산 (0-100점, 20% 가중치)
 */

/**
 * 전문 인력 기반 전문성 점수 계산
 *
 * 점수 계산 로직:
 * - 정신건강의학과 전문의 있음: 100점
 * - 간호사 또는 사회복지사 있음: 80점
 * - 기타 전문 인력 있음: 60점
 * - 정보 없음: 40점
 *
 * @param {Object} staffInfo - 센터 전문 인력 정보
 *   {
 *     hasPsychiatrist: boolean,   // 정신건강의학과 전문의 보유
 *     hasNurse: boolean,          // 간호사 보유
 *     hasSocialWorker: boolean,   // 사회복지사 보유
 *     hasOthers: boolean          // 기타 전문 인력 보유
 *   }
 * @returns {number} - 전문성 점수 (0-100)
 *
 * @example
 * calculateSpecialtyScore({ hasPsychiatrist: true }); // 100
 * calculateSpecialtyScore({ hasNurse: true }); // 80
 * calculateSpecialtyScore({ hasSocialWorker: true }); // 80
 * calculateSpecialtyScore({ hasOthers: true }); // 60
 * calculateSpecialtyScore({}); // 40
 */
function calculateSpecialtyScore(staffInfo) {
  // 입력 검증
  if (!staffInfo || typeof staffInfo !== 'object') {
    throw new TypeError('staffInfo must be an object');
  }

  const {
    hasPsychiatrist = false,
    hasNurse = false,
    hasSocialWorker = false,
    hasOthers = false,
  } = staffInfo;

  // 점수 계산 로직
  if (hasPsychiatrist) {
    return 100; // 정신건강의학과 전문의: 최고 점수
  }

  if (hasNurse || hasSocialWorker) {
    return 80; // 간호사 또는 사회복지사: 높은 점수
  }

  if (hasOthers) {
    return 60; // 기타 전문 인력: 중간 점수
  }

  return 40; // 정보 없음: 기본 점수
}

module.exports = {
  calculateSpecialtyScore,
};
