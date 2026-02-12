// components/organisms/ChatWindow/ChatWindow.tsx
import { memo } from 'react';
import { ChatHeader, MessageList } from '@/components/organisms';
import { ChatInput } from '@/components/molecules';
import { cn } from '@/core/utils';
import type { ChatWindowProps } from './types';

export const ChatWindow = memo(function ChatWindow({
  isOpen,
  isFullscreen = false,
  messages,
  subtitle,
  isLoading = false,
  isInputDisabled = false,
  onSendMessage,
  onClose,
  onToggleFullscreen,
  onEndChat,
}: ChatWindowProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn('chat-window', {
        'chat-window--fullscreen': isFullscreen,
      })}
      role="dialog"
      aria-label="Vestlusaken"
      aria-modal="false"
    >
      <ChatHeader
        subtitle={subtitle}
        isFullscreen={isFullscreen}
        onClose={onClose}
        onToggleFullscreen={onToggleFullscreen}
        onEndChat={onEndChat}
      />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        showNames={!!subtitle}
      />
      <ChatInput
        onSend={onSendMessage}
        isDisabled={isInputDisabled}
      />
    </div>
  );
});
