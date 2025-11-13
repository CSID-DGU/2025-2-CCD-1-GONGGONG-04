/**
 * Qdrant 초기화 스크립트
 *
 * Phase 2 Sprint 5: Qdrant 컬렉션 생성 및 초기 설정
 *
 * 실행 방법:
 * node src/scripts/initQdrant.js
 */

const {
  qdrantClient,
  COLLECTION_NAME,
  testQdrantConnection,
  collectionExists,
  createCollection,
  config
} = require('../config/qdrant');
const logger = require('../utils/logger');

/**
 * Qdrant 초기화 메인 함수
 */
async function initializeQdrant() {
  console.log('🚀 Qdrant 초기화 시작...\n');

  try {
    // 1. Qdrant 연결 테스트
    console.log('1️⃣  Qdrant 연결 테스트 중...');
    const isConnected = await testQdrantConnection();

    if (!isConnected) {
      console.error('❌ Qdrant 연결 실패');
      console.log('\n📌 해결 방법:');
      console.log('   1. Qdrant 컨테이너가 실행 중인지 확인: docker ps | grep qdrant');
      console.log('   2. QDRANT_URL 환경 변수 확인: echo $QDRANT_URL');
      console.log('   3. Qdrant 컨테이너 재시작: docker-compose -f docker-compose.dev.yml restart qdrant');
      process.exit(1);
    }

    console.log('✅ Qdrant 연결 성공\n');

    // 2. 컬렉션 존재 여부 확인
    console.log('2️⃣  컬렉션 확인 중...');
    const exists = await collectionExists(COLLECTION_NAME);

    if (exists) {
      console.log(`⚠️  컬렉션 '${COLLECTION_NAME}'이(가) 이미 존재합니다`);
      console.log('\n옵션:');
      console.log('   - 기존 컬렉션 유지: 스크립트 종료');
      console.log('   - 재생성 필요 시: 수동으로 삭제 후 다시 실행');
      console.log('     삭제 명령: curl -X DELETE http://localhost:6333/collections/' + COLLECTION_NAME);

      // 컬렉션 정보 출력
      const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
      console.log('\n📊 현재 컬렉션 정보:');
      console.log(`   - 이름: ${collectionInfo.name}`);
      console.log(`   - 벡터 차원: ${collectionInfo.config.params.vectors.size}`);
      console.log(`   - 거리 메트릭: ${collectionInfo.config.params.vectors.distance}`);
      console.log(`   - 포인트 수: ${collectionInfo.points_count}`);
      console.log(`   - 상태: ${collectionInfo.status}\n`);

      process.exit(0);
    }

    console.log('✅ 컬렉션이 존재하지 않음 (새로 생성 필요)\n');

    // 3. 컬렉션 생성
    console.log('3️⃣  컬렉션 생성 중...');
    console.log(`   - 이름: ${COLLECTION_NAME}`);
    console.log(`   - 벡터 차원: ${config.vectorSize} (text-embedding-3-large)`);
    console.log(`   - 거리 메트릭: ${config.distance}`);

    const created = await createCollection(COLLECTION_NAME, config.vectorSize);

    if (!created) {
      console.error('❌ 컬렉션 생성 실패');
      process.exit(1);
    }

    console.log('✅ 컬렉션 생성 성공\n');

    // 4. 생성된 컬렉션 정보 확인
    console.log('4️⃣  컬렉션 정보 확인 중...');
    const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);

    console.log('📊 생성된 컬렉션 정보:');
    console.log(`   - 이름: ${collectionInfo.name}`);
    console.log(`   - 벡터 차원: ${collectionInfo.config.params.vectors.size}`);
    console.log(`   - 거리 메트릭: ${collectionInfo.config.params.vectors.distance}`);
    console.log(`   - 포인트 수: ${collectionInfo.points_count}`);
    console.log(`   - 상태: ${collectionInfo.status}\n`);

    // 5. 완료 메시지
    console.log('✅ Qdrant 초기화 완료!\n');
    console.log('📌 다음 단계:');
    console.log('   1. 센터 임베딩 배치 작업 실행: npm run batch:embeddings');
    console.log('   2. 백엔드 서버 시작: npm run dev');
    console.log('   3. 하이브리드 추천 API 테스트: POST /api/v2/recommendations/hybrid\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ 초기화 중 오류 발생:', error.message);
    console.error('\n스택 트레이스:', error.stack);
    process.exit(1);
  }
}

/**
 * 컬렉션 삭제 함수 (재초기화용)
 */
async function resetQdrant() {
  console.log('🔄 Qdrant 리셋 시작...\n');

  try {
    const exists = await collectionExists(COLLECTION_NAME);

    if (!exists) {
      console.log('⚠️  컬렉션이 존재하지 않습니다');
      return;
    }

    console.log(`🗑️  컬렉션 '${COLLECTION_NAME}' 삭제 중...`);
    await qdrantClient.deleteCollection(COLLECTION_NAME);
    console.log('✅ 컬렉션 삭제 완료\n');

    console.log('📌 다음 명령으로 재초기화:');
    console.log('   node src/scripts/initQdrant.js\n');
  } catch (error) {
    console.error('❌ 리셋 중 오류 발생:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
const args = process.argv.slice(2);

if (args.includes('--reset')) {
  resetQdrant();
} else {
  initializeQdrant();
}
