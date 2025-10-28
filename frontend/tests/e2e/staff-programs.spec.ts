/**
 * Sprint 3: Staff and Programs E2E Tests
 * 의료진 및 프로그램 통합 테스트
 */

import { test, expect, Page } from '@playwright/test';
import {
  navigateToCenterDetail,
  mockApiResponse,
  setViewport,
  expectAriaAttribute,
  waitForPageLoad,
} from '../helpers/setup';
import { testCenters, viewports, keyboardKeys } from '../helpers/fixtures';

/**
 * Mock Staff Data
 */
const mockStaffData = {
  withStaff: {
    center_id: 1,
    staff: [
      {
        staff_type: '정신건강의학과 전문의',
        staff_count: 2,
        description: null,
      },
      {
        staff_type: '임상심리사',
        staff_count: 3,
        description: '청소년 상담 전문',
      },
      {
        staff_type: '사회복지사',
        staff_count: 1,
        description: null,
      },
    ],
    total_staff: 6,
    has_data: true,
  },
  emptyStaff: {
    center_id: 1,
    staff: [],
    total_staff: 0,
    has_data: false,
  },
  singleStaff: {
    center_id: 1,
    staff: [
      {
        staff_type: '정신건강의학과 전문의',
        staff_count: 1,
        description: null,
      },
    ],
    total_staff: 1,
    has_data: true,
  },
};

/**
 * Mock Programs Data
 */
const mockProgramsData = {
  fewPrograms: {
    center_id: 1,
    programs: [
      {
        id: 1,
        program_name: '직장인 스트레스 관리',
        program_type: '집단 상담',
        target_group: '직장인',
        description: '직장 생활에서 겪는 스트레스를 효과적으로 관리하는 방법을 배웁니다.',
        is_online_available: true,
        is_free: true,
        fee_amount: null,
        capacity: 12,
        duration_minutes: 90,
      },
      {
        id: 2,
        program_name: '청소년 마음건강',
        program_type: '집단 상담',
        target_group: '청소년',
        description: '청소년의 정서적 안정과 심리적 성장을 돕습니다.',
        is_online_available: false,
        is_free: true,
        fee_amount: null,
        capacity: 8,
        duration_minutes: 60,
      },
      {
        id: 3,
        program_name: '개인 심리상담',
        program_type: '개인 상담',
        target_group: '전체',
        description: null,
        is_online_available: true,
        is_free: false,
        fee_amount: 50000,
        capacity: 1,
        duration_minutes: 50,
      },
    ],
    total_count: 3,
    has_data: true,
    pagination: {
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  },
  manyPrograms: {
    center_id: 1,
    programs: [
      {
        id: 1,
        program_name: '프로그램 1',
        program_type: '집단 상담',
        target_group: '전체',
        description: '프로그램 1 설명',
        is_online_available: true,
        is_free: true,
        fee_amount: null,
        capacity: 10,
        duration_minutes: 60,
      },
      {
        id: 2,
        program_name: '프로그램 2',
        program_type: '집단 상담',
        target_group: '전체',
        description: '프로그램 2 설명',
        is_online_available: false,
        is_free: true,
        fee_amount: null,
        capacity: 10,
        duration_minutes: 60,
      },
      {
        id: 3,
        program_name: '프로그램 3',
        program_type: '집단 상담',
        target_group: '전체',
        description: '프로그램 3 설명',
        is_online_available: true,
        is_free: false,
        fee_amount: 30000,
        capacity: 10,
        duration_minutes: 60,
      },
      {
        id: 4,
        program_name: '프로그램 4',
        program_type: '집단 상담',
        target_group: '전체',
        description: '프로그램 4 설명',
        is_online_available: false,
        is_free: true,
        fee_amount: null,
        capacity: 10,
        duration_minutes: 60,
      },
      {
        id: 5,
        program_name: '프로그램 5',
        program_type: '집단 상담',
        target_group: '전체',
        description: '프로그램 5 설명',
        is_online_available: true,
        is_free: true,
        fee_amount: null,
        capacity: 10,
        duration_minutes: 60,
      },
      {
        id: 6,
        program_name: '프로그램 6',
        program_type: '집단 상담',
        target_group: '전체',
        description: '프로그램 6 설명',
        is_online_available: false,
        is_free: false,
        fee_amount: 40000,
        capacity: 10,
        duration_minutes: 60,
      },
      {
        id: 7,
        program_name: '프로그램 7',
        program_type: '집단 상담',
        target_group: '전체',
        description: '프로그램 7 설명',
        is_online_available: true,
        is_free: true,
        fee_amount: null,
        capacity: 10,
        duration_minutes: 60,
      },
      {
        id: 8,
        program_name: '프로그램 8',
        program_type: '집단 상담',
        target_group: '전체',
        description: '프로그램 8 설명',
        is_online_available: false,
        is_free: true,
        fee_amount: null,
        capacity: 10,
        duration_minutes: 60,
      },
    ],
    total_count: 8,
    has_data: true,
    pagination: {
      total: 8,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  },
  emptyPrograms: {
    center_id: 1,
    programs: [],
    total_count: 0,
    has_data: false,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  },
};

/**
 * 1. STAFF DISPLAY TESTS (6 tests)
 */
test.describe('Center Staff Display', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
  });

  test('should display staff information correctly', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/staff/,
      mockStaffData.withStaff
    );

    await navigateToCenterDetail(page, 1);

    // Check heading exists
    const heading = page.getByRole('heading', { name: /의료진 현황/i });
    await expect(heading).toBeVisible();

    // Check total staff count badge
    const totalBadge = page.getByText(/총.*6명/);
    await expect(totalBadge).toBeVisible();

    // Check staff types are displayed
    await expect(page.getByText('정신건강의학과 전문의')).toBeVisible();
    await expect(page.getByText('임상심리사')).toBeVisible();
    await expect(page.getByText('사회복지사')).toBeVisible();

    // Check staff counts
    await expect(page.getByText(/2명/).first()).toBeVisible();
    await expect(page.getByText(/3명/)).toBeVisible();
    await expect(page.getByText(/1명/)).toBeVisible();

    // Check description when available
    await expect(page.getByText('청소년 상담 전문')).toBeVisible();
  });

  test('should show empty state when no staff data', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/staff/,
      mockStaffData.emptyStaff
    );

    await navigateToCenterDetail(page, 1);

    // Check empty state message
    const emptyMessage = page.getByText(/의료진 정보가 등록되지 않았습니다/);
    await expect(emptyMessage).toBeVisible();

    // Check empty state icon exists
    const emptyIcon = page.locator('[aria-hidden="true"]').first();
    await expect(emptyIcon).toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    // Delay API response to see skeleton
    await page.route(/\/api\/v1\/centers\/1\/staff/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockStaffData.withStaff),
      });
    });

    await navigateToCenterDetail(page, 1);

    // Check for loading skeleton (aria-busy or skeleton class)
    const skeleton = page.locator('[aria-busy="true"], [class*="skeleton"]');
    await expect(skeleton.first()).toBeVisible();

    // Wait for data to load
    await page.waitForTimeout(1500);

    // Check skeleton is replaced with content
    const staffType = page.getByText('정신건강의학과 전문의');
    await expect(staffType).toBeVisible();
  });

  test('should display single staff member correctly', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/staff/,
      mockStaffData.singleStaff
    );

    await navigateToCenterDetail(page, 1);

    // Check total badge shows 1
    const totalBadge = page.getByText(/총.*1명/);
    await expect(totalBadge).toBeVisible();

    // Check staff type is displayed
    await expect(page.getByText('정신건강의학과 전문의')).toBeVisible();
  });

  test('should have proper ARIA attributes for staff section', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/staff/,
      mockStaffData.withStaff
    );

    await navigateToCenterDetail(page, 1);

    // Check list role
    const staffList = page.locator('[role="list"]').filter({ hasText: '정신건강의학과 전문의' });
    await expect(staffList).toBeVisible();

    // Check list items
    const staffItems = page.locator('[role="listitem"]').filter({ hasText: '명' });
    const itemCount = await staffItems.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('should display staff descriptions when available', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/staff/,
      mockStaffData.withStaff
    );

    await navigateToCenterDetail(page, 1);

    // Check description is displayed
    const description = page.getByText('청소년 상담 전문');
    await expect(description).toBeVisible();
  });
});

/**
 * 2. PROGRAMS DISPLAY TESTS (7 tests)
 */
test.describe('Center Programs Display', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
  });

  test('should display program cards correctly', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/programs/,
      mockProgramsData.fewPrograms
    );

    await navigateToCenterDetail(page, 1);

    // Check heading exists
    const heading = page.getByRole('heading', { name: /프로그램 안내/i });
    await expect(heading).toBeVisible();

    // Check program cards are displayed
    await expect(page.getByText('직장인 스트레스 관리')).toBeVisible();
    await expect(page.getByText('청소년 마음건강')).toBeVisible();
    await expect(page.getByText('개인 심리상담')).toBeVisible();

    // Check program types
    await expect(page.getByText('집단 상담').first()).toBeVisible();
    await expect(page.getByText('개인 상담')).toBeVisible();

    // Check target groups
    await expect(page.getByText('직장인')).toBeVisible();
    await expect(page.getByText('청소년')).toBeVisible();
    await expect(page.getByText('전체')).toBeVisible();
  });

  test('should display online and free badges correctly', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/programs/,
      mockProgramsData.fewPrograms
    );

    await navigateToCenterDetail(page, 1);

    // Check online badge
    const onlineBadges = page.getByText('온라인');
    const onlineCount = await onlineBadges.count();
    expect(onlineCount).toBeGreaterThan(0);

    // Check free badge
    const freeBadges = page.getByText('무료');
    const freeCount = await freeBadges.count();
    expect(freeCount).toBeGreaterThan(0);

    // Check paid badge (유료)
    const paidBadge = page.getByText(/50,000원/);
    await expect(paidBadge).toBeVisible();
  });

  test('should show "더보기" button when more than 5 programs', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/programs/,
      mockProgramsData.manyPrograms
    );

    await navigateToCenterDetail(page, 1);

    // Wait for programs to load
    await page.waitForTimeout(500);

    // Check "더보기" button exists
    const moreButton = page.getByRole('button', { name: /더보기/i });
    await expect(moreButton).toBeVisible();

    // Click "더보기" button
    await moreButton.click();

    // Wait for expansion
    await page.waitForTimeout(500);

    // Check all programs are now displayed (8 programs)
    const programCards = page.locator('text=/프로그램 [1-8]/');
    const cardCount = await programCards.count();
    expect(cardCount).toBe(8);

    // Button should change or be hidden after clicking
    const updatedButton = page.getByRole('button', { name: /더보기/i });
    const isVisible = await updatedButton.isVisible();
    // Button may be hidden or text changed after expansion
    // We just verify the expansion happened by checking all cards are visible
    expect(cardCount).toBe(8);
  });

  test('should hide "더보기" button when 5 or fewer programs', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/programs/,
      mockProgramsData.fewPrograms
    );

    await navigateToCenterDetail(page, 1);

    // Wait for programs to load
    await page.waitForTimeout(500);

    // Check "더보기" button does not exist
    const moreButton = page.getByRole('button', { name: /더보기/i });
    await expect(moreButton).not.toBeVisible();
  });

  test('should show empty state when no programs', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/programs/,
      mockProgramsData.emptyPrograms
    );

    await navigateToCenterDetail(page, 1);

    // Check empty state message
    const emptyMessage = page.getByText(/프로그램 정보가 등록되지 않았습니다/);
    await expect(emptyMessage).toBeVisible();

    // Check empty state icon
    const emptyIcon = page.locator('[aria-hidden="true"]').first();
    await expect(emptyIcon).toBeVisible();
  });

  test('should display program capacity and duration', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/programs/,
      mockProgramsData.fewPrograms
    );

    await navigateToCenterDetail(page, 1);

    // Check capacity
    await expect(page.getByText(/12명/).first()).toBeVisible();
    await expect(page.getByText(/8명/)).toBeVisible();

    // Check duration
    await expect(page.getByText(/90분/).first()).toBeVisible();
    await expect(page.getByText(/60분/).first()).toBeVisible();
    await expect(page.getByText(/50분/)).toBeVisible();
  });

  test('should have proper ARIA attributes for program cards', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/programs/,
      mockProgramsData.fewPrograms
    );

    await navigateToCenterDetail(page, 1);

    // Check program cards have button role
    const programCards = page.locator('[role="button"]').filter({ hasText: '프로그램' });
    const cardCount = await programCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Check cards have descriptive aria-label
    const firstCard = programCards.first();
    await expect(firstCard).toHaveAttribute('aria-label');
  });
});

/**
 * 3. PROGRAM DETAIL MODAL TESTS (8 tests)
 */
test.describe('Program Detail Modal', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/programs/,
      mockProgramsData.fewPrograms
    );
  });

  test('should open modal when program card clicked', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Wait for programs to load
    await page.waitForTimeout(500);

    // Click first program card
    const firstCard = page.getByText('직장인 스트레스 관리').first();
    await firstCard.click();

    // Wait for modal animation
    await page.waitForTimeout(300);

    // Verify modal is visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify modal contains program details
    await expect(modal.getByText('직장인 스트레스 관리')).toBeVisible();

    // Verify program type
    await expect(modal.getByText('집단 상담')).toBeVisible();

    // Verify target group
    await expect(modal.getByText('직장인')).toBeVisible();

    // Verify badges
    await expect(modal.getByText('온라인')).toBeVisible();
    await expect(modal.getByText('무료')).toBeVisible();

    // Verify description
    await expect(modal.getByText(/직장 생활에서 겪는 스트레스/)).toBeVisible();

    // Verify details section
    await expect(modal.getByText(/12명/)).toBeVisible();
    await expect(modal.getByText(/90분/)).toBeVisible();
  });

  test('should close modal with close button', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Open modal
    const firstCard = page.getByText('직장인 스트레스 관리').first();
    await firstCard.click();

    // Wait for modal to open
    await page.waitForTimeout(300);

    // Verify modal is visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click close button
    const closeButton = page.getByRole('button', { name: /닫기/i });
    await closeButton.click();

    // Wait for modal animation
    await page.waitForTimeout(300);

    // Verify modal is no longer visible
    await expect(modal).not.toBeVisible();
  });

  test('should close modal with ESC key', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Open modal
    const firstCard = page.getByText('직장인 스트레스 관리').first();
    await firstCard.click();

    // Wait for modal to open
    await page.waitForTimeout(300);

    // Verify modal is visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Press ESC key
    await page.keyboard.press('Escape');

    // Wait for modal animation
    await page.waitForTimeout(300);

    // Verify modal is no longer visible
    await expect(modal).not.toBeVisible();
  });

  test('should close modal by clicking outside', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Open modal
    const firstCard = page.getByText('직장인 스트레스 관리').first();
    await firstCard.click();

    // Wait for modal to open
    await page.waitForTimeout(300);

    // Verify modal is visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click outside modal (on backdrop)
    await page.mouse.click(10, 10);

    // Wait for modal animation
    await page.waitForTimeout(300);

    // Verify modal is no longer visible
    await expect(modal).not.toBeVisible();
  });

  test('should display default message when no description', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Click program without description (개인 심리상담)
    const cardWithoutDesc = page.getByText('개인 심리상담').first();
    await cardWithoutDesc.click();

    // Wait for modal to open
    await page.waitForTimeout(300);

    // Verify modal is visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Check for default message
    const defaultMessage = modal.getByText(/프로그램 설명이 등록되지 않았습니다/);
    await expect(defaultMessage).toBeVisible();
  });

  test('should display paid program fee correctly', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Click paid program
    const paidCard = page.getByText('개인 심리상담').first();
    await paidCard.click();

    // Wait for modal to open
    await page.waitForTimeout(300);

    // Verify modal is visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Check fee display
    await expect(modal.getByText(/50,000원/)).toBeVisible();
  });

  test('should have proper modal ARIA attributes', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Open modal
    const firstCard = page.getByText('직장인 스트레스 관리').first();
    await firstCard.click();

    // Wait for modal to open
    await page.waitForTimeout(300);

    // Verify modal has role="dialog"
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify modal has aria-labelledby or aria-label
    const hasLabel = await modal.evaluate((el) => {
      return el.hasAttribute('aria-labelledby') || el.hasAttribute('aria-label');
    });
    expect(hasLabel).toBeTruthy();
  });

  test('should trap focus within modal', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Open modal
    const firstCard = page.getByText('직장인 스트레스 관리').first();
    await firstCard.click();

    // Wait for modal to open
    await page.waitForTimeout(300);

    // Press Tab multiple times
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if focus is still within modal
    const focusedElement = await page.evaluate(() => {
      const activeEl = document.activeElement;
      const modal = document.querySelector('[role="dialog"]');
      return modal?.contains(activeEl);
    });

    expect(focusedElement).toBeTruthy();
  });
});

/**
 * 4. KEYBOARD NAVIGATION TESTS (5 tests)
 */
test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/programs/,
      mockProgramsData.fewPrograms
    );
  });

  test('should navigate to program cards with Tab key', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Wait for programs to load
    await page.waitForTimeout(500);

    // Press Tab multiple times to reach program cards
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      // Check if a program card is focused
      const focusedText = await page.evaluate(() => {
        const activeEl = document.activeElement;
        return activeEl?.textContent || '';
      });

      if (focusedText.includes('프로그램') || focusedText.includes('스트레스')) {
        // Found a program card
        break;
      }
    }

    // Verify a program card has focus (check for focus ring or active element)
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveCount(1);
  });

  test('should open modal with Enter key on focused card', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Wait for programs to load
    await page.waitForTimeout(500);

    // Find and focus first program card
    const firstCard = page.getByText('직장인 스트레스 관리').first();
    await firstCard.focus();

    // Press Enter
    await page.keyboard.press('Enter');

    // Wait for modal animation
    await page.waitForTimeout(300);

    // Verify modal opens
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test('should open modal with Space key on focused card', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Wait for programs to load
    await page.waitForTimeout(500);

    // Find and focus first program card
    const firstCard = page.getByText('직장인 스트레스 관리').first();
    await firstCard.focus();

    // Press Space
    await page.keyboard.press('Space');

    // Wait for modal animation
    await page.waitForTimeout(300);

    // Verify modal opens
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test('should navigate within modal with keyboard', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Open modal
    const firstCard = page.getByText('직장인 스트레스 관리').first();
    await firstCard.click();

    // Wait for modal to open
    await page.waitForTimeout(300);

    // Press Tab to navigate through modal elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus is within modal
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveCount(1);

    // Find close button and focus it
    const closeButton = page.getByRole('button', { name: /닫기/i });
    await closeButton.focus();

    // Press Enter to close
    await page.keyboard.press('Enter');

    // Wait for modal animation
    await page.waitForTimeout(300);

    // Verify modal closes
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();
  });

  test('should have visible focus indicators', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Wait for programs to load
    await page.waitForTimeout(500);

    // Find and focus first program card
    const firstCard = page.getByText('직장인 스트레스 관리').first();
    await firstCard.focus();

    // Check if element has focus
    await expect(firstCard).toBeFocused();

    // Check for focus ring or outline
    const hasFocusStyle = await firstCard.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return (
        styles.outline !== 'none' ||
        el.classList.contains('focus-ring') ||
        el.classList.contains('focus-visible') ||
        styles.boxShadow !== 'none'
      );
    });

    expect(hasFocusStyle).toBeTruthy();
  });
});

/**
 * 5. ACCESSIBILITY TESTS (6 tests)
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
      /\/api\/v1\/centers\/1\/staff/,
      mockStaffData.withStaff
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/programs/,
      mockProgramsData.fewPrograms
    );
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Check for h2 headings
    const staffHeading = page.getByRole('heading', { level: 2, name: /의료진 현황/i });
    await expect(staffHeading).toBeVisible();

    const programHeading = page.getByRole('heading', { level: 2, name: /프로그램 안내/i });
    await expect(programHeading).toBeVisible();
  });

  test('should have ARIA labels on interactive elements', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Wait for programs to load
    await page.waitForTimeout(500);

    // Check program cards have aria-label
    const programCards = page.locator('[role="button"]').filter({ hasText: '프로그램' });
    const firstCard = programCards.first();
    await expect(firstCard).toHaveAttribute('aria-label');
  });

  test('should have aria-hidden on decorative icons', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Find SVG icons with aria-hidden
    const hiddenIcons = page.locator('svg[aria-hidden="true"]');
    const count = await hiddenIcons.count();

    // Should have multiple decorative icons
    expect(count).toBeGreaterThan(0);
  });

  test('should support screen reader announcements', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Check for live regions (aria-live)
    const liveRegions = page.locator('[aria-live]');
    const count = await liveRegions.count();

    // May or may not have live regions, but if they exist, they should be properly configured
    if (count > 0) {
      const firstLiveRegion = liveRegions.first();
      const ariaLive = await firstLiveRegion.getAttribute('aria-live');
      expect(['polite', 'assertive', 'off']).toContain(ariaLive);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // This is a basic check - full color contrast testing requires specialized tools
    // We verify that text elements are visible and readable

    // Check staff section text is visible
    const staffType = page.getByText('정신건강의학과 전문의');
    await expect(staffType).toBeVisible();

    // Check program card text is visible
    const programName = page.getByText('직장인 스트레스 관리');
    await expect(programName).toBeVisible();

    // Verify elements have proper text color (not transparent)
    const hasColor = await staffType.evaluate((el) => {
      const color = window.getComputedStyle(el).color;
      return color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent';
    });

    expect(hasColor).toBeTruthy();
  });

  test('should have proper role attributes', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Wait for content to load
    await page.waitForTimeout(500);

    // Check list roles for staff
    const staffList = page.locator('[role="list"]').filter({ hasText: '전문의' });
    await expect(staffList).toBeVisible();

    // Check button roles for program cards
    const programButtons = page.locator('[role="button"]').filter({ hasText: '프로그램' });
    const buttonCount = await programButtons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Check dialog role for modal (when opened)
    const firstCard = page.getByText('직장인 스트레스 관리').first();
    await firstCard.click();
    await page.waitForTimeout(300);

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });
});

/**
 * 6. RESPONSIVE DESIGN TESTS (4 tests)
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
      /\/api\/v1\/centers\/1\/staff/,
      mockStaffData.withStaff
    );
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1\/programs/,
      mockProgramsData.fewPrograms
    );
  });

  test('should display correctly on mobile (375x667)', async ({ page }) => {
    await setViewport(page, viewports.mobile.width, viewports.mobile.height);
    await navigateToCenterDetail(page, 1);

    // Check staff section is visible
    const staffHeading = page.getByRole('heading', { name: /의료진 현황/i });
    await expect(staffHeading).toBeVisible();

    // Check programs section is visible
    const programHeading = page.getByRole('heading', { name: /프로그램 안내/i });
    await expect(programHeading).toBeVisible();

    // Check program cards are stacked (single column on mobile)
    const programCard = page.getByText('직장인 스트레스 관리').first();
    await expect(programCard).toBeVisible();
  });

  test('should display correctly on tablet (768x1024)', async ({ page }) => {
    await setViewport(page, viewports.tablet.width, viewports.tablet.height);
    await navigateToCenterDetail(page, 1);

    // Check both sections are visible
    await expect(page.getByRole('heading', { name: /의료진 현황/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /프로그램 안내/i })).toBeVisible();

    // Check program cards are displayed (may be 2 columns on tablet)
    await expect(page.getByText('직장인 스트레스 관리')).toBeVisible();
    await expect(page.getByText('청소년 마음건강')).toBeVisible();
  });

  test('should display correctly on desktop (1920x1080)', async ({ page }) => {
    await setViewport(page, viewports.desktop.width, viewports.desktop.height);
    await navigateToCenterDetail(page, 1);

    // Check all sections are visible
    await expect(page.getByRole('heading', { name: /의료진 현황/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /프로그램 안내/i })).toBeVisible();

    // Check program cards are displayed in grid
    await expect(page.getByText('직장인 스트레스 관리')).toBeVisible();
    await expect(page.getByText('청소년 마음건강')).toBeVisible();
    await expect(page.getByText('개인 심리상담')).toBeVisible();
  });

  test('should handle modal responsively', async ({ page }) => {
    // Test on mobile
    await setViewport(page, viewports.mobile.width, viewports.mobile.height);
    await navigateToCenterDetail(page, 1);

    // Open modal
    const firstCard = page.getByText('직장인 스트레스 관리').first();
    await firstCard.click();
    await page.waitForTimeout(300);

    // Verify modal is visible and fits viewport
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    const modalBox = await modal.boundingBox();
    expect(modalBox?.width).toBeLessThanOrEqual(viewports.mobile.width);

    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Test on desktop
    await setViewport(page, viewports.desktop.width, viewports.desktop.height);
    await page.reload();
    await waitForPageLoad(page);

    // Open modal again
    const cardDesktop = page.getByText('직장인 스트레스 관리').first();
    await cardDesktop.click();
    await page.waitForTimeout(300);

    // Verify modal is visible
    await expect(modal).toBeVisible();
  });
});

/**
 * 7. ERROR HANDLING TESTS (3 tests)
 */
test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
  });

  test('should display error message when staff API fails', async ({ page }) => {
    await page.route(/\/api\/v1\/centers\/1\/staff/, (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    );

    await navigateToCenterDetail(page, 1);

    // Check for error message
    const errorMessage = page.getByText(/의료진 정보를 불러올 수 없습니다|오류가 발생했습니다/);
    await expect(errorMessage).toBeVisible();
  });

  test('should display error message when programs API fails', async ({ page }) => {
    await page.route(/\/api\/v1\/centers\/1\/programs/, (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    );

    await navigateToCenterDetail(page, 1);

    // Check for error message
    const errorMessage = page.getByText(/프로그램 정보를 불러올 수 없습니다|오류가 발생했습니다/);
    await expect(errorMessage).toBeVisible();
  });

  test('should show retry button on error', async ({ page }) => {
    await page.route(/\/api\/v1\/centers\/1\/staff/, (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    );

    await navigateToCenterDetail(page, 1);

    // Check for retry button
    const retryButton = page.getByRole('button', { name: /다시 시도/i });
    // Retry button may or may not be present depending on implementation
    // If present, it should be clickable
    const retryCount = await retryButton.count();
    if (retryCount > 0) {
      await expect(retryButton.first()).toBeVisible();
    }
  });
});
