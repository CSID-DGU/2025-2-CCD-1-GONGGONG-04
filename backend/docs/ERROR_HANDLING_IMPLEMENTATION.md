# Error Handling Implementation Summary

**Sprint 1 - Day 2: 에러 핸들러 미들웨어 작성**

Date: 2025-01-XX

## Overview

Enhanced the error handling system for the MindConnect backend API with comprehensive error types, Prisma error handling, Redis graceful degradation, and improved logging.

---

## Files Created/Modified

### ✅ Created Files

1. **`backend/src/utils/errorCodes.ts`**
   - Centralized error code constants
   - Error response interfaces
   - Error code to HTTP status mapping
   - User-friendly error messages (Korean)
   - Example error responses for documentation

### ✅ Modified Files

1. **`backend/src/middlewares/errorHandler.ts`** (Primary)
   - Added Zod validation error handling
   - Added Prisma database error handling
   - Added improved error logging with context
   - Enhanced operational vs programming error distinction
   - Added development vs production error details

2. **`backend/src/middlewares/errorHandler.js`** (Secondary)
   - Updated to match TypeScript implementation
   - Ensures consistency for JavaScript code

3. **`backend/src/utils/errors.ts`**
   - Added `DatabaseError` class with Prisma error mapping
   - Added `CacheError` class for Redis errors
   - Added `InvalidCoordinatesError` for map search validation
   - Added `InvalidRadiusError` for radius validation
   - Enhanced error classes with static factory methods

4. **`backend/src/services/centersService.ts`**
   - Added input validation with custom error types
   - Added database error handling with try-catch
   - Added Redis graceful degradation
   - Replaced console.log with proper logger
   - Enhanced error context and logging

---

## Error Handling Architecture

### Error Classification

```
Error Types (Hierarchy)
├── Operational Errors (Expected, handled gracefully)
│   ├── ValidationError (400)
│   │   ├── InvalidCoordinatesError
│   │   └── InvalidRadiusError
│   ├── UnauthorizedError (401)
│   ├── ForbiddenError (403)
│   ├── NotFoundError (404)
│   ├── ConflictError (409)
│   ├── DatabaseError (500)
│   ├── CacheError (500 - Non-fatal)
│   └── InternalError (500)
└── Programming Errors (Unexpected, bugs)
    ├── TypeError
    ├── ReferenceError
    └── Other uncaught errors
```

### Error Handling Flow

```
1. Request arrives at Express
2. Error occurs in controller/service
3. Error is thrown or passed to next(error)
4. Error Handler Middleware processes error:

   ┌─────────────────────────────────────┐
   │   Error Handler Middleware          │
   ├─────────────────────────────────────┤
   │ 1. Check if ZodError                │
   │    → Convert to ValidationError     │
   │    → Return 400 with details        │
   ├─────────────────────────────────────┤
   │ 2. Check if PrismaError             │
   │    → Convert to DatabaseError       │
   │    → Return 500 with message        │
   ├─────────────────────────────────────┤
   │ 3. Check if OperationalError        │
   │    → Use error's toJSON()           │
   │    → Return with statusCode         │
   ├─────────────────────────────────────┤
   │ 4. Programming Error                │
   │    → Log full details               │
   │    → Return generic 500             │
   │    → Hide details in production     │
   └─────────────────────────────────────┘

5. Response sent to client with standardized format
```

---

## Error Response Format

### Standard Format

All errors follow this structure:

```typescript
{
  success: false,
  error: {
    code: string,          // Error code (e.g., "INVALID_COORDINATES")
    message: string,       // User-friendly Korean message
    details?: any          // Optional additional information
  }
}
```

### Examples

#### Validation Error (400)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_COORDINATES",
    "message": "위도는 -90에서 90 사이여야 합니다",
    "details": {
      "lat": 95.5
    }
  }
}
```

#### Zod Validation Error (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 유효하지 않습니다",
    "details": [
      {
        "field": "query.lat",
        "message": "Latitude must be between -90 and 90",
        "code": "custom"
      }
    ]
  }
}
```

#### Database Error (500)

```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "센터 검색 중 데이터베이스 오류가 발생했습니다"
  }
}
```

#### Not Found Error (404)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Route not found: GET /api/v1/invalid-route"
  }
}
```

---

## Error Types and Codes

### Map Search Specific Errors

| Code | Status | Message | Usage |
|------|--------|---------|-------|
| `INVALID_COORDINATES` | 400 | 잘못된 좌표값입니다 | Lat/lng validation failed |
| `INVALID_RADIUS` | 400 | 잘못된 반경값입니다 (1-50km) | Radius validation failed |
| `DATABASE_ERROR` | 500 | 데이터베이스 조회 중 오류가 발생했습니다 | Database query failed |
| `CACHE_ERROR` | 500 | 캐시 작업 중 오류가 발생했습니다 | Redis operation failed (logged, not thrown) |

### General Error Codes

| Code | Status | Message |
|------|--------|---------|
| `VALIDATION_ERROR` | 400 | 입력 데이터가 유효하지 않습니다 |
| `UNAUTHORIZED` | 401 | 인증이 필요합니다 |
| `FORBIDDEN` | 403 | 권한이 없습니다 |
| `NOT_FOUND` | 404 | 요청한 리소스를 찾을 수 없습니다 |
| `CONFLICT` | 409 | 요청한 작업이 기존 데이터와 충돌합니다 |
| `INTERNAL_ERROR` | 500 | 서버 내부 에러가 발생했습니다 |

---

## Prisma Error Handling

### Prisma Error Code Mapping

The error handler automatically converts Prisma errors to user-friendly messages:

| Prisma Code | Our Code | Message |
|-------------|----------|---------|
| P2002 | DUPLICATE_ENTRY | 이미 존재하는 데이터입니다 |
| P2025 | NOT_FOUND | 요청한 데이터를 찾을 수 없습니다 |
| P2003 | FOREIGN_KEY_VIOLATION | 참조 무결성 제약 조건 위반입니다 |
| P2010 | QUERY_FAILED | 데이터베이스 쿼리 실행에 실패했습니다 |
| P1001 | CONNECTION_ERROR | 데이터베이스 연결에 실패했습니다 |

### Usage Example

```typescript
try {
  const centers = await prisma.$queryRaw`SELECT * FROM centers`;
} catch (err) {
  // Error handler will automatically convert Prisma error
  // to DatabaseError with appropriate message
  throw err; // or next(err) in Express
}
```

---

## Redis Graceful Degradation

### Philosophy

**Redis failures should NOT fail the request.**

The application gracefully degrades when Redis is unavailable:
- Cache errors are logged but not thrown
- Request continues with database query
- Response still succeeds (slower but functional)

### Implementation

```typescript
// Redis GET operation
try {
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
} catch (err) {
  // Log but continue
  logger.error('[Cache Error]', { error: err });
  // Continue to database query
}

// Redis SET operation
try {
  await redis.setex(cacheKey, ttl, data);
} catch (err) {
  // Log but don't fail the request
  logger.error('[Cache Error]', { error: err });
  // Request still succeeds
}
```

---

## Logging Strategy

### Log Levels by Error Type

| Error Type | Log Level | When |
|------------|-----------|------|
| Validation Errors (4xx) | `warn` | Development only |
| Client Errors (4xx) | `warn` | Development only |
| Server Errors (5xx) | `error` | Always |
| Cache Errors | `error` | Always |
| Programming Errors | `error` | Always |

### Log Context

All error logs include:
- Error code
- Error message
- HTTP status code
- Request path
- Request method
- Stack trace (development only)
- Original error (if wrapped)

### Example Log Output

```json
{
  "level": "error",
  "message": "[Database Error]",
  "code": "QUERY_FAILED",
  "message": "센터 검색 중 데이터베이스 오류가 발생했습니다",
  "prismaCode": "P2010",
  "path": "/api/v1/centers",
  "method": "GET",
  "timestamp": "2025-01-XX 14:30:00"
}
```

---

## Development vs Production Behavior

### Development Mode

- ✅ Full error details in response
- ✅ Stack traces included
- ✅ Original error information exposed
- ✅ All errors logged to console
- ✅ Validation errors logged with details

### Production Mode

- ✅ Generic error messages only
- ❌ No stack traces
- ❌ No original error details
- ✅ Server errors logged only
- ✅ Client errors not logged

### Configuration

```typescript
const config = {
  env: process.env.NODE_ENV || 'development'
};

// In error handler
if (config.env === 'production') {
  // Hide details
} else {
  // Show details
}
```

---

## Integration with Existing Code

### app.js Integration

Error handling middleware is already integrated in the correct order:

```javascript
// 1. Routes (throw errors)
app.use(`${apiPrefix}/centers`, centersRoutes);

// 2. 404 handler
app.use(notFoundHandler);

// 3. Sentry error handler (optional)
if (Sentry && Sentry.Handlers) {
  app.use(Sentry.Handlers.errorHandler());
}

// 4. Global error handler (LAST)
app.use(errorHandler);
```

### Controller Pattern

```typescript
const searchCenters = async (req, res, next) => {
  try {
    const result = await getCentersWithinRadius(lat, lng, radius);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

### Service Pattern

```typescript
export async function getCentersWithinRadius(lat, lng, radius) {
  // Validate inputs
  if (lat < -90 || lat > 90) {
    throw new InvalidCoordinatesError('위도는 -90에서 90 사이여야 합니다', { lat });
  }

  // Database operations with error handling
  try {
    const centers = await prisma.$queryRaw`...`;
  } catch (err) {
    logger.error('[Database Error]', err);
    throw new DatabaseError('센터 검색 중 데이터베이스 오류가 발생했습니다');
  }

  // Redis graceful degradation
  try {
    await redis.set(key, value);
  } catch (err) {
    logger.error('[Cache Error]', err);
    // Continue without caching
  }
}
```

---

## Testing Error Handling

### Manual Testing

#### Test Invalid Coordinates

```bash
# Invalid latitude (> 90)
curl "http://localhost:8080/api/v1/centers?lat=95&lng=126.9780&radius=5"

# Expected: 400 with INVALID_COORDINATES error
```

#### Test Invalid Radius

```bash
# Invalid radius (> 50)
curl "http://localhost:8080/api/v1/centers?lat=37.5665&lng=126.9780&radius=100"

# Expected: 400 with INVALID_RADIUS error
```

#### Test Database Error

```bash
# Simulate by stopping MySQL
docker-compose stop db
curl "http://localhost:8080/api/v1/centers?lat=37.5665&lng=126.9780&radius=5"

# Expected: 500 with DATABASE_ERROR
```

#### Test Redis Graceful Degradation

```bash
# Simulate by stopping Redis
docker-compose stop redis
curl "http://localhost:8080/api/v1/centers?lat=37.5665&lng=126.9780&radius=5"

# Expected: 200 with data (slower response, error logged)
```

### Unit Testing

```typescript
describe('Error Handler', () => {
  it('should handle Zod validation errors', async () => {
    const error = new ZodError([...]);
    // Test error conversion
  });

  it('should handle Prisma errors', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('...', { code: 'P2002' });
    // Test error conversion
  });

  it('should gracefully degrade on Redis errors', async () => {
    // Mock Redis failure
    // Verify request still succeeds
  });
});
```

---

## Best Practices

### DO ✅

- Always use custom error classes (InvalidCoordinatesError, DatabaseError, etc.)
- Include meaningful error messages in Korean
- Provide details for validation errors
- Log all server errors (5xx)
- Use graceful degradation for non-critical services (Redis)
- Validate inputs at service layer
- Use try-catch for database operations
- Pass errors to `next(error)` in Express controllers

### DON'T ❌

- Don't expose sensitive information in error messages
- Don't use generic Error class for operational errors
- Don't fail requests on cache errors
- Don't include stack traces in production
- Don't log validation errors in production
- Don't swallow errors silently
- Don't use console.log for error logging

---

## Error Code Reference

For complete error code documentation, see:
- `backend/src/utils/errorCodes.ts` - All error codes and mappings
- `backend/src/utils/errors.ts` - Error class definitions

---

## Future Enhancements

### Planned Improvements

1. **Error Monitoring**
   - Integrate with Sentry for production error tracking
   - Set up error rate alerts
   - Track error patterns and trends

2. **Error Recovery**
   - Implement retry logic for transient errors
   - Add circuit breaker for external services
   - Implement fallback strategies

3. **Error Analytics**
   - Track most common errors
   - Identify error hotspots
   - Measure error impact on user experience

4. **i18n Support**
   - Support multiple languages for error messages
   - Client language detection
   - Localized error messages

---

## Troubleshooting

### Common Issues

#### Issue: Errors not being caught

**Cause**: Async errors not properly handled

**Solution**: Use try-catch in async functions and pass to next()

```typescript
// ❌ Wrong
async function handler(req, res) {
  const data = await service.getData(); // Error not caught
}

// ✅ Correct
async function handler(req, res, next) {
  try {
    const data = await service.getData();
  } catch (error) {
    next(error);
  }
}
```

#### Issue: Redis errors failing requests

**Cause**: Not catching Redis errors

**Solution**: Always use try-catch for Redis operations

```typescript
// ❌ Wrong
const data = await redis.get(key); // Throws on error

// ✅ Correct
try {
  const data = await redis.get(key);
} catch (err) {
  logger.error('Redis error', err);
  // Continue with database query
}
```

#### Issue: Generic error messages in development

**Cause**: NODE_ENV not set to 'development'

**Solution**: Check environment variable

```bash
# Set in .env
NODE_ENV=development

# Or in docker-compose.yml
environment:
  - NODE_ENV=development
```

---

## Conclusion

The error handling system is now production-ready with:

- ✅ Comprehensive error types and codes
- ✅ Prisma error handling
- ✅ Zod validation error handling
- ✅ Redis graceful degradation
- ✅ Proper logging strategy
- ✅ Development vs production behavior
- ✅ Standardized error response format
- ✅ Error code documentation

All Day 2 error handling requirements have been successfully implemented.

---

**Document Version**: 1.0
**Last Updated**: 2025-01-XX
**Author**: Backend Architecture Team
