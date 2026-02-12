// store/feedback/types.ts
export interface FeedbackState {
  isShown: boolean;
  rating: number | null;
  feedbackText: string;
  isSubmitted: boolean;
  showWarning: boolean;
}

export interface FeedbackActions {
  showFeedback: () => void;
  hideFeedback: () => void;
  setRating: (rating: number) => void;
  setFeedbackText: (text: string) => void;
  submitFeedback: () => void;
  setShowWarning: (show: boolean) => void;
  resetFeedback: () => void;
}

export type FeedbackStore = FeedbackState & FeedbackActions;
