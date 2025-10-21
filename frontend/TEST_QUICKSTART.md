# Test Quick Start Guide

Quick reference for running unit tests in the MindConnect project.

## Setup (One-time)

```bash
cd frontend

# Install missing dependencies (if needed)
npm install --save-dev @testing-library/react @vitejs/plugin-react jsdom

# Verify installation
npm list @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Run Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm test -- --watch

# Run with UI interface
npm test:ui

# Run with coverage report
npm test:coverage
```

### Specific Test Commands

```bash
# Run specific test file
npm test -- CenterHeader.test.tsx

# Run tests matching pattern
npm test -- Center

# Run tests in specific directory
npm test -- components/center
```

## Expected Results

### Success Output
```
✓ components/center/__tests__/CenterHeader.test.tsx (24)
✓ components/center/__tests__/CenterContactInfo.test.tsx (27)
✓ components/center/__tests__/CenterDescription.test.tsx (20)

Test Files  3 passed (3)
     Tests  71 passed (71)
  Start at  XX:XX:XX
  Duration  ~2s
```

### Coverage Report
```
------------------------|---------|----------|---------|---------|
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
CenterHeader.tsx        |   95+   |    90+   |   100   |   95+   |
CenterContactInfo.tsx   |   92+   |    88+   |   100   |   92+   |
CenterDescription.tsx   |   100   |    95+   |   100   |   100   |
------------------------|---------|----------|---------|---------|
All files               |   95+   |    91+   |   100   |   95+   |
```

## Test Files Location

```
frontend/
└── components/
    └── center/
        ├── __tests__/
        │   ├── CenterHeader.test.tsx        (24 tests)
        │   ├── CenterContactInfo.test.tsx   (27 tests)
        │   ├── CenterDescription.test.tsx   (20 tests)
        │   └── README.md                    (Detailed docs)
        ├── CenterHeader.tsx
        ├── CenterContactInfo.tsx
        └── CenterDescription.tsx
```

## Troubleshooting

### Tests won't run
1. Check Node.js version: `node --version` (should be 18+)
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Clear cache: `npm test -- --clearCache`

### Import errors
```bash
npm install --save-dev @testing-library/react @vitejs/plugin-react jsdom
```

### Coverage below 80%
- Check which lines are not covered in the HTML report
- Add tests for uncovered scenarios
- Report location: `frontend/coverage/index.html`

## Quick Tips

1. **Watch Mode**: Best for development, auto-reruns tests
2. **UI Mode**: Visual interface for debugging tests
3. **Coverage**: Shows exactly which code needs more tests
4. **Specific Files**: Faster when working on one component

## Documentation

- **Detailed Guide**: `components/center/__tests__/README.md`
- **Summary**: `claudedocs/center-components-testing-summary.md`
- **Vitest Docs**: https://vitest.dev/

## Common Patterns

### Run tests for component you're working on
```bash
npm test -- --watch CenterHeader
```

### Check coverage for specific file
```bash
npm test:coverage -- CenterHeader.test.tsx
```

### Debug failing test
```bash
npm test:ui
# Then select failing test in UI
```

---

**Need Help?** See detailed documentation in `components/center/__tests__/README.md`
