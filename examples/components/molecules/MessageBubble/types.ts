// components/molecules/MessageBubble/types.ts
export interface Message {
  id: string;
  content: string;
  authorRole: 'end-user' | 'chatbot' | 'backoffice-user';
  authorTimestamp: string;
  authorFirstName?: string;
  authorLastName?: string;
  event?: string;
  isStreaming?: boolean;
}

export interface MessageBubbleProps {
  message: Message;
  isOwn?: boolean;
  showName?: boolean;
}
