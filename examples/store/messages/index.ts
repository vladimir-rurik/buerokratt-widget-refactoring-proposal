// store/messages/index.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { MessagesStore, MessagesState, Message } from './types';

const initialState: MessagesState = {
  items: [],
  queue: [],
  newMessagesCount: 0,
  lastReadTimestamp: null,
};

export const useMessagesStore = create<MessagesStore>()(
  devtools(
    (set) => ({
      ...initialState,

      addMessage: (message: Message) =>
        set(
          (state) => {
            if (state.items.some((m) => m.id === message.id)) {
              return state;
            }
            return {
              items: [...state.items, message],
              newMessagesCount: state.newMessagesCount + 1,
            };
          },
          false,
          'addMessage'
        ),

      addMessages: (messages: Message[]) =>
        set(
          (state) => {
            const existingIds = new Set(state.items.map((m) => m.id));
            const newMessages = messages.filter((m) => !existingIds.has(m.id));
            return { items: [...state.items, ...newMessages] };
          },
          false,
          'addMessages'
        ),

      updateMessage: (id: string, update: Partial<Message>) =>
        set(
          (state) => ({
            items: state.items.map((m) =>
              m.id === id ? { ...m, ...update } : m
            ),
          }),
          false,
          'updateMessage'
        ),

      removeMessage: (id: string) =>
        set(
          (state) => ({ items: state.items.filter((m) => m.id !== id) }),
          false,
          'removeMessage'
        ),

      clearMessages: () =>
        set({ items: [], newMessagesCount: 0 }, false, 'clearMessages'),

      queueMessage: (message: Message) =>
        set(
          (state) => ({ queue: [...state.queue, message] }),
          false,
          'queueMessage'
        ),

      clearQueue: () => set({ queue: [] }, false, 'clearQueue'),

      incrementNewCount: () =>
        set(
          (state) => ({ newMessagesCount: state.newMessagesCount + 1 }),
          false,
          'incrementNewCount'
        ),

      resetNewCount: () => set({ newMessagesCount: 0 }, false, 'resetNewCount'),

      setLastReadTimestamp: (timestamp: string) =>
        set({ lastReadTimestamp: timestamp }, false, 'setLastReadTimestamp'),
    }),
    { name: 'Messages' }
  )
);

export type { MessagesState, MessagesActions, MessagesStore, Message } from './types';
