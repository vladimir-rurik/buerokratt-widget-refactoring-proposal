// components/molecules/RatingStars/types.ts
export interface RatingStarsProps {
  value: number | null;
  onChange: (rating: number) => void;
  maxRating?: number;
  isReadOnly?: boolean;
  size?: 16 | 20 | 24 | 32;
}
