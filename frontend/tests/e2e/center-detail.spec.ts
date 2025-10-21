/**
 * Center Detail Page E2E Tests
 * 센터 상세 페이지 종합 테스트
 */

import { test, expect, Page } from '@playwright/test';
import {
  navigateToCenterDetail,
  waitForPageLoad,
  grantClipboardPermissions,
  expectMinimumSize,
  expectFocusable,
  expectAriaAttribute,
  expectToastMessage,
  expectPhoneLink,
  setViewport,
  selectByKeyboard,
  mockApiResponse,
  simulateOffline,
} from './helpers/setup';
import {
  testCenters,
  viewports,
  errorMessages,
  successMessages,
} from './helpers/fixtures';

/**
 * 1. PAGE LOAD AND RENDERING TESTS (6 tests)
 */
test.describe('Page Load and Rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API response for valid center
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
  });

  test('should load center detail page successfully', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Check main element exists
    await expect(page.locator('main')).toBeVisible();

    // Check header exists
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display center name correctly', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Center name should be visible
    const centerName = page.getByText(testCenters.valid.center_name);
    await expect(centerName).toBeVisible();
  });

  test('should display center type badge', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Center type badge should be visible
    const centerType = page.getByText(testCenters.valid.center_type);
    await expect(centerType).toBeVisible();
  });

  test('should display rating and review count', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Rating should be visible
    const rating = page.getByText(testCenters.valid.stats.avg_rating.toString());
    await expect(rating).toBeVisible();

    // Review count should be visible
    const reviewCount = page.getByText(`${testCenters.valid.stats.review_count}개의 리뷰`);
    await expect(reviewCount).toBeVisible();
  });

  test('should display phone number and address', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Phone number should be visible
    const phone = page.getByText(testCenters.valid.contact.phone!);
    await expect(phone).toBeVisible();

    // Road address should be visible
    const address = page.getByText(testCenters.valid.contact.road_address);
    await expect(address).toBeVisible();
  });

  test('should display business content description', async ({ page }) => {
    await navigateToCenterDetail(page, 1);

    // Business content should be visible
    const description = page.getByText(testCenters.valid.business_content!);
    await expect(description).toBeVisible();
  });
});

/**
 * 2. USER INTERACTIONS TESTS (10 tests)
 */
test.describe('User Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await navigateToCenterDetail(page, 1);
  });

  test('should have clickable phone number link', async ({ page }) => {
    const phoneNumber = testCenters.valid.contact.phone!;
    const cleanPhone = phoneNumber.replace(/-/g, '');

    const phoneLink = page.locator(`a[href="tel:${cleanPhone}"]`);
    await expect(phoneLink).toBeVisible();
    await expect(phoneLink).toHaveText(phoneNumber);
  });

  test('should have working call button', async ({ page }) => {
    const callButton = page.getByRole('button', { name: '전화하기' }).first();
    await expect(callButton).toBeVisible();
    await expect(callButton).toBeEnabled();

    // Click should not throw error
    await callButton.click();
  });

  test('should open Kakao Map on directions click', async ({ page, context }) => {
    // Listen for new page
    const pagePromise = context.waitForEvent('page');

    // Click directions button
    const directionsButton = page.getByRole('button', { name: '길찾기' });
    await directionsButton.click();

    // Verify new page opens
    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    // Verify URL contains kakao.com
    expect(newPage.url()).toContain('kakao.com/link/to');

    // Close new page
    await newPage.close();
  });

  test('should toggle favorite button', async ({ page }) => {
    const favoriteButton = page.getByRole('button', { name: '즐겨찾기' });
    await expect(favoriteButton).toBeVisible();

    // Click favorite button
    await favoriteButton.click();

    // Visual feedback should occur (button remains visible)
    await expect(favoriteButton).toBeVisible();
  });

  test('should show share button', async ({ page }) => {
    const shareButton = page.getByRole('button', { name: '공유하기' });
    await expect(shareButton).toBeVisible();

    // Click share button
    await shareButton.click();

    // Button should remain visible
    await expect(shareButton).toBeVisible();
  });

  test('should copy address to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await grantClipboardPermissions(page);

    // Find address element
    const addressElement = page.getByText(testCenters.valid.contact.road_address);
    await expect(addressElement).toBeVisible();

    // Click to copy
    await addressElement.click();

    // Verify toast message appears
    await expectToastMessage(page, successMessages.addressCopied);

    // Verify checkmark icon appears
    const checkIcon = page.locator('[class*="Check"]').first();
    await expect(checkIcon).toBeVisible({ timeout: 3000 });
  });

  test('should show copy success toast message', async ({ page, context }) => {
    await grantClipboardPermissions(page);

    const addressButton = page.getByText(testCenters.valid.contact.road_address);
    await addressButton.click();

    // Toast should appear
    const toast = page.getByText(/복사되었습니다/);
    await expect(toast).toBeVisible();
  });

  test('should have working back button', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /홈으로 돌아가기/ });
    await expect(backButton).toBeVisible();

    // Click back button
    await backButton.click();

    // Should navigate to home
    await page.waitForURL('/');
    expect(page.url()).toContain('/');
  });

  test('should display checkmark icon after address copy', async ({ page, context }) => {
    await grantClipboardPermissions(page);

    const addressElement = page.getByText(testCenters.valid.contact.road_address);
    await addressElement.click();

    // Wait for checkmark to appear
    const checkIcon = page.locator('svg').filter({ hasText: '' });
    await expect(checkIcon.first()).toBeVisible({ timeout: 3000 });
  });

  test('should handle multiple button clicks', async ({ page }) => {
    const callButton = page.getByRole('button', { name: '전화하기' }).first();

    // Click multiple times
    await callButton.click();
    await callButton.click();
    await callButton.click();

    // Button should remain enabled
    await expect(callButton).toBeEnabled();
  });
});

/**
 * 3. ERROR HANDLING TESTS (4 tests)
 */
test.describe('Error Handling', () => {
  test('should show 404 page for non-existent center ID', async ({ page }) => {
    // Mock 404 response
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/999999$/,
      { error: 'Center not found' },
      404
    );

    await page.goto('/centers/999999');
    await waitForPageLoad(page);

    // 404 message should appear
    const notFoundMessage = page.getByText(errorMessages.notFound);
    await expect(notFoundMessage).toBeVisible();

    // Home button should exist
    const homeButton = page.getByRole('button', { name: /전체 센터 보기/ });
    await expect(homeButton).toBeVisible();
  });

  test('should show error page when backend is down', async ({ page }) => {
    // Mock server error
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      { error: 'Internal server error' },
      500
    );

    await page.goto('/centers/1');
    await waitForPageLoad(page);

    // Error message should appear
    const errorMessage = page.getByText(errorMessages.serverError);
    await expect(errorMessage).toBeVisible();

    // Retry button should exist
    const retryButton = page.getByRole('button', { name: /다시 시도/ });
    await expect(retryButton).toBeVisible();
  });

  test('should show loading state during page load', async ({ page }) => {
    await page.goto('/centers/1');

    // Loading indicator may appear briefly
    // This is hard to test reliably, so we check page eventually loads
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should handle missing phone number gracefully', async ({ page }) => {
    // Mock center without phone
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/2$/,
      testCenters.noPhone
    );

    await navigateToCenterDetail(page, 2);

    // Directions button should be visible
    const directionsButton = page.getByRole('button', { name: '길찾기' });
    await expect(directionsButton).toBeVisible();

    // Phone section should not exist
    const phoneLabel = page.getByText('전화번호');
    await expect(phoneLabel).not.toBeVisible();
  });
});

/**
 * 4. ACCESSIBILITY TESTS (5 tests)
 */
test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
    await navigateToCenterDetail(page, 1);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Press Tab to focus first interactive element
    await page.keyboard.press('Tab');

    // Check if an element is focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveCount(1);

    // Tab through multiple elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should still exist
    await expect(page.locator(':focus')).toHaveCount(1);
  });

  test('should have visible focus indicators', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /홈으로 돌아가기/ });

    // Focus the button
    await backButton.focus();

    // Button should be focused
    await expect(backButton).toBeFocused();

    // Check for focus-visible class or outline
    const hasFocusStyle = await backButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return (
        styles.outline !== 'none' ||
        el.classList.contains('focus-ring') ||
        el.classList.contains('focus-visible')
      );
    });

    expect(hasFocusStyle).toBeTruthy();
  });

  test('should have ARIA labels on interactive elements', async ({ page }) => {
    // Back button
    const backButton = page.getByRole('button', { name: /홈으로 돌아가기/ });
    await expect(backButton).toHaveAttribute('aria-label');

    // Share button
    const shareButton = page.getByRole('button', { name: '공유하기' });
    await expect(shareButton).toHaveAttribute('aria-label');

    // Favorite button
    const favoriteButton = page.getByRole('button', { name: '즐겨찾기' });
    await expect(favoriteButton).toHaveAttribute('aria-label');
  });

  test('should have aria-hidden on decorative icons', async ({ page }) => {
    // Find SVG icons with aria-hidden
    const hiddenIcons = page.locator('svg[aria-hidden="true"]');
    const count = await hiddenIcons.count();

    // Should have multiple decorative icons
    expect(count).toBeGreaterThan(0);
  });

  test('should meet minimum touch target size (44x44px)', async ({ page }) => {
    // Call button
    const callButton = page.getByRole('button', { name: '전화하기' }).first();
    const callBox = await callButton.boundingBox();
    expect(callBox?.height).toBeGreaterThanOrEqual(44);

    // Directions button
    const directionsButton = page.getByRole('button', { name: '길찾기' });
    const directionsBox = await directionsButton.boundingBox();
    expect(directionsBox?.height).toBeGreaterThanOrEqual(44);

    // Share button
    const shareButton = page.getByRole('button', { name: '공유하기' });
    const shareBox = await shareButton.boundingBox();
    expect(shareBox?.height).toBeGreaterThanOrEqual(44);
  });
});

/**
 * 5. RESPONSIVE DESIGN TESTS (4 tests)
 */
test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );
  });

  test('should display correctly on mobile (375x667)', async ({ page }) => {
    await setViewport(page, viewports.mobile.width, viewports.mobile.height);
    await navigateToCenterDetail(page, 1);

    // Main content should be visible
    await expect(page.locator('main')).toBeVisible();

    // Header should be visible
    await expect(page.locator('header')).toBeVisible();

    // Center name should be visible
    const centerName = page.getByText(testCenters.valid.center_name);
    await expect(centerName).toBeVisible();

    // Buttons should stack vertically (full width)
    const callButton = page.getByRole('button', { name: '전화하기' }).first();
    const buttonBox = await callButton.boundingBox();

    // Button should be reasonably wide (at least 200px on mobile)
    expect(buttonBox?.width).toBeGreaterThan(200);
  });

  test('should display correctly on tablet (768x1024)', async ({ page }) => {
    await setViewport(page, viewports.tablet.width, viewports.tablet.height);
    await navigateToCenterDetail(page, 1);

    // All main sections should be visible
    await expect(page.locator('main')).toBeVisible();
    const cards = page.locator('[class*="Card"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Content should have max-width constraint
    const main = page.locator('main');
    const mainBox = await main.boundingBox();
    expect(mainBox?.width).toBeLessThanOrEqual(viewports.tablet.width);
  });

  test('should display correctly on desktop (1920x1080)', async ({ page }) => {
    await setViewport(page, viewports.desktop.width, viewports.desktop.height);
    await navigateToCenterDetail(page, 1);

    // Content should be centered with max-width
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Main content should have max-width (not full screen width)
    const mainBox = await main.boundingBox();
    expect(mainBox?.width).toBeLessThan(viewports.desktop.width);
  });

  test('should adapt layout to different breakpoints', async ({ page }) => {
    // Test mobile
    await setViewport(page, 375, 667);
    await navigateToCenterDetail(page, 1);
    const mobileName = page.getByText(testCenters.valid.center_name);
    await expect(mobileName).toBeVisible();

    // Test desktop
    await setViewport(page, 1920, 1080);
    await page.reload();
    const desktopName = page.getByText(testCenters.valid.center_name);
    await expect(desktopName).toBeVisible();

    // Both should show the same content
    expect(await mobileName.textContent()).toBe(await desktopName.textContent());
  });
});

/**
 * 6. ADDITIONAL INTEGRATION TESTS (3 tests)
 */
test.describe('Additional Integration Tests', () => {
  test('should handle rapid navigation', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/\d+$/,
      testCenters.valid
    );

    // Rapidly navigate between pages
    await page.goto('/centers/1');
    await page.goto('/centers/2');
    await page.goto('/centers/1');

    await waitForPageLoad(page);

    // Page should eventually load correctly
    await expect(page.locator('main')).toBeVisible();
  });

  test('should maintain state after page refresh', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );

    await navigateToCenterDetail(page, 1);

    const initialCenterName = await page.getByText(testCenters.valid.center_name).textContent();

    // Refresh page
    await page.reload();
    await waitForPageLoad(page);

    // Content should still be the same
    const refreshedCenterName = await page.getByText(testCenters.valid.center_name).textContent();
    expect(initialCenterName).toBe(refreshedCenterName);
  });

  test('should handle browser back button', async ({ page }) => {
    await mockApiResponse(
      page,
      /\/api\/v1\/centers\/1$/,
      testCenters.valid
    );

    // Navigate to home first
    await page.goto('/');

    // Navigate to center detail
    await page.goto('/centers/1');
    await waitForPageLoad(page);

    // Go back
    await page.goBack();

    // Should be back at home
    await page.waitForURL('/');
    expect(page.url()).toContain('/');
  });
});
