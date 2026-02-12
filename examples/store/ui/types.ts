// store/ui/types.ts
export interface ChatUIState {
  isOpen: boolean;
  isFullscreen: boolean;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface ChatUIActions {
  open: () => void;
  close: () => void;
  toggle: () => void;
  setFullscreen: (value: boolean) => void;
  setDimensions: (width: number, height: number) => void;
}

export type ChatUIStore = ChatUIState & ChatUIActions;
