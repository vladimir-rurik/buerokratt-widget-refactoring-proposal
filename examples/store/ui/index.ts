// store/ui/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ChatUIStore, ChatUIState } from './types';

const initialState: ChatUIState = {
  isOpen: false,
  isFullscreen: false,
  dimensions: { width: 400, height: 450 },
};

export const useChatUIStore = create<ChatUIStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        open: () => set({ isOpen: true }, false, 'open'),

        close: () =>
          set({ isOpen: false, isFullscreen: false }, false, 'close'),

        toggle: () =>
          set((state) => ({ isOpen: !state.isOpen }), false, 'toggle'),

        setFullscreen: (value) =>
          set({ isFullscreen: value }, false, 'setFullscreen'),

        setDimensions: (width, height) =>
          set({ dimensions: { width, height } }, false, 'setDimensions'),
      }),
      {
        name: 'byk-chat-ui',
        partialize: (state) => ({ dimensions: state.dimensions }),
      }
    ),
    { name: 'ChatUI' }
  )
);

export type { ChatUIState, ChatUIActions, ChatUIStore } from './types';
