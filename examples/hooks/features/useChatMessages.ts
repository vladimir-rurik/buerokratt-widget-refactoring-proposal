// hooks/features/useChatMessages.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { useMessagesStore, type Message } from '@/store';
import { chatApi } from '@/services';
import { eventBus } from '@/core';

export function useChatMessages(chatId: string | null) {
  const queryClient = useQueryClient();
  const store = useMessagesStore();

  // Server state via React Query
  const { isLoading, error, refetch } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => (chatId ? chatApi.instance.getMessages(chatId) : []),
    enabled: !!chatId,
    staleTime: 5000,
    refetchInterval: 5000,
  });

  // Sync server state to local store
  useEffect(() => {
    if (chatId) {
      refetch().then((result) => {
        if (result.data) {
          store.addMessages(result.data);
        }
      });
    }
  }, [chatId, refetch, store]);

  // SSE listener
  useEffect(() => {
    if (!chatId) return;
    return eventBus.on('chat:message-received', (msg: unknown) => {
      const message = msg as Message;
      if (message.chatId === chatId) {
        store.addMessage(message);
      }
    });
  }, [chatId, store]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      if (!chatId) throw new Error('No chat ID');
      return chatApi.instance.sendMessage({
        chatId,
        content,
        authorRole: 'end-user',
        authorTimestamp: new Date().toISOString(),
      });
    },
    onSuccess: (newMessage) => {
      store.addMessage(newMessage);
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    },
  });

  const sendMessage = useCallback(
    (content: string) => sendMessageMutation.mutate(content),
    [sendMessageMutation]
  );

  return {
    messages: store.items,
    isLoading,
    error,
    sendMessage,
    isSending: sendMessageMutation.isPending,
    newMessagesCount: store.newMessagesCount,
    resetNewCount: store.resetNewCount,
  };
}
