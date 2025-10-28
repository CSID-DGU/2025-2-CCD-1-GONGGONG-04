'use client';

/**
 * ReviewFormModal Component
 *
 * Sprint 4: Review and Rating System
 * Modal dialog for creating and editing reviews
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from './StarRating';
import { useCreateReview, useUpdateReview } from '@/hooks/useReviewMutation';
import { reviewSchema, reviewFormDefaults } from '@/lib/validations/reviewSchema';
import type { ReviewFormValues } from '@/lib/validations/reviewSchema';
import type { Review } from '@/types/review';

export interface ReviewFormModalProps {
  /** Center ID to review */
  centerId: number;
  /** Existing review for edit mode (null for create mode) */
  existingReview?: Review | null;
  /** Dialog open state */
  isOpen: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback on successful submission */
  onSuccess?: (review: Review) => void;
}

export function ReviewFormModal({
  centerId,
  existingReview,
  isOpen,
  onClose,
  onSuccess,
}: ReviewFormModalProps) {
  const isEditMode = !!existingReview;

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: reviewFormDefaults,
  });

  // Watch content field for character count
  const contentValue = watch('content') || '';
  const contentLength = contentValue.length;

  // Mutations
  const createMutation = useCreateReview(centerId);
  const updateMutation = useUpdateReview();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Populate form with existing review data when editing
  useEffect(() => {
    if (isEditMode && existingReview) {
      reset({
        rating: existingReview.rating,
        title: existingReview.title || '',
        content: existingReview.content,
        visit_date: existingReview.visit_date || '',
      });
    } else {
      reset(reviewFormDefaults);
    }
  }, [isEditMode, existingReview, reset]);

  // Submit handler
  const onSubmit = async (data: ReviewFormValues) => {
    try {
      // Transform empty strings to null for optional fields
      const formData = {
        rating: data.rating,
        title: data.title || null,
        content: data.content,
        visit_date: data.visit_date || null,
      };

      if (isEditMode && existingReview) {
        // Update existing review
        const updatedReview = await updateMutation.mutateAsync({
          reviewId: existingReview.id,
          data: formData,
        });
        onSuccess?.(updatedReview);
      } else {
        // Create new review
        const newReview = await createMutation.mutateAsync(formData);
        onSuccess?.(newReview);
      }

      // Close modal and reset form
      onClose();
      reset(reviewFormDefaults);
    } catch (error) {
      // Error handling is done in mutation hooks via toast
      console.error('Review submission error:', error);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!isLoading) {
      onClose();
      reset(reviewFormDefaults);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-h2">
            {isEditMode ? '리뷰 수정' : '리뷰 작성'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="text-small font-medium">
              별점 <span className="text-destructive">*</span>
            </Label>
            <StarRating
              rating={watch('rating') || 0}
              onRatingChange={(rating) => setValue('rating', rating, { shouldValidate: true })}
              size="lg"
            />
            {errors.rating && (
              <p className="text-caption text-destructive" role="alert">
                {errors.rating.message}
              </p>
            )}
          </div>

          {/* Title (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-small font-medium">
              제목 (선택)
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="리뷰 제목을 입력하세요"
              {...register('title')}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-caption text-destructive" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Content (Required) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="content" className="text-small font-medium">
                리뷰 내용 <span className="text-destructive">*</span>
              </Label>
              <span
                className={`text-caption ${
                  contentLength > 1000 ? 'text-destructive' : 'text-neutral-500'
                }`}
              >
                {contentLength} / 1000
              </span>
            </div>
            <Textarea
              id="content"
              placeholder="센터에 대한 솔직한 리뷰를 작성해주세요 (최소 10자)"
              rows={6}
              {...register('content')}
              aria-invalid={!!errors.content}
              aria-describedby={errors.content ? 'content-error' : undefined}
            />
            {errors.content && (
              <p id="content-error" className="text-caption text-destructive" role="alert">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Visit Date (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="visit_date" className="text-small font-medium">
              방문 날짜 (선택)
            </Label>
            <Input
              id="visit_date"
              type="date"
              {...register('visit_date')}
              aria-invalid={!!errors.visit_date}
              aria-describedby={errors.visit_date ? 'visit-date-error' : undefined}
            />
            {errors.visit_date && (
              <p id="visit-date-error" className="text-caption text-destructive" role="alert">
                {errors.visit_date.message}
              </p>
            )}
          </div>

          {/* Footer Buttons */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" variant="default" disabled={isLoading}>
              {isLoading ? '저장 중...' : isEditMode ? '수정하기' : '등록'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
