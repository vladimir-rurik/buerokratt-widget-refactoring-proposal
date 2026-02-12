// components/organisms/ChatHeader/types.ts
export interface ChatHeaderProps {
  title?: string;
  subtitle?: string | null;
  isFullscreen?: boolean;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onEndChat?: () => void;
}
