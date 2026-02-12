// hooks/features/useChatUI.ts
import { useEffect } from 'react';
import { useChatUIStore } from '@/store';

export function useChatUI() {
  const ui = useChatUIStore();

  // PostMessage for iframe support
  useEffect(() => {
    window.parent.postMessage(
      {
        isOpened: ui.isOpen,
        isFullScreen: ui.isFullscreen,
      },
      '*'
    );
  }, [ui.isOpen, ui.isFullscreen]);

  return {
    isOpen: ui.isOpen,
    isFullscreen: ui.isFullscreen,
    dimensions: ui.dimensions,
    open: ui.open,
    close: ui.close,
    toggle: ui.toggle,
    setFullscreen: ui.setFullscreen,
    setDimensions: ui.setDimensions,
  };
}
