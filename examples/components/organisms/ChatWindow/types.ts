// components/organisms/ChatWindow/types.ts
import type { Message } from '@/components/molecules/MessageBubble';

export interface ChatWindowProps {
  isOpen: boolean;
  isFullscreen?: boolean;
  messages: Message[];
  subtitle?: string | null;
  isLoading?: boolean;
  isInputDisabled?: boolean;
  onSendMessage: (content: string) => void;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onEndChat?: () => void;
}
