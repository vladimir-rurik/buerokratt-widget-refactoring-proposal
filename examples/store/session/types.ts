// store/session/types.ts
export type ChatStatus = 'idle' | 'open' | 'active' | 'ended';
export type ChatMode = 'free' | 'restricted';

export interface IdleTimer {
  isIdle: boolean;
  lastActive: string | null;
}

export interface SessionState {
  chatId: string | null;
  status: ChatStatus;
  mode: ChatMode;
  customerSupportId: string | null;
  customerSupportName: string | null;
  estimatedWaitingTime: number | null;
  idleTimer: IdleTimer;
}

export interface SessionActions {
  initSession: (chatId: string) => void;
  setCustomerSupport: (id: string, name: string) => void;
  setStatus: (status: ChatStatus) => void;
  setMode: (mode: ChatMode) => void;
  setEstimatedWaiting: (seconds: number) => void;
  setIdle: (isIdle: boolean) => void;
  updateLastActive: () => void;
  endSession: () => void;
}

export type SessionStore = SessionState & SessionActions;
