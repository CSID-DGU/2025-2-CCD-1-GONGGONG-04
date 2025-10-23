/**
 * ReviewCard Component
 *
 * Sprint 4: Review and Rating System
 * Displays individual review with author info, rating, content, and reaction buttons
 */

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MoreVertical, Edit, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Review, ReactionType } from '@/types/review';

export interface ReviewCardProps {
  review: Review;
  onReactionClick?: (reviewId: number, reaction: ReactionType) => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
}

export function ReviewCard({ review, onReactionClick, onEdit, onDelete }: ReviewCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Format dates
  const createdDate = formatDistanceToNow(new Date(review.created_at), {
    addSuffix: true,
    locale: ko,
  });

  const visitDate = review.visit_date
    ? new Date(review.visit_date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // Handle reaction clicks
  const handleHelpfulClick = () => {
    if (onReactionClick) {
      const newReaction: ReactionType | null =
        review.my_reaction === 'helpful' ? null : 'helpful';
      onReactionClick(review.id, newReaction as ReactionType);
    }
  };

  const handleUnhelpfulClick = () => {
    if (onReactionClick) {
      const newReaction: ReactionType | null =
        review.my_reaction === 'unhelpful' ? null : 'unhelpful';
      onReactionClick(review.id, newReaction as ReactionType);
    }
  };

  // Handle delete click
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(review.id);
    }
    setShowDeleteDialog(false);
  };

  return (
    <Card className="rounded-card shadow-soft hover:shadow-card transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={review.user.avatar_url || undefined} alt={review.user.nickname} />
              <AvatarFallback>{review.user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-body font-semibold text-neutral-900">{review.user.nickname}</p>
              <p className="text-small text-neutral-600">{createdDate}</p>
            </div>
          </div>

          {/* More Menu (only for own reviews) */}
          {review.is_my_review && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="더보기 메뉴">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(review)}>
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    삭제
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex gap-0.5" role="img" aria-label={`별점 ${review.rating}점`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= review.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-neutral-200 text-neutral-200'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          {visitDate && <Badge variant="outline">방문일: {visitDate}</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Review Title */}
        {review.title && (
          <h3 className="text-body font-semibold text-neutral-900">{review.title}</h3>
        )}

        {/* Review Content */}
        <p className="text-body text-neutral-700 whitespace-pre-wrap">{review.content}</p>

        {/* Reaction Buttons */}
        {onReactionClick && (
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant={review.my_reaction === 'helpful' ? 'default' : 'ghost'}
              size="sm"
              onClick={handleHelpfulClick}
              className="gap-1"
              aria-label="이 리뷰가 도움돼요"
              aria-pressed={review.my_reaction === 'helpful'}
            >
              <ThumbsUp className="h-4 w-4" aria-hidden="true" />
              <span>{review.helpful_count}</span>
            </Button>
            <Button
              variant={review.my_reaction === 'unhelpful' ? 'default' : 'ghost'}
              size="sm"
              onClick={handleUnhelpfulClick}
              className="gap-1"
              aria-label="이 리뷰가 도움안돼요"
              aria-pressed={review.my_reaction === 'unhelpful'}
            >
              <ThumbsDown className="h-4 w-4" aria-hidden="true" />
              <span>{review.unhelpful_count}</span>
            </Button>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리뷰를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 리뷰는 복구할 수 없습니다. 정말로 삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
