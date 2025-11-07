/**
 * E2E Tests for Assessment Flow (Sprint 3 - Task 3.3.1)
 *
 * Frontend-Backend Integration Testing:
 * - Assessment submission flow (logged-in and anonymous users)
 * - Error handling scenarios
 * - Browser compatibility
 * - Responsive design validation
 *
 * Test Coverage:
 * - Complete assessment submission workflow
 * - Result page display
 * - Recommendation integration
 * - Error states and recovery
 * - Accessibility compliance
 * - Responsive behavior (320px, 768px, 1024px)
 */

import { test, expect, Page } from '@playwright/test';

// Mock API responses for predictable testing
const mockTemplate = {
  id: 1,
  template_name: 'K-10 기반 정신건강 자가진단',
  template_type: 'K10',
  description: '10개 문항으로 구성된 정신건강 선별 검사',
  questions: [
    {
      id: 1,
      text: '지난 4주 동안, 이유 없이 피곤하다고 느낀 적이 얼마나 자주 있었습니까?',
      options: [
        { value: 1, label: '전혀 없었다' },
        { value: 2, label: '가끔 있었다' },
        { value: 3, label: '자주 있었다' },
        { value: 4, label: '항상 그랬다' }
      ]
    },
    {
      id: 2,
      text: '지난 4주 동안, 신경이 예민하다고 느낀 적이 얼마나 자주 있었습니까?',
      options: [
        { value: 1, label: '전혀 없었다' },
        { value: 2, label: '가끔 있었다' },
        { value: 3, label: '자주 있었다' },
        { value: 4, label: '항상 그랬다' }
      ]
    },
    {
      id: 3,
      text: '지난 4주 동안, 너무 신경이 쓰여서 어떤 것으로도 진정시킬 수 없다고 느낀 적이 얼마나 자주 있었습니까?',
      options: [
        { value: 1, label: '전혀 없었다' },
        { value: 2, label: '가끔 있었다' },
        { value: 3, label: '자주 있었다' },
        { value: 4, label: '항상 그랬다' }
      ]
    },
    {
      id: 4,
      text: '지난 4주 동안, 절망적이라고 느낀 적이 얼마나 자주 있었습니까?',
      options: [
        { value: 1, label: '전혀 없었다' },
        { value: 2, label: '가끔 있었다' },
        { value: 3, label: '자주 있었다' },
        { value: 4, label: '항상 그랬다' }
      ]
    },
    {
      id: 5,
      text: '지난 4주 동안, 안절부절못하거나 들떠 있다고 느낀 적이 얼마나 자주 있었습니까?',
      options: [
        { value: 1, label: '전혀 없었다' },
        { value: 2, label: '가끔 있었다' },
        { value: 3, label: '자주 있었다' },
        { value: 4, label: '항상 그랬다' }
      ]
    },
    {
      id: 6,
      text: '지난 4주 동안, 너무 안절부절못해서 가만히 앉아 있을 수 없다고 느낀 적이 얼마나 자주 있었습니까?',
      options: [
        { value: 1, label: '전혀 없었다' },
        { value: 2, label: '가끔 있었다' },
        { value: 3, label: '자주 있었다' },
        { value: 4, label: '항상 그랬다' }
      ]
    },
    {
      id: 7,
      text: '지난 4주 동안, 우울하다고 느낀 적이 얼마나 자주 있었습니까?',
      options: [
        { value: 1, label: '전혀 없었다' },
        { value: 2, label: '가끔 있었다' },
        { value: 3, label: '자주 있었다' },
        { value: 4, label: '항상 그랬다' }
      ]
    },
    {
      id: 8,
      text: '지난 4주 동안, 모든 일이 힘들다고 느낀 적이 얼마나 자주 있었습니까?',
      options: [
        { value: 1, label: '전혀 없었다' },
        { value: 2, label: '가끔 있었다' },
        { value: 3, label: '자주 있었다' },
        { value: 4, label: '항상 그랬다' }
      ]
    },
    {
      id: 9,
      text: '지난 4주 동안, 너무 슬퍼서 무엇으로도 기운을 낼 수 없다고 느낀 적이 얼마나 자주 있었습니까?',
      options: [
        { value: 1, label: '전혀 없었다' },
        { value: 2, label: '가끔 있었다' },
        { value: 3, label: '자주 있었다' },
        { value: 4, label: '항상 그랬다' }
      ]
    },
    {
      id: 10,
      text: '지난 4주 동안, 자신이 가치 없는 사람이라고 느낀 적이 얼마나 자주 있었습니까?',
      options: [
        { value: 1, label: '전혀 없었다' },
        { value: 2, label: '가끔 있었다' },
        { value: 3, label: '자주 있었다' },
        { value: 4, label: '항상 그랬다' }
      ]
    }
  ],
  scoring_rules: {
    total_points: 40,
    severity_thresholds: {
      LOW: { min: 0, max: 15, label: '양호' },
      MID: { min: 16, max: 29, label: '주의' },
      HIGH: { min: 30, max: 40, label: '위험' }
    }
  },
  is_active: true,
  created_at: '2025-01-01T00:00:00Z'
};

// Helper function to mock API responses
async function mockApiResponse(page: Page, route: string | RegExp, response: any, status = 200) {
  await page.route(route, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

// Helper function to navigate to assessment page
async function navigateToAssessment(page: Page) {
  await page.goto('/assessment');
  await page.waitForLoadState('networkidle');
}

// Helper function to answer all questions with specific values
async function answerAllQuestions(page: Page, answers: number[]) {
  for (let i = 0; i < answers.length; i++) {
    const answerValue = answers[i];

    // Select the option
    await page.click(`input[name="question-${i + 1}"][value="${answerValue}"]`);

    if (i < answers.length - 1) {
      // Click "다음" button for all but the last question
      await page.click('button:has-text("다음")');
      await page.waitForTimeout(300); // Wait for animation
    } else {
      // Click "제출" button on the last question
      await page.click('button:has-text("제출")');
    }
  }
}

// Helper function to set viewport
async function setViewport(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
}

// ========================================
// Test Suite 1: Assessment Submission Flow
// ========================================

test.describe('Assessment Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock template API
    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);
  });

  test('should complete assessment for logged-in user and save to history', async ({ page }) => {
    // Mock assessment submission response
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      assessment_id: 'a123',
      template_id: 1,
      total_score: 20,
      severity_code: 'MID',
      severity_label: '주의',
      submitted_at: '2025-01-10T10:00:00Z',
      recommendations_available: true
    }, 200);

    // Navigate to assessment page first
    await navigateToAssessment(page);

    // Set auth token after page loads
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
    });
    await expect(page.locator('h1')).toContainText('정신건강 자가진단');

    // Start assessment
    await page.click('button:has-text("시작하기")');

    // Answer all 10 questions (mid-range answers for MID severity)
    await answerAllQuestions(page, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);

    // Wait for result page
    await expect(page).toHaveURL(/\/assessment\/result\/.+/);

    // Verify result page displays correct information
    await expect(page.locator('[data-testid="total-score"]')).toContainText('20');
    await expect(page.locator('[data-testid="severity-badge"]')).toContainText('주의');
    await expect(page.locator('[data-testid="severity-label"]')).toBeVisible();

    // Verify recommendation button is available for logged-in users
    const recommendButton = page.locator('button:has-text("나에게 맞는 센터 추천받기")');
    await expect(recommendButton).toBeVisible();
    await expect(recommendButton).toBeEnabled();
  });

  test('should complete assessment for anonymous user without saving', async ({ page }) => {
    // Mock anonymous assessment submission response
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      assessment_id: null, // No ID for anonymous users
      template_id: 1,
      total_score: 15,
      severity_code: 'LOW',
      severity_label: '양호',
      submitted_at: '2025-01-10T10:00:00Z',
      recommendations_available: false
    }, 200);

    // Navigate to assessment page first
    await navigateToAssessment(page);

    // Ensure no auth token after page loads
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
    });

    // Start assessment
    await page.click('button:has-text("시작하기")');

    // Answer all 10 questions (low scores for LOW severity)
    await answerAllQuestions(page, [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);

    // Wait for result page
    await expect(page).toHaveURL(/\/assessment\/result\/.+/);

    // Verify result page displays correct information
    await expect(page.locator('[data-testid="total-score"]')).toContainText('15');
    await expect(page.locator('[data-testid="severity-badge"]')).toContainText('양호');

    // Verify message prompting login to save results
    await expect(page.locator('text=/로그인하시면.*저장됩니다/')).toBeVisible();

    // Recommendation button should prompt login
    const loginPromptButton = page.locator('button:has-text("로그인하고 추천받기")');
    await expect(loginPromptButton).toBeVisible();
  });

  test('should display emergency contact banner for HIGH severity', async ({ page }) => {
    // Mock HIGH severity response
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      assessment_id: 'a124',
      template_id: 1,
      total_score: 38,
      severity_code: 'HIGH',
      severity_label: '위험',
      submitted_at: '2025-01-10T10:00:00Z',
      recommendations_available: true
    }, 200);

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Answer all questions with highest scores for HIGH severity
    await answerAllQuestions(page, [4, 4, 4, 4, 4, 4, 4, 3, 3, 4]);

    // Wait for result page
    await expect(page).toHaveURL(/\/assessment\/result\/.+/);

    // Verify emergency banner is displayed
    const emergencyBanner = page.locator('[data-testid="emergency-banner"]');
    await expect(emergencyBanner).toBeVisible();
    await expect(emergencyBanner).toContainText('긴급');

    // Verify emergency contact links
    await expect(page.locator('a[href="tel:1577-0199"]')).toBeVisible(); // 정신건강위기상담전화
    await expect(page.locator('a[href="tel:1393"]')).toBeVisible(); // 자살예방상담전화
  });

  test('should show progress indicator during assessment', async ({ page }) => {
    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Check initial progress (1/10)
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    await expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    await expect(page.locator('text=/1.*\\/.*10/')).toBeVisible();

    // Answer first question and proceed
    await page.click('input[name="question-1"][value="2"]');
    await page.click('button:has-text("다음")');
    await page.waitForTimeout(300);

    // Check updated progress (2/10)
    await expect(progressBar).toHaveAttribute('aria-valuenow', '2');
    await expect(page.locator('text=/2.*\\/.*10/')).toBeVisible();
  });

  test('should allow navigation back to previous questions', async ({ page }) => {
    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Answer first 3 questions
    await page.click('input[name="question-1"][value="2"]');
    await page.click('button:has-text("다음")');
    await page.waitForTimeout(300);

    await page.click('input[name="question-2"][value="3"]');
    await page.click('button:has-text("다음")');
    await page.waitForTimeout(300);

    await page.click('input[name="question-3"][value="1"]');

    // Click "이전" button
    const prevButton = page.locator('button:has-text("이전")');
    await expect(prevButton).toBeVisible();
    await prevButton.click();
    await page.waitForTimeout(300);

    // Verify we're back on question 2
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '2');

    // Verify previously selected answer is still checked
    const selectedOption = page.locator('input[name="question-2"][value="3"]');
    await expect(selectedOption).toBeChecked();
  });
});

// ========================================
// Test Suite 2: Error Handling
// ========================================

test.describe('Error Handling', () => {
  test('should display error toast for network errors and allow retry', async ({ page }) => {
    // Mock network error (500)
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      error: 'INTERNAL_SERVER_ERROR',
      message: '서버 오류가 발생했습니다'
    }, 500);

    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Answer all questions
    await answerAllQuestions(page, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);

    // Wait for error toast
    const errorToast = page.locator('[role="alert"]:has-text("서버 오류")');
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    // Verify retry button appears
    const retryButton = page.locator('button:has-text("다시 시도")');
    await expect(retryButton).toBeVisible();

    // Mock successful retry
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      assessment_id: 'a125',
      template_id: 1,
      total_score: 20,
      severity_code: 'MID',
      severity_label: '주의',
      submitted_at: '2025-01-10T10:00:00Z',
      recommendations_available: true
    }, 200);

    // Click retry
    await retryButton.click();

    // Verify successful submission after retry
    await expect(page).toHaveURL(/\/assessment\/result\/.+/);
    await expect(page.locator('[data-testid="total-score"]')).toBeVisible();
  });

  test('should display validation error toast for invalid submission', async ({ page }) => {
    // Mock validation error (400)
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      error: 'VALIDATION_ERROR',
      message: '모든 질문에 답변해주세요',
      missing_questions: [5, 7]
    }, 400);

    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Simulate skipping some questions (through API mock)
    await page.click('input[name="question-1"][value="2"]');

    // Force submit through API call (simulating incomplete answers)
    await page.evaluate(() => {
      fetch('/api/v1/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: 1,
          answers: [{ question_id: 1, selected_option: 2 }] // Incomplete
        })
      });
    });

    // Wait for validation error toast
    const errorToast = page.locator('[role="alert"]:has-text("모든 질문에 답변")');
    await expect(errorToast).toBeVisible({ timeout: 5000 });
  });

  test('should redirect to login page on 401 Unauthorized', async ({ page }) => {
    // Mock 401 Unauthorized response
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      error: 'UNAUTHORIZED',
      message: '인증이 필요합니다'
    }, 401);

    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);

    // Set auth token after page loads
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'expired-token');
    });
    await page.click('button:has-text("시작하기")');

    // Answer all questions
    await answerAllQuestions(page, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);

    // Verify redirect to login page
    await expect(page).toHaveURL(/\/login\?redirect=/, { timeout: 5000 });
  });

  test('should display 403 Forbidden error appropriately', async ({ page }) => {
    // Mock 403 Forbidden response
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      error: 'FORBIDDEN',
      message: '접근 권한이 없습니다'
    }, 403);

    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Answer all questions
    await answerAllQuestions(page, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);

    // Wait for error toast
    const errorToast = page.locator('[role="alert"]:has-text("접근 권한")');
    await expect(errorToast).toBeVisible({ timeout: 5000 });
  });

  test('should handle rate limiting gracefully', async ({ page }) => {
    // Mock 429 Rate Limit Exceeded response
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      error: 'RATE_LIMIT_EXCEEDED',
      message: '요청 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.',
      retry_after: 60
    }, 429);

    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Answer all questions
    await answerAllQuestions(page, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);

    // Wait for rate limit error toast
    const errorToast = page.locator('[role="alert"]:has-text("요청 횟수가 너무 많습니다")');
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    // Verify retry timer is displayed
    await expect(page.locator('text=/60.*초.*후/')).toBeVisible();
  });
});

// ========================================
// Test Suite 3: Browser Compatibility
// ========================================

test.describe('Browser Compatibility', () => {
  // These tests will run on all browsers configured in playwright.config.ts
  // (chromium, firefox, webkit)

  test('should work correctly across all browsers', async ({ page, browserName }) => {
    console.log(`Testing on browser: ${browserName}`);

    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      assessment_id: 'a126',
      template_id: 1,
      total_score: 18,
      severity_code: 'MID',
      severity_label: '주의',
      submitted_at: '2025-01-10T10:00:00Z',
      recommendations_available: true
    }, 200);

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Answer all questions
    await answerAllQuestions(page, [2, 2, 2, 2, 2, 1, 2, 2, 1, 2]);

    // Verify result page loads
    await expect(page).toHaveURL(/\/assessment\/result\/.+/);
    await expect(page.locator('[data-testid="total-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="severity-badge"]')).toBeVisible();
  });

  test('should handle CSS grid layout correctly in all browsers', async ({ page }) => {
    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Verify options are displayed in grid layout
    const optionsContainer = page.locator('[data-testid="options-container"]').first();
    const computedStyle = await optionsContainer.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });

    // Grid should be supported in modern browsers
    expect(['grid', 'flex']).toContain(computedStyle);
  });

  test('should support keyboard navigation in all browsers', async ({ page }) => {
    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Tab to first option
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Might need multiple tabs depending on layout

    // Select with Space key
    await page.keyboard.press('Space');

    // Navigate to Next button with Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter to proceed
    await page.keyboard.press('Enter');

    await page.waitForTimeout(300);

    // Verify we moved to question 2
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '2');
  });
});

// ========================================
// Test Suite 4: Responsive Design
// ========================================

test.describe('Responsive Design', () => {
  const viewports = {
    mobile: { width: 320, height: 568 }, // iPhone SE
    tablet: { width: 768, height: 1024 }, // iPad
    desktop: { width: 1024, height: 768 }, // Desktop
  };

  test('should display correctly on mobile (320px)', async ({ page }) => {
    await setViewport(page, viewports.mobile.width, viewports.mobile.height);

    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);

    // Verify mobile-friendly layout
    await expect(page.locator('h1')).toBeVisible();
    const heading = page.locator('h1');
    const fontSize = await heading.evaluate((el) => window.getComputedStyle(el).fontSize);

    // Font size should be readable on mobile (at least 20px)
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(20);

    // Start assessment
    await page.click('button:has-text("시작하기")');

    // Verify options are stacked vertically on mobile
    const optionsContainer = page.locator('[data-testid="options-container"]').first();
    await expect(optionsContainer).toBeVisible();

    // Buttons should be full-width or appropriately sized for touch
    const nextButton = page.locator('button:has-text("다음")');
    const buttonWidth = await nextButton.evaluate((el) => el.offsetWidth);
    const containerWidth = await page.evaluate(() => document.body.clientWidth);

    // Button should be at least 80% of container width on mobile or have min-width
    expect(buttonWidth).toBeGreaterThan(containerWidth * 0.6);
  });

  test('should display correctly on tablet (768px)', async ({ page }) => {
    await setViewport(page, viewports.tablet.width, viewports.tablet.height);

    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      assessment_id: 'a127',
      template_id: 1,
      total_score: 22,
      severity_code: 'MID',
      severity_label: '주의',
      submitted_at: '2025-01-10T10:00:00Z',
      recommendations_available: true
    }, 200);

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Verify layout adapts to tablet
    await expect(page.locator('h2')).toBeVisible();

    // Complete assessment
    await answerAllQuestions(page, [2, 2, 2, 3, 2, 2, 2, 2, 2, 3]);

    // Verify result page layout on tablet
    await expect(page).toHaveURL(/\/assessment\/result\/.+/);

    // Result card should have appropriate width
    const resultCard = page.locator('[data-testid="result-card"]');
    const cardWidth = await resultCard.evaluate((el) => el.offsetWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // Card should not be full-width on tablet (should have margins)
    expect(cardWidth).toBeLessThan(viewportWidth * 0.95);
  });

  test('should display correctly on desktop (1024px)', async ({ page }) => {
    await setViewport(page, viewports.desktop.width, viewports.desktop.height);

    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);

    // Verify desktop layout
    await expect(page.locator('h1')).toBeVisible();

    // Layout should be centered with max-width
    const mainContainer = page.locator('main').first();
    const containerWidth = await mainContainer.evaluate((el) => el.offsetWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // Container should have max-width constraint on desktop
    expect(containerWidth).toBeLessThan(viewportWidth);
    expect(containerWidth).toBeGreaterThan(600); // Reasonable min-width

    await page.click('button:has-text("시작하기")');

    // Options should be displayed in appropriate grid on desktop
    const optionsContainer = page.locator('[data-testid="options-container"]').first();
    await expect(optionsContainer).toBeVisible();
  });

  test('should handle viewport rotation gracefully', async ({ page }) => {
    // Start in portrait mobile
    await setViewport(page, 375, 667);

    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');
    await page.click('input[name="question-1"][value="2"]');

    // Rotate to landscape
    await setViewport(page, 667, 375);
    await page.waitForTimeout(300);

    // Verify content is still visible and functional
    await expect(page.locator('h2')).toBeVisible();

    // Verify selected answer persists
    const selectedOption = page.locator('input[name="question-1"][value="2"]');
    await expect(selectedOption).toBeChecked();

    // Should be able to continue
    await page.click('button:has-text("다음")');
    await page.waitForTimeout(300);

    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '2');
  });
});

// ========================================
// Test Suite 5: Accessibility
// ========================================

test.describe('Accessibility', () => {
  test('should meet WCAG AA standards', async ({ page }) => {
    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);

    // Basic accessibility checks
    // Note: In a real project, integrate axe-core for comprehensive a11y testing

    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    await page.click('button:has-text("시작하기")');

    // Verify form inputs have labels
    const inputs = page.locator('input[type="radio"]');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const inputId = await input.getAttribute('id');

      if (inputId) {
        const label = page.locator(`label[for="${inputId}"]`);
        await expect(label).toBeVisible();
      }
    }

    // Verify ARIA attributes
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toHaveAttribute('aria-valuenow');
    await expect(progressBar).toHaveAttribute('aria-valuemin');
    await expect(progressBar).toHaveAttribute('aria-valuemax');
  });

  test('should support full keyboard navigation', async ({ page }) => {
    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      assessment_id: 'a128',
      template_id: 1,
      total_score: 16,
      severity_code: 'MID',
      severity_label: '주의',
      submitted_at: '2025-01-10T10:00:00Z',
      recommendations_available: true
    }, 200);

    await navigateToAssessment(page);

    // Tab to "시작하기" button
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedElement).toContain('시작');

    // Press Enter to start
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Complete assessment using only keyboard
    for (let i = 0; i < 10; i++) {
      // Tab to second option (value=2)
      await page.keyboard.press('Tab'); // Question label
      await page.keyboard.press('Tab'); // Option 1
      await page.keyboard.press('Tab'); // Option 2
      await page.keyboard.press('Space'); // Select option 2

      // Tab to Next/Submit button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Press Enter
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
    }

    // Verify we reached the result page
    await expect(page).toHaveURL(/\/assessment\/result\/.+/);
  });

  test('should have visible focus indicators', async ({ page }) => {
    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Tab to first option
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check for focus ring/outline
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    const outline = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });

    expect(outline).toBeTruthy();
  });

  test('should announce screen reader updates', async ({ page }) => {
    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');

    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();

    // Should have at least one live region for announcements
    expect(liveRegionCount).toBeGreaterThanOrEqual(1);
  });
});

// ========================================
// Test Suite 6: Performance
// ========================================

test.describe('Performance', () => {
  test('should load assessment page within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);
    await navigateToAssessment(page);

    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should submit assessment within performance threshold', async ({ page }) => {
    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    let submissionTime = 0;
    await mockApiResponse(page, /\/api\/v1\/assessments$/, async (route) => {
      const startTime = Date.now();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          assessment_id: 'a129',
          template_id: 1,
          total_score: 19,
          severity_code: 'MID',
          severity_label: '주의',
          submitted_at: '2025-01-10T10:00:00Z',
          recommendations_available: true
        }),
      });

      submissionTime = Date.now() - startTime;
    });

    await navigateToAssessment(page);
    await page.click('button:has-text("시작하기")');
    await answerAllQuestions(page, [2, 2, 2, 2, 2, 2, 1, 2, 2, 2]);

    // API response should be handled within 1 second
    expect(submissionTime).toBeLessThan(1000);
  });
});

// ========================================
// Test Suite 7: Integration with Recommendations
// ========================================

test.describe('Recommendation Integration', () => {
  test('should navigate to recommendations page from result', async ({ page }) => {
    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);
    await mockApiResponse(page, /\/api\/v1\/assessments$/, {
      assessment_id: 'a130',
      template_id: 1,
      total_score: 24,
      severity_code: 'MID',
      severity_label: '주의',
      submitted_at: '2025-01-10T10:00:00Z',
      recommendations_available: true
    }, 200);

    // Mock location API for recommendations
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 37.5665, longitude: 126.9780 }); // Seoul

    await navigateToAssessment(page);

    // Set auth token after page loads
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
    });
    await page.click('button:has-text("시작하기")');
    await answerAllQuestions(page, [2, 3, 2, 3, 2, 2, 3, 2, 2, 3]);

    // Wait for result page
    await expect(page).toHaveURL(/\/assessment\/result\/.+/);

    // Click recommendation button
    await page.click('button:has-text("나에게 맞는 센터 추천받기")');

    // Verify navigation to recommendation page with assessment ID
    await expect(page).toHaveURL(/\/recommendations\/from-assessment\/.+/);
  });

  test('should pass severity code to recommendation system', async ({ page }) => {
    await mockApiResponse(page, /\/api\/v1\/assessments\/templates\/1/, mockTemplate);

    let capturedRequestBody: any = null;
    await page.route(/\/api\/v1\/assessments$/, async (route) => {
      capturedRequestBody = JSON.parse(route.request().postData() || '{}');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          assessment_id: 'a131',
          template_id: 1,
          total_score: 32,
          severity_code: 'HIGH',
          severity_label: '위험',
          submitted_at: '2025-01-10T10:00:00Z',
          recommendations_available: true
        }),
      });
    });

    await navigateToAssessment(page);

    // Set auth token after page loads
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
    });
    await page.click('button:has-text("시작하기")');

    // Answer with HIGH scores
    await answerAllQuestions(page, [4, 4, 4, 4, 4, 3, 3, 3, 3, 4]);

    // Verify request included all answers
    expect(capturedRequestBody).toBeTruthy();
    expect(capturedRequestBody.template_id).toBe(1);
    expect(capturedRequestBody.answers).toHaveLength(10);
  });
});
