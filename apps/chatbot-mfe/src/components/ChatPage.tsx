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
import {
  useConversations,
  useConversation,
  useCreateConversation,
  useUpdateConversation,
  useDeleteConversation,
  useSendMessage,
} from '@myapp/frontend/apollo-client';
import type { Message } from '../api/chatbot.api';
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
    setLoading,
    setError,
    clearError,
  } = useChatbotStore();

  const { rateLimitInfo, trackMessage } = useRateLimit(10, 1);

  // Apollo Client hooks for GraphQL operations
  const {
    data: conversationsData,
    loading: conversationsLoading,
    error: conversationsError,
  } = useConversations(1, 50);
  const { data: conversationData, loading: conversationLoading } =
    useConversation(currentConversationId);
  const createConversationMutation = useCreateConversation();
  const updateConversationMutation = useUpdateConversation();
  const deleteConversationMutation = useDeleteConversation();
  const sendMessageMutation = useSendMessage();

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

  // Load conversations on mount and when data updates
  useEffect(() => {
    if (conversationsData?.conversations) {
      const conversations = conversationsData.conversations.map(
        (conv: any) => ({
          id: conv.id,
          title: conv.title,
          createdAt: new Date(conv.createdAt).getTime(),
          updatedAt: new Date(conv.updatedAt).getTime(),
          _count: { messages: conv.messageCount },
        })
      );
      setConversations(conversations);

      // Auto-select first conversation if none selected
      if (!currentConversationId && conversations.length > 0) {
        setCurrentConversation(conversations[0].id);
      }
    }
  }, [conversationsData]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (conversationData?.conversation && currentConversationId) {
      const messages = conversationData.conversation.messages.map(
        (msg: any) => ({
          ...msg,
          timestamp: new Date(msg.createdAt).getTime(),
        })
      );
      setMessages(currentConversationId, messages);
    }
  }, [conversationData, currentConversationId]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      // Data will be fetched by Apollo and handled in useEffect above
      setLoading(false);
    } catch (err: any) {
      console.error('Load conversations error:', err);
      setError(err.message || 'Failed to load conversations');
      setTimeout(() => clearError(), 5000);
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const result = await createConversationMutation(
        'Chat ' + (conversations.length + 1)
      );
      if (result.data?.createConversation) {
        const newConversation = result.data.createConversation;
        const storeConversation = {
          id: newConversation.id,
          title: newConversation.title,
          createdAt: new Date(newConversation.createdAt).getTime(),
          updatedAt: new Date(newConversation.updatedAt).getTime(),
          _count: { messages: 0 },
        };
        addConversation(storeConversation);
        setCurrentConversation(newConversation.id);
        setMessages(newConversation.id, []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create conversation');
      setTimeout(() => clearError(), 5000);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversationMutation(id);
      deleteConversation(id);

      // Select another conversation if deleted one was selected
      if (currentConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setCurrentConversation(remaining[0]?.id || null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete conversation');
      setTimeout(() => clearError(), 5000);
    }
  };

  const handleRenameConversation = async (id: string, title: string) => {
    try {
      await updateConversationMutation(id, title);
      updateConversation(id, { title });
    } catch (err: any) {
      setError(err.message || 'Failed to rename conversation');
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
      // Send message via Apollo mutation
      await sendMessageMutation(currentConversationId, content);

      // Start streaming AI response via REST API (SSE endpoint - cannot migrate to GraphQL)
      // The sendMessageStream endpoint returns Server-Sent Events for real-time streaming
      const response = await fetch(
        `${import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:3001/api'}/chat/conversations/${currentConversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(
            errorJson.error || errorJson.message || 'Failed to send message'
          );
        } catch {
          throw new Error(
            errorText || `Request failed with status ${response.status}`
          );
        }
      }

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
  if (error && !conversations.length && !isLoading && !conversationsLoading) {
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
