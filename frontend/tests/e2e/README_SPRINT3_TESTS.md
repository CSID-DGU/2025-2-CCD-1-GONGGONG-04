# Sprint 3 E2E Tests - Staff and Programs

## Overview

Comprehensive end-to-end tests for Sprint 3 features covering staff display and programs functionality using Playwright.

**File**: `frontend/tests/e2e/staff-programs.spec.ts`

---

## Test Coverage Summary

### Total Test Count: **39 tests** across 7 test suites

| Test Suite | Test Count | Description |
|------------|-----------|-------------|
| 1. Staff Display | 6 tests | Medical staff information display and empty states |
| 2. Programs Display | 7 tests | Program cards, badges, and "더보기" functionality |
| 3. Program Detail Modal | 8 tests | Modal opening/closing, content display, keyboard interaction |
| 4. Keyboard Navigation | 5 tests | Tab navigation, Enter/Space keys, focus management |
| 5. Accessibility | 6 tests | ARIA attributes, heading hierarchy, screen reader support |
| 6. Responsive Design | 4 tests | Mobile, tablet, desktop viewports |
| 7. Error Handling | 3 tests | API failure scenarios and error messages |

---

## Test Suites Detail

### 1. Staff Display Tests (6 tests)

#### ✅ Test Cases:
- **Display staff information correctly**: Verifies heading, total badge, staff types, counts, and descriptions
- **Show empty state when no staff data**: Checks empty state message and icon
- **Handle loading state**: Validates skeleton/loading indicators during data fetch
- **Display single staff member correctly**: Tests edge case with only one staff member
- **Proper ARIA attributes for staff section**: Validates `role="list"` and `role="listitem"`
- **Display staff descriptions when available**: Ensures optional descriptions render correctly

#### Mock Data Used:
- `mockStaffData.withStaff` - 3 staff members (total 6 people)
- `mockStaffData.emptyStaff` - Empty staff list
- `mockStaffData.singleStaff` - Single staff member

---

### 2. Programs Display Tests (7 tests)

#### ✅ Test Cases:
- **Display program cards correctly**: Verifies program names, types, target groups
- **Display online and free badges correctly**: Checks badge rendering for online/free/paid programs
- **Show "더보기" button when more than 5 programs**: Tests expansion functionality
- **Hide "더보기" button when 5 or fewer programs**: Verifies button not shown for small lists
- **Show empty state when no programs**: Checks empty state message and icon
- **Display program capacity and duration**: Validates metadata display (12명, 90분, etc.)
- **Proper ARIA attributes for program cards**: Validates `role="button"` and `aria-label`

#### Mock Data Used:
- `mockProgramsData.fewPrograms` - 3 programs (no "더보기" button)
- `mockProgramsData.manyPrograms` - 8 programs (shows "더보기" button)
- `mockProgramsData.emptyPrograms` - Empty program list

---

### 3. Program Detail Modal Tests (8 tests)

#### ✅ Test Cases:
- **Open modal when program card clicked**: Verifies modal opens with correct content
- **Close modal with close button**: Tests close button functionality
- **Close modal with ESC key**: Validates keyboard shortcut for closing
- **Close modal by clicking outside**: Tests backdrop click to close
- **Display default message when no description**: Shows fallback message for missing descriptions
- **Display paid program fee correctly**: Validates fee display for paid programs
- **Proper modal ARIA attributes**: Checks `role="dialog"`, `aria-labelledby`
- **Trap focus within modal**: Ensures focus stays within modal during keyboard navigation

#### Modal Content Verified:
- Program name in modal title
- Badges (online/free/paid)
- Description or default message
- Details section (type, target group, capacity, duration, fee)

---

### 4. Keyboard Navigation Tests (5 tests)

#### ✅ Test Cases:
- **Navigate to program cards with Tab key**: Tests Tab key navigation to program cards
- **Open modal with Enter key on focused card**: Validates Enter key activation
- **Open modal with Space key on focused card**: Validates Space key activation
- **Navigate within modal with keyboard**: Tests Tab navigation inside modal
- **Visible focus indicators**: Verifies focus rings/outlines are visible

#### Keyboard Keys Tested:
- `Tab` - Focus navigation
- `Enter` - Activate focused element
- `Space` - Activate focused element
- `Escape` - Close modal

---

### 5. Accessibility Tests (6 tests)

#### ✅ Test Cases:
- **Proper heading hierarchy**: Validates `h2` headings for sections
- **ARIA labels on interactive elements**: Checks `aria-label` on buttons and cards
- **aria-hidden on decorative icons**: Ensures decorative SVGs have `aria-hidden="true"`
- **Screen reader announcements**: Validates `aria-live` regions if present
- **Sufficient color contrast**: Basic check for text visibility and color
- **Proper role attributes**: Validates `role="list"`, `role="button"`, `role="dialog"`

#### Accessibility Standards:
- WCAG AA compliance for color contrast
- Proper heading hierarchy (h1 > h2 > h3)
- ARIA attributes for semantic meaning
- Focus management and keyboard navigation

---

### 6. Responsive Design Tests (4 tests)

#### ✅ Test Cases:
- **Display correctly on mobile (375x667)**: Tests mobile layout
- **Display correctly on tablet (768x1024)**: Tests tablet layout with 2-column grid
- **Display correctly on desktop (1920x1080)**: Tests desktop layout
- **Handle modal responsively**: Tests modal on different viewports

#### Viewports Tested:
- Mobile: 375x667 (iPhone SE)
- Tablet: 768x1024 (iPad)
- Desktop: 1920x1080 (Full HD)

---

### 7. Error Handling Tests (3 tests)

#### ✅ Test Cases:
- **Display error message when staff API fails**: Tests 500 error handling for staff endpoint
- **Display error message when programs API fails**: Tests 500 error handling for programs endpoint
- **Show retry button on error**: Validates retry functionality (if implemented)

---

## Running the Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Only Sprint 3 Tests
```bash
npx playwright test staff-programs
```

### Run Specific Test Suite
```bash
npx playwright test staff-programs -g "Staff Display"
npx playwright test staff-programs -g "Program Detail Modal"
```

### Run with UI Mode (Debug)
```bash
npx playwright test staff-programs --ui
```

### Run on Specific Browser
```bash
npx playwright test staff-programs --project=chromium
npx playwright test staff-programs --project=firefox
npx playwright test staff-programs --project=webkit
```

### Run on Mobile Viewport
```bash
npx playwright test staff-programs --project=mobile-chrome
```

---

## Test Data

### Mock Staff Data Structure
```typescript
{
  center_id: number;
  staff: Array<{
    staff_type: string;
    staff_count: number;
    description: string | null;
  }>;
  total_staff: number;
  has_data: boolean;
}
```

### Mock Programs Data Structure
```typescript
{
  center_id: number;
  programs: Array<{
    id: number;
    program_name: string;
    program_type: string;
    target_group: string;
    description: string | null;
    is_online_available: boolean;
    is_free: boolean;
    fee_amount: number | null;
    capacity: number | null;
    duration_minutes: number | null;
  }>;
  total_count: number;
  has_data: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

## Test Patterns Used

### API Mocking
```typescript
await mockApiResponse(
  page,
  /\/api\/v1\/centers\/1\/staff/,
  mockStaffData.withStaff
);
```

### Navigation
```typescript
await navigateToCenterDetail(page, 1);
```

### Viewport Setup
```typescript
await setViewport(page, viewports.mobile.width, viewports.mobile.height);
```

### Accessibility Checks
```typescript
await expectAriaAttribute(page, '[role="button"]', 'aria-label');
```

---

## Expected Test Results

### Success Criteria
- ✅ All 39 tests pass
- ✅ No accessibility violations
- ✅ Responsive design works on all viewports
- ✅ Keyboard navigation fully functional
- ✅ Error states handled gracefully

### Performance Targets
- Test execution time: < 2 minutes (all tests)
- Individual test timeout: 30 seconds
- Modal animation wait: 300ms
- API response delay: 1000ms (for skeleton testing)

---

## Integration with CI/CD

### GitHub Actions (Example)
```yaml
- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

### Test Reports
- HTML Report: `playwright-report/index.html`
- JSON Report: `test-results/results.json`
- Screenshots on failure: `test-results/**/*.png`
- Videos on failure: `test-results/**/*.webm`

---

## Troubleshooting

### Common Issues

#### 1. Modal Not Opening
- **Cause**: Animation timing or element not clickable
- **Fix**: Increase `waitForTimeout` to 500ms

#### 2. Focus Tests Failing
- **Cause**: Browser doesn't show focus ring by default
- **Fix**: Check for `focus-visible` class or CSS outline

#### 3. API Mocking Not Working
- **Cause**: Incorrect route pattern or timing
- **Fix**: Use `page.route()` before navigation, check regex pattern

#### 4. Responsive Tests Failing
- **Cause**: Viewport not set before navigation
- **Fix**: Call `setViewport()` before `navigateToCenterDetail()`

---

## Best Practices

### ✅ DO:
- Use existing helper functions from `helpers/setup.ts`
- Mock API responses for predictable test data
- Wait for animations with `page.waitForTimeout(300)`
- Test keyboard navigation (Tab, Enter, Space, Escape)
- Verify ARIA attributes for accessibility
- Test on multiple viewports (mobile, tablet, desktop)
- Handle loading states with skeleton checks

### ❌ DON'T:
- Rely on hard-coded timeouts (use `waitForSelector` when possible)
- Test implementation details (test user-visible behavior)
- Skip accessibility tests
- Ignore error states
- Use real API endpoints (always mock for E2E)

---

## Future Enhancements

### Planned Additions:
- [ ] Visual regression testing (Playwright screenshots)
- [ ] Performance testing (Lighthouse integration)
- [ ] Cross-browser compatibility matrix
- [ ] Mobile gestures testing (swipe, pinch)
- [ ] Internationalization testing (i18n)
- [ ] Analytics event tracking verification

---

## Related Documentation

- **Testing Strategy**: `cloudedocs/feature-plans/통합_정보_제공/sprint_3/7.테스트_전략.md`
- **Implementation Checklist**: `cloudedocs/feature-plans/통합_정보_제공/sprint_3/9.구현_할일_목록.md`
- **Component API**: `context/컴포넌트_API.md`
- **UI/UX Guidelines**: `context/공통_UI_UX_가이드라인.md`

---

**Last Updated**: 2025-01-22
**Test File Version**: 1.0
**Playwright Version**: ^1.40.0
**Coverage**: Sprint 3 - Staff and Programs Display
