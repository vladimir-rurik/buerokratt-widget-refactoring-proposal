// store/session/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SessionStore, SessionState, ChatStatus, ChatMode } from './types';

const initialState: SessionState = {
  chatId: null,
  status: 'idle',
  mode: 'free',
  customerSupportId: null,
  customerSupportName: null,
  estimatedWaitingTime: null,
  idleTimer: {
    isIdle: false,
    lastActive: null,
  },
};

export const useSessionStore = create<SessionStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        initSession: (chatId: string) =>
          set(
            {
              chatId,
              status: 'open',
              idleTimer: { isIdle: false, lastActive: new Date().toISOString() },
            },
            false,
            'initSession'
          ),

        setCustomerSupport: (id: string, name: string) =>
          set(
            {
              customerSupportId: id,
              customerSupportName: name,
              status: 'active',
            },
            false,
            'setCustomerSupport'
          ),

        setStatus: (status: ChatStatus) =>
          set({ status }, false, 'setStatus'),

        setMode: (mode: ChatMode) =>
          set({ mode }, false, 'setMode'),

        setEstimatedWaiting: (seconds: number) =>
          set({ estimatedWaitingTime: seconds }, false, 'setEstimatedWaiting'),

        setIdle: (isIdle: boolean) =>
          set(
            (state) => ({
              idleTimer: { ...state.idleTimer, isIdle },
            }),
            false,
            'setIdle'
          ),

        updateLastActive: () =>
          set(
            (state) => ({
              idleTimer: { ...state.idleTimer, lastActive: new Date().toISOString() },
            }),
            false,
            'updateLastActive'
          ),

        endSession: () =>
          set(
            {
              chatId: null,
              status: 'ended',
              customerSupportId: null,
              customerSupportName: null,
              estimatedWaitingTime: null,
            },
            false,
            'endSession'
          ),
      }),
      {
        name: 'byk-session',
        partialize: (state) => ({ chatId: state.chatId }),
      }
    ),
    { name: 'Session' }
  )
);

export type { SessionState, SessionActions, SessionStore, ChatStatus, ChatMode } from './types';
