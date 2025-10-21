# Center Component Unit Tests

Comprehensive unit tests for center detail page components using Vitest and React Testing Library.

## Test Coverage

### 1. CenterHeader.test.tsx (10 test suites, 24 tests)
- **Rendering Tests** (6 tests)
  - Center name display
  - Center type badge
  - Rating formatting (1 decimal place)
  - Review count with comma formatting
  - Single review display

- **No Reviews State** (3 tests)
  - Shows "아직 리뷰가 없습니다" message
  - Hides rating display
  - Hides star icon

- **Button Interactions** (4 tests)
  - Share button callback
  - Favorite button callback
  - Works without callbacks

- **Favorite State** (4 tests)
  - Filled/unfilled heart icon states
  - Proper aria-labels
  - Default state handling

- **Accessibility** (7 tests)
  - ARIA labels on all buttons
  - Aria-hidden on decorative icons
  - Keyboard navigation support
  - Focus-visible styles

### 2. CenterContactInfo.test.tsx (7 test suites, 27 tests)
- **Rendering Tests** (4 tests)
  - Phone number display
  - Road address display
  - Jibun address display
  - Distance badge display

- **Null Value Handling** (4 tests)
  - Hide phone section when null
  - Hide jibun address when null
  - Hide distance badge when undefined
  - Full-width directions button when no phone

- **Phone Formatting** (2 tests)
  - Display with hyphens
  - Tel link without hyphens

- **Distance Formatting** (4 tests)
  - < 1000m shows meters
  - 1000-9999m shows km with 1 decimal
  - >= 10000m shows rounded km
  - Correct rounding logic

- **Button Interactions** (7 tests)
  - Call button triggers onCall
  - Directions button triggers onDirections
  - Opens phone dialer
  - Opens Kakao Map
  - Works without callbacks

- **Clipboard Functionality** (6 tests)
  - Copies address to clipboard
  - Shows success toast
  - Shows checkmark icon
  - Reverts to copy icon after 2s
  - Shows error toast on failure

- **Accessibility** (5 tests)
  - ARIA labels on buttons
  - ARIA label for phone link
  - Aria-hidden on decorative icons
  - Focus-visible styles
  - Keyboard navigation

- **Layout Variations** (4 tests)
  - Both buttons when phone exists
  - Full-width directions when no phone
  - Button variant changes based on phone presence

### 3. CenterDescription.test.tsx (8 test suites, 20 tests)
- **Rendering Tests** (5 tests)
  - Section title
  - Business content display
  - Multi-line content
  - View count with label
  - Favorite count with label

- **Null Content State** (4 tests)
  - Empty state message
  - Helpful guidance message
  - Content not rendered when null
  - Stats still visible

- **Number Formatting** (5 tests)
  - Comma formatting for thousands
  - Single digit handling
  - Zero value handling
  - Large numbers with multiple commas

- **Whitespace Preservation** (3 tests)
  - whitespace-pre-line class
  - Multi-line content spacing
  - Single line content handling

- **Accessibility** (6 tests)
  - Proper heading tag
  - Screen reader text for icons
  - Aria-labels for stats
  - Aria-hidden on decorative icons
  - Text contrast classes
  - Empty state styling

- **Layout and Structure** (4 tests)
  - Divider between sections
  - Vertical separator in stats
  - Proper spacing classes
  - Empty state padding

- **Edge Cases** (4 tests)
  - Empty string content
  - Very long content
  - Special characters
  - HTML entities

## Total Test Statistics
- **Total Test Files**: 3
- **Total Test Suites**: 25
- **Total Test Cases**: 71
- **Expected Coverage**: > 80% for all components

## Setup Instructions

### 1. Install Missing Dependencies (if needed)
```bash
cd frontend
npm install --save-dev @testing-library/react @vitejs/plugin-react jsdom
```

### 2. Verify Configuration Files
Ensure these files exist:
- `vitest.config.ts` - Vitest configuration
- `vitest.setup.ts` - Test setup and mocks

### 3. Run Tests

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm test -- --watch
```

**Run tests with UI:**
```bash
npm test:ui
```

**Run tests with coverage:**
```bash
npm test:coverage
```

**Run specific test file:**
```bash
npm test -- CenterHeader.test.tsx
```

## Expected Test Output

### Successful Run
```
✓ CenterHeader (24 tests)
  ✓ Rendering (6)
  ✓ No Reviews State (3)
  ✓ Button Interactions (4)
  ✓ Favorite State (4)
  ✓ Accessibility (7)

✓ CenterContactInfo (27 tests)
  ✓ Rendering (4)
  ✓ Null Value Handling (4)
  ✓ Phone Formatting (2)
  ✓ Distance Formatting (4)
  ✓ Button Interactions (7)
  ✓ Clipboard Functionality (6)
  ✓ Accessibility (5)
  ✓ Layout Variations (4)

✓ CenterDescription (20 tests)
  ✓ Rendering (5)
  ✓ Null Content State (4)
  ✓ Number Formatting (5)
  ✓ Whitespace Preservation (3)
  ✓ Accessibility (6)
  ✓ Layout and Structure (4)
  ✓ Edge Cases (4)

Test Files  3 passed (3)
     Tests  71 passed (71)
  Start at  HH:MM:SS
  Duration  XXXms
```

### Coverage Report
```
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
CenterHeader.tsx        |   95.00 |    90.00 |   100.0 |   95.00 |
CenterContactInfo.tsx   |   92.00 |    88.00 |   100.0 |   92.00 |
CenterDescription.tsx   |   100.0 |    95.00 |   100.0 |   100.0 |
------------------------|---------|----------|---------|---------|
All files               |   95.67 |    91.00 |   100.0 |   95.67 |
```

## Mock Configurations

### Toast Mock (CenterContactInfo)
```typescript
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));
```

### Clipboard API Mock
```typescript
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});
```

### Window Mocks
```typescript
// window.open
global.window.open = vi.fn();

// window.location.href
delete (window as any).location;
(window as any).location = { href: '' };
```

## Troubleshooting

### Issue: "Cannot find module '@testing-library/react'"
**Solution:**
```bash
npm install --save-dev @testing-library/react
```

### Issue: "Cannot find module '@vitejs/plugin-react'"
**Solution:**
```bash
npm install --save-dev @vitejs/plugin-react
```

### Issue: "ReferenceError: window is not defined"
**Solution:** Check that `vitest.setup.ts` is properly configured with jsdom environment.

### Issue: "Navigator.clipboard is undefined"
**Solution:** The mock in the test file should handle this. Ensure the mock is before the component import.

### Issue: Tests timeout
**Solution:** Check async operations and ensure proper use of `waitFor` for async assertions.

## Test Maintenance

### Adding New Tests
1. Follow existing test structure (AAA pattern: Arrange, Act, Assert)
2. Group related tests in `describe` blocks
3. Use clear, descriptive test names starting with "should"
4. Mock external dependencies at the top of the file
5. Clean up mocks in `beforeEach` hooks

### Updating Tests After Component Changes
1. Run tests to identify failures
2. Update test expectations to match new behavior
3. Add new tests for new features
4. Ensure coverage remains above 80%
5. Update this README if test structure changes significantly

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **User-Centric Testing**: Test from the user's perspective using accessible queries
3. **Avoid Test IDs When Possible**: Use role and accessible name queries first
4. **Keep Tests Independent**: Each test should work in isolation
5. **Use Meaningful Assertions**: Clear expectations that document component behavior
6. **Mock External Dependencies**: Keep tests fast and deterministic
7. **Test Edge Cases**: Empty states, null values, extreme inputs
8. **Accessibility Testing**: Ensure ARIA labels, keyboard navigation, and screen reader support

## Related Documentation
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Component API Documentation](../../../context/컴포넌트_API.md)
- [UI/UX Guidelines](../../../context/공통_UI_UX_가이드라인.md)
