// components/organisms/MessageList/MessageList.tsx
import { useRef, useEffect, useState, useCallback, memo } from 'react';
import { MessageBubble } from '@/components/molecules';
import type { MessageListProps } from './types';

const AUTO_SCROLL_THRESHOLD = 100;

export const MessageList = memo(function MessageList({
  messages,
  isLoading = false,
  showNames = false,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = useCallback(() => {
    if (!listRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom =
      scrollHeight - scrollTop - clientHeight < AUTO_SCROLL_THRESHOLD;

    setShouldAutoScroll(isNearBottom);
  }, []);

  return (
    <div
      ref={listRef}
      className="message-list"
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-label="Sõnumite loend"
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.authorRole === 'end-user'}
          showName={showNames}
        />
      ))}
      {isLoading && (
        <div className="message-list__loading" aria-label="Kirjutab...">
          <span className="message-list__typing-indicator" />
        </div>
      )}
    </div>
  );
});
