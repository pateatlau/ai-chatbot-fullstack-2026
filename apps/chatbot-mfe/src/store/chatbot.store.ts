import { useEffect } from 'react';
import { useChatbotStore as useSharedChatbotStore } from '@ai-chatbot/chatbot-stores';
import { getEventBus, EVENT_NAMES, useEventBus } from '@myapp/shared/event-bus';

/**
 * MFE-local Chatbot Store Hook
 *
 * Re-exports the shared chatbot store for use within the Chatbot MFE.
 * This provides a clean separation between the MFE and shared libraries.
 */
export const useChatbotStore = useSharedChatbotStore;

/**
 * Initialize Chatbot Store with Event Bus subscriptions
 *
 * This hook should be called once at the MFE root level (ChatPage.tsx or App.tsx)
 * to set up all event listeners and ensure proper cleanup.
 *
 * @example
 * function ChatPage() {
 *   useChatbotStoreInitialization();
 *   const { conversations } = useChatbotStore();
 *   // ...
 * }
 */
export function useChatbotStoreInitialization() {
  const { setConversations, setMessages } = useChatbotStore();

  // Listen for user login - could load user's conversations
  useEventBus(EVENT_NAMES.USER_LOGGED_IN, (event) => {
    console.log('[Chatbot MFE] User logged in:', event.user.email);
    // In a real app, you would fetch conversations here:
    // fetchUserConversations(event.user.id);
  });

  // Listen for user logout - clear all conversation data
  useEventBus(EVENT_NAMES.USER_LOGGED_OUT, () => {
    console.log('[Chatbot MFE] User logged out, clearing conversations');
    setConversations([]);
    setMessages('', []); // Clear messages for current conversation
  });

  // Listen for conversation deleted events from other sources
  useEventBus(EVENT_NAMES.CONVERSATION_DELETED, (event) => {
    console.log('[Chatbot MFE] Conversation deleted:', event.conversationId);
    const { deleteConversation } = useChatbotStore.getState();
    deleteConversation(event.conversationId);
  });

  // Listen for message received events (from WebSocket/SSE in real app)
  useEventBus(EVENT_NAMES.CHAT_MESSAGE_RECEIVED, (event) => {
    console.log('[Chatbot MFE] Message received:', event.messageId);
    const { receiveMessage } = useChatbotStore.getState();
    // Add message to store (in real app, this would come from backend)
    receiveMessage({
      id: event.messageId,
      conversationId: event.conversationId,
      role: 'assistant',
      content: event.content || '',
      timestamp: event.timestamp,
    });
  });

  // Cleanup is handled automatically by useEventBus hook
}

/**
 * Helper hook to check if user is authenticated before using chatbot
 *
 * @returns {boolean} True if user is logged in
 */
export function useIsChatbotAvailable(): boolean {
  const eventBus = getEventBus();
  const history = eventBus.getEventHistory();

  // Check if there's a recent USER_LOGGED_IN event without a corresponding logout
  // Using reverse iteration since findLastIndex is ES2023
  let lastLoginIndex = -1;
  let lastLogoutIndex = -1;

  for (let i = history.length - 1; i >= 0; i--) {
    const event = history[i];
    if (
      event &&
      event.name === EVENT_NAMES.USER_LOGGED_IN &&
      lastLoginIndex === -1
    ) {
      lastLoginIndex = i;
    }
    if (
      event &&
      event.name === EVENT_NAMES.USER_LOGGED_OUT &&
      lastLogoutIndex === -1
    ) {
      lastLogoutIndex = i;
    }
    if (lastLoginIndex !== -1 && lastLogoutIndex !== -1) {
      break;
    }
  }

  return lastLoginIndex > lastLogoutIndex;
}

/**
 * Broadcast conversation creation to other MFEs
 *
 * This allows other parts of the app (admin dashboard, analytics, etc.)
 * to react to new conversations without direct coupling.
 */
export function useConversationBroadcaster() {
  const { conversations } = useChatbotStore();
  const eventBus = getEventBus();

  useEffect(() => {
    // When a new conversation is added, emit event
    const latestConversation = conversations[0];
    if (latestConversation) {
      const history = eventBus.getEventHistory();
      const alreadyBroadcast = history.some(
        (event) =>
          event.name === EVENT_NAMES.CONVERSATION_CREATED &&
          event.data?.conversationId === latestConversation.id
      );

      if (!alreadyBroadcast) {
        // This would be called from addConversation action instead
        // But showing here for reference
        console.log(
          '[Chatbot MFE] Broadcasting conversation:',
          latestConversation.id
        );
      }
    }
  }, [conversations, eventBus]);
}
