// components/templates/ChatTemplate/types.ts
import type { Message } from '@/components/molecules/MessageBubble';

export interface ChatTemplateProps {
  isOpen: boolean;
  isFullscreen: boolean;
  messages: Message[];
  newMessagesCount: number;
  subtitle?: string | null;
  isLoading: boolean;
  onToggle: () => void;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onSendMessage: (content: string) => void;
  onEndChat?: () => void;
}
