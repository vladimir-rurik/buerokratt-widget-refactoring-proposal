// hooks/features/useChat.ts
import { useCallback } from 'react';
import { useChatMessages } from './useChatMessages';
import { useChatSession } from './useChatSession';
import { useChatUI } from './useChatUI';
import { useFeedbackStore } from '@/store';

/**
 * Composite hook - combines all chat-related functionality
 */
export function useChat() {
  const session = useChatSession();
  const messages = useChatMessages(session.chatId);
  const ui = useChatUI();
  const feedback = useFeedbackStore();

  const startChat = useCallback(() => {
    session.initChat();
  }, [session]);

  const endChat = useCallback(() => {
    session.endChat();
  }, [session]);

  const sendMessage = useCallback(
    (content: string) => {
      messages.sendMessage(content);
      session.updateLastActive();
    },
    [messages, session]
  );

  return {
    // Session
    chatId: session.chatId,
    status: session.status,
    customerSupportName: session.customerSupportName,

    // Messages
    messages: messages.messages,
    isLoading: messages.isLoading,
    newMessagesCount: messages.newMessagesCount,

    // UI
    isOpen: ui.isOpen,
    isFullscreen: ui.isFullscreen,

    // Feedback
    showFeedback: feedback.isShown,

    // Actions
    startChat,
    endChat,
    sendMessage,
    toggle: ui.toggle,
    close: ui.close,
    open: ui.open,
    setFullscreen: ui.setFullscreen,
  };
}
