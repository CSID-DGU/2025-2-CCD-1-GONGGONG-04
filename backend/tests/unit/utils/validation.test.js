/**
 * Validation Schemas Unit Tests
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.5: Validation Schemas 단위 테스트
 *
 * 검증: 10개 테스트 통과
 */

const {
  recommendationRequestSchema,
  assessmentSubmitSchema,
  locationSchema,
} = require('../../../src/utils/validation');

describe('Validation Schemas', () => {
  describe('recommendationRequestSchema', () => {
    // Test 1: 유효한 추천 요청 (userId)
    test('should validate valid recommendation request with userId', () => {
      const validRequest = {
        userId: 1,
        location: {
          latitude: 37.5665,
          longitude: 126.978,
        },
        filters: {
          maxDistance: 10,
        },
      };

      const result = recommendationRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    // Test 2: 유효한 추천 요청 (sessionId)
    test('should validate valid recommendation request with sessionId', () => {
      const validRequest = {
        sessionId: 'abc123',
        location: {
          latitude: 37.5665,
          longitude: 126.978,
        },
      };

      const result = recommendationRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    // Test 3: userId와 sessionId 둘 다 없음 → 에러
    test('should fail when neither userId nor sessionId provided', () => {
      const invalidRequest = {
        location: {
          latitude: 37.5665,
          longitude: 126.978,
        },
      };

      const result = recommendationRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('필수');
      }
    });

    // Test 4: 잘못된 위도 범위 → 에러
    test('should fail for invalid latitude', () => {
      const invalidRequest = {
        userId: 1,
        location: {
          latitude: 91, // 범위 초과
          longitude: 126.978,
        },
      };

      const result = recommendationRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    // Test 5: 잘못된 경도 범위 → 에러
    test('should fail for invalid longitude', () => {
      const invalidRequest = {
        userId: 1,
        location: {
          latitude: 37.5665,
          longitude: -181, // 범위 초과
        },
      };

      const result = recommendationRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    // Test 6: maxDistance가 50 초과 → 에러
    test('should fail for maxDistance > 50', () => {
      const invalidRequest = {
        userId: 1,
        location: {
          latitude: 37.5665,
          longitude: 126.978,
        },
        filters: {
          maxDistance: 100,
        },
      };

      const result = recommendationRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('assessmentSubmitSchema', () => {
    // Test 7: 유효한 자가진단 제출
    test('should validate valid assessment submission', () => {
      const validSubmission = {
        userId: 1,
        templateId: 1,
        answers: [
          { questionId: 1, selectedOption: 0 },
          { questionId: 2, selectedOption: 2 },
          { questionId: 3, selectedOption: 3 },
        ],
      };

      const result = assessmentSubmitSchema.safeParse(validSubmission);
      expect(result.success).toBe(true);
    });

    // Test 8: 답변 배열 비어있음 → 에러
    test('should fail when answers array is empty', () => {
      const invalidSubmission = {
        userId: 1,
        templateId: 1,
        answers: [],
      };

      const result = assessmentSubmitSchema.safeParse(invalidSubmission);
      expect(result.success).toBe(false);
    });

    // Test 9: selectedOption 범위 초과 → 에러
    test('should fail when selectedOption is out of range', () => {
      const invalidSubmission = {
        userId: 1,
        templateId: 1,
        answers: [{ questionId: 1, selectedOption: 4 }], // 0-3만 유효
      };

      const result = assessmentSubmitSchema.safeParse(invalidSubmission);
      expect(result.success).toBe(false);
    });

    // Test 10: userId와 sessionId 둘 다 없음 → 에러
    test('should fail when neither userId nor sessionId provided', () => {
      const invalidSubmission = {
        templateId: 1,
        answers: [{ questionId: 1, selectedOption: 0 }],
      };

      const result = assessmentSubmitSchema.safeParse(invalidSubmission);
      expect(result.success).toBe(false);
    });
  });

  describe('locationSchema', () => {
    // Test 11: 유효한 위치 정보
    test('should validate valid location', () => {
      const validLocation = {
        latitude: 37.5665,
        longitude: 126.978,
      };

      const result = locationSchema.safeParse(validLocation);
      expect(result.success).toBe(true);
    });

    // Test 12: 잘못된 위치 정보
    test('should fail for invalid location', () => {
      const invalidLocation = {
        latitude: 'invalid',
        longitude: 126.978,
      };

      const result = locationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
    });
  });
});
