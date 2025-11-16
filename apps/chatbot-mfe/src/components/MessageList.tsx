import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../api/chatbot.api';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: Message[];
  streamingMessage?: { role: 'assistant'; content: string } | null;
  isLoading?: boolean;
}

export function MessageList({
  messages,
  streamingMessage,
  isLoading = false,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, streamingMessage, shouldAutoScroll]);

  // Check if user has scrolled up
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    setShouldAutoScroll(isAtBottom);
  };

  if (messages.length === 0 && !streamingMessage && !isLoading) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <span role="img" aria-label="chat bubble">
            💬
          </span>
        </div>
        <h3 className={styles.emptyTitle}>Start a conversation</h3>
        <p className={styles.emptyDescription}>
          Send a message to begin chatting with the AI assistant
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onScroll={handleScroll}
    >
      <div className={styles.messagesList}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {streamingMessage && (
          <MessageBubble message={streamingMessage} isStreaming={true} />
        )}

        {isLoading && (
          <div className={styles.loadingIndicator}>
            <div className={styles.typingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!shouldAutoScroll && (
        <button
          className={styles.scrollToBottomButton}
          onClick={scrollToBottom}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={styles.scrollIcon}
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-.53 14.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V8.25a.75.75 0 0 0-1.5 0v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
