// index.ts - Main entry point
export { ChatTemplate } from '@/components/templates';
export { useChat, useChatMessages, useChatSession, useChatUI } from '@/hooks';
export {
  useChatUIStore,
  useMessagesStore,
  useSessionStore,
  useFeedbackStore,
} from '@/store';
export type {
  ChatUIState,
  MessagesState,
  Message,
  SessionState,
  FeedbackState,
} from '@/store';
export { config } from '@/config';
export type { WidgetConfig } from '@/config';
