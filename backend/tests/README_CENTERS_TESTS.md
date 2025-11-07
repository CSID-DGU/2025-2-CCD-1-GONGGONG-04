# Centers Search API Tests

> **Sprint 1: 지도 기반 센터 검색 - Day 2 Testing**
>
> Comprehensive unit and integration tests for the Centers Search API

---

## 📚 Test Files Created

### 1. Unit Tests
**File**: `tests/unit/services/centersService.test.ts`

**Test Count**: 17 test cases

**Coverage Areas**:
- ✅ `getCentersWithinRadius` function behavior
- ✅ Redis caching (cache hit/miss scenarios)
- ✅ Distance calculation integration
- ✅ Walk time calculation (80m per minute)
- ✅ Operating status integration (OPEN, CLOSING_SOON, CLOSED, NO_INFO, HOLIDAY)
- ✅ Empty result handling
- ✅ Database error handling
- ✅ Redis error handling (graceful degradation)
- ✅ Operating status error handling
- ✅ Null coordinates handling
- ✅ Default radius behavior (5km)
- ✅ Result ordering by distance
- ✅ Result limit (100 centers)

### 2. Integration Tests
**File**: `tests/integration/api/centers-search.api.test.ts`

**Test Count**: 50+ test cases

**Coverage Areas**:

#### Success Cases (200 OK)
- ✅ Valid parameters return 200
- ✅ Centers array with correct structure
- ✅ Default radius (5km) when not provided
- ✅ Decimal coordinates handling
- ✅ Boundary latitude values (-90, 90)
- ✅ Boundary longitude values (-180, 180)
- ✅ Maximum radius (50km)
- ✅ Minimum radius (1km)

#### Validation Errors (400 Bad Request)
- ✅ Missing lat parameter
- ✅ Missing lng parameter
- ✅ Missing both lat and lng
- ✅ Latitude < -90
- ✅ Latitude > 90
- ✅ Longitude < -180
- ✅ Longitude > 180
- ✅ Non-numeric latitude/longitude
- ✅ Empty latitude/longitude
- ✅ Radius < 1
- ✅ Radius > 50
- ✅ Negative radius
- ✅ Non-numeric radius

#### Response Format Validation (FR-BE-01)
- ✅ Matches specification structure
- ✅ All required fields present
- ✅ Correct data types
- ✅ Walk time format (e.g., "10분")
- ✅ Operating status values
- ✅ Total matches number of centers
- ✅ Optional fields handling

#### Database Integration
- ✅ Returns actual centers from database
- ✅ Valid data verification
- ✅ Rating range validation (0-5)
- ✅ Non-negative review counts

#### Redis Caching
- ✅ Cache results after first query
- ✅ Different cache keys for different coordinates
- ✅ Different cache keys for different radius
- ✅ Graceful handling of Redis errors

#### Performance Tests
- ✅ Response within threshold (<2000ms)
- ✅ Large radius queries efficient (<2000ms)
- ✅ Caching performance benefits

#### Edge Cases
- ✅ Remote location returns empty array
- ✅ Many decimal places in coordinates
- ✅ Special characters handled gracefully

---

## 🚀 Running Tests

### Prerequisites
```bash
# Ensure environment variables are set
# Create .env.local if not exists
cp .env.example .env.local

# Ensure database is running
docker-compose up -d db

# Ensure Redis is running (optional for unit tests)
docker-compose up -d redis
```

### Run All Tests
```bash
cd backend
npm test
```

### Run Unit Tests Only
```bash
npm test -- tests/unit/services/centersService.test.ts
```

### Run Integration Tests Only
```bash
npm test -- tests/integration/api/centers-search.api.test.ts
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run in Watch Mode
```bash
npm run test:watch
```

---

## 📊 Test Coverage Summary

### Service Layer (`centersService.ts`)
Expected coverage: **>80%**

**Covered Functions**:
- `getCentersWithinRadius()` - Main search function
- `calculateWalkTime()` - Helper function for walk time
- Redis caching logic
- Distance calculation integration
- Operating status integration

**Edge Cases Covered**:
- Cache hit/miss scenarios
- Redis connection failures
- Database query failures
- Operating status calculation failures
- Null/invalid coordinates
- Empty results
- Large result sets (100+ centers)

### API Layer (`GET /api/v1/centers`)
Expected coverage: **>80%**

**Covered Endpoints**:
- `GET /api/v1/centers?lat=X&lng=Y&radius=Z`

**Validation Coverage**:
- All parameter validation (lat, lng, radius)
- All error responses (400, 500)
- All success responses (200)

---

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
{
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js',
    '**/tests/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      isolatedModules: true,
      diagnostics: false
    }]
  }
}
```

### Test Setup (`tests/setup.js`)
- Loads environment variables from `.env.local`
- Registers ts-node for TypeScript support
- Makes app available globally for tests
- Sets global test timeout (30s)

---

## 🧪 Mocking Strategy

### Prisma Client Mock
```typescript
jest.mock('@prisma/client');
const mockPrisma = {
  $queryRaw: jest.fn(),
  $executeRawUnsafe: jest.fn()
};
```

### Redis Mock
```typescript
jest.mock('ioredis');
const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  quit: jest.fn()
};
```

### Distance Service Mock
```typescript
jest.mock('../../../src/services/distance.service');
const mockCalculateDistance = jest.fn();
```

### Operating Status Service Mock
```typescript
jest.mock('../../../src/services/operatingStatus.service');
const mockCalculateOperatingStatus = jest.fn();
```

---

## 📝 Test Data

### Sample Center Data
```javascript
{
  id: BigInt(1),
  center_name: '서울시 정신건강복지센터',
  latitude: { toString: () => '37.5665' },
  longitude: { toString: () => '126.9780' },
  center_type: '정신건강복지센터',
  road_address: '서울특별시 중구 세종대로 110',
  phone_number: '02-1234-5678',
  avg_rating: { toString: () => '4.5' },
  review_count: 42
}
```

### Test Coordinates
- **Seoul City Hall**: `lat=37.5665, lng=126.9780`
- **Gangnam Station**: `lat=37.4979, lng=127.0276`
- **Boundary Tests**: `lat=-90/90, lng=-180/180`

---

## 🐛 Known Issues & Solutions

### Issue 1: Redis Connection Errors in Tests
**Symptom**: `ECONNREFUSED 127.0.0.1:6380`

**Solution**:
- Unit tests mock Redis completely (no real connection needed)
- Integration tests require Redis running:
  ```bash
  docker-compose up -d redis
  ```
- Or set `REDIS_URL=redis://localhost:6379` in `.env.local`

### Issue 2: Prisma $executeRawUnsafe Not Mocked
**Symptom**: `TypeError: prisma.$executeRawUnsafe is not a function`

**Solution**:
- Unit tests need complete Prisma mock including `$executeRawUnsafe`
- Already implemented in test setup:
  ```typescript
  const mockPrisma = {
    $queryRaw: jest.fn(),
    $executeRawUnsafe: jest.fn()
  };
  ```

### Issue 3: Open Handles Warning
**Symptom**: `Jest has detected the following 1 open handle`

**Solution**:
- Integration tests should properly close connections:
  ```typescript
  afterAll(async () => {
    await prisma.$disconnect();
    await redis.quit();
  });
  ```

---

## ✅ Test Checklist

### Before Running Tests
- [ ] Database is running (`docker-compose up -d db`)
- [ ] Redis is running (`docker-compose up -d redis`) - *optional for unit tests*
- [ ] Environment variables are set (`.env.local`)
- [ ] Dependencies are installed (`npm install`)
- [ ] Database schema is up to date (`npx prisma generate`)

### After Running Tests
- [ ] All unit tests pass (17/17)
- [ ] All integration tests pass (50+/50+)
- [ ] Code coverage > 80%
- [ ] No open handles warnings
- [ ] No memory leaks

---

## 📈 Coverage Goals

### Target Coverage
- **Service Layer**: >80% line coverage
- **API Layer**: >80% line coverage
- **Error Handling**: 100% coverage
- **Edge Cases**: 100% coverage

### How to Check Coverage
```bash
npm run test:coverage

# View detailed HTML report
open coverage/lcov-report/index.html
```

---

## 🔍 Debugging Tests

### Enable Verbose Output
```bash
npm test -- --verbose
```

### Run Single Test
```bash
npm test -- --testNamePattern="should return centers within radius"
```

### Debug in VS Code
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "--runInBand",
    "--no-cache",
    "${fileBasename}"
  ],
  "cwd": "${workspaceFolder}/backend",
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

## 📚 Additional Resources

### Related Documentation
- [PRD - 지도 기반 센터 검색](../context/PRD.md#sprint-1-지도-기반-센터-검색)
- [Database Design](../context/Database_design.md)
- [API Specification](../context/API_specification.md)

### Testing Best Practices
- Always test error scenarios
- Test boundary conditions
- Mock external dependencies
- Use realistic test data
- Clean up resources after tests
- Verify response formats match specifications

---

**Last Updated**: 2025-01-07
**Test Version**: v1.0.0
**Sprint**: Sprint 1 - Day 2
