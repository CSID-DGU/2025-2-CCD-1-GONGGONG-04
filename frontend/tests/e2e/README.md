# Center Detail Page E2E Tests

Comprehensive End-to-End (E2E) tests for the center detail page using Playwright.

## Overview

This test suite covers all critical user scenarios, accessibility requirements, and responsive design behavior for the `/centers/[id]` page in the MindConnect platform.

## Test Coverage

### 1. Page Load and Rendering (6 tests)
- ✅ Page loads successfully with valid center ID
- ✅ Center name displays correctly
- ✅ Center type badge displays
- ✅ Rating and review count display
- ✅ Phone number and address display
- ✅ Business content description displays

### 2. User Interactions (10 tests)
- ✅ Clickable phone number link (tel: protocol)
- ✅ Working call button
- ✅ Kakao Map opens on directions click
- ✅ Favorite button toggles
- ✅ Share button displays
- ✅ Address copy to clipboard
- ✅ Copy success toast message
- ✅ Back button navigation
- ✅ Checkmark icon after copy
- ✅ Multiple button clicks handling

### 3. Error Handling (4 tests)
- ✅ 404 page for non-existent center ID
- ✅ Error page when backend is down
- ✅ Loading state during page load
- ✅ Graceful handling of missing phone number

### 4. Accessibility (5 tests)
- ✅ Keyboard navigation support
- ✅ Visible focus indicators
- ✅ ARIA labels on interactive elements
- ✅ aria-hidden on decorative icons
- ✅ Minimum touch target size (44x44px)

### 5. Responsive Design (4 tests)
- ✅ Mobile viewport (375x667)
- ✅ Tablet viewport (768x1024)
- ✅ Desktop viewport (1920x1080)
- ✅ Layout adaptation to breakpoints

### 6. Additional Integration Tests (3 tests)
- ✅ Rapid navigation handling
- ✅ State maintenance after page refresh
- ✅ Browser back button handling

## Total Test Count

**32 comprehensive E2E test cases**

## Test Structure

```
frontend/tests/e2e/
├── center-detail.spec.ts     # Main test file (32 tests)
├── helpers/
│   ├── setup.ts              # Test utilities and helpers
│   └── fixtures.ts           # Test data fixtures
└── README.md                 # This file
```

## Prerequisites

### 1. Install Dependencies

```bash
cd frontend
npm install
```

Playwright should already be installed as a devDependency.

### 2. Install Playwright Browsers

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers.

### 3. Environment Setup

Ensure `.env.test` file exists in the frontend directory:

```env
PLAYWRIGHT_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
PLAYWRIGHT_TIMEOUT=30000
```

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

This opens the Playwright UI for interactive test debugging.

### Run Tests in Headed Mode (Visible Browser)

```bash
npm run test:e2e:headed
```

### Debug Tests

```bash
npm run test:e2e:debug
```

This opens the Playwright Inspector for step-by-step debugging.

### Run Tests on Specific Browser

```bash
# Chromium only
npm run test:e2e:chromium

# Mobile Chrome only
npm run test:e2e:mobile
```

### View Test Report

```bash
npm run test:e2e:report
```

## Test Configuration

Configuration is defined in `playwright.config.ts`:

- **Test Directory**: `./tests/e2e`
- **Base URL**: `http://localhost:3000`
- **Timeout**: 30 seconds per test
- **Retry**: 2 retries on CI, 0 locally
- **Parallel**: Disabled (serial execution for database consistency)
- **Screenshots**: Captured on failure
- **Videos**: Retained on failure
- **Trace**: Enabled on first retry

## Browsers Tested

- ✅ Chromium (Desktop Chrome)
- ✅ Firefox (Desktop Firefox)
- ✅ WebKit (Desktop Safari)
- ✅ Mobile Chrome (iPhone 12)
- ✅ Mobile Safari (iPhone 12)
- ✅ Tablet (iPad Pro)

## Test Data

Test fixtures are defined in `helpers/fixtures.ts`:

### Test Centers

- **valid**: Full center with all fields
- **noPhone**: Center without phone number
- **minimal**: Center with minimal information
- **invalid**: Non-existent center (ID: 999999)

### Viewports

- **mobile**: 375x667
- **tablet**: 768x1024
- **desktop**: 1920x1080

## Key Test Scenarios

### 1. Phone Call Interaction

```typescript
test('should have clickable phone number link', async ({ page }) => {
  const phoneLink = page.locator('a[href^="tel:"]');
  await expect(phoneLink).toBeVisible();
});
```

### 2. Address Copy to Clipboard

```typescript
test('should copy address to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const addressElement = page.getByText(/서울특별시/);
  await addressElement.click();
  await expect(page.getByText(/복사되었습니다/)).toBeVisible();
});
```

### 3. Kakao Map Navigation

```typescript
test('should open Kakao Map on directions click', async ({ page, context }) => {
  const pagePromise = context.waitForEvent('page');
  await page.getByRole('button', { name: /길찾기/ }).click();
  const newPage = await pagePromise;
  expect(newPage.url()).toContain('kakao.com/link/to');
});
```

### 4. Accessibility - Keyboard Navigation

```typescript
test('should support keyboard navigation', async ({ page }) => {
  await page.keyboard.press('Tab');
  const focusedElement = page.locator(':focus');
  await expect(focusedElement).toHaveCount(1);
});
```

### 5. Responsive Design

```typescript
test('should display correctly on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await navigateToCenterDetail(page, 1);
  await expect(page.locator('main')).toBeVisible();
});
```

## Expected Test Output

When running tests successfully, you should see:

```
Running 32 tests using 1 worker

✓ [chromium] › center-detail.spec.ts:25:3 › Page Load and Rendering › should load center detail page successfully (1.2s)
✓ [chromium] › center-detail.spec.ts:34:3 › Page Load and Rendering › should display center name correctly (0.8s)
✓ [chromium] › center-detail.spec.ts:41:3 › Page Load and Rendering › should display center type badge (0.7s)
...
✓ [chromium] › center-detail.spec.ts:289:3 › Additional Integration Tests › should handle browser back button (1.5s)

32 passed (42s)
```

## Test Reports

After test execution, reports are generated:

- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `test-results/results.json`
- **Screenshots**: `test-results/**/*-failed-*.png`
- **Videos**: `test-results/**/*-failed-*.webm`
- **Traces**: `test-results/**/*-retry1-trace.zip`

## CI/CD Integration

For Continuous Integration:

```bash
# Set CI environment variable
CI=true npm run test:e2e
```

This enables:
- 2 retries per test
- Serial execution (1 worker)
- Full reporting

## Debugging Failed Tests

### 1. View Screenshot

Failed tests automatically capture screenshots:

```
test-results/center-detail-Page-Load-and-Rendering-should-load-center-detail-page-successfully-chromium/test-failed-1.png
```

### 2. View Video

Failed tests record video:

```
test-results/center-detail-Page-Load-and-Rendering-should-load-center-detail-page-successfully-chromium/video.webm
```

### 3. View Trace

Download and view trace files in Playwright Trace Viewer:

```bash
npx playwright show-trace test-results/trace.zip
```

### 4. Run in Debug Mode

```bash
npm run test:e2e:debug
```

This opens the Playwright Inspector for step-by-step debugging.

## Test Maintenance

### Adding New Tests

1. Create new test in `center-detail.spec.ts`
2. Follow existing test structure and naming conventions
3. Use helper functions from `helpers/setup.ts`
4. Use test data from `helpers/fixtures.ts`
5. Ensure tests are independent and isolated

### Updating Test Data

Edit `helpers/fixtures.ts` to update test center data.

### Updating Test Helpers

Edit `helpers/setup.ts` to add new utility functions.

## Best Practices

1. **Test Independence**: Each test should be independent and not rely on other tests
2. **Clean Setup**: Use `beforeEach` for common setup
3. **Descriptive Names**: Use clear, descriptive test names
4. **Assertions**: Use meaningful assertions with helpful error messages
5. **Wait for Elements**: Always wait for elements before interacting
6. **Accessibility**: Include accessibility checks in all interaction tests
7. **Responsive**: Test across multiple viewports
8. **Error Handling**: Test both success and error scenarios

## Known Issues and Limitations

### 1. API Mocking

Tests use API mocking to avoid backend dependencies. This means:
- Tests run faster
- No database setup required
- Backend doesn't need to be running

### 2. External Services

Tests mock external services:
- Kakao Map API
- Clipboard API
- Geolocation API

### 3. Real Browser Limitations

Some tests may behave differently in headless vs. headed mode:
- Clipboard permissions
- Popup blockers
- Window focus

## Performance Benchmarks

Expected test execution times:

- **Full Suite (32 tests)**: ~40-60 seconds
- **Single Browser**: ~15-20 seconds
- **Mobile Tests**: ~8-10 seconds
- **Accessibility Tests**: ~5-7 seconds

## Troubleshooting

### Tests Fail with Timeout

Increase timeout in `playwright.config.ts`:

```typescript
timeout: 60 * 1000, // 60 seconds
```

### Browser Not Installed

```bash
npx playwright install chromium
```

### Port Already in Use

Ensure port 3000 is available or change `baseURL` in config.

### API Mocking Not Working

Check that API URL patterns in tests match actual API endpoints.

## Contributing

When adding new tests:

1. Follow existing test structure
2. Add descriptive comments
3. Update this README with new test coverage
4. Ensure tests pass on all browsers
5. Add fixtures for new test data

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [API Mocking](https://playwright.dev/docs/mock)

## Contact

For questions or issues with E2E tests, contact the QA team or create an issue in the project repository.
