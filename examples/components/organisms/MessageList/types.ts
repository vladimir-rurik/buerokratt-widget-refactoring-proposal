// components/organisms/MessageList/types.ts
import type { Message } from '@/components/molecules/MessageBubble';

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  showNames?: boolean;
  onScrollToBottom?: () => void;
}
