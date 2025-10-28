/**
 * Review Flow E2E Tests
 * Sprint 4: Review and Rating System - Week 2 Day 10
 *
 * Comprehensive end-to-end tests for review functionality including:
 * - Review display (ReviewSummary, ReviewList)
 * - Review creation flow
 * - Review reactions (helpful/unhelpful)
 * - Review editing and deletion
 * - Sorting and infinite scroll
 * - Form validation
 * - Authentication checks
 */

import { test, expect, Page } from '@playwright/test';

// Mock data for tests
const mockCenter = {
  id: 1,
  center_name: '강남구정신건강복지센터',
  center_type: '정신건강복지센터',
  stats: {
    avg_rating: 4.5,
    review_count: 10,
  },
};

const mockReviews = [
  {
    id: 1,
    rating: 5,
    title: '매우 만족스러운 상담',
    content: '상담사분이 정말 친절하시고 전문적이었어요. 많은 도움이 되었습니다.',
    visit_date: '2024-10-01',
    helpful_count: 15,
    unhelpful_count: 2,
    my_reaction: null,
    is_my_review: false,
    user: {
      id: 101,
      nickname: '김민수',
      avatar_url: null,
    },
    created_at: '2024-10-15T10:00:00Z',
  },
  {
    id: 2,
    rating: 4,
    title: '좋은 프로그램',
    content: '다양한 프로그램이 있어서 좋았습니다. 추천합니다.',
    visit_date: null,
    helpful_count: 8,
    unhelpful_count: 1,
    my_reaction: null,
    is_my_review: true, // User's own review
    user: {
      id: 1,
      nickname: '테스트유저',
      avatar_url: null,
    },
    created_at: '2024-10-10T14:30:00Z',
  },
];

const mockUser = {
  id: 1,
  email: 'test@example.com',
  nickname: '테스트유저',
  is_active: true,
};

/**
 * Helper Functions
 */

async function mockApiResponses(page: Page) {
  // Mock center details
  await page.route('**/api/v1/centers/1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCenter),
    });
  });

  // Mock reviews list
  await page.route('**/api/v1/centers/1/reviews*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reviews: mockReviews,
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_count: 2,
          has_next: false,
          has_prev: false,
        },
      }),
    });
  });

  // Mock auth check
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser),
    });
  });
}

async function mockUnauthenticated(page: Page) {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unauthorized' }),
    });
  });
}

async function navigateToCenterWithReviews(page: Page) {
  await mockApiResponses(page);
  await page.goto('/centers/1');
  await page.waitForLoadState('networkidle');
}

/**
 * 1. REVIEW DISPLAY TESTS (5 tests)
 */
test.describe('Review Display', () => {
  test('should display ReviewSummary with correct rating and count', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Check average rating display
    const ratingText = page.getByText('4.5');
    await expect(ratingText).toBeVisible();

    // Check review count
    const reviewCountText = page.getByText('10개의 리뷰');
    await expect(reviewCountText).toBeVisible();

    // Check star rating visual
    const stars = page.locator('[role="img"][aria-label*="별점"]').first();
    await expect(stars).toBeVisible();
  });

  test('should display ReviewList with all reviews', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Check if both reviews are displayed
    const review1Title = page.getByText('매우 만족스러운 상담');
    await expect(review1Title).toBeVisible();

    const review2Title = page.getByText('좋은 프로그램');
    await expect(review2Title).toBeVisible();

    // Check review count indicator
    const totalCount = page.getByText(/총.*2.*개의 리뷰/);
    await expect(totalCount).toBeVisible();
  });

  test('should display ReviewCard with author info and content', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Check author name
    const authorName = page.getByText('김민수');
    await expect(authorName).toBeVisible();

    // Check review content
    const content = page.getByText(/상담사분이 정말 친절하시고/);
    await expect(content).toBeVisible();

    // Check rating stars
    const ratingLabel = page.locator('[aria-label="별점 5점"]').first();
    await expect(ratingLabel).toBeVisible();

    // Check visit date badge
    const visitDate = page.getByText(/방문일: 2024년 10월 1일/);
    await expect(visitDate).toBeVisible();
  });

  test('should display reaction buttons with counts', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Find helpful button with count
    const helpfulButton = page.getByRole('button', { name: /이 리뷰가 도움돼요/ }).first();
    await expect(helpfulButton).toBeVisible();
    await expect(helpfulButton).toContainText('15');

    // Find unhelpful button with count
    const unhelpfulButton = page.getByRole('button', { name: /이 리뷰가 도움안돼요/ }).first();
    await expect(unhelpfulButton).toBeVisible();
    await expect(unhelpfulButton).toContainText('2');
  });

  test('should show EmptyReviews when no reviews exist', async ({ page }) => {
    // Mock empty reviews response
    await page.route('**/api/v1/centers/1/reviews*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [],
          pagination: {
            current_page: 1,
            total_pages: 0,
            total_count: 0,
            has_next: false,
            has_prev: false,
          },
        }),
      });
    });

    await page.goto('/centers/1');
    await page.waitForLoadState('networkidle');

    // Check empty state message
    const emptyMessage = page.getByText(/아직 작성된 리뷰가 없습니다/);
    await expect(emptyMessage).toBeVisible();

    // Check CTA button
    const ctaButton = page.getByRole('button', { name: /첫 리뷰 작성하기/ });
    await expect(ctaButton).toBeVisible();
  });
});

/**
 * 2. REVIEW CREATION FLOW TESTS (6 tests)
 */
test.describe('Review Creation Flow', () => {
  test('should open review modal when clicking write button', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Click write review button
    const writeButton = page.getByRole('button', { name: /리뷰 작성/ });
    await writeButton.click();

    // Modal should appear
    const modalTitle = page.getByRole('heading', { name: '리뷰 작성' });
    await expect(modalTitle).toBeVisible();

    // Form fields should be visible
    await expect(page.getByLabel(/별점/)).toBeVisible();
    await expect(page.getByPlaceholder(/리뷰 제목을 입력하세요/)).toBeVisible();
    await expect(page.getByPlaceholder(/센터에 대한 솔직한 리뷰/)).toBeVisible();
  });

  test('should successfully create a new review', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Mock create review API
    await page.route('**/api/v1/centers/1/reviews', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockReviews[0],
            id: 3,
            rating: 5,
            title: '테스트 리뷰',
            content: '이것은 테스트 리뷰입니다. 최소 10자 이상 작성.',
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Open modal
    const writeButton = page.getByRole('button', { name: /리뷰 작성/ });
    await writeButton.click();

    // Fill form
    // Select 5 stars
    const stars = page.locator('[role="img"][aria-label*="별점"]').first();
    const starButtons = stars.locator('[role="button"]');
    await starButtons.nth(4).click(); // 5th star

    // Fill title
    await page.getByPlaceholder(/리뷰 제목을 입력하세요/).fill('테스트 리뷰');

    // Fill content (minimum 10 characters)
    await page
      .getByPlaceholder(/센터에 대한 솔직한 리뷰/)
      .fill('이것은 테스트 리뷰입니다. 최소 10자 이상 작성.');

    // Submit
    const submitButton = page.getByRole('button', { name: /등록/ });
    await submitButton.click();

    // Modal should close
    await expect(page.getByRole('heading', { name: '리뷰 작성' })).not.toBeVisible();

    // Success toast should appear
    const toast = page.getByText(/리뷰가 등록되었습니다/);
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields - rating', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    const writeButton = page.getByRole('button', { name: /리뷰 작성/ });
    await writeButton.click();

    // Skip rating, fill only content
    await page
      .getByPlaceholder(/센터에 대한 솔직한 리뷰/)
      .fill('별점을 선택하지 않은 테스트');

    // Try to submit
    const submitButton = page.getByRole('button', { name: /등록/ });
    await submitButton.click();

    // Error message should appear
    const errorMessage = page.getByText(/별점을 선택해주세요/);
    await expect(errorMessage).toBeVisible();
  });

  test('should validate minimum content length (10 characters)', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    const writeButton = page.getByRole('button', { name: /리뷰 작성/ });
    await writeButton.click();

    // Select rating
    const stars = page.locator('[role="img"][aria-label*="별점"]').first();
    const starButtons = stars.locator('[role="button"]');
    await starButtons.nth(4).click();

    // Fill content with less than 10 characters
    await page.getByPlaceholder(/센터에 대한 솔직한 리뷰/).fill('짧음');

    // Try to submit
    const submitButton = page.getByRole('button', { name: /등록/ });
    await submitButton.click();

    // Error message should appear
    const errorMessage = page.getByText(/최소 10자 이상/);
    await expect(errorMessage).toBeVisible();
  });

  test('should validate maximum content length (1000 characters)', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    const writeButton = page.getByRole('button', { name: /리뷰 작성/ });
    await writeButton.click();

    // Fill content with more than 1000 characters
    const longContent = 'a'.repeat(1001);
    await page.getByPlaceholder(/센터에 대한 솔직한 리뷰/).fill(longContent);

    // Character count should show red
    const charCount = page.getByText(/1001 \/ 1000/);
    await expect(charCount).toHaveClass(/text-destructive/);
  });

  test('should close modal on cancel button click', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    const writeButton = page.getByRole('button', { name: /리뷰 작성/ });
    await writeButton.click();

    // Fill some data
    await page.getByPlaceholder(/리뷰 제목을 입력하세요/).fill('테스트');

    // Click cancel
    const cancelButton = page.getByRole('button', { name: /취소/ });
    await cancelButton.click();

    // Modal should close
    await expect(page.getByRole('heading', { name: '리뷰 작성' })).not.toBeVisible();
  });
});

/**
 * 3. REVIEW REACTIONS TESTS (4 tests)
 */
test.describe('Review Reactions', () => {
  test('should toggle helpful reaction on click', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Mock reaction API
    await page.route('**/api/v1/reviews/1/reaction', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockReviews[0],
          helpful_count: 16,
          my_reaction: 'helpful',
        }),
      });
    });

    // Click helpful button
    const helpfulButton = page.getByRole('button', { name: /이 리뷰가 도움돼요/ }).first();
    await helpfulButton.click();

    // Button should show pressed state
    await expect(helpfulButton).toHaveAttribute('aria-pressed', 'true');

    // Count should increase (optimistic update)
    await expect(helpfulButton).toContainText('16');
  });

  test('should toggle unhelpful reaction on click', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Mock reaction API
    await page.route('**/api/v1/reviews/1/reaction', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockReviews[0],
          unhelpful_count: 3,
          my_reaction: 'unhelpful',
        }),
      });
    });

    // Click unhelpful button
    const unhelpfulButton = page.getByRole('button', { name: /이 리뷰가 도움안돼요/ }).first();
    await unhelpfulButton.click();

    // Button should show pressed state
    await expect(unhelpfulButton).toHaveAttribute('aria-pressed', 'true');

    // Count should increase (optimistic update)
    await expect(unhelpfulButton).toContainText('3');
  });

  test('should show optimistic update immediately', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Delay API response to test optimistic update
    await page.route('**/api/v1/reviews/1/reaction', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockReviews[0],
          helpful_count: 16,
          my_reaction: 'helpful',
        }),
      });
    });

    const helpfulButton = page.getByRole('button', { name: /이 리뷰가 도움돼요/ }).first();
    const initialCount = await helpfulButton.textContent();

    // Click and verify immediate update
    await helpfulButton.click();

    // Count should change immediately (before API response)
    await expect(helpfulButton).not.toContainText(initialCount!);
  });

  test('should remove reaction when clicking same button again', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Mock toggle reaction (click twice)
    let clickCount = 0;
    await page.route('**/api/v1/reviews/1/reaction', async (route) => {
      clickCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockReviews[0],
          helpful_count: clickCount === 1 ? 16 : 15,
          my_reaction: clickCount === 1 ? 'helpful' : null,
        }),
      });
    });

    const helpfulButton = page.getByRole('button', { name: /이 리뷰가 도움돼요/ }).first();

    // First click - add reaction
    await helpfulButton.click();
    await expect(helpfulButton).toHaveAttribute('aria-pressed', 'true');

    // Second click - remove reaction
    await helpfulButton.click();
    await expect(helpfulButton).toHaveAttribute('aria-pressed', 'false');
  });
});

/**
 * 4. REVIEW EDITING AND DELETION TESTS (5 tests)
 */
test.describe('Review Editing and Deletion', () => {
  test('should show edit/delete menu only for own reviews', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Find the review cards
    const allCards = page.locator('[class*="Card"]');
    const firstCard = allCards.first(); // Other user's review
    const secondCard = allCards.nth(1); // Own review

    // First card should NOT have more menu
    const firstMoreButton = firstCard.getByRole('button', { name: /더보기 메뉴/ });
    await expect(firstMoreButton).not.toBeVisible();

    // Second card SHOULD have more menu
    const secondMoreButton = secondCard.getByRole('button', { name: /더보기 메뉴/ });
    await expect(secondMoreButton).toBeVisible();
  });

  test('should open edit modal with pre-filled data', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Find own review and open menu
    const ownReviewCard = page.locator('[class*="Card"]').nth(1);
    const moreButton = ownReviewCard.getByRole('button', { name: /더보기 메뉴/ });
    await moreButton.click();

    // Click edit
    const editMenuItem = page.getByRole('menuitem', { name: /수정/ });
    await editMenuItem.click();

    // Modal should open with edit title
    const modalTitle = page.getByRole('heading', { name: '리뷰 수정' });
    await expect(modalTitle).toBeVisible();

    // Form should be pre-filled
    const titleInput = page.getByPlaceholder(/리뷰 제목을 입력하세요/);
    await expect(titleInput).toHaveValue('좋은 프로그램');

    const contentInput = page.getByPlaceholder(/센터에 대한 솔직한 리뷰/);
    await expect(contentInput).toHaveValue('다양한 프로그램이 있어서 좋았습니다. 추천합니다.');
  });

  test('should successfully update review', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Mock update API
    await page.route('**/api/v1/reviews/2', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockReviews[1],
            title: '수정된 제목',
            content: '수정된 내용입니다. 최소 10자 이상.',
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Open edit modal
    const ownReviewCard = page.locator('[class*="Card"]').nth(1);
    const moreButton = ownReviewCard.getByRole('button', { name: /더보기 메뉴/ });
    await moreButton.click();

    const editMenuItem = page.getByRole('menuitem', { name: /수정/ });
    await editMenuItem.click();

    // Edit content
    const titleInput = page.getByPlaceholder(/리뷰 제목을 입력하세요/);
    await titleInput.fill('수정된 제목');

    const contentInput = page.getByPlaceholder(/센터에 대한 솔직한 리뷰/);
    await contentInput.fill('수정된 내용입니다. 최소 10자 이상.');

    // Submit
    const submitButton = page.getByRole('button', { name: /수정하기/ });
    await submitButton.click();

    // Success toast
    const toast = page.getByText(/리뷰가 수정되었습니다/);
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Open more menu
    const ownReviewCard = page.locator('[class*="Card"]').nth(1);
    const moreButton = ownReviewCard.getByRole('button', { name: /더보기 메뉴/ });
    await moreButton.click();

    // Click delete
    const deleteMenuItem = page.getByRole('menuitem', { name: /삭제/ });
    await deleteMenuItem.click();

    // Confirmation dialog should appear
    const dialogTitle = page.getByRole('heading', { name: /리뷰를 삭제하시겠습니까/ });
    await expect(dialogTitle).toBeVisible();

    const dialogDescription = page.getByText(/삭제된 리뷰는 복구할 수 없습니다/);
    await expect(dialogDescription).toBeVisible();

    // Should have cancel and confirm buttons
    await expect(page.getByRole('button', { name: /취소/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /삭제/ })).toBeVisible();
  });

  test('should successfully delete review after confirmation', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Mock delete API
    await page.route('**/api/v1/reviews/2', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Review deleted' }),
        });
      } else {
        await route.continue();
      }
    });

    // Open more menu and delete
    const ownReviewCard = page.locator('[class*="Card"]').nth(1);
    const moreButton = ownReviewCard.getByRole('button', { name: /더보기 메뉴/ });
    await moreButton.click();

    const deleteMenuItem = page.getByRole('menuitem', { name: /삭제/ });
    await deleteMenuItem.click();

    // Confirm deletion
    const confirmButton = page.getByRole('button', { name: /삭제/ }).last();
    await confirmButton.click();

    // Success toast
    const toast = page.getByText(/리뷰가 삭제되었습니다/);
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});

/**
 * 5. SORTING FUNCTIONALITY TESTS (4 tests)
 */
test.describe('Sorting Functionality', () => {
  test('should display sort selector with correct options', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Click sort selector
    const sortTrigger = page.getByRole('combobox', { name: /정렬 옵션/ });
    await sortTrigger.click();

    // Check all options
    await expect(page.getByRole('option', { name: '최신순' })).toBeVisible();
    await expect(page.getByRole('option', { name: '도움순' })).toBeVisible();
    await expect(page.getByRole('option', { name: '평점 높은순' })).toBeVisible();
    await expect(page.getByRole('option', { name: '평점 낮은순' })).toBeVisible();
  });

  test('should change sort order to helpful', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Mock sorted response
    await page.route('**/api/v1/centers/1/reviews*sortBy=helpful*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [...mockReviews].reverse(), // Different order
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_count: 2,
            has_next: false,
            has_prev: false,
          },
        }),
      });
    });

    // Change sort
    const sortTrigger = page.getByRole('combobox', { name: /정렬 옵션/ });
    await sortTrigger.click();

    const helpfulOption = page.getByRole('option', { name: '도움순' });
    await helpfulOption.click();

    // Reviews should reload
    await page.waitForResponse((response) =>
      response.url().includes('sortBy=helpful')
    );
  });

  test('should change sort order to rating_desc', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    const sortTrigger = page.getByRole('combobox', { name: /정렬 옵션/ });
    await sortTrigger.click();

    const ratingOption = page.getByRole('option', { name: '평점 높은순' });
    await ratingOption.click();

    // Verify API call with correct parameter
    await page.waitForResponse((response) =>
      response.url().includes('sortBy=rating_desc')
    );
  });

  test('should maintain sort order after reaction click', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Set sort to helpful
    const sortTrigger = page.getByRole('combobox', { name: /정렬 옵션/ });
    await sortTrigger.click();
    await page.getByRole('option', { name: '도움순' }).click();

    // Click reaction
    await page.route('**/api/v1/reviews/1/reaction', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify(mockReviews[0]) });
    });

    const helpfulButton = page.getByRole('button', { name: /이 리뷰가 도움돼요/ }).first();
    await helpfulButton.click();

    // Sort selector should still show helpful
    await expect(sortTrigger).toHaveValue('helpful');
  });
});

/**
 * 6. INFINITE SCROLL TESTS (2 tests)
 */
test.describe('Infinite Scroll', () => {
  test('should show load more button when has next page', async ({ page }) => {
    // Mock paginated response
    await page.route('**/api/v1/centers/1/reviews*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: mockReviews,
          pagination: {
            current_page: 1,
            total_pages: 3,
            total_count: 20,
            has_next: true,
            has_prev: false,
          },
        }),
      });
    });

    await page.goto('/centers/1');
    await page.waitForLoadState('networkidle');

    // Load more button should be visible
    const loadMoreButton = page.getByRole('button', { name: /더 많은 리뷰 불러오기/ });
    await expect(loadMoreButton).toBeVisible();
    await expect(loadMoreButton).toHaveText('더보기');
  });

  test('should load next page on button click', async ({ page }) => {
    // Mock first page
    await page.route('**/api/v1/centers/1/reviews*page=1*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [mockReviews[0]],
          pagination: {
            current_page: 1,
            total_pages: 2,
            total_count: 2,
            has_next: true,
            has_prev: false,
          },
        }),
      });
    });

    // Mock second page
    await page.route('**/api/v1/centers/1/reviews*page=2*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [mockReviews[1]],
          pagination: {
            current_page: 2,
            total_pages: 2,
            total_count: 2,
            has_next: false,
            has_prev: true,
          },
        }),
      });
    });

    await page.goto('/centers/1');
    await page.waitForLoadState('networkidle');

    // Click load more
    const loadMoreButton = page.getByRole('button', { name: /더 많은 리뷰 불러오기/ });
    await loadMoreButton.click();

    // Second review should appear
    await expect(page.getByText('좋은 프로그램')).toBeVisible();

    // Load more button should disappear
    await expect(loadMoreButton).not.toBeVisible();
  });
});

/**
 * 7. AUTHENTICATION CHECKS TESTS (2 tests)
 */
test.describe('Authentication Checks', () => {
  test('should hide write button for unauthenticated users', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/centers/1');
    await page.waitForLoadState('networkidle');

    // Write button should not be visible
    const writeButton = page.getByRole('button', { name: /리뷰 작성/ });
    await expect(writeButton).not.toBeVisible();
  });

  test('should show login prompt when unauthenticated user clicks reaction', async ({
    page,
  }) => {
    await mockUnauthenticated(page);
    await page.goto('/centers/1');
    await page.waitForLoadState('networkidle');

    // Try to click helpful button
    const helpfulButton = page.getByRole('button', { name: /이 리뷰가 도움돼요/ }).first();
    await helpfulButton.click();

    // Login prompt should appear
    const loginPrompt = page.getByText(/로그인이 필요합니다/);
    await expect(loginPrompt).toBeVisible({ timeout: 5000 });
  });
});

/**
 * 8. ACCESSIBILITY TESTS (5 tests)
 */
test.describe('Accessibility', () => {
  test('should support keyboard navigation through reviews', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Tab through interactive elements
    await page.keyboard.press('Tab'); // First helpful button
    let focused = page.locator(':focus');
    await expect(focused).toHaveAttribute('aria-label', /이 리뷰가 도움돼요/);

    await page.keyboard.press('Tab'); // Unhelpful button
    focused = page.locator(':focus');
    await expect(focused).toHaveAttribute('aria-label', /이 리뷰가 도움안돼요/);

    // Space/Enter should activate buttons
    await page.keyboard.press('Enter');
    // Reaction should trigger
  });

  test('should have proper ARIA labels on all interactive elements', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Check sort selector
    const sortSelector = page.getByRole('combobox', { name: /정렬 옵션/ });
    await expect(sortSelector).toHaveAttribute('aria-label');

    // Check reaction buttons
    const helpfulButton = page.getByRole('button', { name: /이 리뷰가 도움돼요/ }).first();
    await expect(helpfulButton).toHaveAttribute('aria-label');

    const unhelpfulButton = page
      .getByRole('button', { name: /이 리뷰가 도움안돼요/ })
      .first();
    await expect(unhelpfulButton).toHaveAttribute('aria-label');
  });

  test('should announce reaction state with aria-pressed', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    const helpfulButton = page.getByRole('button', { name: /이 리뷰가 도움돼요/ }).first();

    // Initially not pressed
    await expect(helpfulButton).toHaveAttribute('aria-pressed', 'false');

    // Mock reaction
    await page.route('**/api/v1/reviews/1/reaction', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ ...mockReviews[0], my_reaction: 'helpful' }),
      });
    });

    // Click button
    await helpfulButton.click();

    // Should be pressed
    await expect(helpfulButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should have proper form labels and error announcements', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Open review modal
    const writeButton = page.getByRole('button', { name: /리뷰 작성/ });
    await writeButton.click();

    // Check form labels
    await expect(page.getByLabel(/별점/)).toBeVisible();
    await expect(page.getByLabel(/제목/)).toBeVisible();
    await expect(page.getByLabel(/리뷰 내용/)).toBeVisible();
    await expect(page.getByLabel(/방문 날짜/)).toBeVisible();

    // Try to submit without filling
    const submitButton = page.getByRole('button', { name: /등록/ });
    await submitButton.click();

    // Error should have role="alert" for screen readers
    const errorMessage = page.getByRole('alert').first();
    await expect(errorMessage).toBeVisible();
  });

  test('should have visible focus indicators on all focusable elements', async ({ page }) => {
    await navigateToCenterWithReviews(page);

    // Focus helpful button
    const helpfulButton = page.getByRole('button', { name: /이 리뷰가 도움돼요/ }).first();
    await helpfulButton.focus();

    // Check for focus styles
    const hasFocusStyle = await helpfulButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return (
        styles.outline !== 'none' &&
        styles.outline !== '0px' &&
        styles.outlineWidth !== '0px'
      );
    });

    expect(hasFocusStyle).toBeTruthy();
  });
});
