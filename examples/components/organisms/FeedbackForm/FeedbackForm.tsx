// components/organisms/FeedbackForm/FeedbackForm.tsx
import { memo, useState, useEffect } from 'react';
import { Button, Input, Typography } from '@/components/atoms';
import { RatingStars } from '@/components/molecules';
import type { FeedbackFormProps } from './types';

export const FeedbackForm = memo(function FeedbackForm({
  isShown,
  rating,
  feedbackText,
  showWarning,
  isSubmittingRating,
  isSubmittingFeedback,
  onSetRating,
  onSubmit,
  onClose,
}: FeedbackFormProps) {
  const [localText, setLocalText] = useState(feedbackText);

  useEffect(() => {
    setLocalText(feedbackText);
  }, [feedbackText]);

  if (!isShown) return null;

  const handleSubmit = () => {
    if (!rating) {
      return;
    }
    onSubmit(localText);
  };

  return (
    <div className="feedback-form" role="dialog" aria-label="Tagasiside">
      <Typography variant="h3">Kuidas vestlus läks?</Typography>

      <RatingStars
        value={rating}
        onChange={onSetRating}
        isReadOnly={isSubmittingRating}
      />

      {showWarning && (
        <p className="feedback-form__warning" role="alert">
          Palun vali hinnang enne saatmist
        </p>
      )}

      <Input
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        placeholder="Lisa kommentaar (valikuline)"
        disabled={isSubmittingFeedback}
      />

      <div className="feedback-form__actions">
        <Button variant="ghost" onClick={onClose}>
          Tühista
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmittingFeedback}
          disabled={!rating || isSubmittingRating}
        >
          Saada
        </Button>
      </div>
    </div>
  );
});
