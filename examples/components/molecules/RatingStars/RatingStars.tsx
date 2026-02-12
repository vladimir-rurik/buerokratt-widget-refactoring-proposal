// components/molecules/RatingStars/RatingStars.tsx
import { useState, useCallback, memo } from 'react';
import { Icon } from '@/components/atoms';
import { cn } from '@/core/utils';
import type { RatingStarsProps } from './types';

export const RatingStars = memo(function RatingStars({
  value,
  onChange,
  maxRating = 5,
  isReadOnly = false,
  size = 24,
}: RatingStarsProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const displayRating = hoveredRating ?? value ?? 0;

  const handleMouseEnter = useCallback(
    (rating: number) => {
      if (!isReadOnly) {
        setHoveredRating(rating);
      }
    },
    [isReadOnly]
  );

  const handleMouseLeave = useCallback(() => {
    if (!isReadOnly) {
      setHoveredRating(null);
    }
  }, [isReadOnly]);

  const handleClick = useCallback(
    (rating: number) => {
      if (!isReadOnly) {
        onChange(rating);
      }
    },
    [isReadOnly, onChange]
  );

  return (
    <div
      className={cn('rating-stars', isReadOnly && 'rating-stars--readonly')}
      role="group"
      aria-label="Hinnang"
    >
      {Array.from({ length: maxRating }, (_, i) => {
        const rating = i + 1;
        const isFilled = rating <= displayRating;

        return (
          <button
            key={rating}
            type="button"
            className={cn('rating-stars__star', {
              'rating-stars__star--filled': isFilled,
            })}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={isReadOnly}
            aria-label={`${rating} tärni${isFilled ? ', valitud' : ''}`}
            aria-pressed={isFilled}
          >
            <Icon name={isFilled ? 'star-filled' : 'star'} size={size} />
          </button>
        );
      })}
    </div>
  );
});
