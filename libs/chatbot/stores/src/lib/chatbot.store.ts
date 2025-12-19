// libs/chatbot/stores/src/lib/chatbot.store.ts

import { create } from 'zustand';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  error?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastMessage?: Message;
}

export interface ChatbotState {
  // State
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> Message[]
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (
    conversationId: string,
    updates: Partial<Conversation>
  ) => void;
  deleteConversation: (conversationId: string) => void;
  setCurrentConversation: (conversationId: string | null) => void;

  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;

  sendMessage: (conversationId: string, content: string) => void;
  receiveMessage: (message: Message) => void;

  setLoading: (isLoading: boolean) => void;
  setSending: (isSending: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useChatbotStore = create<ChatbotState>((set, get) => ({
  // Initial state
  conversations: [],
  currentConversationId: null,
  messages: {},
  isLoading: false,
  isSending: false,
  error: null,

  // Conversation actions
  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) => {
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    }));

    // Emit conversation created event
    const eventBus = getEventBus();
    eventBus.emit(EVENT_NAMES.CONVERSATION_CREATED, {
      conversationId: conversation.id,
      userId: conversation.userId,
      title: conversation.title,
      timestamp: Date.now(),
    });
  },

  updateConversation: (conversationId, updates) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, ...updates, updatedAt: Date.now() }
          : conv
      ),
    }));

    // Emit conversation updated event if title changed
    if (updates.title) {
      const eventBus = getEventBus();
      eventBus.emit(EVENT_NAMES.CONVERSATION_UPDATED, {
        conversationId,
        updates: { title: updates.title },
        timestamp: Date.now(),
      });
    }
  },

  deleteConversation: (conversationId) => {
    const state = get();
    const conversation = state.conversations.find(
      (c) => c.id === conversationId
    );

    set((state) => ({
      conversations: state.conversations.filter(
        (conv) => conv.id !== conversationId
      ),
      messages: Object.fromEntries(
        Object.entries(state.messages).filter(([id]) => id !== conversationId)
      ),
      currentConversationId:
        state.currentConversationId === conversationId
          ? null
          : state.currentConversationId,
    }));

    // Emit conversation deleted event
    if (conversation) {
      const eventBus = getEventBus();
      eventBus.emit(EVENT_NAMES.CONVERSATION_DELETED, {
        conversationId,
        userId: conversation.userId,
        timestamp: Date.now(),
      });
    }
  },

  setCurrentConversation: (conversationId) =>
    set({ currentConversationId: conversationId }),

  // Message actions
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),

  addMessage: (message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [message.conversationId]: [
          ...(state.messages[message.conversationId] || []),
          message,
        ],
      },
    })),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: Object.fromEntries(
        Object.entries(state.messages).map(([convId, msgs]) => [
          convId,
          msgs.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
        ])
      ),
    })),

  sendMessage: (conversationId, content) => {
    const state = get();
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      conversationId,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Add message to store
    get().addMessage(message);

    // Emit chat message sent event
    const eventBus = getEventBus();
    eventBus.emit(EVENT_NAMES.CHAT_MESSAGE_SENT, {
      messageId: message.id,
      conversationId,
      userId:
        state.conversations.find((c) => c.id === conversationId)?.userId || '',
      content,
      timestamp: message.timestamp,
    });
  },

  receiveMessage: (message) => {
    get().addMessage(message);

    // Emit chat message received event
    const eventBus = getEventBus();
    eventBus.emit(EVENT_NAMES.CHAT_MESSAGE_RECEIVED, {
      messageId: message.id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    });
  },

  // Loading/error actions
  setLoading: (isLoading) => set({ isLoading }),
  setSending: (isSending) => set({ isSending }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
