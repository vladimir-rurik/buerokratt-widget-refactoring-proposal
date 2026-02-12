// store/feedback/index.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { FeedbackStore, FeedbackState } from './types';

const initialState: FeedbackState = {
  isShown: false,
  rating: null,
  feedbackText: '',
  isSubmitted: false,
  showWarning: false,
};

export const useFeedbackStore = create<FeedbackStore>()(
  devtools(
    (set) => ({
      ...initialState,

      showFeedback: () => set({ isShown: true }, false, 'showFeedback'),

      hideFeedback: () => set({ isShown: false }, false, 'hideFeedback'),

      setRating: (rating: number) =>
        set({ rating, showWarning: false }, false, 'setRating'),

      setFeedbackText: (text: string) =>
        set({ feedbackText: text }, false, 'setFeedbackText'),

      submitFeedback: () =>
        set({ isSubmitted: true, isShown: false }, false, 'submitFeedback'),

      setShowWarning: (show: boolean) =>
        set({ showWarning: show }, false, 'setShowWarning'),

      resetFeedback: () =>
        set(initialState, false, 'resetFeedback'),
    }),
    { name: 'Feedback' }
  )
);

export type { FeedbackState, FeedbackActions, FeedbackStore } from './types';
