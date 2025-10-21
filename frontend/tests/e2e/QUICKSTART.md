# E2E Testing Quick Start Guide

Get started with E2E testing in 5 minutes.

## 1. Install Playwright Browsers

```bash
cd frontend
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers (~400MB).

## 2. Run Tests

```bash
npm run test:e2e
```

That's it! Tests will run and generate a report.

## 3. View Results

```bash
npm run test:e2e:report
```

Opens HTML report in your browser.

## Common Commands

```bash
# Run tests interactively (recommended for development)
npm run test:e2e:ui

# Run tests with visible browser (useful for debugging)
npm run test:e2e:headed

# Run tests in debug mode (step through each action)
npm run test:e2e:debug

# Run tests on specific browser only
npm run test:e2e:chromium

# Run mobile tests only
npm run test:e2e:mobile
```

## Understanding Test Results

### ✅ Passed Test
```
✓ [chromium] › center-detail.spec.ts:25:3 › should load page successfully (1.2s)
```

### ❌ Failed Test
```
✗ [chromium] › center-detail.spec.ts:34:3 › should display center name (0.8s)

  Error: Timed out waiting for element
  Call log:
    - waiting for element...
```

Check `test-results/` for screenshots and videos.

## Test Structure

Tests are organized by functionality:

1. **Page Load and Rendering** - Basic page functionality
2. **User Interactions** - Buttons, clicks, navigation
3. **Error Handling** - 404, server errors
4. **Accessibility** - Keyboard, ARIA, touch targets
5. **Responsive Design** - Mobile, tablet, desktop

## Next Steps

- Read [README.md](./README.md) for comprehensive documentation
- Explore test files in `tests/e2e/`
- Add new tests for additional features
- Configure CI/CD integration

## Need Help?

- [Playwright Docs](https://playwright.dev)
- [Test Examples](./center-detail.spec.ts)
- [Helper Functions](./helpers/setup.ts)
