// components/molecules/ChatInput/ChatInput.tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Icon } from '@/components/atoms';
import type { ChatInputProps } from './types';

export function ChatInput({
  onSend,
  isDisabled = false,
  placeholder = 'Kirjuta sõnum...',
  maxLength = 2000,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [value]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim() && !isDisabled) {
        onSend(value.trim());
        setValue('');
      }
    },
    [value, isDisabled, onSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const canSend = value.trim().length > 0 && !isDisabled;

  return (
    <form onSubmit={handleSubmit} className="chat-input" role="form">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled}
        maxLength={maxLength}
        className="chat-input__textarea"
        rows={1}
        data-testid="message-input"
        aria-label="Sõnumi sisestusväli"
      />
      <Button
        type="submit"
        variant="primary"
        disabled={!canSend}
        className="chat-input__send"
        data-testid="send-button"
        aria-label="Saada sõnum"
      >
        <Icon name="send" size={20} />
      </Button>
    </form>
  );
}
