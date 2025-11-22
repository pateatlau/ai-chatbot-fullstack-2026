import React, { useEffect } from 'react';
import { ErrorBoundary } from '@myapp/frontend/ui-components';
import { ConversationSidebar } from './ConversationSidebar';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useStreamingMessage } from '../hooks/useStreamingMessage';
import { useRateLimit } from '../hooks/useRateLimit';
import {
  useChatbotStore,
  useChatbotStoreInitialization,
} from '../store/chatbot.store';
import { chatbotAPI, type Message } from '../api/chatbot.api';
import styles from './ChatPage.module.css';

function ChatPageContent() {
  // Initialize chatbot store with event bus subscriptions
  useChatbotStoreInitialization();

  // Get state and actions from store
  const {
    conversations,
    currentConversationId,
    messages: storeMessages,
    isLoading,
    error,
    setConversations,
    addConversation,
    updateConversation,
    deleteConversation,
    setCurrentConversation,
    setMessages,
    addMessage,
    sendMessage,
    setLoading,
    setError,
    clearError,
  } = useChatbotStore();

  const { rateLimitInfo, trackMessage } = useRateLimit(10, 1);

  // Get messages for current conversation
  const messages = currentConversationId
    ? storeMessages[currentConversationId] || []
    : [];

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
        conversationId: currentConversationId!,
        role: 'assistant',
        content: fullMessage,
        timestamp: Date.now(),
      };
      addMessage(aiMessage);
      resetMessage();

      // Refresh conversations to update message count
      loadConversations();
    },
    onError: (error) => {
      setError(error.message);
      setTimeout(() => clearError(), 5000);
    },
  });

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatbotAPI.getConversations();
      setConversations(data);

      // Auto-select first conversation if none selected
      if (!currentConversationId && data.length > 0) {
        const firstConversation = data[0];
        if (firstConversation) {
          setCurrentConversation(firstConversation.id);
        }
      }
    } catch (err: any) {
      console.error('Load conversations error:', err);
      setError(err.response?.data?.message || 'Failed to load conversations');
      setTimeout(() => clearError(), 5000);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const data = await chatbotAPI.getMessages(conversationId);
      // Ensure data is always an array and convert to store format
      const messagesArray = Array.isArray(data) ? data : [];
      const formattedMessages = messagesArray.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.createdAt).getTime(),
      }));
      setMessages(conversationId, formattedMessages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load messages');
      setTimeout(() => clearError(), 5000);
      // Set empty array on error
      setMessages(conversationId, []);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const newConversation = await chatbotAPI.createConversation({
        title: `Chat ${conversations.length + 1}`,
      });
      // Convert API response to store format
      const storeConversation = {
        ...newConversation,
        createdAt: new Date(newConversation.createdAt).getTime(),
        updatedAt: new Date(newConversation.updatedAt).getTime(),
      };
      addConversation(storeConversation);
      setCurrentConversation(newConversation.id);
      setMessages(newConversation.id, []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create conversation');
      setTimeout(() => clearError(), 5000);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await chatbotAPI.deleteConversation(id);
      deleteConversation(id);

      // Select another conversation if deleted one was selected
      if (currentConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setCurrentConversation(remaining[0]?.id || null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete conversation');
      setTimeout(() => clearError(), 5000);
    }
  };

  const handleRenameConversation = async (id: string, title: string) => {
    try {
      await chatbotAPI.updateConversationTitle(id, title);
      updateConversation(id, { title });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to rename conversation');
      setTimeout(() => clearError(), 5000);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId || isStreaming || rateLimitInfo.isLimited) {
      return;
    }

    // Add user message immediately
    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversationId: currentConversationId,
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    // Track rate limit
    trackMessage();

    try {
      // Start streaming AI response
      const response = await chatbotAPI.sendMessageStream(
        currentConversationId,
        content
      );
      startStreaming(response);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      setTimeout(() => clearError(), 5000);
    }
  };

  const selectedConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  // Add error boundary fallback
  if (error && !conversations.length && !isLoading) {
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
        selectedConversationId={currentConversationId}
        onSelectConversation={setCurrentConversation}
        onCreateConversation={handleCreateConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        isLoading={isLoading}
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
                  onClick={() => clearError()}
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
              isLoading={isLoading}
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

export function ChatPage() {
  return (
    <ErrorBoundary variant="full" context="page-chat">
      <ChatPageContent />
    </ErrorBoundary>
  );
}
