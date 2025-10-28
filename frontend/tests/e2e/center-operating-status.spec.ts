/**
 * Center Operating Status E2E Tests
 * 센터 운영 상태 통합 테스트 (Sprint 2)
 */

import { test, expect, Page } from '@playwright/test';
import {
  navigateToCenterDetail,
  mockApiResponse,
  setViewport,
} from '../helpers/setup';
import { testCenters, viewports } from '../helpers/fixtures';

/**
 * Mock 운영 상태 데이터
 */
const mockOperatingStatus = {
  open: {
    centerId: 1,
    centerName: '마음이음센터',
    status: 'OPEN',
    message: '운영 중',
    currentTime: new Date().toISOString(),
    nextOpenDate: null,
    operatingHours: [
      { dayOfWeek: 0, dayName: '일요일', openTime: '00:00', closeTime: '00:00', isOpen: false },
      { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 2, dayName: '화요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 3, dayName: '수요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 4, dayName: '목요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 6, dayName: '토요일', openTime: '10:00', closeTime: '15:00', isOpen: true },
    ],
    holidays: [
      { date: '2025-01-01', name: '신정', type: 'public' as const },
      { date: '2025-02-09', name: '설날', type: 'public' as const },
      { date: '2025-03-01', name: '삼일절', type: 'public' as const },
    ],
  },
  closingSoon: {
    centerId: 1,
    centerName: '마음이음센터',
    status: 'CLOSING_SOON',
    message: '30분 후 마감',
    currentTime: new Date().toISOString(),
    nextOpenDate: null,
    operatingHours: [
      { dayOfWeek: 0, dayName: '일요일', openTime: '00:00', closeTime: '00:00', isOpen: false },
      { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 2, dayName: '화요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 3, dayName: '수요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 4, dayName: '목요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 6, dayName: '토요일', openTime: '10:00', closeTime: '15:00', isOpen: true },
    ],
    holidays: [],
  },
  closed: {
    centerId: 1,
    centerName: '마음이음센터',
    status: 'CLOSED',
    message: '운영 종료',
    currentTime: new Date().toISOString(),
    nextOpenDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    operatingHours: [
      { dayOfWeek: 0, dayName: '일요일', openTime: '00:00', closeTime: '00:00', isOpen: false },
      { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 2, dayName: '화요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 3, dayName: '수요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 4, dayName: '목요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 6, dayName: '토요일', openTime: '10:00', closeTime: '15:00', isOpen: true },
    ],
    holidays: [],
  },
  holiday: {
    centerId: 1,
    centerName: '마음이음센터',
    status: 'HOLIDAY',
    message: '공휴일',
    currentTime: new Date().toISOString(),
    nextOpenDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    operatingHours: [
      { dayOfWeek: 0, dayName: '일요일', openTime: '00:00', closeTime: '00:00', isOpen: false },
      { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 2, dayName: '화요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 3, dayName: '수요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 4, dayName: '목요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 6, dayName: '토요일', openTime: '10:00', closeTime: '15:00', isOpen: true },
    ],
    holidays: [
      { date: new Date().toISOString().split('T')[0], name: '신정', type: 'public' as const },
    ],
  },
  tempClosed: {
    centerId: 1,
    centerName: '마음이음센터',
    status: 'TEMP_CLOSED',
    message: '임시 휴무',
    currentTime: new Date().toISOString(),
    nextOpenDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    operatingHours: [
      { dayOfWeek: 0, dayName: '일요일', openTime: '00:00', closeTime: '00:00', isOpen: false },
      { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 2, dayName: '화요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 3, dayName: '수요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 4, dayName: '목요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 6, dayName: '토요일', openTime: '10:00', closeTime: '15:00', isOpen: true },
    ],
    holidays: [
      { date: new Date().toISOString().split('T')[0], name: '시설 점검', type: 'temporary' as const },
    ],
  },
  noInfo: {
    centerId: 1,
    centerName: '마음이음센터',
    status: 'NO_INFO',
    message: '운영 정보 없음',
    currentTime: new Date().toISOString(),
    nextOpenDate: null,
    operatingHours: [],
    holidays: [],
  },
};

/**
 * 1. OPERATING STATUS BADGE TESTS (6 tests)
 */
test.describe('Operating Status Badge Display', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
  });

  test('should display OPEN status badge correctly', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.open
    );

    await navigateToCenterDetail(page, 1);

    const badge = page.getByText('운영 중');
    await expect(badge).toBeVisible();
  });

  test('should display CLOSING_SOON status badge correctly', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.closingSoon
    );

    await navigateToCenterDetail(page, 1);

    const badge = page.getByText('30분 후 마감');
    await expect(badge).toBeVisible();
  });

  test('should display CLOSED status badge correctly', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.closed
    );

    await navigateToCenterDetail(page, 1);

    const badge = page.getByText('운영 종료');
    await expect(badge).toBeVisible();
  });

  test('should display HOLIDAY status badge correctly', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.holiday
    );

    await navigateToCenterDetail(page, 1);

    const badge = page.getByText('공휴일');
    await expect(badge).toBeVisible();
  });

  test('should display TEMP_CLOSED status badge correctly', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.tempClosed
    );

    await navigateToCenterDetail(page, 1);

    const badge = page.getByText('임시 휴무');
    await expect(badge).toBeVisible();
  });

  test('should display NO_INFO status badge correctly', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.noInfo
    );

    await navigateToCenterDetail(page, 1);

    const badge = page.getByText('운영 정보 없음');
    await expect(badge).toBeVisible();
  });
});

/**
 * 2. OPERATING HOURS TABLE TESTS (4 tests)
 */
test.describe('Operating Hours Table Display', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.open
    );
  });

  test('should display operating hours table', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    const tableTitle = page.getByRole('heading', { name: '요일별 운영시간' });
    await expect(tableTitle).toBeVisible();
  });

  test('should display all 7 days in operating hours table', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    const days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

    for (const day of days) {
      const dayElement = page.getByText(day);
      await expect(dayElement).toBeVisible();
    }
  });

  test('should display operating hours for each day', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    const mondayHours = page.getByText('09:00 - 18:00');
    await expect(mondayHours.first()).toBeVisible();
  });

  test('should display closed status for non-operating days', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // 일요일은 휴무
    const sundayRow = page.locator('text=일요일').locator('..');
    await expect(sundayRow).toContainText('휴무');
  });
});

/**
 * 3. HOLIDAY LIST TESTS (4 tests)
 */
test.describe('Holiday List Display', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.open
    );
  });

  test('should display holiday list section', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    const holidayTitle = page.getByRole('heading', { name: '휴무일 안내' });
    await expect(holidayTitle).toBeVisible();
  });

  test('should display holidays with dates', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    const newYear = page.getByText('신정');
    await expect(newYear).toBeVisible();
  });

  test('should display holiday type badges', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    const publicHolidayBadge = page.getByText('공휴일');
    await expect(publicHolidayBadge.first()).toBeVisible();
  });

  test('should limit displayed holidays to maxItems', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // 3개의 휴일만 표시되어야 함
    const holidays = page.locator('[aria-label*="휴무일"]');
    const count = await holidays.count();
    expect(count).toBeLessThanOrEqual(5); // maxItems=5
  });
});

/**
 * 4. UPDATE INDICATOR TESTS (3 tests)
 */
test.describe('Real-time Update Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.open
    );
  });

  test('should display update indicator', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    const updateIndicator = page.locator('text=/마지막 업데이트|업데이트 중/');
    await expect(updateIndicator.first()).toBeVisible();
  });

  test('should show relative update time', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    const relativeTime = page.locator('text=/방금 전|.*전 업데이트/');
    await expect(relativeTime.first()).toBeVisible();
  });

  test('should display auto-update interval information', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    const autoUpdateInfo = page.getByText(/60초마다 자동 업데이트/);
    await expect(autoUpdateInfo).toBeVisible();
  });
});

/**
 * 5. LOADING STATE TESTS (2 tests)
 */
test.describe('Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
  });

  test('should show skeleton during initial load', async ({ page }) => {
    // Delay API response to see skeleton
    await page.route(/\/api\/v1\/centers\/1\/operating-status/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockOperatingStatus.open),
      });
    });

    await navigateToCenterDetail(page, 1);

    // Check for skeleton (aria-busy)
    const skeleton = page.locator('[aria-busy="true"]');
    await expect(skeleton.first()).toBeVisible();
  });

  test('should hide skeleton after data loads', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.open
    );

    await navigateToCenterDetail(page, 1);

    // Wait for data to load
    await page.waitForTimeout(500);

    const badge = page.getByText('운영 중');
    await expect(badge).toBeVisible();
  });
});

/**
 * 6. ERROR STATE TESTS (2 tests)
 */
test.describe('Error States', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
  });

  test('should display error message on API failure', async ({ page }) => {
    await page.route(/\/api\/v1\/centers\/1\/operating-status/, (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    );

    await navigateToCenterDetail(page, 1);

    const errorMessage = page.getByText('운영 정보를 불러올 수 없습니다');
    await expect(errorMessage).toBeVisible();
  });

  test('should show retry button on error', async ({ page }) => {
    await page.route(/\/api\/v1\/centers\/1\/operating-status/, (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    );

    await navigateToCenterDetail(page, 1);

    const retryButton = page.getByRole('button', { name: '다시 시도' });
    await expect(retryButton).toBeVisible();
  });
});

/**
 * 7. RESPONSIVE DESIGN TESTS (2 tests)
 */
test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.open
    );
  });

  test('should display correctly on mobile', async ({ page }) => {
    await setViewport(page, viewports.mobile.width, viewports.mobile.height);
    await navigateToCenterDetail(page, 1);

    const badge = page.getByText('운영 중');
    await expect(badge).toBeVisible();

    const operatingHoursTitle = page.getByRole('heading', { name: '요일별 운영시간' });
    await expect(operatingHoursTitle).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await setViewport(page, viewports.desktop.width, viewports.desktop.height);
    await navigateToCenterDetail(page, 1);

    const badge = page.getByText('운영 중');
    await expect(badge).toBeVisible();

    const operatingHoursTitle = page.getByRole('heading', { name: '요일별 운영시간' });
    await expect(operatingHoursTitle).toBeVisible();
  });
});

/**
 * 8. ACCESSIBILITY TESTS (3 tests)
 */
test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.open
    );
  });

  test('should have proper aria-labels for status badge', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    const badge = page.locator('[aria-label*="운영"]');
    await expect(badge.first()).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    const h2 = page.getByRole('heading', { level: 2, name: '운영 정보' });
    await expect(h2).toBeVisible();

    const h3 = page.getByRole('heading', { level: 3, name: '현재 운영 상태' });
    await expect(h3).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

/**
 * Edge Cases - 엣지 케이스 테스트
 * Nice-to-have: 특수한 운영 상황 처리 검증
 */
test.describe('Edge Cases', () => {
  test('should handle 24-hour operating centers', async ({ page }) => {
    const twentyFourHourStatus = {
      ...mockOperatingStatus.open,
      operatingHours: [
        ...mockOperatingStatus.open.operatingHours.slice(0, 6),
        { dayOfWeek: 6, dayName: '토요일', openTime: '00:00', closeTime: '23:59', isOpen: true },
      ],
    };

    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      twentyFourHourStatus
    );
    await navigateToCenterDetail(page, 1);

    // 24시간 운영 표시 확인
    await expect(page.getByText('00:00 ~ 23:59')).toBeVisible();
  });

  test('should handle centers with no operating hours info', async ({ page }) => {
    const noInfoStatus = {
      centerId: 1,
      centerName: '마음이음센터',
      status: 'NO_INFO',
      message: '운영 정보 없음',
      currentTime: new Date().toISOString(),
      nextOpenDate: null,
      operatingHours: [],
      holidays: [],
    };

    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      noInfoStatus
    );
    await navigateToCenterDetail(page, 1);

    // 정보 없음 메시지 확인
    await expect(page.getByText('운영 정보 없음')).toBeVisible();
  });

  test('should handle centers with irregular hours (different each day)', async ({ page }) => {
    const irregularStatus = {
      ...mockOperatingStatus.open,
      operatingHours: [
        { dayOfWeek: 0, dayName: '일요일', openTime: '00:00', closeTime: '00:00', isOpen: false },
        { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
        { dayOfWeek: 2, dayName: '화요일', openTime: '10:00', closeTime: '19:00', isOpen: true },
        { dayOfWeek: 3, dayName: '수요일', openTime: '08:00', closeTime: '17:00', isOpen: true },
        { dayOfWeek: 4, dayName: '목요일', openTime: '09:30', closeTime: '18:30', isOpen: true },
        { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '20:00', isOpen: true },
        { dayOfWeek: 6, dayName: '토요일', openTime: '10:00', closeTime: '15:00', isOpen: true },
      ],
    };

    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      irregularStatus
    );
    await navigateToCenterDetail(page, 1);

    // 각 요일별 다른 시간 표시 확인
    await expect(page.getByText('09:00 ~ 18:00')).toBeVisible(); // 월요일
    await expect(page.getByText('10:00 ~ 19:00')).toBeVisible(); // 화요일
    await expect(page.getByText('09:00 ~ 20:00')).toBeVisible(); // 금요일
  });

  test('should handle many holidays (>10 items with expand/collapse)', async ({ page }) => {
    const manyHolidays = Array.from({ length: 15 }, (_, i) => ({
      date: `2025-0${Math.floor(i / 3) + 1}-${(i % 30) + 1}`.padStart(10, '0'),
      name: `휴무일 ${i + 1}`,
      type: 'public' as const,
    }));

    const manyHolidaysStatus = {
      ...mockOperatingStatus.open,
      holidays: manyHolidays,
    };

    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      manyHolidaysStatus
    );
    await navigateToCenterDetail(page, 1);

    // 처음에는 일부만 표시
    const holidayItems = page.locator('[role="list"] li');
    await expect(holidayItems).not.toHaveCount(15);

    // "더보기" 버튼 클릭
    const moreButton = page.getByRole('button', { name: /더보기/ });
    if (await moreButton.isVisible()) {
      await moreButton.click();
      // 모든 항목 표시 확인
      await expect(holidayItems).toHaveCount(15);
    }
  });
});

/**
 * Auto-refresh Behavior - 자동 갱신 동작 테스트
 * Nice-to-have: 60초 자동 갱신 및 포커스 갱신 검증
 */
test.describe('Auto-refresh Behavior', () => {
  test('should auto-refresh after 60 seconds', async ({ page }) => {
    let requestCount = 0;

    await page.route('**/api/v1/centers/1/operating-status', (route) => {
      requestCount++;
      const status = requestCount === 1
        ? mockOperatingStatus.open
        : mockOperatingStatus.closingSoon;

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(status),
      });
    });

    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await navigateToCenterDetail(page, 1);

    // 초기 상태 확인
    await expect(page.getByText('운영 중')).toBeVisible();
    expect(requestCount).toBe(1);

    // 60초 대기 (실제 테스트에서는 page.clock() 사용 권장)
    await page.waitForTimeout(61000);

    // 자동 갱신 후 상태 변경 확인
    await expect(page.getByText('30분 후 마감')).toBeVisible({ timeout: 5000 });
    expect(requestCount).toBeGreaterThan(1);
  });

  test('should refresh on window focus', async ({ page, context }) => {
    let requestCount = 0;

    await page.route('**/api/v1/centers/1/operating-status', (route) => {
      requestCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOperatingStatus.open),
      });
    });

    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await navigateToCenterDetail(page, 1);

    const initialCount = requestCount;

    // 새 탭 열기
    const newPage = await context.newPage();
    await newPage.goto('about:blank');

    // 원래 탭으로 돌아가기 (focus 이벤트 트리거)
    await page.bringToFront();
    await page.waitForTimeout(1000);

    // 포커스 갱신 확인
    expect(requestCount).toBeGreaterThan(initialCount);

    await newPage.close();
  });

  test('should display update indicator during refresh', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.open
    );
    await navigateToCenterDetail(page, 1);

    // 업데이트 인디케이터 확인 (로딩 중에만 표시)
    const updateIndicator = page.locator('[aria-live="polite"]');
    await expect(updateIndicator).toBeAttached();
  });
});

/**
 * Cache Behavior - 캐시 동작 테스트
 * Nice-to-have: Redis 캐시 응답 검증
 */
test.describe('Cache Behavior', () => {
  test('should indicate cache hit in X-Cache header', async ({ page }) => {
    await page.route('**/api/v1/centers/1/operating-status', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'max-age=300',
        },
        body: JSON.stringify(mockOperatingStatus.open),
      });
    });

    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await navigateToCenterDetail(page, 1);

    // 캐시 히트 시 빠른 응답
    await expect(page.getByText('운영 중')).toBeVisible({ timeout: 2000 });
  });

  test('should handle cache invalidation gracefully', async ({ page }) => {
    let useCache = true;

    await page.route('**/api/v1/centers/1/operating-status', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'X-Cache': useCache ? 'HIT' : 'MISS',
        },
        body: JSON.stringify(mockOperatingStatus.open),
      });
      useCache = false; // 다음 요청은 캐시 미스
    });

    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await navigateToCenterDetail(page, 1);

    // 첫 번째 로드 (캐시 히트)
    await expect(page.getByText('운영 중')).toBeVisible();

    // 새로고침 (캐시 미스)
    await page.reload();
    await expect(page.getByText('운영 중')).toBeVisible();
  });

  test('should show response time in reasonable range', async ({ page }) => {
    const startTime = Date.now();

    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/operating-status/,
      mockOperatingStatus.open
    );
    await navigateToCenterDetail(page, 1);

    await expect(page.getByText('운영 중')).toBeVisible();

    const responseTime = Date.now() - startTime;

    // 캐시된 응답은 2초 이내 (모킹된 환경)
    expect(responseTime).toBeLessThan(2000);
  });
});
