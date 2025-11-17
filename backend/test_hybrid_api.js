/**
 * 하이브리드 추천 API 간단 테스트
 */

const axios = require('axios');

const API_BASE = 'http://localhost:8080';

async function testHybridAPI() {
  console.log('🧪 하이브리드 추천 API 테스트 시작...\n');

  try {
    // Test 1: 기본 요청
    console.log('Test 1: 기본 하이브리드 추천 요청');
    const response1 = await axios.post(`${API_BASE}/api/v2/recommendations/hybrid`, {
      latitude: 37.5665,
      longitude: 126.9780,
      userQuery: '우울증 상담이 필요해요',
      maxDistance: 10,
      limit: 5
    });

    console.log('✅ 성공!');
    console.log(`- 추천 개수: ${response1.data.data.recommendations.length}`);
    console.log(`- 알고리즘: ${response1.data.data.metadata.algorithm}`);
    console.log(`- 쿼리 시간: ${response1.data.data.metadata.queryTime}ms`);
    console.log(`- Fallback 모드: ${response1.data.data.metadata.fallbackMode}`);

    if (response1.data.data.recommendations.length > 0) {
      const first = response1.data.data.recommendations[0];
      console.log(`- 1위 센터: ${first.centerName} (점수: ${first.totalScore})`);
      console.log(`  - 규칙 기반 점수: ${first.scores.ruleBasedScore}`);
      console.log(`  - 임베딩 점수: ${first.scores.embeddingScore}`);
    }
    console.log('');

    // Test 2: userQuery 없이 (Fallback 모드)
    console.log('Test 2: userQuery 없이 요청 (Fallback 모드 테스트)');
    const response2 = await axios.post(`${API_BASE}/api/v2/recommendations/hybrid`, {
      latitude: 37.5665,
      longitude: 126.9780,
      maxDistance: 10,
      limit: 3
    });

    console.log('✅ 성공!');
    console.log(`- Fallback 모드: ${response2.data.data.metadata.fallbackMode}`);
    console.log(`- 알고리즘: ${response2.data.data.metadata.algorithm}`);
    console.log('');

    // Test 3: 커스텀 가중치
    console.log('Test 3: 커스텀 가중치 (50:50)');
    const response3 = await axios.post(`${API_BASE}/api/v2/recommendations/hybrid`, {
      latitude: 37.5665,
      longitude: 126.9780,
      userQuery: '불안 장애 상담',
      weights: {
        embedding: 0.5,
        rule: 0.5
      },
      limit: 3
    });

    console.log('✅ 성공!');
    console.log(`- 적용된 가중치: embedding=${response3.data.data.metadata.weights.embedding}, rule=${response3.data.data.metadata.weights.rule}`);
    console.log('');

    // Test 4: 헬스 체크
    console.log('Test 4: 하이브리드 추천 헬스 체크');
    const health = await axios.get(`${API_BASE}/api/v2/recommendations/hybrid/health`);

    console.log('✅ 성공!');
    console.log(`- 전체 상태: ${health.data.status}`);
    console.log(`- LLM 상태: ${health.data.components.llm.status}`);
    console.log(`- Vector DB 상태: ${health.data.components.vectorDB.status}`);
    console.log('');

    console.log('🎉 모든 테스트 통과!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 테스트 실패:');
    if (error.response) {
      console.error(`  - 상태 코드: ${error.response.status}`);
      console.error(`  - 응답:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`  - 에러:`, error.message);
    }
    process.exit(1);
  }
}

// 서버가 실행 중인지 확인
axios.get(`${API_BASE}/health`)
  .then(() => {
    console.log('✅ 서버 연결 확인\n');
    testHybridAPI();
  })
  .catch((error) => {
    console.error('❌ 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
    console.error(`   URL: ${API_BASE}`);
    console.error(`   에러: ${error.message}`);
    process.exit(1);
  });
