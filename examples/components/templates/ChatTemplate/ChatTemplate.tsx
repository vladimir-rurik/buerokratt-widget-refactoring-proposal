// components/templates/ChatTemplate/ChatTemplate.tsx
import { memo } from 'react';
import { ChatWindow, FeedbackForm } from '@/components/organisms';
import { Icon } from '@/components/atoms';
import { useFeedbackStore } from '@/store';
import type { ChatTemplateProps } from './types';

export const ChatTemplate = memo(function ChatTemplate({
  isOpen,
  isFullscreen,
  messages,
  newMessagesCount,
  subtitle,
  isLoading,
  onToggle,
  onClose,
  onToggleFullscreen,
  onSendMessage,
  onEndChat,
}: ChatTemplateProps) {
  const feedback = useFeedbackStore();

  return (
    <div className="widget-container">
      <ChatWindow
        isOpen={isOpen}
        isFullscreen={isFullscreen}
        messages={messages}
        subtitle={subtitle}
        isLoading={isLoading}
        onSendMessage={onSendMessage}
        onClose={onClose}
        onToggleFullscreen={onToggleFullscreen}
        onEndChat={onEndChat}
      />

      {/* Widget trigger button */}
      <button
        className="widget-trigger"
        onClick={onToggle}
        data-testid="widget-trigger"
        aria-label={isOpen ? 'Sule vestlus' : 'Ava vestlus'}
        aria-expanded={isOpen}
      >
        <Icon name={isOpen ? 'close' : 'chat'} size={24} />
        {newMessagesCount > 0 && !isOpen && (
          <span className="widget-trigger__badge" aria-label={`${newMessagesCount} uut sõnumit`}>
            {newMessagesCount > 9 ? '9+' : newMessagesCount}
          </span>
        )}
      </button>

      {/* Feedback form */}
      <FeedbackForm
        isShown={feedback.isShown}
        rating={feedback.rating}
        feedbackText={feedback.feedbackText}
        showWarning={feedback.showWarning}
        isSubmittingRating={false}
        isSubmittingFeedback={false}
        onSetRating={feedback.setRating}
        onSubmit={feedback.submitFeedback}
        onClose={feedback.hideFeedback}
      />
    </div>
  );
});
