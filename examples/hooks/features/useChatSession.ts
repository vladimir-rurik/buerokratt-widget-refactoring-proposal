// hooks/features/useChatSession.ts
import { useMutation } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { useSessionStore, useMessagesStore, useChatUIStore, useFeedbackStore } from '@/store';
import { chatApi, type Chat } from '@/services';

export function useChatSession() {
  const session = useSessionStore();
  const messages = useMessagesStore();
  const ui = useChatUIStore();
  const feedback = useFeedbackStore();

  // Initialize chat
  const initChatMutation = useMutation({
    mutationFn: () =>
      chatApi.instance.initChat({
        message: {
          content: '',
          authorRole: 'end-user',
          authorTimestamp: new Date().toISOString(),
        },
        endUserTechnicalData: {
          endUserUrl: window.location.href,
          endUserOs: navigator.userAgent,
        },
      }),
    onSuccess: (data: Chat) => {
      session.initSession(data.id);
      ui.open();
    },
  });

  // End chat
  const endChatMutation = useMutation({
    mutationFn: () => {
      if (!session.chatId) throw new Error('No active chat');
      return chatApi.instance.endChat({
        chatId: session.chatId,
        status: 'ENDED',
        event: 'CLIENT_LEFT',
      });
    },
    onSuccess: () => {
      session.endSession();
      messages.clearMessages();
      feedback.showFeedback();
      ui.close();
    },
  });

  // JWT refresh
  useEffect(() => {
    if (!session.chatId || session.status !== 'active') return;

    const interval = setInterval(() => {
      chatApi.instance.extendJwt().catch(console.error);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session.chatId, session.status]);

  const initChat = useCallback(() => initChatMutation.mutate(), [initChatMutation]);
  const endChat = useCallback(() => endChatMutation.mutate(), [endChatMutation]);

  return {
    chatId: session.chatId,
    status: session.status,
    customerSupportName: session.customerSupportName,
    initChat,
    isInitializing: initChatMutation.isPending,
    endChat,
    isEnding: endChatMutation.isPending,
    setIdle: session.setIdle,
    updateLastActive: session.updateLastActive,
  };
}
