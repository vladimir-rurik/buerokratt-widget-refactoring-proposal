// components/organisms/FeedbackForm/types.ts
export interface FeedbackFormProps {
  isShown: boolean;
  rating: number | null;
  feedbackText: string;
  showWarning: boolean;
  isSubmittingRating: boolean;
  isSubmittingFeedback: boolean;
  onSetRating: (rating: number) => void;
  onSubmit: (text: string) => void;
  onClose: () => void;
}
