# Error Handling Quick Reference

Quick reference guide for error handling in MindConnect backend.

---

## Import Error Classes

```typescript
// From utils/errors.ts
import {
  ValidationError,
  InvalidCoordinatesError,
  InvalidRadiusError,
  NotFoundError,
  DatabaseError,
  CacheError,
  InternalError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from '../utils/errors';

// From utils/errorCodes.ts
import { ERROR_CODES } from '../utils/errorCodes';
```

---

## Common Error Patterns

### Validation Errors

```typescript
// Invalid coordinates
if (lat < -90 || lat > 90) {
  throw new InvalidCoordinatesError('위도는 -90에서 90 사이여야 합니다', { lat });
}

// Invalid radius
if (radius < 1 || radius > 50) {
  throw new InvalidRadiusError('반경은 1-50km 사이여야 합니다', { radius });
}

// Generic validation
throw new ValidationError('입력 데이터가 유효하지 않습니다', {
  field: 'email',
  value: invalidEmail,
});
```

### Database Errors

```typescript
try {
  const result = await prisma.$queryRaw`...`;
} catch (err) {
  logger.error('[Database Error]', err);
  throw new DatabaseError('데이터 조회 중 오류가 발생했습니다', 'QUERY_FAILED');
}
```

### Cache Errors (Graceful Degradation)

```typescript
// Redis GET
try {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
} catch (err) {
  logger.error('[Cache Error]', { operation: 'get', error: err });
  // Continue with database query
}

// Redis SET
try {
  await redis.setex(key, ttl, JSON.stringify(data));
} catch (err) {
  logger.error('[Cache Error]', { operation: 'set', error: err });
  // Continue - request still succeeds
}
```

### Not Found Errors

```typescript
const center = await prisma.center.findUnique({ where: { id } });
if (!center) {
  throw new NotFoundError('Center', id);
}
```

### Authentication/Authorization Errors

```typescript
if (!req.user) {
  throw new UnauthorizedError('인증이 필요합니다');
}

if (req.user.role !== 'admin') {
  throw new ForbiddenError('권한이 없습니다');
}
```

---

## Express Controller Pattern

```typescript
const myController = async (req, res, next) => {
  try {
    // 1. Validate input (Zod schema already applied by middleware)
    const { param1, param2 } = req.query;

    // 2. Call service
    const result = await myService.doSomething(param1, param2);

    // 3. Send success response
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // 4. Pass error to error handler middleware
    next(error);
  }
};
```

---

## Service Layer Pattern

```typescript
export async function myService(param1: string, param2: number) {
  // 1. Validate inputs
  if (!param1) {
    throw new ValidationError('param1은 필수입니다');
  }

  // 2. Check cache (graceful degradation)
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    logger.error('[Cache Error]', err);
  }

  // 3. Database query with error handling
  let data;
  try {
    data = await prisma.myModel.findMany({ ... });
  } catch (err) {
    logger.error('[Database Error]', err);
    throw new DatabaseError('데이터 조회 중 오류가 발생했습니다');
  }

  // 4. Save to cache (graceful degradation)
  try {
    await redis.setex(cacheKey, ttl, JSON.stringify(data));
  } catch (err) {
    logger.error('[Cache Error]', err);
  }

  return data;
}
```

---

## Error Response Format

All errors return this format:

```typescript
{
  success: false,
  error: {
    code: string,          // Error code
    message: string,       // User-friendly message
    details?: any          // Optional details
  }
}
```

---

## HTTP Status Codes

| Error Type | Status Code |
|------------|-------------|
| ValidationError | 400 |
| UnauthorizedError | 401 |
| ForbiddenError | 403 |
| NotFoundError | 404 |
| ConflictError | 409 |
| DatabaseError | 500 |
| InternalError | 500 |
| CacheError | 500 (logged, not thrown) |

---

## Logging Best Practices

```typescript
// ✅ Good - Include context
logger.error('[Database Error]', {
  code: 'QUERY_FAILED',
  operation: 'getCenters',
  params: { lat, lng, radius },
  error: err,
});

// ❌ Bad - No context
logger.error('Error occurred');

// ✅ Good - Use appropriate log level
logger.info('[Center Search] Cache HIT');
logger.warn('[Validation] Invalid coordinates');
logger.error('[Database] Connection failed');

// ❌ Bad - Wrong log level
logger.error('[Center Search] Cache HIT'); // Should be info
```

---

## Common Mistakes to Avoid

### ❌ Don't Do This

```typescript
// 1. Don't throw generic Error
throw new Error('Something went wrong');

// 2. Don't fail on cache errors
const cached = await redis.get(key); // Will throw on error

// 3. Don't swallow errors
try {
  await doSomething();
} catch (err) {
  // Silent failure
}

// 4. Don't use console.log
console.log('Error:', err);
```

### ✅ Do This Instead

```typescript
// 1. Use specific error classes
throw new DatabaseError('데이터베이스 조회 실패');

// 2. Handle cache errors gracefully
try {
  const cached = await redis.get(key);
} catch (err) {
  logger.error('[Cache Error]', err);
  // Continue
}

// 3. Always handle or propagate errors
try {
  await doSomething();
} catch (err) {
  logger.error('[Operation Failed]', err);
  throw new InternalError('작업 실패', err);
}

// 4. Use logger
logger.error('[Error]', { error: err });
```

---

## Testing Errors

### Unit Test Example

```typescript
import { InvalidCoordinatesError } from '../utils/errors';

describe('getCentersWithinRadius', () => {
  it('should throw InvalidCoordinatesError for invalid lat', async () => {
    await expect(
      getCentersWithinRadius(95, 126.9780, 5)
    ).rejects.toThrow(InvalidCoordinatesError);
  });

  it('should handle database errors gracefully', async () => {
    // Mock Prisma to throw error
    prisma.$queryRaw = jest.fn().mockRejectedValue(new Error('DB Error'));

    await expect(
      getCentersWithinRadius(37.5, 126.9, 5)
    ).rejects.toThrow(DatabaseError);
  });
});
```

---

## Environment-Specific Behavior

### Development Mode

```typescript
// Full error details
{
  success: false,
  error: {
    code: 'DATABASE_ERROR',
    message: 'Query failed: SELECT * FROM centers',
    name: 'PrismaClientKnownRequestError',
    stack: '...',
    originalError: { ... }
  }
}
```

### Production Mode

```typescript
// Generic message only
{
  success: false,
  error: {
    code: 'DATABASE_ERROR',
    message: '데이터베이스 조회 중 오류가 발생했습니다'
  }
}
```

---

## Quick Checklist

When adding new endpoints:

- [ ] Use try-catch in async controllers
- [ ] Pass errors to `next(error)`
- [ ] Validate inputs (throw ValidationError)
- [ ] Wrap database calls in try-catch
- [ ] Handle cache errors gracefully (don't throw)
- [ ] Use appropriate error classes
- [ ] Include error context in logs
- [ ] Test error scenarios
- [ ] Document expected errors

---

## Need Help?

- **Full Documentation**: `backend/docs/ERROR_HANDLING_IMPLEMENTATION.md`
- **Error Codes**: `backend/src/utils/errorCodes.ts`
- **Error Classes**: `backend/src/utils/errors.ts`
- **Examples**: `backend/src/services/centersService.ts`

---

**Last Updated**: 2025-01-XX
