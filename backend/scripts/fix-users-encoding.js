/**
 * Fix Users Encoding Script
 *
 * Sprint 3 - Bug Fix: 사용자 닉네임 한글 인코딩 문제 해결
 *
 * 문제: 기존 사용자 데이터가 Latin-1 인코딩으로 삽입되어
 *      UTF-8 한글 텍스트가 깨진 상태로 저장됨
 *
 * 해결: 손상된 사용자 데이터를 정상 UTF-8 인코딩으로 업데이트
 */

const { prisma } = require('../src/config/database');

// 사용자 닉네임 수정 데이터 (정상 UTF-8 인코딩)
const userUpdates = [
  { id: BigInt(1), nickname: '김민수' },
  { id: BigInt(2), nickname: '이서준' },
  { id: BigInt(3), nickname: '박지우' },
  { id: BigInt(4), nickname: '최유진' },
  { id: BigInt(5), nickname: '정하준' },
  { id: BigInt(6), nickname: '윤서아' },
  { id: BigInt(7), nickname: '강태희' },
  { id: BigInt(8), nickname: '조은비' },
  { id: BigInt(9), nickname: '임시연' },
  { id: BigInt(10), nickname: '한지훈' },
];

async function fixUsersEncoding() {
  try {
    console.log('🔧 사용자 인코딩 수정 시작...\n');

    let updatedCount = 0;

    for (const userData of userUpdates) {
      try {
        // 사용자 존재 여부 확인
        const existingUser = await prisma.user.findUnique({
          where: { id: userData.id },
        });

        if (existingUser) {
          // 닉네임 업데이트
          await prisma.user.update({
            where: { id: userData.id },
            data: { nickname: userData.nickname },
          });

          console.log(`   ✅ 사용자 ${userData.id} 업데이트: "${userData.nickname}"`);
          updatedCount++;
        } else {
          console.log(`   ⏭️  사용자 ${userData.id} 존재하지 않음, 건너뛰기`);
        }
      } catch (error) {
        console.error(`   ❌ 사용자 ${userData.id} 업데이트 실패:`, error.message);
      }
    }

    console.log(`\n✅ 총 ${updatedCount}개 사용자 업데이트 완료\n`);

    // 결과 확인
    console.log('📋 업데이트된 사용자 확인:');
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userUpdates.map(u => u.id),
        },
      },
      select: {
        id: true,
        nickname: true,
      },
      take: 5,
    });

    users.forEach(user => {
      console.log(`   ID ${user.id}: ${user.nickname}`);
    });

    console.log('\n✅ 사용자 인코딩 수정 완료!\n');
  } catch (error) {
    console.error('❌ 사용자 인코딩 수정 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
fixUsersEncoding()
  .then(() => {
    console.log('🎉 모든 작업 완료!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 오류 발생:', error);
    process.exit(1);
  });
