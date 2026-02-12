// components/organisms/ChatHeader/ChatHeader.tsx
import { memo } from 'react';
import { Button, Icon, Typography } from '@/components/atoms';
import type { ChatHeaderProps } from './types';

export const ChatHeader = memo(function ChatHeader({
  title = 'Bürokratt',
  subtitle,
  isFullscreen = false,
  onClose,
  onToggleFullscreen,
  onEndChat,
}: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="chat-header__info">
        <Typography variant="h3" as="h2">
          {title}
        </Typography>
        {subtitle && <Typography variant="small">{subtitle}</Typography>}
      </div>

      <div className="chat-header__actions">
        {onEndChat && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEndChat}
            aria-label="Lõpeta vestlus"
            title="Lõpeta vestlus"
          >
            <Icon name="logout" size={20} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFullscreen}
          data-testid={isFullscreen ? 'exit-fullscreen-button' : 'fullscreen-button'}
          aria-label={isFullscreen ? 'Välju täisekraanist' : 'Täisekraan'}
          title={isFullscreen ? 'Välju täisekraanist' : 'Täisekraan'}
        >
          <Icon name={isFullscreen ? 'minimize' : 'maximize'} size={20} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Sule vestlus"
          title="Sule vestlus"
        >
          <Icon name="close" size={20} />
        </Button>
      </div>
    </header>
  );
});
