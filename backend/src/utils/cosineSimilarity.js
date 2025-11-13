/**
 * Cosine Similarity Utility
 *
 * Phase 2 Sprint 5: 벡터 유사도 계산
 * 두 벡터 간의 코사인 유사도를 계산
 */

const math = require('mathjs');

/**
 * 코사인 유사도 계산
 *
 * @param {number[]} vecA - 첫 번째 벡터
 * @param {number[]} vecB - 두 번째 벡터
 * @returns {number} 코사인 유사도 (-1 ~ 1 범위)
 *
 * @description
 * 코사인 유사도 = dot(A, B) / (||A|| * ||B||)
 * - 1.0: 동일한 방향 (완전히 유사)
 * - 0.0: 직교 (무관함)
 * - -1.0: 반대 방향 (완전히 반대)
 *
 * @throws {Error} 벡터 길이가 다른 경우
 */
function cosineSimilarity(vecA, vecB) {
  // 입력 검증
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    throw new Error('입력값은 배열이어야 합니다');
  }

  if (vecA.length === 0 || vecB.length === 0) {
    throw new Error('벡터는 최소 1개 이상의 요소를 가져야 합니다');
  }

  if (vecA.length !== vecB.length) {
    throw new Error(`벡터 차원이 일치하지 않습니다 (${vecA.length} vs ${vecB.length})`);
  }

  // NaN 또는 Infinity 체크
  if (vecA.some(v => !Number.isFinite(v)) || vecB.some(v => !Number.isFinite(v))) {
    throw new Error('벡터에 유효하지 않은 값(NaN 또는 Infinity)이 포함되어 있습니다');
  }

  try {
    // 내적 계산
    const dotProduct = math.dot(vecA, vecB);

    // 각 벡터의 노름(크기) 계산
    const normA = math.norm(vecA);
    const normB = math.norm(vecB);

    // 노름이 0인 경우 (제로 벡터)
    if (normA === 0 || normB === 0) {
      return 0;
    }

    // 코사인 유사도 계산
    const similarity = dotProduct / (normA * normB);

    // 부동소수점 연산 오차로 인한 범위 초과 보정
    return Math.max(-1, Math.min(1, similarity));
  } catch (error) {
    throw new Error(`코사인 유사도 계산 실패: ${error.message}`);
  }
}

/**
 * 배치 코사인 유사도 계산
 *
 * @param {number[]} queryVector - 쿼리 벡터
 * @param {number[][]} targetVectors - 비교 대상 벡터 배열
 * @returns {number[]} 각 벡터와의 유사도 배열
 */
function batchCosineSimilarity(queryVector, targetVectors) {
  if (!Array.isArray(targetVectors) || targetVectors.length === 0) {
    throw new Error('targetVectors는 비어있지 않은 배열이어야 합니다');
  }

  return targetVectors.map(targetVector =>
    cosineSimilarity(queryVector, targetVector)
  );
}

/**
 * Top-K 유사 벡터 찾기
 *
 * @param {number[]} queryVector - 쿼리 벡터
 * @param {Array<{id: string|number, vector: number[]}>} targetData - ID와 벡터 배열
 * @param {number} k - 반환할 상위 결과 수
 * @param {number} threshold - 최소 유사도 임계값 (기본: 0)
 * @returns {Array<{id: string|number, similarity: number}>} 상위 K개 결과
 */
function findTopKSimilar(queryVector, targetData, k = 10, threshold = 0) {
  if (!Array.isArray(targetData) || targetData.length === 0) {
    return [];
  }

  // 모든 벡터와의 유사도 계산
  const similarities = targetData.map(({ id, vector }) => ({
    id,
    similarity: cosineSimilarity(queryVector, vector)
  }));

  // 임계값 필터링 및 정렬
  return similarities
    .filter(item => item.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}

/**
 * 유사도 점수를 백분율로 변환
 *
 * @param {number} similarity - 코사인 유사도 (-1 ~ 1)
 * @returns {number} 백분율 (0 ~ 100)
 */
function similarityToPercentage(similarity) {
  // -1 ~ 1 범위를 0 ~ 100으로 변환
  return Math.round(((similarity + 1) / 2) * 100);
}

/**
 * 유사도 레벨 판단
 *
 * @param {number} similarity - 코사인 유사도 (0 ~ 1)
 * @returns {string} 유사도 레벨 ('very_high', 'high', 'medium', 'low')
 */
function getSimilarityLevel(similarity) {
  if (similarity >= 0.9) return 'very_high';
  if (similarity >= 0.7) return 'high';
  if (similarity >= 0.5) return 'medium';
  return 'low';
}

module.exports = {
  cosineSimilarity,
  batchCosineSimilarity,
  findTopKSimilar,
  similarityToPercentage,
  getSimilarityLevel
};
