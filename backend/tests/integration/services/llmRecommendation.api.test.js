/**
 * LLM 기반 추천 시스템 통합 테스트
 *
 * Sprint 5: 하이브리드 추천 시스템 통합 테스트
 * 총 20개 테스트 케이스 (17개 작성)
 *
 * STATUS: ⏳ API 엔드포인트 구현 대기 중
 * - POST /api/v2/recommendations/hybrid 엔드포인트가 아직 구현되지 않음
 * - 엔드포인트 구현 후 테스트 실행 가능
 *
 * NOTE: 이 테스트는 실제 외부 서비스(OpenAI, Qdrant, Redis) 연동을 필요로 합니다.
 * 테스트 실행 전 다음 환경 변수가 설정되어 있어야 합니다:
 * - OPENAI_API_KEY: OpenAI API 키
 * - QDRANT_URL: Qdrant 서버 URL (기본: http://localhost:6333)
 * - REDIS_URL: Redis 서버 URL (기본: redis://localhost:6379)
 *
 * 실행 방법:
 * OPENAI_API_KEY=sk-xxx npm test tests/integration/services/llmRecommendation.api.test.js
 */

const request = require('supertest');
const app = require('../../../src/app');

// 환경 변수 체크
const SKIP_INTEGRATION_TESTS = !process.env.OPENAI_API_KEY || process.env.SKIP_LLM_TESTS === 'true';

const describeOrSkip = SKIP_INTEGRATION_TESTS ? describe.skip : describe;

describeOrSkip('LLM 기반 추천 시스템 통합 테스트', () => {
  // 테스트 데이터
  const testLocation = {
    latitude: 37.5665,
    longitude: 126.9780
  };

  const testQuery = '우울증 상담이 필요해요';

  describe('1. 하이브리드 추천 API 엔드포인트', () => {
    it('1-1. POST /api/v2/recommendations/hybrid - 기본 요청 성공', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: testQuery,
          maxDistance: 10,
          limit: 5
        })
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.metadata).toHaveProperty('algorithm');
      expect(response.body.metadata).toHaveProperty('weights');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
    }, 30000);

    it('1-2. latitude 누락 시 400 에러', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          longitude: testLocation.longitude,
          userQuery: testQuery
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('1-3. longitude 누락 시 400 에러', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          userQuery: testQuery
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('1-4. userQuery 없이도 동작 (규칙 기반 폴백)', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          maxDistance: 10
        })
        .expect(200);

      expect(response.body.metadata.fallbackMode).toBe(true);
      expect(response.body.metadata.algorithm).toBe('rule_based_fallback');
    }, 30000);

    it('1-5. 커스텀 가중치 적용', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: testQuery,
          weights: {
            embedding: 0.5,
            rule: 0.5
          }
        })
        .expect(200);

      expect(response.body.metadata.weights.embedding).toBe(0.5);
      expect(response.body.metadata.weights.rule).toBe(0.5);
    }, 30000);

    it('1-6. 가중치 합이 1.0이 아닌 경우 400 에러', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: testQuery,
          weights: {
            embedding: 0.6,
            rule: 0.6  // 합 1.2
          }
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('2. 의미론적 검색 기능', () => {
    it('2-1. 쿼리 텍스트 임베딩 생성', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: '불안 장애 상담',
          limit: 3
        })
        .expect(200);

      // 의미론적 검색이 수행되었는지 확인
      expect(response.body.metadata.fallbackMode).toBe(false);
      expect(response.body.recommendations.length).toBeGreaterThan(0);
    }, 30000);

    it('2-2. 매칭된 키워드 반환', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: '청년 우울증 상담',
          limit: 5
        })
        .expect(200);

      // 일부 결과는 matchedKeywords를 가져야 함
      const hasKeywords = response.body.recommendations.some(
        rec => rec.matchedKeywords && rec.matchedKeywords.length > 0
      );

      // 의미론적 검색이 성공했다면 키워드가 있어야 함
      if (!response.body.metadata.fallbackMode) {
        expect(hasKeywords).toBe(true);
      }
    }, 30000);
  });

  describe('3. 하이브리드 점수 계산', () => {
    it('3-1. 규칙 기반 + 임베딩 점수 병합', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: '스트레스 상담',
          weights: {
            embedding: 0.3,
            rule: 0.7
          },
          limit: 5
        })
        .expect(200);

      // 결과가 있으면 scores 객체 검증
      if (response.body.recommendations.length > 0) {
        const firstResult = response.body.recommendations[0];
        expect(firstResult.scores).toHaveProperty('total');
        expect(firstResult.scores).toHaveProperty('ruleBasedScore');
        expect(firstResult.scores).toHaveProperty('embeddingScore');
      }
    }, 30000);

    it('3-2. 하이브리드 점수로 정렬', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: '정신건강 상담',
          limit: 10
        })
        .expect(200);

      // 점수가 내림차순으로 정렬되어 있는지 확인
      const scores = response.body.recommendations.map(r => r.totalScore);
      const sortedScores = [...scores].sort((a, b) => b - a);

      expect(scores).toEqual(sortedScores);
    }, 30000);
  });

  describe('4. 캐싱 기능', () => {
    it('4-1. 동일한 요청은 캐시에서 반환', async () => {
      const requestBody = {
        latitude: testLocation.latitude,
        longitude: testLocation.longitude,
        userQuery: '심리상담 테스트',
        limit: 5
      };

      // 첫 번째 요청
      const response1 = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send(requestBody)
        .expect(200);

      expect(response1.body.metadata.cacheHit).toBe(false);

      // 두 번째 요청 (캐시 히트 기대)
      const response2 = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send(requestBody)
        .expect(200);

      expect(response2.body.metadata.cacheHit).toBe(true);
    }, 60000);
  });

  describe('5. Graceful Degradation', () => {
    it('5-1. 빈 쿼리 시 규칙 기반만 사용', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: '',
          limit: 5
        })
        .expect(200);

      expect(response.body.metadata.fallbackMode).toBe(true);
      expect(response.body.metadata.fallbackReason).toBe('No user query provided');
    }, 30000);

    it('5-2. 공백만 있는 쿼리 처리', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: '   ',
          limit: 5
        })
        .expect(200);

      expect(response.body.metadata.fallbackMode).toBe(true);
    }, 30000);
  });

  describe('6. 성능 및 메타데이터', () => {
    it('6-1. queryTime 메타데이터 제공', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: '상담 필요',
          limit: 5
        })
        .expect(200);

      expect(response.body.metadata).toHaveProperty('queryTime');
      expect(typeof response.body.metadata.queryTime).toBe('number');
      expect(response.body.metadata.queryTime).toBeGreaterThan(0);
    }, 30000);

    it('6-2. totalCount 메타데이터 제공', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: '우울',
          limit: 3
        })
        .expect(200);

      expect(response.body.metadata).toHaveProperty('totalCount');
      expect(response.body.metadata.totalCount).toBe(response.body.recommendations.length);
    }, 30000);

    it('6-3. algorithm 메타데이터 제공', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: '치료',
          limit: 5
        })
        .expect(200);

      expect(response.body.metadata).toHaveProperty('algorithm');
      expect(['hybrid_v1', 'rule_based_fallback']).toContain(response.body.metadata.algorithm);
    }, 30000);
  });

  describe('7. 자가진단 통합', () => {
    it('7-1. assessmentId와 함께 요청 가능', async () => {
      const response = await request(app)
        .post('/api/v2/recommendations/hybrid')
        .send({
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          userQuery: '상담 필요',
          assessmentId: 1,
          limit: 5
        })
        .expect(200);

      // assessmentId가 있어도 정상 동작
      expect(response.body).toHaveProperty('recommendations');
    }, 30000);
  });
});

// 환경 변수가 없을 때 안내 메시지
if (SKIP_INTEGRATION_TESTS) {
  console.warn(`
⚠️  LLM 통합 테스트 스킵됨

이 테스트를 실행하려면 다음 환경 변수를 설정하세요:
- OPENAI_API_KEY: OpenAI API 키
- QDRANT_URL: Qdrant 서버 URL (선택, 기본: http://localhost:6333)
- REDIS_URL: Redis 서버 URL (선택, 기본: redis://localhost:6379)

실행 예시:
OPENAI_API_KEY=sk-xxx npm test tests/integration/services/llmRecommendation.api.test.js
  `);
}
