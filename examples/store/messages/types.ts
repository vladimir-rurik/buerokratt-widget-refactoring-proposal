// store/messages/types.ts
export interface Message {
  id: string;
  chatId: string;
  content: string;
  authorRole: 'end-user' | 'chatbot' | 'backoffice-user';
  authorTimestamp: string;
  event?: string;
  isStreaming?: boolean;
  streamId?: string;
}

export interface MessagesState {
  items: Message[];
  queue: Message[];
  newMessagesCount: number;
  lastReadTimestamp: string | null;
}

export interface MessagesActions {
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  updateMessage: (id: string, update: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  queueMessage: (message: Message) => void;
  clearQueue: () => void;
  incrementNewCount: () => void;
  resetNewCount: () => void;
  setLastReadTimestamp: (timestamp: string) => void;
}

export type MessagesStore = MessagesState & MessagesActions;
