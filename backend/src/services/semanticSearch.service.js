/**
 * Semantic Search Service
 *
 * Phase 2 Sprint 5: 의미론적 검색 서비스
 * LLM 임베딩과 Vector DB를 결합한 센터 검색
 */

const llmService = require('./llm.service');
const vectorDBService = require('./vectorDB.service');
const { cosineSimilarity } = require('../utils/cosineSimilarity');
const { SemanticSearchError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * 의미론적 검색 수행
 *
 * @param {Object} request - 검색 요청
 * @param {string} request.queryText - 사용자 쿼리 텍스트
 * @param {number} [request.topK=20] - 반환할 상위 결과 수
 * @param {number} [request.threshold=0.5] - 최소 유사도 임계값
 * @param {Object} [request.filter] - 메타데이터 필터
 * @returns {Promise<Array>} 검색 결과
 *
 * @example
 * const results = await semanticSearch({
 *   queryText: '우울증 상담이 필요해요',
 *   topK: 10,
 *   threshold: 0.6
 * });
 */
async function semanticSearch(request) {
  const { queryText, topK = 20, threshold = 0.2, filter = null } = request;

  const startTime = Date.now();

  try {
    // 1. 쿼리 텍스트를 임베딩으로 변환
    logger.debug('쿼리 임베딩 생성 시작', { queryText: queryText.substring(0, 50) + '...' });

    const embeddingResult = await llmService.generateEmbedding({
      text: queryText,
      model: 'openai',
      cache: true
    });

    const queryEmbedding = embeddingResult.embeddings[0];

    logger.debug('쿼리 임베딩 생성 완료', {
      vectorSize: queryEmbedding.length,
      cacheHit: embeddingResult.cacheHit,
      tokenCount: embeddingResult.tokenCount
    });

    // 2. Vector DB에서 유사한 벡터 검색
    const searchResults = await vectorDBService.searchSimilarVectors({
      vector: queryEmbedding,
      topK,
      threshold,
      filter
    });

    logger.debug('벡터 검색 완료', {
      resultCount: searchResults.length,
      topK,
      threshold
    });

    // 3. 결과 포맷팅
    const formattedResults = searchResults.map(result => ({
      centerId: parseInt(result.id),
      similarityScore: result.score,
      centerName: result.payload.name || null,
      matchedKeywords: extractMatchedKeywords(result.payload, queryText)
    }));

    const queryTime = Date.now() - startTime;

    logger.info('의미론적 검색 완료', {
      queryTextLength: queryText.length,
      resultCount: formattedResults.length,
      topK,
      threshold,
      queryTime: `${queryTime}ms`
    });

    return {
      results: formattedResults,
      metadata: {
        queryTime,
        cacheHit: embeddingResult.cacheHit,
        totalResults: formattedResults.length
      }
    };
  } catch (error) {
    logger.error('의미론적 검색 실패', {
      error: error.message,
      queryText: queryText.substring(0, 50),
      topK,
      threshold
    });

    throw new SemanticSearchError('의미론적 검색 실패', null, error);
  }
}

/**
 * 매칭된 키워드 추출
 *
 * @param {Object} payload - 센터 메타데이터
 * @param {string} queryText - 사용자 쿼리
 * @returns {string[]} 매칭된 키워드 배열
 */
function extractMatchedKeywords(payload, queryText) {
  const keywords = [];
  const queryLower = queryText.toLowerCase();

  // specialties에서 키워드 추출
  if (payload.specialties && Array.isArray(payload.specialties)) {
    payload.specialties.forEach(specialty => {
      if (queryLower.includes(specialty.toLowerCase()) || specialty.length > 2) {
        keywords.push(specialty);
      }
    });
  }

  // description에서 키워드 추출 (간단한 매칭)
  if (payload.description) {
    const commonMentalHealthTerms = [
      '우울증', '불안', '스트레스', '상담', '치료',
      '정신건강', '심리', '청년', '직장인', '학생',
      '부모', '자녀', '가족', '수면', '외상'
    ];

    commonMentalHealthTerms.forEach(term => {
      if (queryLower.includes(term) && payload.description.includes(term)) {
        if (!keywords.includes(term)) {
          keywords.push(term);
        }
      }
    });
  }

  // 중복 제거 및 최대 5개로 제한
  return [...new Set(keywords)].slice(0, 5);
}

/**
 * 배치 의미론적 검색
 *
 * @param {string[]} queries - 쿼리 텍스트 배열
 * @param {Object} options - 검색 옵션
 * @returns {Promise<Array>} 각 쿼리별 검색 결과
 */
async function batchSemanticSearch(queries, options = {}) {
  const { topK = 20, threshold = 0.5, filter = null } = options;

  if (!Array.isArray(queries) || queries.length === 0) {
    throw new Error('queries는 비어있지 않은 배열이어야 합니다');
  }

  const results = [];

  for (const query of queries) {
    try {
      const result = await semanticSearch({
        queryText: query,
        topK,
        threshold,
        filter
      });
      results.push({
        query,
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('배치 검색 중 개별 쿼리 실패', {
        query,
        error: error.message
      });
      results.push({
        query,
        success: false,
        error: error.message
      });
    }
  }

  logger.info('배치 의미론적 검색 완료', {
    totalQueries: queries.length,
    successCount: results.filter(r => r.success).length,
    failCount: results.filter(r => !r.success).length
  });

  return results;
}

/**
 * 쿼리 확장 (동의어, 관련어 추가)
 *
 * @param {string} queryText - 원본 쿼리
 * @returns {string} 확장된 쿼리
 */
function expandQuery(queryText) {
  const synonyms = {
    '우울증': ['우울', '우울감', '기분 저하'],
    '불안': ['불안감', '걱정', '두려움'],
    '스트레스': ['압박', '긴장', '부담'],
    '상담': ['심리상담', '치료', '상담치료'],
    '청년': ['젊은이', '청소년', '대학생'],
    '직장인': ['회사원', '근로자', '샐러리맨']
  };

  let expandedQuery = queryText;

  Object.keys(synonyms).forEach(key => {
    if (queryText.includes(key)) {
      // 동의어 1-2개만 추가 (너무 많으면 노이즈)
      const additionalTerms = synonyms[key].slice(0, 2).join(' ');
      expandedQuery += ` ${additionalTerms}`;
    }
  });

  return expandedQuery;
}

/**
 * 유사도 점수 설명 생성
 *
 * @param {number} score - 코사인 유사도 점수 (0~1)
 * @returns {Object} 점수 설명
 */
function explainSimilarityScore(score) {
  if (score >= 0.9) {
    return {
      level: 'very_high',
      description: '매우 높은 유사도',
      emoji: '🎯',
      percentage: Math.round(score * 100)
    };
  } else if (score >= 0.7) {
    return {
      level: 'high',
      description: '높은 유사도',
      emoji: '✅',
      percentage: Math.round(score * 100)
    };
  } else if (score >= 0.5) {
    return {
      level: 'medium',
      description: '중간 유사도',
      emoji: '🔍',
      percentage: Math.round(score * 100)
    };
  } else {
    return {
      level: 'low',
      description: '낮은 유사도',
      emoji: '⚠️',
      percentage: Math.round(score * 100)
    };
  }
}

/**
 * 검색 결과 재정렬 (거리, 평점 등 추가 가중치 반영)
 *
 * @param {Array} searchResults - 검색 결과
 * @param {Object} userLocation - 사용자 위치 {latitude, longitude}
 * @param {Object} weights - 가중치 {similarity, distance, rating}
 * @returns {Array} 재정렬된 결과
 */
async function rerankResults(searchResults, userLocation = null, weights = {}) {
  const {
    similarity = 0.7,
    distance = 0.2,
    rating = 0.1
  } = weights;

  // 추가 데이터가 필요한 경우 여기서 조회
  // (거리 계산, 평점 조회 등)

  return searchResults.results.sort((a, b) => {
    // 현재는 유사도만 사용, 추후 확장 가능
    return b.similarityScore - a.similarityScore;
  });
}

module.exports = {
  semanticSearch,
  batchSemanticSearch,
  expandQuery,
  explainSimilarityScore,
  rerankResults,
  extractMatchedKeywords
};
