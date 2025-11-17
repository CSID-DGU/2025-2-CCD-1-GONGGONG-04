/**
 * Qdrant Vector Database Configuration
 *
 * Phase 2 Sprint 5: Vector DB 통합
 * Qdrant를 사용한 임베딩 벡터 저장 및 검색
 */

const { QdrantClient } = require('@qdrant/js-client-rest');
const logger = require('../utils/logger');

/**
 * Qdrant 클라이언트 초기화
 */
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY || undefined,
  checkCompatibility: false  // 버전 호환성 체크 비활성화 (1.7.4 구버전 사용)
});

/**
 * Qdrant 컬렉션 이름
 */
const COLLECTION_NAME = 'centers';

/**
 * Qdrant 연결 테스트
 */
async function testQdrantConnection() {
  try {
    const health = await qdrantClient.api('cluster').clusterStatus();
    logger.info('Qdrant 연결 성공', { status: health });
    return true;
  } catch (error) {
    logger.error('Qdrant 연결 실패', {
      error: error.message,
      url: process.env.QDRANT_URL
    });
    return false;
  }
}

/**
 * Qdrant 컬렉션 존재 여부 확인
 */
async function collectionExists(collectionName = COLLECTION_NAME) {
  try {
    const collections = await qdrantClient.getCollections();
    return collections.collections.some(c => c.name === collectionName);
  } catch (error) {
    logger.error('컬렉션 확인 실패', { error: error.message });
    return false;
  }
}

/**
 * Qdrant 컬렉션 생성
 *
 * @param {string} collectionName - 컬렉션 이름
 * @param {number} vectorSize - 벡터 차원 (기본: 3072, text-embedding-3-large)
 */
async function createCollection(collectionName = COLLECTION_NAME, vectorSize = 3072) {
  try {
    const exists = await collectionExists(collectionName);

    if (exists) {
      logger.info('컬렉션이 이미 존재합니다', { collectionName });
      return true;
    }

    await qdrantClient.createCollection(collectionName, {
      vectors: {
        size: vectorSize,
        distance: 'Cosine'  // 코사인 유사도 사용
      },
      optimizers_config: {
        default_segment_number: 2
      },
      replication_factor: 1
    });

    logger.info('Qdrant 컬렉션 생성 성공', {
      collectionName,
      vectorSize,
      distance: 'Cosine'
    });

    return true;
  } catch (error) {
    logger.error('컬렉션 생성 실패', {
      error: error.message,
      collectionName
    });
    return false;
  }
}

/**
 * Qdrant 컬렉션 삭제
 */
async function deleteCollection(collectionName = COLLECTION_NAME) {
  try {
    await qdrantClient.deleteCollection(collectionName);
    logger.info('컬렉션 삭제 성공', { collectionName });
    return true;
  } catch (error) {
    logger.error('컬렉션 삭제 실패', {
      error: error.message,
      collectionName
    });
    return false;
  }
}

/**
 * Qdrant 설정 정보
 */
const config = {
  collectionName: COLLECTION_NAME,
  vectorSize: 3072,  // text-embedding-3-large 차원
  distance: 'Cosine',
  limits: {
    maxPoints: 100000,      // 최대 포인트 수 (센터 수)
    searchLimit: 100        // 검색 결과 최대 수
  }
};

module.exports = {
  qdrantClient,
  COLLECTION_NAME,
  testQdrantConnection,
  collectionExists,
  createCollection,
  deleteCollection,
  config
};
