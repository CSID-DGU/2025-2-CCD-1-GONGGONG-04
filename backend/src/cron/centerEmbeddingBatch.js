/**
 * Center Embedding Batch Job
 *
 * Phase 2 Sprint 5: 센터 임베딩 생성 배치 작업
 * 모든 센터의 설명 + 프로그램 정보를 임베딩으로 변환하여 Vector DB에 저장
 *
 * 실행 방법:
 * 1. 수동 실행: node src/cron/centerEmbeddingBatch.js
 * 2. npm script: npm run batch:embeddings
 * 3. Cron (자동): 매일 02:00 AM
 */

require('ts-node/register');
const { PrismaClient } = require('@prisma/client');
const llmService = require('../services/llm.service');
const vectorDBService = require('../services/vectorDB.service');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * 센터 정보를 텍스트로 변환
 */
function buildCenterText(center) {
  const parts = [];

  // 1. 센터 기본 정보
  parts.push(center.centerName);

  // 2. 센터 유형
  if (center.centerType) {
    parts.push(`유형: ${center.centerType}`);
  }

  // 3. 센터 설명 (businessContent - 가장 중요)
  if (center.businessContent) {
    parts.push(center.businessContent);
  }

  // 4. 추가 정보
  if (center.otherInfo) {
    parts.push(center.otherInfo);
  }

  // 5. 프로그램 정보 (이름 + 대상 + 설명)
  if (center.programs && center.programs.length > 0) {
    const programTexts = center.programs.map(p => {
      const programParts = [p.programName];
      if (p.targetGroup) {
        programParts.push(`(대상: ${p.targetGroup})`);
      }
      if (p.description) {
        programParts.push(`: ${p.description}`);
      }
      return programParts.join(' ');
    });
    parts.push('제공 프로그램: ' + programTexts.join('; '));
  }

  // 6. 위치 정보
  if (center.roadAddress) {
    parts.push(`위치: ${center.roadAddress}`);
  }

  return parts.join('\n\n').trim();
}

/**
 * 메인 배치 작업
 */
async function generateCenterEmbeddings(options = {}) {
  const { centerIds = null, force = false } = options;

  console.log('🚀 센터 임베딩 배치 작업 시작...\n');
  const startTime = Date.now();

  try {
    // 1. 센터 조회
    console.log('1️⃣  센터 정보 조회 중...');

    const where = {
      isActive: true,
      ...(centerIds ? { id: { in: centerIds } } : {})
    };

    const centers = await prisma.center.findMany({
      where,
      include: {
        programs: {
          where: { isActive: true }
        }
      }
    });

    console.log(`✅ 총 ${centers.length}개 센터 조회 완료\n`);

    if (centers.length === 0) {
      console.log('⚠️  처리할 센터가 없습니다');
      return {
        success: true,
        total: 0,
        processed: 0,
        failed: 0
      };
    }

    // 2. 센터별 텍스트 생성 및 임베딩
    console.log('2️⃣  임베딩 생성 중...');
    let successCount = 0;
    let failCount = 0;
    const batchSize = 10;  // 10개씩 배치 처리

    for (let i = 0; i < centers.length; i += batchSize) {
      const batch = centers.slice(i, i + batchSize);

      console.log(`\n📦 배치 ${Math.floor(i / batchSize) + 1}/${Math.ceil(centers.length / batchSize)} 처리 중 (${batch.length}개)`);

      for (const center of batch) {
        try {
          // 텍스트 생성
          const combinedText = buildCenterText(center);

          if (!combinedText || combinedText.length < 10) {
            console.log(`⚠️  [${center.id}] ${center.centerName}: 텍스트가 너무 짧음 (${combinedText.length}자), 스킵`);
            failCount++;
            continue;
          }

          // 임베딩 생성
          const { embeddings } = await llmService.generateEmbedding({
            text: combinedText,
            model: 'openai',
            cache: false  // 배치 작업에서는 캐시 사용 안 함
          });

          const embedding = embeddings[0];

          // Vector DB 저장 (BigInt를 Number로 변환)
          await vectorDBService.upsertVector({
            id: Number(center.id),
            vector: embedding,
            payload: {
              centerId: Number(center.id),
              name: center.centerName,
              centerType: center.centerType || '',
              roadAddress: center.roadAddress || '',
              programCount: center.programs.length,
              textLength: combinedText.length
            }
          });

          console.log(`✅ [${center.id}] ${center.centerName} (${combinedText.length}자)`);
          successCount++;
        } catch (error) {
          console.error(`❌ [${center.id}] ${center.centerName}: ${error.message}`);
          failCount++;
        }
      }

      // 배치 간 약간의 지연 (Rate Limit 방지)
      if (i + batchSize < centers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('\n✅ 센터 임베딩 배치 작업 완료!');
    console.log(`\n📊 처리 결과:`);
    console.log(`   - 총 센터 수: ${centers.length}`);
    console.log(`   - 성공: ${successCount}`);
    console.log(`   - 실패: ${failCount}`);
    console.log(`   - 소요 시간: ${duration}초\n`);

    logger.info('센터 임베딩 배치 작업 완료', {
      total: centers.length,
      success: successCount,
      failed: failCount,
      duration: `${duration}s`
    });

    return {
      success: true,
      total: centers.length,
      processed: successCount,
      failed: failCount,
      duration
    };
  } catch (error) {
    console.error('❌ 배치 작업 중 오류 발생:', error.message);
    console.error('\n스택 트레이스:', error.stack);

    logger.error('센터 임베딩 배치 작업 실패', {
      error: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 특정 센터만 재생성
 */
async function regenerateCenterEmbedding(centerId) {
  console.log(`🔄 센터 ${centerId} 임베딩 재생성 시작...\n`);

  try {
    const result = await generateCenterEmbeddings({
      centerIds: [centerId],
      force: true
    });

    if (result.success && result.processed > 0) {
      console.log(`✅ 센터 ${centerId} 임베딩 재생성 완료\n`);
    } else {
      console.log(`⚠️  센터 ${centerId} 임베딩 재생성 실패\n`);
    }

    return result;
  } catch (error) {
    console.error(`❌ 센터 ${centerId} 임베딩 재생성 실패:`, error.message);
    throw error;
  }
}

/**
 * 스크립트 실행 (CLI)
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  // 옵션 파싱
  const centerIds = args.includes('--ids')
    ? args[args.indexOf('--ids') + 1]?.split(',').map(id => parseInt(id))
    : null;

  const force = args.includes('--force');

  // 실행
  generateCenterEmbeddings({ centerIds, force })
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('실행 중 오류:', error);
      process.exit(1);
    });
}

module.exports = {
  generateCenterEmbeddings,
  regenerateCenterEmbedding
};
