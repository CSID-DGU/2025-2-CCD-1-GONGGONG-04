/**
 * Fix Review Encoding Script
 *
 * Sprint 3 - Bug Fix: 리뷰 한글 인코딩 문제 해결
 *
 * 문제: 기존 리뷰 데이터가 Latin-1 인코딩으로 삽입되어
 *      UTF-8 한글 텍스트가 깨진 상태로 저장됨
 *
 * 해결: 손상된 리뷰 데이터를 삭제하고,
 *      정상적인 UTF-8 인코딩으로 샘플 리뷰 재삽입
 */

const { prisma } = require('../src/config/database');

// 샘플 리뷰 데이터 (정상 UTF-8 인코딩)
const sampleReviews = [
  {
    centerId: BigInt(1),
    userId: BigInt(4),
    rating: 5,
    title: '처음이라 걱정했는데 잘 다녀왔어요',
    content: '천천히 설명해 주셔서 긴장이 많이 풀렸습니다.',
    visitDate: new Date('2025-05-28'),
    helpfulCount: 6,
  },
  {
    centerId: BigInt(1),
    userId: BigInt(3),
    rating: 5,
    title: '상담 내용이 아주 알찼어요',
    content: '실생활에서 바로 써볼 수 있는 방법들을 알려주셔서 큰 도움이 됐어요.',
    visitDate: new Date('2025-05-07'),
    helpfulCount: 1,
  },
  {
    centerId: BigInt(1),
    userId: BigInt(2),
    rating: 5,
    title: '정말 친절하고 전문적이에요',
    content: '분위기도 편안하고 설명도 이해하기 쉬워서 전반적으로 매우 만족했습니다.',
    visitDate: new Date('2025-03-15'),
    helpfulCount: 3,
  },
  {
    centerId: BigInt(1),
    userId: BigInt(1),
    rating: 5,
    title: '추천합니다',
    content: '친구에게도 추천하고 싶을 정도로 좋았어요. 다음에 또 방문할게요.',
    visitDate: new Date('2025-02-20'),
    helpfulCount: 2,
  },
];

async function fixReviewEncoding() {
  try {
    console.log('🔧 리뷰 인코딩 수정 시작...\n');

    // 1. 기존 리뷰 데이터 삭제
    console.log('1️⃣ 손상된 리뷰 데이터 삭제 중...');
    const deleteResult = await prisma.review.deleteMany({});
    console.log(`   ✅ ${deleteResult.count}개 리뷰 삭제 완료\n`);

    // 2. 샘플 리뷰 재삽입 (정상 UTF-8 인코딩)
    console.log('2️⃣ 새로운 리뷰 데이터 삽입 중...');
    for (const review of sampleReviews) {
      const created = await prisma.review.create({
        data: review,
      });
      console.log(`   ✅ 리뷰 ${created.id} 생성: "${review.title}"`);
    }

    console.log(`\n✅ 총 ${sampleReviews.length}개 리뷰 삽입 완료\n`);

    // 3. 결과 확인
    console.log('3️⃣ 삽입된 리뷰 확인...');
    const reviews = await prisma.review.findMany({
      where: { centerId: BigInt(1) },
      select: {
        id: true,
        title: true,
        content: true,
      },
      take: 2,
    });

    console.log('\n📋 샘플 리뷰:');
    reviews.forEach((review) => {
      console.log(`   ID ${review.id}:`);
      console.log(`   제목: ${review.title}`);
      console.log(`   내용: ${review.content.substring(0, 50)}...`);
      console.log('');
    });

    console.log('✅ 리뷰 인코딩 수정 완료!\n');
  } catch (error) {
    console.error('❌ 리뷰 인코딩 수정 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
fixReviewEncoding()
  .then(() => {
    console.log('🎉 모든 작업 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 오류 발생:', error);
    process.exit(1);
  });
