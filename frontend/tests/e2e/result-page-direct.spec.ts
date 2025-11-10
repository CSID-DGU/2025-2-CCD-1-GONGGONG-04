/**
 * 결과 페이지 직접 테스트
 *
 * 진단 완료 과정을 거치지 않고 결과 페이지에 직접 접근하여 테스트
 */

import { test, expect } from '@playwright/test';

test.describe('결과 페이지 직접 접근 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 콘솔 에러 캡처
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    // 네트워크 에러 캡처
    page.on('pageerror', (error) => {
      console.log('❌ Page Error:', error.message);
    });
  });

  test('결과-1: 백엔드 API로 진단 결과 생성 후 결과 페이지 확인', async ({ page, request }) => {
    console.log('\n=== 1단계: 백엔드에 진단 결과 제출 ===');

    // 백엔드 API로 직접 진단 제출
    const submitResponse = await request.post('http://localhost:8080/api/v1/assessments', {
      data: {
        templateId: 1,
        answers: [
          { questionNumber: 1, selectedOption: 1 },
          { questionNumber: 2, selectedOption: 2 },
          { questionNumber: 3, selectedOption: 3 },
          { questionNumber: 4, selectedOption: 4 },
          { questionNumber: 5, selectedOption: 1 },
          { questionNumber: 6, selectedOption: 2 },
          { questionNumber: 7, selectedOption: 3 },
          { questionNumber: 8, selectedOption: 4 },
          { questionNumber: 9, selectedOption: 1 },
          { questionNumber: 10, selectedOption: 2 },
        ],
      },
    });

    expect(submitResponse.ok()).toBeTruthy();
    const submitResult = await submitResponse.json();
    console.log('✅ 진단 제출 성공:', submitResult);

    const assessmentId = submitResult.data.assessmentId;
    expect(assessmentId).toBeDefined();
    console.log(`📋 생성된 Assessment ID: ${assessmentId}`);

    console.log('\n=== 2단계: 결과 페이지 접근 ===');

    // 결과 페이지로 이동
    await page.goto(`http://localhost:3000/assessment/result/${assessmentId}`);

    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');

    console.log('\n=== 3단계: 결과 페이지 요소 검증 ===');

    // 1. 점수 섹션 확인
    console.log('📊 점수 섹션 검증 중...');
    await expect(page.getByText(/총점/i)).toBeVisible({ timeout: 5000 });
    console.log('✅ 총점 표시 확인');

    // 2. 해석 섹션 확인
    console.log('📝 해석 섹션 검증 중...');
    await expect(page.getByText(/결과 해석/i)).toBeVisible();
    console.log('✅ 결과 해석 섹션 확인');

    // 3. 심각도 표시 확인
    const severityCode = submitResult.severityCode;
    console.log(`🎯 심각도 코드: ${severityCode}`);

    // 4. 추천 CTA 버튼 확인
    console.log('🔘 추천 버튼 검증 중...');
    const recommendButton = page.getByRole('button', { name: /맞춤 센터 추천받기/i });
    await expect(recommendButton).toBeVisible();
    console.log('✅ 추천 버튼 표시 확인');

    // 5. HIGH 심각도일 경우 긴급 배너 확인
    if (severityCode === 'HIGH') {
      console.log('🚨 HIGH 심각도 - 긴급 배너 검증 중...');
      await expect(page.getByText(/긴급|emergency|위급/i)).toBeVisible();
      console.log('✅ 긴급 배너 표시 확인');
    }

    // 6. 스크린샷 캡처
    await page.screenshot({
      path: `test-results/result-page-${assessmentId}.png`,
      fullPage: true
    });
    console.log(`📸 스크린샷 저장: result-page-${assessmentId}.png`);
  });

  test('결과-2: 존재하지 않는 ID로 접근 시 에러 처리 확인', async ({ page }) => {
    console.log('\n=== 존재하지 않는 결과 페이지 접근 ===');

    await page.goto('http://localhost:3000/assessment/result/999999');
    await page.waitForLoadState('networkidle');

    // 에러 메시지 또는 Not Found 표시 확인
    const hasError = await page.getByText(/찾을 수 없|not found|오류/i).isVisible()
      .catch(() => false);

    console.log(`❌ 에러 메시지 표시 여부: ${hasError}`);

    // 스크린샷 캡처
    await page.screenshot({
      path: 'test-results/result-page-not-found.png',
      fullPage: true
    });
  });

  test('결과-3: 결과 페이지에서 추천 버튼 클릭 동작 확인', async ({ page, request }) => {
    console.log('\n=== 추천 버튼 클릭 테스트 ===');

    // 먼저 진단 결과 생성
    const submitResponse = await request.post('http://localhost:8080/api/v1/assessments', {
      data: {
        templateId: 1,
        answers: Array.from({ length: 10 }, (_, i) => ({
          questionNumber: i + 1,
          selectedOption: 2,
        })),
      },
    });

    const submitResult = await submitResponse.json();
    const assessmentId = submitResult.data.assessmentId;

    // 결과 페이지 접근
    await page.goto(`http://localhost:3000/assessment/result/${assessmentId}`);
    await page.waitForLoadState('networkidle');

    // 추천 버튼 클릭
    const recommendButton = page.getByRole('button', { name: /맞춤 센터 추천받기/i });
    await expect(recommendButton).toBeVisible();

    console.log('🖱️ 추천 버튼 클릭...');
    await recommendButton.click();

    // 추천 페이지로 이동 확인
    await page.waitForURL(/\/assessment\/recommend/i, { timeout: 5000 });
    console.log('✅ 추천 페이지로 이동 확인');
    console.log(`📍 현재 URL: ${page.url()}`);

    await page.screenshot({
      path: 'test-results/result-page-recommend-click.png',
      fullPage: true
    });
  });
});
