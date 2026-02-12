// components/molecules/ChatInput/types.ts
export interface ChatInputProps {
  onSend: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}
