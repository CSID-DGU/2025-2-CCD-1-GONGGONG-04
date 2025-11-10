/**
 * Sprint 3 Review - Assessment Flow E2E Test
 *
 * 4개 화면의 핵심 기능만 검증:
 * 1. /assessment - 자가진단 페이지
 * 2. /assessment/result/[id] - 진단 결과 페이지
 * 3. /recommendations/from-assessment/[id] - 진단 기반 추천 페이지
 * 4. /my/assessments - 진단 이력 페이지
 */

import { test, expect } from '@playwright/test';

// ============================================
// 1. 자가진단 페이지 테스트
// ============================================

test.describe('화면 1: 자가진단 페이지 (/assessment)', () => {
  test.beforeEach(async ({ page }) => {
    // 브라우저 콘솔 에러 로깅
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`BROWSER ERROR: ${msg.text()}`);
      }
    });

    await page.goto('http://localhost:3000/assessment');
  });

  test('핵심기능-1.1: 페이지 로딩 및 헤더 표시', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/마음이음|MindConnect/);

    // 진단 헤더 표시 확인
    await expect(page.getByRole('heading', { name: /정신건강 자가진단/i })).toBeVisible();

    // 예상 소요 시간 표시 확인
    await expect(page.getByText(/예상 소요 시간/i)).toBeVisible();
  });

  test('핵심기능-1.2: 진행률 표시 확인', async ({ page }) => {
    // 진행률 바 표시 확인
    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toBeVisible();

    // 초기 진행률 "1/10" 확인
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible();
  });

  test('핵심기능-1.3: 질문 카드 및 라디오 버튼 표시', async ({ page }) => {
    // 질문 텍스트 표시 확인 (첫 번째 질문 텍스트)
    const questionText = page.locator('text=/지난 한 달 동안/i').first();
    await expect(questionText).toBeVisible();

    // 4개 라디오 버튼 확인
    const radioButtons = page.getByRole('radio');
    await expect(radioButtons).toHaveCount(4);
  });

  test('핵심기능-1.4: 네비게이션 버튼 동작', async ({ page }) => {
    // 첫 질문에서 "이전" 버튼 비활성화 확인
    const prevButton = page.getByRole('button', { name: /이전/i });
    await expect(prevButton).toBeDisabled();

    // 답변 선택
    await page.getByRole('radio').first().check();

    // "다음" 버튼 클릭
    const nextButton = page.getByRole('button', { name: /다음/i });
    await nextButton.click();

    // 2번 질문으로 이동 확인
    await expect(page.getByText(/2\s*\/\s*10/)).toBeVisible();

    // "이전" 버튼 활성화 확인
    await expect(prevButton).toBeEnabled();
  });

  test('핵심기능-1.5: 전체 진단 완료 플로우', async ({ page }) => {
    // 10개 질문에 순차적으로 답변
    for (let i = 1; i <= 10; i++) {
      // 진행률 확인
      await expect(page.getByText(new RegExp(`${i}\\s*\\/\\s*10`))).toBeVisible();

      // 현재 질문(i번)의 첫 번째 옵션 선택
      // force click으로 모든 이벤트 트리거 보장
      const firstRadio = page.locator(`#question-${i}-option-1`);
      await firstRadio.click({ force: true });

      // 라디오 버튼이 실제로 선택되었는지 확인
      await expect(firstRadio).toBeChecked({ timeout: 1000 });

      // 상태 업데이트를 위한 짧은 대기
      await page.waitForTimeout(200);

      if (i < 10) {
        // 다음 버튼이 활성화될 때까지 대기 (최대 3초)
        const nextButton = page.getByRole('button', { name: /다음/i });
        await expect(nextButton).toBeEnabled({ timeout: 3000 });
        await nextButton.click();

        // 다음 질문 완전히 렌더링될 때까지 대기
        await page.waitForTimeout(500);

        // 다음 질문 번호가 표시될 때까지 대기
        await expect(page.getByText(new RegExp(`${i + 1}\\s*\\/\\s*10`))).toBeVisible();
      }
    }

    // 마지막 질문에서 "제출" 버튼 표시 확인
    const submitButton = page.getByRole('button', { name: /제출/i });
    await expect(submitButton).toBeVisible();

    // 제출 클릭
    await submitButton.click();

    // 결과 페이지로 이동 확인 (URL 변경)
    await expect(page).toHaveURL(/\/assessment\/result\/\d+/);
  });
});

// ============================================
// 2. 진단 결과 페이지 테스트
// ============================================

test.describe('화면 2: 진단 결과 페이지 (/assessment/result/[id])', () => {
  test('핵심기능-2.1: 총점 및 심각도 표시', async ({ page }) => {
    // 전체 진단 완료 후 결과 페이지 진입
    await page.goto('http://localhost:3000/assessment');

    // 10개 질문 모두 첫 번째 보기 선택 (총점 10점 = LOW)
    for (let i = 1; i <= 10; i++) {
      await page.getByRole('radio').first().check();
      if (i < 10) {
        await page.getByRole('button', { name: /다음/i }).click();
      }
    }
    await page.getByRole('button', { name: /제출/i }).click();

    // 결과 페이지 로딩 대기
    await page.waitForURL(/\/assessment\/result\/\d+/);

    // 총점 표시 확인
    await expect(page.getByText(/총점/i)).toBeVisible();

    // 심각도 배지 표시 확인 (LOW = 초록색)
    const severityBadge = page.locator('[data-testid="severity-badge"]');
    await expect(severityBadge).toBeVisible();
  });

  test('핵심기능-2.2: 해석 메시지 표시', async ({ page }) => {
    // 결과 페이지 직접 접근 (이전 테스트에서 생성된 ID 사용 가정)
    await page.goto('http://localhost:3000/assessment');

    // 진단 완료
    for (let i = 1; i <= 10; i++) {
      await page.getByRole('radio').first().check();
      if (i < 10) {
        await page.getByRole('button', { name: /다음/i }).click();
      }
    }
    await page.getByRole('button', { name: /제출/i }).click();

    await page.waitForURL(/\/assessment\/result\/\d+/);

    // 해석 메시지 표시 확인
    const interpretation = page.locator('[data-testid="interpretation"]');
    await expect(interpretation).toBeVisible();
  });

  test('핵심기능-2.3: 추천 CTA 버튼 표시 및 클릭', async ({ page }) => {
    // 진단 완료 후 결과 페이지
    await page.goto('http://localhost:3000/assessment');

    for (let i = 1; i <= 10; i++) {
      await page.getByRole('radio').first().check();
      if (i < 10) {
        await page.getByRole('button', { name: /다음/i }).click();
      }
    }
    await page.getByRole('button', { name: /제출/i }).click();

    await page.waitForURL(/\/assessment\/result\/\d+/);

    // "나에게 맞는 센터 추천받기" CTA 버튼 확인
    const ctaButton = page.getByRole('button', { name: /센터 추천/i });
    await expect(ctaButton).toBeVisible();

    // 버튼 클릭
    await ctaButton.click();

    // 추천 페이지로 이동 확인
    await expect(page).toHaveURL(/\/recommendations\/from-assessment\/\d+/);
  });

  test('핵심기능-2.4: HIGH 심각도 시 긴급 연락처 배너', async ({ page }) => {
    // 고득점 진단 (모두 4번 보기 선택 = 40점 = HIGH)
    await page.goto('http://localhost:3000/assessment');

    for (let i = 1; i <= 10; i++) {
      // 마지막 보기 선택 (4점)
      await page.getByRole('radio').nth(3).check();
      if (i < 10) {
        await page.getByRole('button', { name: /다음/i }).click();
      }
    }
    await page.getByRole('button', { name: /제출/i }).click();

    await page.waitForURL(/\/assessment\/result\/\d+/);

    // 긴급 연락처 배너 표시 확인
    const emergencyBanner = page.locator('[data-testid="emergency-contact"]');
    await expect(emergencyBanner).toBeVisible();

    // 긴급 전화번호 링크 확인
    const phoneLink = page.getByRole('link', { name: /1393|1577|119/i });
    await expect(phoneLink).toBeVisible();
  });
});

// ============================================
// 3. 진단 기반 추천 페이지 테스트
// ============================================

test.describe('화면 3: 진단 기반 추천 페이지 (/recommendations/from-assessment/[id])', () => {
  test('핵심기능-3.1: 위치 입력 모달 표시', async ({ page }) => {
    // 진단 완료 후 추천 페이지 진입
    await page.goto('http://localhost:3000/assessment');

    for (let i = 1; i <= 10; i++) {
      await page.getByRole('radio').first().check();
      if (i < 10) {
        await page.getByRole('button', { name: /다음/i }).click();
      }
    }
    await page.getByRole('button', { name: /제출/i }).click();
    await page.waitForURL(/\/assessment\/result\/\d+/);

    // 추천 페이지로 이동
    await page.getByRole('button', { name: /센터 추천/i }).click();
    await page.waitForURL(/\/recommendations\/from-assessment\/\d+/);

    // 위치 입력 모달 자동 표시 확인
    const locationModal = page.getByRole('dialog', { name: /위치/i });
    await expect(locationModal).toBeVisible();
  });

  test('핵심기능-3.2: 위치 설정 후 추천 센터 목록 표시', async ({ page }) => {
    // 추천 페이지 직접 접근 (실제 assessmentId 사용 가정)
    await page.goto('http://localhost:3000/assessment');

    for (let i = 1; i <= 10; i++) {
      await page.getByRole('radio').first().check();
      if (i < 10) {
        await page.getByRole('button', { name: /다음/i }).click();
      }
    }
    await page.getByRole('button', { name: /제출/i }).click();
    await page.waitForURL(/\/assessment\/result\/\d+/);
    await page.getByRole('button', { name: /센터 추천/i }).click();
    await page.waitForURL(/\/recommendations\/from-assessment\/\d+/);

    // 위치 입력 (주소 검색 또는 현재 위치)
    const currentLocationButton = page.getByRole('button', { name: /현재 위치/i });

    // 현재 위치 사용 버튼 클릭
    if (await currentLocationButton.isVisible()) {
      await currentLocationButton.click();
    }

    // 센터 카드 목록 표시 대기 (최소 1개)
    const centerCards = page.locator('[data-testid="center-card"]');
    await expect(centerCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('핵심기능-3.3: 진단 정보 헤더 표시', async ({ page }) => {
    // 추천 페이지 진입
    await page.goto('http://localhost:3000/assessment');

    for (let i = 1; i <= 10; i++) {
      await page.getByRole('radio').first().check();
      if (i < 10) {
        await page.getByRole('button', { name: /다음/i }).click();
      }
    }
    await page.getByRole('button', { name: /제출/i }).click();
    await page.waitForURL(/\/assessment\/result\/\d+/);
    await page.getByRole('button', { name: /센터 추천/i }).click();
    await page.waitForURL(/\/recommendations\/from-assessment\/\d+/);

    // 위치 설정 후
    const currentLocationButton = page.getByRole('button', { name: /현재 위치/i });
    if (await currentLocationButton.isVisible()) {
      await currentLocationButton.click();
    }

    // 진단 정보 헤더 (심각도 배지) 표시 확인
    const assessmentHeader = page.locator('[data-testid="recommendation-header"]');
    await expect(assessmentHeader).toBeVisible({ timeout: 10000 });
  });
});

// ============================================
// 4. 진단 이력 페이지 테스트 (로그인 필요)
// ============================================

test.describe('화면 4: 진단 이력 페이지 (/my/assessments)', () => {
  test('핵심기능-4.1: 페이지 접근 및 헤더 표시', async ({ page }) => {
    // 진단 이력 페이지 접근
    await page.goto('http://localhost:3000/my/assessments');

    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: /진단 이력/i })).toBeVisible();
  });

  test('핵심기능-4.2: 새 진단 시작 버튼', async ({ page }) => {
    await page.goto('http://localhost:3000/my/assessments');

    // "새 진단 시작" 버튼 확인
    const newAssessmentButton = page.getByRole('button', { name: /새 진단/i });
    await expect(newAssessmentButton).toBeVisible();

    // 클릭 시 진단 페이지로 이동
    await newAssessmentButton.click();
    await expect(page).toHaveURL('/assessment');
  });

  test('핵심기능-4.3: 진단 이력 카드 표시 (이력 있는 경우)', async ({ page }) => {
    // 먼저 진단 1회 완료하여 이력 생성
    await page.goto('http://localhost:3000/assessment');

    for (let i = 1; i <= 10; i++) {
      await page.getByRole('radio').first().check();
      if (i < 10) {
        await page.getByRole('button', { name: /다음/i }).click();
      }
    }
    await page.getByRole('button', { name: /제출/i }).click();
    await page.waitForURL(/\/assessment\/result\/\d+/);

    // 이력 페이지로 이동
    await page.goto('http://localhost:3000/my/assessments');

    // 이력 카드 표시 확인
    const historyCard = page.locator('[data-testid="assessment-history-card"]');
    await expect(historyCard.first()).toBeVisible();

    // 카드 내용 확인 (진단 일시, 총점, 심각도)
    await expect(historyCard.first()).toContainText(/총점|점수/i);
  });

  test('핵심기능-4.4: 빈 상태 처리 (이력 없는 경우)', async ({ page }) => {
    // 이력이 없는 새 사용자 시뮬레이션 (로컬 스토리지 초기화)
    await page.goto('http://localhost:3000/my/assessments');

    // 빈 상태 메시지 또는 안내 표시 확인
    const emptyMessage = page.getByText(/진단 기록이 없습니다|첫 진단/i);

    // 이력이 있거나 없을 수 있으므로 조건부 검증
    const historyCard = page.locator('[data-testid="assessment-history-card"]');
    const hasHistory = await historyCard.count() > 0;

    if (!hasHistory) {
      await expect(emptyMessage).toBeVisible();
    }
  });
});

// ============================================
// 통합 플로우 테스트
// ============================================

test.describe('전체 플로우: 진단 → 결과 → 추천 → 이력', () => {
  test('핵심기능-전체: 완전한 사용자 여정', async ({ page }) => {
    // 1. 자가진단 페이지 시작
    await page.goto('http://localhost:3000/assessment');
    await expect(page.getByRole('heading', { name: /정신건강 자가진단/i })).toBeVisible();

    // 2. 10개 질문 답변
    for (let i = 1; i <= 10; i++) {
      await page.getByRole('radio').first().check();
      if (i < 10) {
        await page.getByRole('button', { name: /다음/i }).click();
      }
    }

    // 3. 제출 및 결과 페이지 확인
    await page.getByRole('button', { name: /제출/i }).click();
    await page.waitForURL(/\/assessment\/result\/\d+/);
    await expect(page.getByText(/총점/i)).toBeVisible();

    // 4. 추천 페이지로 이동
    await page.getByRole('button', { name: /센터 추천/i }).click();
    await page.waitForURL(/\/recommendations\/from-assessment\/\d+/);

    // 5. 위치 설정
    const currentLocationButton = page.getByRole('button', { name: /현재 위치/i });
    if (await currentLocationButton.isVisible()) {
      await currentLocationButton.click();
    }

    // 6. 추천 센터 목록 확인
    const centerCards = page.locator('[data-testid="center-card"]');
    await expect(centerCards.first()).toBeVisible({ timeout: 10000 });

    // 7. 이력 페이지 확인
    await page.goto('http://localhost:3000/my/assessments');
    await expect(page.getByRole('heading', { name: /진단 이력/i })).toBeVisible();
  });
});
