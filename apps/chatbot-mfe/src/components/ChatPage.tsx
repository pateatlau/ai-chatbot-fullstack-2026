import React, { useState, useEffect } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useStreamingMessage } from '../hooks/useStreamingMessage';
import { useRateLimit } from '../hooks/useRateLimit';
import {
  chatbotAPI,
  type Conversation,
  type Message,
} from '../api/chatbot.api';
import styles from './ChatPage.module.css';

export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { rateLimitInfo, trackMessage } = useRateLimit(10, 1);

  const {
    message: streamingMessage,
    isStreaming,
    startStreaming,
    resetMessage,
  } = useStreamingMessage({
    onComplete: (fullMessage) => {
      // Add completed AI message to messages list
      const aiMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: selectedConversationId!,
        role: 'assistant',
        content: fullMessage,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      resetMessage();

      // Refresh conversations to update message count
      loadConversations();
    },
    onError: (error) => {
      setError(error.message);
      setTimeout(() => setError(null), 5000);
    },
  });

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const data = await chatbotAPI.getConversations();
      setConversations(data);

      // Auto-select first conversation if none selected
      if (!selectedConversationId && data.length > 0) {
        const firstConversation = data[0];
        if (firstConversation) {
          setSelectedConversationId(firstConversation.id);
        }
      }
    } catch (err: any) {
      console.error('Load conversations error:', err);
      setError(err.response?.data?.message || 'Failed to load conversations');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      const data = await chatbotAPI.getMessages(conversationId);
      // Ensure data is always an array
      setMessages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load messages');
      setTimeout(() => setError(null), 5000);
      // Set empty array on error
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const newConversation = await chatbotAPI.createConversation({
        title: `Chat ${conversations.length + 1}`,
      });
      setConversations((prev) => [newConversation, ...prev]);
      setSelectedConversationId(newConversation.id);
      setMessages([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create conversation');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await chatbotAPI.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));

      // Select another conversation if deleted one was selected
      if (selectedConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setSelectedConversationId(remaining[0]?.id || null);
        setMessages([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete conversation');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleRenameConversation = async (id: string, title: string) => {
    try {
      await chatbotAPI.updateConversationTitle(id, title);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to rename conversation');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId || isStreaming || rateLimitInfo.isLimited) {
      return;
    }

    // Add user message immediately
    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversationId: selectedConversationId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Track rate limit
    trackMessage();

    try {
      // Start streaming AI response
      const response = await chatbotAPI.sendMessageStream(
        selectedConversationId,
        content
      );
      startStreaming(response);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      setTimeout(() => setError(null), 5000);
    }
  };

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  // Add error boundary fallback
  if (error && !conversations.length && !isLoadingConversations) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error Loading Chatbot</h2>
        <p>{error}</p>
        <button onClick={loadConversations}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ConversationSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        onCreateConversation={handleCreateConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        isLoading={isLoadingConversations}
      />

      <div className={styles.chatArea}>
        {selectedConversation ? (
          <>
            <div className={styles.chatHeader}>
              <h3 className={styles.chatTitle}>{selectedConversation.title}</h3>
              <div className={styles.chatInfo}>
                {selectedConversation._count?.messages || 0} messages
              </div>
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className={styles.closeError}
                >
                  ✕
                </button>
              </div>
            )}

            {rateLimitInfo.isNearLimit && !rateLimitInfo.isLimited && (
              <div className={styles.warningBanner}>
                <span>
                  <span role="img" aria-label="warning">
                    ⚠️
                  </span>{' '}
                  Rate limit warning: {rateLimitInfo.remaining} messages
                  remaining
                  {rateLimitInfo.resetTime &&
                    ` (resets in ${Math.ceil((rateLimitInfo.resetTime.getTime() - Date.now()) / 60000)} min)`}
                </span>
              </div>
            )}

            {rateLimitInfo.isLimited && (
              <div className={styles.errorBanner}>
                <span>
                  <span role="img" aria-label="prohibited">
                    🚫
                  </span>{' '}
                  Rate limit reached. Please wait
                  {rateLimitInfo.resetTime &&
                    ` ${Math.ceil((rateLimitInfo.resetTime.getTime() - Date.now()) / 60000)} minutes`}{' '}
                  before sending more messages.
                </span>
              </div>
            )}

            <MessageList
              messages={messages}
              streamingMessage={
                streamingMessage.content
                  ? { role: 'assistant', content: streamingMessage.content }
                  : null
              }
              isLoading={isLoadingMessages}
            />

            <MessageInput
              onSend={handleSendMessage}
              disabled={isStreaming || rateLimitInfo.isLimited}
              placeholder={
                rateLimitInfo.isLimited
                  ? 'Rate limit reached. Please wait...'
                  : 'Type your message...'
              }
            />
          </>
        ) : (
          <div className={styles.noConversationSelected}>
            <div className={styles.emptyIcon}>
              <span role="img" aria-label="chat">
                💬
              </span>
            </div>
            <h3>No conversation selected</h3>
            <p>
              Select a conversation from the sidebar or create a new one to
              start chatting
            </p>
            <button
              onClick={handleCreateConversation}
              className={styles.createButton}
            >
              Start New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
