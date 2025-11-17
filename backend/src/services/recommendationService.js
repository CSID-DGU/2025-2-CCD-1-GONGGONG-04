/**
 * Recommendation Service (JavaScript wrapper)
 *
 * Sprint 5: TypeScript recommendationService.ts를 JavaScript에서 사용하기 위한 래퍼
 */

require('ts-node/register');
const recommendationServiceTs = require('./recommendationService.ts');

/**
 * 센터 추천 계산
 *
 * @param {Object} request - 추천 요청
 * @param {number} request.latitude - 사용자 위도
 * @param {number} request.longitude - 사용자 경도
 * @param {number} [request.maxDistance=10] - 최대 거리 (km)
 * @param {number} [request.limit=10] - 최대 결과 수
 * @param {string} [request.sessionId] - 세션 ID
 * @param {bigint} [request.userId] - 사용자 ID
 * @returns {Promise<Array>} 추천 결과
 */
async function getRecommendations(request) {
  const {
    latitude,
    longitude,
    maxDistance = 10,
    limit = 10,
    sessionId,
    userId
  } = request;

  // TypeScript 함수 호출
  const result = await recommendationServiceTs.getRecommendations({
    latitude,
    longitude,
    maxDistance,
    limit,
    sessionId,
    userId
  });

  return result;
}

module.exports = {
  getRecommendations
};
