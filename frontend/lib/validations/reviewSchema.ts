/**
 * Review Form Validation Schema
 *
 * Sprint 4: Review and Rating System
 * Zod validation schemas for review creation and editing
 */

import { z } from 'zod';

/**
 * Review Form Schema
 * Validates review creation and update forms
 */
export const reviewSchema = z.object({
  rating: z
    .number({
      required_error: '별점을 선택해주세요',
      invalid_type_error: '별점은 숫자여야 합니다',
    })
    .min(1, '별점은 최소 1점입니다')
    .max(5, '별점은 최대 5점입니다')
    .int('별점은 정수여야 합니다'),

  title: z
    .string()
    .min(2, '제목은 최소 2자 이상이어야 합니다')
    .max(100, '제목은 최대 100자까지 입력 가능합니다')
    .optional()
    .or(z.literal('')),

  content: z
    .string({
      required_error: '리뷰 내용을 입력해주세요',
    })
    .min(10, '리뷰 내용은 최소 10자 이상이어야 합니다')
    .max(1000, '리뷰 내용은 최대 1000자까지 입력 가능합니다'),

  visit_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)')
    .optional()
    .or(z.literal('')),
});

/**
 * Inferred TypeScript type from Zod schema
 */
export type ReviewFormValues = z.infer<typeof reviewSchema>;

/**
 * Default values for empty review form
 */
export const reviewFormDefaults: Partial<ReviewFormValues> = {
  rating: 0,
  title: '',
  content: '',
  visit_date: '',
};
