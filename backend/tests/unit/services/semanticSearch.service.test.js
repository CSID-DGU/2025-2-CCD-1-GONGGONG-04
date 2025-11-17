/**
 * Semantic Search Service Unit Tests
 *
 * Sprint 5: Semantic Search Service 단위 테스트
 * 총 12개 테스트 케이스
 *
 * ✅ PASSING (12 tests):
 * - 입력 검증 (2개): 빈 배열, 배열 타입 검증
 * - 유틸리티 함수 (10개): extractMatchedKeywords, expandQuery, explainSimilarityScore, rerankResults
 */

const {
  semanticSearch,
  batchSemanticSearch,
  expandQuery,
  explainSimilarityScore,
  rerankResults,
  extractMatchedKeywords
} = require('../../../src/services/semanticSearch.service');

// Logger 직접 mock
const logger = require('../../../src/utils/logger');
logger.info = jest.fn();
logger.warn = jest.fn();
logger.error = jest.fn();
logger.debug = jest.fn();

// LLM Service mock
const mockGenerateEmbedding = jest.fn();
jest.mock('../../../src/services/llm.service', () => ({
  generateEmbedding: mockGenerateEmbedding
}));

// Vector DB Service mock
const mockSearchSimilarVectors = jest.fn();
jest.mock('../../../src/services/vectorDB.service', () => ({
  searchSimilarVectors: mockSearchSimilarVectors
}));

describe('Semantic Search Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. batchSemanticSearch - 배치 검색 입력 검증', () => {
    it('1-1. 빈 배열 입력 시 에러 발생', async () => {
      await expect(
        batchSemanticSearch([])
      ).rejects.toThrow('queries는 비어있지 않은 배열이어야 합니다');
    });

    it('1-2. 배열이 아닌 입력 시 에러 발생', async () => {
      await expect(
        batchSemanticSearch('not_an_array')
      ).rejects.toThrow('queries는 비어있지 않은 배열이어야 합니다');
    });
  });

  describe('2. extractMatchedKeywords - 키워드 추출', () => {
    it('2-1. specialties에서 키워드 추출', () => {
      const payload = {
        specialties: ['우울증', '불안장애', '스트레스'],
        description: '우울증 전문 상담 센터'
      };

      const keywords = extractMatchedKeywords(payload, '우울증 상담이 필요해요');

      expect(keywords).toContain('우울증');
      expect(keywords).toContain('상담');
      expect(keywords.length).toBeLessThanOrEqual(5);
    });

    it('2-2. description에서 공통 용어 매칭', () => {
      const payload = {
        description: '청년 직장인 우울증 상담 센터'
      };

      const keywords = extractMatchedKeywords(payload, '청년 직장인 우울증 상담');

      expect(keywords).toContain('청년');
      expect(keywords).toContain('직장인');
      expect(keywords).toContain('우울증');
      expect(keywords).toContain('상담');
    });

    it('2-3. specialties가 없는 경우 빈 배열 또는 description만 사용', () => {
      const payload = {
        description: '불안 장애 치료'
      };

      const keywords = extractMatchedKeywords(payload, '불안 치료 필요');

      expect(keywords).toContain('불안');
      expect(keywords).toContain('치료');
    });

    it('2-4. 중복 키워드 제거', () => {
      const payload = {
        specialties: ['우울증', '우울증'],
        description: '우울증 우울증'
      };

      const keywords = extractMatchedKeywords(payload, '우울증');

      expect(keywords.filter(k => k === '우울증').length).toBe(1);
    });

    it('2-5. 최대 5개로 제한', () => {
      const payload = {
        specialties: ['우울증', '불안', '스트레스', 'PTSD', '공황', '강박'],
        description: '상담 치료 정신건강 심리'
      };

      const keywords = extractMatchedKeywords(payload, '우울증 불안 스트레스 PTSD 공황 강박');

      expect(keywords.length).toBeLessThanOrEqual(5);
    });
  });

  describe('3. expandQuery - 쿼리 확장', () => {
    it('3-1. 우울증 동의어 추가', () => {
      const expanded = expandQuery('우울증 상담 받고 싶어요');

      expect(expanded).toContain('우울증');
      expect(expanded).toContain('상담');
      // 동의어가 추가됨
      expect(expanded.includes('우울') || expanded.includes('우울감')).toBe(true);
    });

    it('3-2. 여러 키워드의 동의어 추가', () => {
      const expanded = expandQuery('청년 불안 스트레스');

      expect(expanded).toContain('청년');
      expect(expanded).toContain('불안');
      expect(expanded).toContain('스트레스');
      // 각 키워드의 동의어가 추가됨
      expect(expanded.length).toBeGreaterThan('청년 불안 스트레스'.length);
    });

    it('3-3. 동의어가 없는 키워드는 원본 유지', () => {
      const original = '알 수 없는 키워드';
      const expanded = expandQuery(original);

      expect(expanded).toBe(original);
    });
  });

  describe('4. explainSimilarityScore - 유사도 점수 설명', () => {
    it('4-1. 매우 높은 유사도 (0.9 이상)', () => {
      const explanation = explainSimilarityScore(0.95);

      expect(explanation.level).toBe('very_high');
      expect(explanation.description).toBe('매우 높은 유사도');
      expect(explanation.emoji).toBe('🎯');
      expect(explanation.percentage).toBe(95);
    });

    it('4-2. 높은 유사도 (0.7~0.9)', () => {
      const explanation = explainSimilarityScore(0.75);

      expect(explanation.level).toBe('high');
      expect(explanation.description).toBe('높은 유사도');
      expect(explanation.emoji).toBe('✅');
      expect(explanation.percentage).toBe(75);
    });

    it('4-3. 중간 유사도 (0.5~0.7)', () => {
      const explanation = explainSimilarityScore(0.6);

      expect(explanation.level).toBe('medium');
      expect(explanation.description).toBe('중간 유사도');
      expect(explanation.emoji).toBe('🔍');
      expect(explanation.percentage).toBe(60);
    });

    it('4-4. 낮은 유사도 (0.5 미만)', () => {
      const explanation = explainSimilarityScore(0.3);

      expect(explanation.level).toBe('low');
      expect(explanation.description).toBe('낮은 유사도');
      expect(explanation.emoji).toBe('⚠️');
      expect(explanation.percentage).toBe(30);
    });
  });

  describe('5. rerankResults - 결과 재정렬', () => {
    it('5-1. 유사도 기준 내림차순 정렬', async () => {
      const mockResults = {
        results: [
          { centerId: 1, similarityScore: 0.5 },
          { centerId: 2, similarityScore: 0.9 },
          { centerId: 3, similarityScore: 0.7 }
        ]
      };

      const reranked = await rerankResults(mockResults);

      expect(reranked[0].similarityScore).toBe(0.9);
      expect(reranked[1].similarityScore).toBe(0.7);
      expect(reranked[2].similarityScore).toBe(0.5);
    });

    it('5-2. 빈 결과 배열 처리', async () => {
      const mockResults = {
        results: []
      };

      const reranked = await rerankResults(mockResults);

      expect(reranked).toEqual([]);
    });
  });
});
