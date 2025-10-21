# Performance & Accessibility Audit Guide

> Quick reference for running performance optimizations and audits on the MindConnect center detail page

---

## Prerequisites

### 1. Install Dependencies

```bash
cd frontend
npm install --save-dev lighthouse @axe-core/playwright chrome-launcher
```

### 2. Start Development Server

```bash
npm run dev
```

The server should be running at `http://localhost:3000`

---

## Running Audits

### Option 1: Run All Audits (Recommended)

This runs Lighthouse, accessibility, and performance tests in sequence:

```bash
npm run audit:all
```

---

### Option 2: Run Individual Audits

#### A. Lighthouse Audit

Measures Performance, Accessibility, Best Practices, and SEO scores:

```bash
npm run audit:lighthouse
```

**With custom URL**:
```bash
npm run audit:lighthouse http://localhost:3000/centers/1
```

**Output**:
- HTML reports: `claudedocs/lighthouse-reports/lighthouse-[timestamp]/`
- JSON data: `claudedocs/lighthouse-reports/lighthouse-[timestamp]/summary.json`

---

#### B. Accessibility Audit

Validates WCAG 2.1 AA compliance with axe-core:

```bash
npm run audit:a11y
```

**With custom URL**:
```bash
npm run audit:a11y http://localhost:3000/centers/1
```

**Output**:
- JSON report: `claudedocs/a11y-reports/a11y-[timestamp]/accessibility-report.json`
- Markdown summary: `claudedocs/a11y-reports/a11y-[timestamp]/accessibility-report.md`

---

#### C. Performance Tests (Playwright)

Runs comprehensive performance test suite:

```bash
npm run test:perf
```

**Output**:
- HTML report: `playwright-report/index.html`
- Console metrics during execution

**View HTML report**:
```bash
npm run test:e2e:report
```

---

## Understanding Results

### Lighthouse Scores

**Thresholds** (All must pass):
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

**Core Web Vitals**:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Status Indicators**:
- ✅ Green: Score ≥ 90
- ⚠️ Yellow: 50 ≤ Score < 90
- ❌ Red: Score < 50

---

### Accessibility Violations

**Severity Levels**:
1. **Critical** 🔴: Fix immediately (blocks users)
2. **Serious** 🟠: High priority (major accessibility barrier)
3. **Moderate** 🟡: Medium priority (usability issue)
4. **Minor** 🔵: Low priority (best practice)

**Fix Priority**:
1. Fix all Critical and Serious violations first
2. Address Moderate violations next
3. Tackle Minor violations when time permits

---

### Performance Test Results

**Metrics Measured**:
- Page load time: < 1.5s ✅
- API response: < 500ms ✅
- LCP: < 2.5s ✅
- FCP: < 1.8s ✅
- CLS: < 0.1 ✅
- TTI: < 3.8s ✅
- TBT: < 200ms ✅

**Test Status**:
- ✅ PASS: Metric within budget
- ❌ FAIL: Metric exceeds budget (needs optimization)

---

## Common Issues & Fixes

### Lighthouse Performance < 90

**Common Causes**:
- Large JavaScript bundles
- Unoptimized images
- Render-blocking resources
- Poor caching strategy

**Fixes**:
1. Code split with dynamic imports
2. Use Next.js `<Image>` component
3. Implement ISR/SSG
4. Configure cache headers

---

### Accessibility Violations

#### Missing Alt Text
```tsx
// ❌ Bad
<img src="/icon.png" />

// ✅ Good
<img src="/icon.png" alt="센터 위치 아이콘" />
```

#### Missing ARIA Labels
```tsx
// ❌ Bad
<button>
  <ShareIcon />
</button>

// ✅ Good
<button aria-label="공유하기">
  <ShareIcon aria-hidden="true" />
</button>
```

#### Low Color Contrast
```tsx
// ❌ Bad: Light gray on white
<p className="text-neutral-300">텍스트</p>

// ✅ Good: Dark gray on white (meets WCAG AA)
<p className="text-neutral-700">텍스트</p>
```

---

### Performance Test Failures

#### Page Load > 1.5s
- Check network waterfall in dev tools
- Reduce API response time
- Enable ISR/caching
- Optimize bundle size

#### LCP > 2.5s
- Optimize hero image/content
- Preload critical resources
- Remove render-blocking scripts
- Use SSR/SSG

#### CLS > 0.1
- Reserve space for dynamic content
- Set image dimensions
- Avoid layout-shifting ads/embeds
- Use `font-display: swap`

---

## Automation & CI/CD

### GitHub Actions Workflow

Create `.github/workflows/performance-audit.yml`:

```yaml
name: Performance & Accessibility Audit

on:
  pull_request:
    paths:
      - 'frontend/**'
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Build application
        working-directory: frontend
        run: npm run build

      - name: Start server
        working-directory: frontend
        run: npm start &
        env:
          NODE_ENV: production

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run Lighthouse audit
        working-directory: frontend
        run: npm run audit:lighthouse http://localhost:3000/centers/1

      - name: Run Accessibility audit
        working-directory: frontend
        run: npm run audit:a11y http://localhost:3000/centers/1

      - name: Run Performance tests
        working-directory: frontend
        run: npm run test:perf

      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: audit-reports
          path: |
            frontend/claudedocs/lighthouse-reports/
            frontend/claudedocs/a11y-reports/
            frontend/playwright-report/
```

---

## Performance Monitoring

### Vercel Analytics Integration

Add to `frontend/app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

This tracks:
- Real User Monitoring (RUM)
- Core Web Vitals
- Geographic performance
- Device-specific metrics

---

## Best Practices

### Before Every Release

1. ✅ Run `npm run audit:all`
2. ✅ Fix all Critical and Serious violations
3. ✅ Ensure all Lighthouse scores ≥ 90
4. ✅ Verify Core Web Vitals pass
5. ✅ Check performance test suite passes

### During Development

1. Run `npm run test:perf` locally before PR
2. Check Lighthouse scores for new features
3. Validate accessibility with screen reader
4. Test keyboard navigation manually

### Continuous Improvement

1. Track metrics over time
2. Set up performance budgets in CI/CD
3. Monitor real user metrics (RUM)
4. Review and update budgets quarterly

---

## Troubleshooting

### Lighthouse Fails to Launch

**Error**: `Chrome failed to launch`

**Fix**:
```bash
# Install Chromium for Lighthouse
npx playwright install chromium
```

---

### Accessibility Audit Errors

**Error**: `axe-core not found`

**Fix**:
```bash
npm install --save-dev @axe-core/playwright
```

---

### Performance Tests Timeout

**Error**: `Timeout waiting for page load`

**Fix**:
1. Ensure dev server is running
2. Check network connectivity
3. Increase timeout in test config

---

## Additional Resources

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Web Vitals Guide](https://web.dev/vitals/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Playwright Testing](https://playwright.dev/docs/intro)

---

## Quick Commands Reference

```bash
# Development
npm run dev                  # Start dev server

# Audits
npm run audit:all            # Run all audits
npm run audit:lighthouse     # Lighthouse only
npm run audit:a11y           # Accessibility only
npm run test:perf            # Performance tests

# Reports
npm run test:e2e:report      # View Playwright HTML report
open claudedocs/lighthouse-reports/lighthouse-[latest]/  # Lighthouse reports
open claudedocs/a11y-reports/a11y-[latest]/             # A11y reports

# Utilities
npx playwright install       # Install browsers
npm run lint                 # Lint check
npm run build                # Production build
```

---

**Last Updated**: 2025-10-21
**Maintainer**: Frontend Team
**Status**: Ready for Use
