'use client';

/**
 * StarRating Component
 *
 * Sprint 4: Review and Rating System
 * Interactive star rating input with hover preview and readonly mode
 */

import { useState } from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  /** Current rating value (1-5) */
  rating: number;
  /** Callback when rating changes (interactive mode only) */
  onRatingChange?: (rating: number) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Read-only mode (display only, no interaction) */
  readonly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function StarRating({
  rating,
  onRatingChange,
  size = 'md',
  readonly = false,
  className = '',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleClick = (selectedRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const handleMouseEnter = (starIndex: number) => {
    if (!readonly) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;
  const starSize = sizeMap[size];

  return (
    <div
      className={`flex gap-0.5 ${className}`}
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={readonly ? `별점 ${rating}점` : '별점 선택'}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= displayRating;
        const isInteractive = !readonly && onRatingChange;

        return (
          <button
            key={starIndex}
            type="button"
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            disabled={readonly}
            className={`
              ${starSize}
              ${isInteractive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
              ${readonly ? 'pointer-events-none' : ''}
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500 focus-visible:ring-offset-2 rounded
            `}
            aria-label={readonly ? undefined : `별점 ${starIndex}점`}
            aria-checked={readonly ? undefined : starIndex === rating}
            role={readonly ? undefined : 'radio'}
            tabIndex={readonly ? -1 : 0}
          >
            <Star
              className={`
                ${starSize}
                ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-neutral-300 text-neutral-300'}
                transition-colors duration-150
              `}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
