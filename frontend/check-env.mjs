#!/usr/bin/env node
// Kakao Map API 키 설정 확인 스크립트

console.log('\n🔍 환경변수 설정 확인\n');

const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

if (!apiKey) {
  console.error('❌ NEXT_PUBLIC_KAKAO_MAP_KEY가 설정되지 않았습니다.');
  console.log('\n📝 해결 방법:');
  console.log('1. frontend/.env.local 파일이 존재하는지 확인');
  console.log('2. NEXT_PUBLIC_KAKAO_MAP_KEY=여기에키입력 형식으로 설정');
  console.log('3. 개발 서버 재시작\n');
  process.exit(1);
}

if (apiKey === 'YOUR_KAKAO_MAP_API_KEY_HERE') {
  console.error('⚠️  기본 템플릿 값이 그대로 있습니다.');
  console.log('\n📝 해결 방법:');
  console.log('1. https://developers.kakao.com/ 에서 JavaScript 키 발급');
  console.log('2. frontend/.env.local 파일에서 YOUR_KAKAO_MAP_API_KEY_HERE를 실제 키로 교체');
  console.log('3. 개발 서버 재시작\n');
  process.exit(1);
}

if (apiKey.length !== 32) {
  console.warn('⚠️  Kakao JavaScript 키는 일반적으로 32자입니다.');
  console.log(`   현재 키 길이: ${apiKey.length}자`);
  console.log('   올바른 JavaScript 키인지 확인해주세요 (REST API 키 아님)\n');
}

console.log('✅ NEXT_PUBLIC_KAKAO_MAP_KEY 설정 완료');
console.log(`   키 길이: ${apiKey.length}자`);
console.log(`   첫 8자: ${apiKey.substring(0, 8)}...`);
console.log('\n🎉 설정이 올바르게 완료되었습니다!\n');
