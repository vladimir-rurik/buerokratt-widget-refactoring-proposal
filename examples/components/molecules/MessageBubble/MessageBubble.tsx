// components/molecules/MessageBubble/MessageBubble.tsx
import { cn } from '@/core/utils';
import { formatTime } from '@/core/formatting';
import type { MessageBubbleProps } from './types';

function getAuthorName(message: MessageBubbleProps['message']): string {
  if (message.authorRole === 'chatbot') return 'Bürokratt';
  if (message.authorFirstName) {
    return `${message.authorFirstName} ${message.authorLastName?.[0] ?? ''}`.trim();
  }
  return 'Nõustaja';
}

export function MessageBubble({
  message,
  isOwn = false,
  showName = false,
}: MessageBubbleProps) {
  return (
    <div
      className={cn('message-bubble', {
        'message-bubble--own': isOwn,
        'message-bubble--bot': message.authorRole === 'chatbot',
        'message-bubble--streaming': message.isStreaming,
      })}
      data-testid="message-bubble"
    >
      {showName && !isOwn && (
        <span className="message-bubble__author">{getAuthorName(message)}</span>
      )}
      <div className="message-bubble__content">
        <p className="message-bubble__text">{message.content}</p>
        {message.isStreaming && <span className="message-bubble__cursor" />}
      </div>
      <time className="message-bubble__time" dateTime={message.authorTimestamp}>
        {formatTime(message.authorTimestamp)}
      </time>
    </div>
  );
}
