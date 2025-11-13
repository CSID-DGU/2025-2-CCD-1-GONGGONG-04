/**
 * Vector Database Service
 *
 * Phase 2 Sprint 5: Qdrant Vector DB 통합
 * 센터 임베딩 저장 및 검색
 */

const { qdrantClient, COLLECTION_NAME, config: qdrantConfig } = require('../config/qdrant');
const { vectorDBLimiter } = require('../utils/rateLimiter');
const { VectorDBError, SemanticSearchError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * 벡터 저장 (단일 또는 업데이트)
 *
 * @param {Object} point - 저장할 포인트
 * @param {string|number} point.id - 센터 ID
 * @param {number[]} point.vector - 임베딩 벡터 (3072차원)
 * @param {Object} point.payload - 메타데이터
 * @returns {Promise<boolean>} 성공 여부
 */
async function upsertVector(point) {
  const { id, vector, payload = {} } = point;

  try {
    // 입력 검증
    if (!id) {
      throw new Error('ID는 필수입니다');
    }

    if (!Array.isArray(vector) || vector.length !== qdrantConfig.vectorSize) {
      throw new Error(`벡터 차원은 ${qdrantConfig.vectorSize}이어야 합니다 (현재: ${vector?.length})`);
    }

    // Rate Limiter를 통한 DB 작업
    await vectorDBLimiter.schedule(async () => {
      await qdrantClient.upsert(COLLECTION_NAME, {
        wait: true,
        points: [
          {
            id: String(id),  // Qdrant는 string ID 선호
            vector,
            payload: {
              ...payload,
              updatedAt: new Date().toISOString()
            }
          }
        ]
      });
    });

    logger.debug('벡터 저장 성공', {
      id,
      vectorSize: vector.length,
      payloadKeys: Object.keys(payload)
    });

    return true;
  } catch (error) {
    logger.error('벡터 저장 실패', {
      error: error.message,
      id,
      operation: 'upsert'
    });
    throw new VectorDBError('벡터 저장 실패', 'upsert', error);
  }
}

/**
 * 배치 벡터 저장
 *
 * @param {Array<{id, vector, payload}>} points - 저장할 포인트 배열
 * @returns {Promise<Object>} 저장 결과
 */
async function batchUpsertVectors(points) {
  if (!Array.isArray(points) || points.length === 0) {
    throw new Error('points는 비어있지 않은 배열이어야 합니다');
  }

  try {
    // 배치 크기 제한 (Qdrant 권장: 100개씩)
    const batchSize = 100;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);

      try {
        await vectorDBLimiter.schedule(async () => {
          await qdrantClient.upsert(COLLECTION_NAME, {
            wait: true,
            points: batch.map(p => ({
              id: String(p.id),
              vector: p.vector,
              payload: {
                ...p.payload,
                updatedAt: new Date().toISOString()
              }
            }))
          });
        });

        successCount += batch.length;

        logger.debug('배치 벡터 저장 성공', {
          batchIndex: Math.floor(i / batchSize) + 1,
          batchSize: batch.length,
          totalSuccess: successCount
        });
      } catch (batchError) {
        failCount += batch.length;
        logger.error('배치 벡터 저장 실패', {
          batchIndex: Math.floor(i / batchSize) + 1,
          error: batchError.message
        });
      }
    }

    logger.info('배치 벡터 저장 완료', {
      totalPoints: points.length,
      successCount,
      failCount
    });

    return {
      total: points.length,
      success: successCount,
      failed: failCount
    };
  } catch (error) {
    logger.error('배치 벡터 저장 실패', {
      error: error.message,
      totalPoints: points.length
    });
    throw new VectorDBError('배치 벡터 저장 실패', 'batch_upsert', error);
  }
}

/**
 * 벡터 유사도 검색
 *
 * @param {Object} request - 검색 요청
 * @param {number[]} request.vector - 쿼리 벡터
 * @param {number} [request.topK=20] - 반환할 상위 결과 수
 * @param {number} [request.threshold=0.5] - 최소 유사도 임계값
 * @param {Object} [request.filter] - 메타데이터 필터
 * @returns {Promise<Array>} 검색 결과
 */
async function searchSimilarVectors(request) {
  const { vector, topK = 20, threshold = 0.5, filter = null } = request;

  try {
    // 입력 검증
    if (!Array.isArray(vector) || vector.length !== qdrantConfig.vectorSize) {
      throw new Error(`쿼리 벡터 차원은 ${qdrantConfig.vectorSize}이어야 합니다`);
    }

    if (topK < 1 || topK > qdrantConfig.limits.searchLimit) {
      throw new Error(`topK는 1~${qdrantConfig.limits.searchLimit} 범위여야 합니다`);
    }

    // Rate Limiter를 통한 검색
    const result = await vectorDBLimiter.schedule(async () => {
      return await qdrantClient.search(COLLECTION_NAME, {
        vector,
        limit: topK,
        score_threshold: threshold,
        filter: filter || undefined,
        with_payload: true,
        with_vector: false  // 벡터는 반환하지 않음 (용량 절약)
      });
    });

    logger.debug('벡터 검색 성공', {
      topK,
      threshold,
      resultCount: result.length,
      hasFilter: filter !== null
    });

    // 결과 포맷팅
    return result.map(hit => ({
      id: hit.id,
      score: hit.score,
      payload: hit.payload
    }));
  } catch (error) {
    logger.error('벡터 검색 실패', {
      error: error.message,
      topK,
      threshold
    });
    throw new SemanticSearchError('벡터 검색 실패', vector, error);
  }
}

/**
 * 벡터 삭제
 *
 * @param {string|number} id - 삭제할 포인트 ID
 * @returns {Promise<boolean>} 성공 여부
 */
async function deleteVector(id) {
  try {
    await vectorDBLimiter.schedule(async () => {
      await qdrantClient.delete(COLLECTION_NAME, {
        wait: true,
        points: [String(id)]
      });
    });

    logger.debug('벡터 삭제 성공', { id });
    return true;
  } catch (error) {
    logger.error('벡터 삭제 실패', {
      error: error.message,
      id
    });
    throw new VectorDBError('벡터 삭제 실패', 'delete', error);
  }
}

/**
 * 배치 벡터 삭제
 *
 * @param {Array<string|number>} ids - 삭제할 ID 배열
 * @returns {Promise<boolean>} 성공 여부
 */
async function batchDeleteVectors(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('ids는 비어있지 않은 배열이어야 합니다');
  }

  try {
    await vectorDBLimiter.schedule(async () => {
      await qdrantClient.delete(COLLECTION_NAME, {
        wait: true,
        points: ids.map(id => String(id))
      });
    });

    logger.info('배치 벡터 삭제 성공', { count: ids.length });
    return true;
  } catch (error) {
    logger.error('배치 벡터 삭제 실패', {
      error: error.message,
      count: ids.length
    });
    throw new VectorDBError('배치 벡터 삭제 실패', 'batch_delete', error);
  }
}

/**
 * 벡터 조회
 *
 * @param {string|number} id - 조회할 포인트 ID
 * @returns {Promise<Object|null>} 포인트 정보
 */
async function getVector(id) {
  try {
    const result = await vectorDBLimiter.schedule(async () => {
      return await qdrantClient.retrieve(COLLECTION_NAME, {
        ids: [String(id)],
        with_payload: true,
        with_vector: true
      });
    });

    if (result.length === 0) {
      return null;
    }

    return {
      id: result[0].id,
      vector: result[0].vector,
      payload: result[0].payload
    };
  } catch (error) {
    logger.error('벡터 조회 실패', {
      error: error.message,
      id
    });
    throw new VectorDBError('벡터 조회 실패', 'retrieve', error);
  }
}

/**
 * 컬렉션 정보 조회
 *
 * @returns {Promise<Object>} 컬렉션 정보
 */
async function getCollectionInfo() {
  try {
    const info = await qdrantClient.getCollection(COLLECTION_NAME);

    return {
      name: info.name,
      vectorSize: info.config.params.vectors.size,
      distance: info.config.params.vectors.distance,
      pointsCount: info.points_count,
      status: info.status
    };
  } catch (error) {
    logger.error('컬렉션 정보 조회 실패', { error: error.message });
    throw new VectorDBError('컬렉션 정보 조회 실패', 'get_collection_info', error);
  }
}

/**
 * 벡터 DB 헬스 체크
 *
 * @returns {Promise<Object>} 헬스 상태
 */
async function healthCheck() {
  try {
    // Qdrant 클러스터 상태 확인
    const clusterStatus = await qdrantClient.api('cluster').clusterStatus();

    // 컬렉션 존재 여부 확인
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(c => c.name === COLLECTION_NAME);

    let collectionInfo = null;
    if (collectionExists) {
      collectionInfo = await getCollectionInfo();
    }

    return {
      status: 'healthy',
      cluster: clusterStatus,
      collection: collectionExists ? {
        name: COLLECTION_NAME,
        pointsCount: collectionInfo?.pointsCount || 0,
        vectorSize: collectionInfo?.vectorSize || qdrantConfig.vectorSize
      } : null
    };
  } catch (error) {
    logger.error('Vector DB 헬스 체크 실패', { error: error.message });
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

module.exports = {
  upsertVector,
  batchUpsertVectors,
  searchSimilarVectors,
  deleteVector,
  batchDeleteVectors,
  getVector,
  getCollectionInfo,
  healthCheck
};
