# Event Bus: Code Examples & Templates

**Document Type:** Developer Reference  
**Created:** November 18, 2025  
**Scope:** Practical patterns for implementing event bus in MFEs

---

## 📝 TABLE OF CONTENTS

1. [Event Bus Core Implementation](#event-bus-core-implementation)
2. [Zustand Store Integration](#zustand-store-integration)
3. [React Component Patterns](#react-component-patterns)
4. [MFE-Specific Patterns](#mfe-specific-patterns)
5. [Error Handling](#error-handling)
6. [Testing Examples](#testing-examples)
7. [Troubleshooting](#troubleshooting)

---

## EVENT BUS CORE IMPLEMENTATION

### 1. Complete EventBus Class

```typescript
// libs/frontend/event-bus/src/lib/event-bus.ts

type EventListener<T = any> = (data: T) => void | Promise<void>;
type EventUnsubscribe = () => void;

export interface EventBusOptions {
  enableHistory?: boolean;
  maxHistorySize?: number;
  enableLogging?: boolean;
}

interface EventRecord {
  name: string;
  data: any;
  timestamp: number;
  listenersCount: number;
}

/**
 * Pub/Sub Event Bus for zero-coupling inter-MFE communication
 *
 * @example
 * const bus = new EventBus();
 * const unsubscribe = bus.subscribe('user:logged-in', (event) => {
 *   console.log('User logged in:', event.user.email);
 * });
 * bus.emit('user:logged-in', { user: { email: 'test@example.com' } });
 * unsubscribe(); // Clean up
 */
export class EventBus {
  private listeners = new Map<string, Set<EventListener>>();
  private eventHistory: EventRecord[] = [];
  private options: Required<EventBusOptions>;

  constructor(options: EventBusOptions = {}) {
    this.options = {
      enableHistory: options.enableHistory ?? true,
      maxHistorySize: options.maxHistorySize ?? 1000,
      enableLogging: options.enableLogging ?? false,
    };
  }

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  subscribe<T = any>(
    eventName: string,
    listener: EventListener<T>
  ): EventUnsubscribe {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    this.listeners.get(eventName)!.add(listener);

    if (this.options.enableLogging) {
      console.log(
        `[EventBus] Listener added for "${eventName}"`,
        `(total: ${this.listeners.get(eventName)?.size})`
      );
    }

    // Return unsubscribe function
    return () => this.unsubscribe(eventName, listener);
  }

  /**
   * Subscribe to event once, then auto-unsubscribe
   */
  once<T = any>(
    eventName: string,
    listener: EventListener<T>
  ): EventUnsubscribe {
    const wrappedListener = (data: T) => {
      listener(data);
      this.unsubscribe(eventName, wrappedListener);
    };

    return this.subscribe(eventName, wrappedListener);
  }

  /**
   * Emit event to all listeners
   */
  async emit<T = any>(eventName: string, data: T): Promise<void> {
    if (this.options.enableLogging) {
      console.log(`[EventBus] Emitting "${eventName}"`, data);
    }

    // Record event
    if (this.options.enableHistory) {
      this.recordEvent(eventName, data);
    }

    // Get listeners
    const listeners = this.listeners.get(eventName);
    if (!listeners || listeners.size === 0) {
      if (this.options.enableLogging) {
        console.warn(`[EventBus] No listeners for "${eventName}"`);
      }
      return;
    }

    // Execute all listeners
    const promises = Array.from(listeners).map((listener) =>
      Promise.resolve(listener(data)).catch((err) => {
        console.error(`[EventBus] Error in listener for "${eventName}":`, err);
      })
    );

    await Promise.all(promises);
  }

  /**
   * Unsubscribe specific listener
   */
  private unsubscribe<T = any>(
    eventName: string,
    listener: EventListener<T>
  ): void {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.delete(listener);

      if (this.options.enableLogging) {
        console.log(
          `[EventBus] Listener removed for "${eventName}"`,
          `(total: ${listeners.size})`
        );
      }

      // Clean up empty sets
      if (listeners.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  /**
   * Remove all listeners for an event (or all events if no name provided)
   */
  clear(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
      if (this.options.enableLogging) {
        console.log(`[EventBus] Cleared all listeners for "${eventName}"`);
      }
    } else {
      this.listeners.clear();
      if (this.options.enableLogging) {
        console.log(`[EventBus] Cleared all listeners`);
      }
    }
  }

  /**
   * Get number of listeners for an event
   */
  getListenerCount(eventName: string): number {
    return this.listeners.get(eventName)?.size ?? 0;
  }

  /**
   * Get event history (for debugging)
   */
  getEventHistory(): EventRecord[] {
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get all event names with listeners
   */
  getEventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Record event in history
   */
  private recordEvent(eventName: string, data: any): void {
    this.eventHistory.push({
      name: eventName,
      data,
      timestamp: Date.now(),
      listenersCount: this.listeners.get(eventName)?.size ?? 0,
    });

    // Trim history if too large
    if (this.eventHistory.length > this.options.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.options.maxHistorySize);
    }
  }
}

// Global singleton
export const eventBus = new EventBus({
  enableLogging: process.env.NODE_ENV === 'development',
});
```

### 2. Type-Safe Event Map

```typescript
// libs/frontend/event-bus/src/lib/event-types.ts

/**
 * AUTHENTICATION EVENTS
 */
export interface UserLoggedInEvent {
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
  loginTime: string; // ISO8601
  ipAddress?: string;
}

export interface UserLoggedOutEvent {
  userId: string;
  logoutTime: string; // ISO8601
  reason: 'user_initiated' | 'session_expired' | 'token_revoked';
}

export interface TokenRefreshedEvent {
  userId: string;
  accessToken: string;
  expiresIn: number;
  refreshTime: string; // ISO8601
}

export interface SessionExpiredEvent {
  userId: string;
  expirationTime: string; // ISO8601
  lastActivity: string; // ISO8601
}

export interface AuthErrorEvent {
  error: string;
  code: string;
  details?: any;
  timestamp: string; // ISO8601
}

/**
 * CONVERSATION EVENTS
 */
export interface ConversationCreatedEvent {
  conversationId: string;
  userId: string;
  title: string;
  createdAt: string; // ISO8601
  metadata?: {
    tags?: string[];
    isArchived?: boolean;
  };
}

export interface ConversationUpdatedEvent {
  conversationId: string;
  userId: string;
  changes: {
    title?: string;
    isArchived?: boolean;
    metadata?: any;
  };
  updatedAt: string; // ISO8601
}

export interface ConversationDeletedEvent {
  conversationId: string;
  userId: string;
  deletedAt: string; // ISO8601
  reason?: string;
}

/**
 * MESSAGE EVENTS
 */
export interface MessageSentEvent {
  messageId: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  sentAt: string; // ISO8601
  metadata?: {
    tokenCount?: number;
    model?: string;
  };
}

export interface MessageReceivedEvent {
  messageId: string;
  conversationId: string;
  userId: string;
  content: string;
  receivedAt: string; // ISO8601
  metadata?: any;
}

export interface MessageErrorEvent {
  conversationId: string;
  error: string;
  errorCode: string;
  timestamp: string; // ISO8601
  retryable: boolean;
}

/**
 * SETTINGS EVENTS
 */
export interface SettingsUpdatedEvent {
  userId: string;
  settingsType: string;
  changes: Record<string, any>;
  updatedAt: string; // ISO8601
}

export interface ThemeChangedEvent {
  theme: 'light' | 'dark' | 'system';
  userId?: string;
  timestamp: string; // ISO8601
}

export interface LanguageChangedEvent {
  language: string;
  userId?: string;
  timestamp: string; // ISO8601
}

/**
 * SYSTEM EVENTS
 */
export interface AppInitializedEvent {
  timestamp: string; // ISO8601
  version: string;
}

export interface NetworkStatusChangedEvent {
  isOnline: boolean;
  timestamp: string; // ISO8601
}

export interface ErrorOccurredEvent {
  error: string;
  errorCode?: string;
  context?: string;
  timestamp: string; // ISO8601
  severity: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * COMPLETE EVENT MAP
 * Use this for type-safe emit/subscribe
 */
export interface EventMap {
  // Authentication
  'user:logged-in': UserLoggedInEvent;
  'user:logged-out': UserLoggedOutEvent;
  'token:refreshed': TokenRefreshedEvent;
  'session:expired': SessionExpiredEvent;
  'auth:error': AuthErrorEvent;

  // Conversations
  'conversation:created': ConversationCreatedEvent;
  'conversation:updated': ConversationUpdatedEvent;
  'conversation:deleted': ConversationDeletedEvent;

  // Messages
  'message:sent': MessageSentEvent;
  'message:received': MessageReceivedEvent;
  'message:error': MessageErrorEvent;

  // Settings
  'settings:updated': SettingsUpdatedEvent;
  'theme:changed': ThemeChangedEvent;
  'language:changed': LanguageChangedEvent;

  // System
  'app:initialized': AppInitializedEvent;
  'network:status-changed': NetworkStatusChangedEvent;
  'error:occurred': ErrorOccurredEvent;
}

export type EventName = keyof EventMap;
```

### 3. Type-Safe Event Emitter

```typescript
// libs/frontend/event-bus/src/lib/event-emitter.ts

import { eventBus } from './event-bus';
import type { EventMap, EventName } from './event-types';

/**
 * Type-safe event emitter hook
 * @example
 * const { emit } = useEventEmitter();
 * emit('user:logged-in', { userId: '123', ... });
 */
export const useEventEmitter = () => ({
  emit<E extends EventName>(eventName: E, data: EventMap[E]): Promise<void> {
    return eventBus.emit(eventName, data);
  },
});

/**
 * Type-safe event listener hook
 * @example
 * useEventListener('user:logged-in', (event) => {
 *   console.log(event.user.email); // Fully typed!
 * });
 */
export const useEventListener = <E extends EventName>(
  eventName: E,
  callback: (data: EventMap[E]) => void | Promise<void>
): (() => void) => {
  return eventBus.subscribe(eventName, callback);
};

/**
 * Subscribe to event once
 */
export const useEventListenerOnce = <E extends EventName>(
  eventName: E,
  callback: (data: EventMap[E]) => void | Promise<void>
): (() => void) => {
  return eventBus.once(eventName, callback);
};
```

---

## ZUSTAND STORE INTEGRATION

### 1. Event-Emitting Auth Store

```typescript
// libs/frontend/stores/src/lib/auth.store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { eventBus } from '@myapp/frontend/event-bus';
import type { User } from './types';

export interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });

        // ← EMIT EVENT (Zero coupling - subscribers don't know about this store)
        eventBus.emit('user:logged-in', {
          userId: user.id,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
          },
          accessToken,
          refreshToken,
          loginTime: new Date().toISOString(),
        });
      },

      clearAuth: () => {
        const state = get();

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // ← EMIT EVENT
        if (state.user) {
          eventBus.emit('user:logged-out', {
            userId: state.user.id,
            logoutTime: new Date().toISOString(),
            reason: 'user_initiated',
          });
        }
      },

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });

        const state = get();

        // ← EMIT EVENT
        if (state.user) {
          eventBus.emit('token:refreshed', {
            userId: state.user.id,
            accessToken,
            expiresIn: 3600,
            refreshTime: new Date().toISOString(),
          });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### 2. Event-Listening Store

```typescript
// apps/chatbot-mfe/src/store/chatbot.store.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface ChatbotState {
  // State
  conversations: any[];
  activeConversationId: string | null;
  messages: any[];
  currentUserContext: {
    userId: string;
    email: string;
    role: string;
  } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setConversations: (conversations: any[]) => void;
  setActiveConversation: (id: string) => void;
  addMessage: (message: any) => void;
  setUserContext: (context: any) => void;
  setError: (error: string | null) => void;
  clearState: () => void;
}

export const useChatbotStore = create<ChatbotState>()(
  subscribeWithSelector((set) => ({
    conversations: [],
    activeConversationId: null,
    messages: [],
    currentUserContext: null,
    isLoading: false,
    error: null,

    setConversations: (conversations) => set({ conversations }),
    setActiveConversation: (id) => set({ activeConversationId: id }),
    addMessage: (message) =>
      set((state) => ({
        messages: [...state.messages, message],
      })),
    setUserContext: (context) => set({ currentUserContext: context }),
    setError: (error) => set({ error }),
    clearState: () =>
      set({
        conversations: [],
        activeConversationId: null,
        messages: [],
        currentUserContext: null,
        error: null,
      }),
  }))
);
```

---

## REACT COMPONENT PATTERNS

### 1. Component with Event Listener

```typescript
// apps/chatbot-mfe/src/components/ChatPage.tsx

import { useEffect } from 'react';
import { useEventListener } from '@myapp/frontend/hooks';
import { useChatbotStore } from '../store/chatbot.store';

export function ChatPage() {
  const { currentUserContext, clearState } = useChatbotStore();

  // Listen for user logout across entire app
  useEventListener('user:logged-out', (event) => {
    console.log(`User ${event.userId} logged out`);
    clearState(); // Clear chatbot state
  });

  // Listen for token refresh
  useEventListener('token:refreshed', (event) => {
    console.log('Token refreshed, no action needed here');
  });

  return (
    <div>
      {currentUserContext ? (
        <div>
          Logged in as: {currentUserContext.email}
        </div>
      ) : (
        <div>Please log in</div>
      )}
    </div>
  );
}
```

### 2. Component with Event Emitter

```typescript
// apps/chatbot-mfe/src/components/MessageInput.tsx

import { useEventEmitter } from '@myapp/frontend/event-bus';
import { useChatbotStore } from '../store/chatbot.store';
import { chatbotAPI } from '../api/chatbot.api';

export function MessageInput() {
  const { emit } = useEventEmitter();
  const { activeConversationId, currentUserContext, addMessage } = useChatbotStore();

  const handleSendMessage = async (content: string) => {
    try {
      const response = await chatbotAPI.sendMessage(activeConversationId!, {
        content,
      });

      // Add message to local state
      addMessage({
        id: response.id,
        conversationId: activeConversationId,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      });

      // ← EMIT EVENT for other MFEs to listen
      await emit('message:sent', {
        messageId: response.id,
        conversationId: activeConversationId!,
        userId: currentUserContext!.userId,
        role: 'user',
        content,
        sentAt: new Date().toISOString(),
        metadata: {
          model: 'gpt-4',
        },
      });
    } catch (error) {
      // ← EMIT ERROR EVENT
      await emit('message:error', {
        conversationId: activeConversationId!,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'MESSAGE_SEND_FAILED',
        timestamp: new Date().toISOString(),
        retryable: true,
      });
    }
  };

  return (
    <textarea
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          handleSendMessage(e.currentTarget.value);
          e.currentTarget.value = '';
        }
      }}
      placeholder="Type a message..."
    />
  );
}
```

### 3. Custom Hook for Event-Driven Logic

```typescript
// libs/frontend/hooks/src/lib/useMFEInitialization.ts

import { useEffect } from 'react';
import { useEventListener } from './useEventListener';
import { useChatbotStore } from '@myapp/chatbot-mfe/store';
import { useProfileStore } from '@myapp/profile-mfe/store';

/**
 * Initialize MFE on user login
 * Call this in your MFE root component
 */
export function useMFEInitialization() {
  const { setUserContext } = useChatbotStore();
  const { setUserProfile } = useProfileStore();

  // Listen for login
  useEventListener('user:logged-in', (event) => {
    // Initialize this MFE with user data
    setUserContext({
      userId: event.userId,
      email: event.user.email,
      role: event.user.role,
    });

    // Fetch additional data if needed
    console.log('MFE initialized for user:', event.user.email);
  });

  // Listen for logout
  useEventListener('user:logged-out', () => {
    // Clear state
    useChatbotStore.getState().clearState();
  });
}
```

---

## MFE-SPECIFIC PATTERNS

### 1. Auth MFE Pattern (Emitter)

```typescript
// apps/auth-mfe/src/pages/Login.tsx

import { useAuthStore, useToastStore } from '@myapp/frontend/stores';
import { useEventEmitter } from '@myapp/frontend/event-bus';
import { authService } from '../services/auth.service';

export function Login() {
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const { emit } = useEventEmitter();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data);

      // Update auth store (which will emit 'user:logged-in' internally)
      setAuth(response.user, response.accessToken, response.refreshToken);

      addToast('Login successful!', 'success');

      // Additional auth success event (optional, can be more specific)
      await emit('auth:error'); // Just kidding! Don't emit errors on success

      window.location.replace('/dashboard');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';

      addToast(errorMessage, 'error');

      // ← EMIT AUTH ERROR EVENT for other MFEs
      await emit('auth:error', {
        error: errorMessage,
        code: error.response?.data?.code || 'LOGIN_FAILED',
        details: { email: data.email },
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit({
        email: e.currentTarget.email.value,
        password: e.currentTarget.password.value,
      });
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 2. Chatbot MFE Pattern (Listener & Emitter)

```typescript
// apps/chatbot-mfe/src/app/ChatPage.tsx

import { useEffect } from 'react';
import { useEventListener, useEventEmitter } from '@myapp/frontend/event-bus';
import { useChatbotStore } from '../store/chatbot.store';
import { chatbotAPI } from '../api/chatbot.api';

export function ChatPage() {
  const store = useChatbotStore();
  const { emit } = useEventEmitter();

  // Initialize on mount
  useEffect(() => {
    // Listen for login
    const unsubLogin = useEventListener('user:logged-in', async (event) => {
      store.setUserContext({
        userId: event.userId,
        email: event.user.email,
        role: event.user.role,
      });

      // Fetch conversations for this user
      try {
        const conversations = await chatbotAPI.getConversations();
        store.setConversations(conversations);
      } catch (error) {
        store.setError('Failed to load conversations');
      }
    });

    // Listen for logout
    const unsubLogout = useEventListener('user:logged-out', () => {
      store.clearState();
    });

    return () => {
      unsubLogin();
      unsubLogout();
    };
  }, []);

  const handleCreateConversation = async (title: string) => {
    try {
      const response = await chatbotAPI.createConversation({ title });

      // Update local state
      store.setConversations([response, ...store.conversations]);

      // ← EMIT EVENT
      await emit('conversation:created', {
        conversationId: response.id,
        userId: store.currentUserContext!.userId,
        title: response.title,
        createdAt: response.createdAt,
      });

      addToast('Conversation created!', 'success');
    } catch (error) {
      store.setError('Failed to create conversation');
    }
  };

  return (
    <div>
      <button onClick={() => handleCreateConversation('New Chat')}>
        New Conversation
      </button>
      {/* ... */}
    </div>
  );
}
```

### 3. Admin MFE Pattern (Smart Listener)

```typescript
// apps/admin-mfe/src/store/admin.store.ts

import { create } from 'zustand';
import { useEventListener } from '@myapp/frontend/event-bus';

export interface AdminState {
  isAdminMode: boolean;
  adminUser: User | null;
  systemAlerts: Alert[];

  setAdminUser: (user: User) => void;
  addSystemAlert: (alert: Alert) => void;
  clearState: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isAdminMode: false,
  adminUser: null,
  systemAlerts: [],

  setAdminUser: (user) => set({ adminUser: user, isAdminMode: true }),
  addSystemAlert: (alert) =>
    set((state) => ({ systemAlerts: [...state.systemAlerts, alert] })),
  clearState: () =>
    set({ isAdminMode: false, adminUser: null, systemAlerts: [] }),
}));

/**
 * Initialize admin store event listeners
 * Call this in AdminApp root component
 */
export function useAdminStoreInitialization() {
  useEffect(() => {
    // Listen for login - check if user is admin
    const unsubLogin = useEventListener('user:logged-in', (event) => {
      if (event.user.role === 'admin') {
        useAdminStore.getState().setAdminUser(event.user);

        // Show alert
        useAdminStore.getState().addSystemAlert({
          id: Date.now().toString(),
          type: 'info',
          message: `Admin ${event.user.name} logged in`,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Listen for message errors - log to admin
    const unsubMessageError = useEventListener('message:error', (event) => {
      useAdminStore.getState().addSystemAlert({
        id: Date.now().toString(),
        type: 'warning',
        message: `Message error in conversation ${event.conversationId}`,
        timestamp: new Date().toISOString(),
      });
    });

    // Listen for logout
    const unsubLogout = useEventListener('user:logged-out', () => {
      useAdminStore.getState().clearState();
    });

    return () => {
      unsubLogin();
      unsubMessageError();
      unsubLogout();
    };
  }, []);
}
```

---

## ERROR HANDLING

### 1. Safe Event Listener with Error Handling

```typescript
// Custom hook for safer event listening
import { useEventListener } from '@myapp/frontend/event-bus';
import { useToastStore } from '@myapp/frontend/stores';

export function useSafeEventListener<E extends EventName>(
  eventName: E,
  callback: (data: EventMap[E]) => Promise<void> | void,
  onError?: (error: Error) => void
) {
  const { addToast } = useToastStore();

  return useEventListener(eventName, async (data) => {
    try {
      await Promise.resolve(callback(data));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      console.error(`Error handling ${eventName}:`, error);
      addToast(`Error: ${message}`, 'error');

      onError?.(error instanceof Error ? error : new Error(message));
    }
  });
}

// Usage
useSafeEventListener(
  'user:logged-in',
  async (event) => {
    // Risky operation
    await initializeUserData(event.userId);
  },
  (error) => {
    // Handle error
    console.error('Failed to initialize:', error);
  }
);
```

### 2. Event Listener with Retry Logic

```typescript
export function useEventListenerWithRetry<E extends EventName>(
  eventName: E,
  callback: (data: EventMap[E]) => Promise<void>,
  options: {
    maxRetries?: number;
    delayMs?: number;
  } = {}
) {
  const { maxRetries = 3, delayMs = 1000 } = options;

  return useEventListener(eventName, async (data) => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await callback(data);
        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError;
  });
}

// Usage
useEventListenerWithRetry(
  'message:sent',
  async (event) => {
    await trackMessageInAnalytics(event);
  },
  { maxRetries: 3, delayMs: 500 }
);
```

### 3. Event Listener with Debouncing

```typescript
import { useMemo } from 'react';

export function useEventListenerWithDebounce<E extends EventName>(
  eventName: E,
  callback: (data: EventMap[E]) => void | Promise<void>,
  debounceMs: number = 500
) {
  const debouncedCallback = useMemo(() => {
    let timeoutId: NodeJS.Timeout;

    return (data: EventMap[E]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback(data);
      }, debounceMs);
    };
  }, [callback, debounceMs]);

  return useEventListener(eventName, debouncedCallback);
}

// Usage - only update UI once per 500ms
useEventListenerWithDebounce(
  'settings:updated',
  (event) => {
    updateUIWithSettings(event);
  },
  500
);
```

---

## TESTING EXAMPLES

### 1. Unit Test EventBus

```typescript
// libs/frontend/event-bus/src/lib/event-bus.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from './event-bus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus({ enableLogging: false });
  });

  describe('subscribe', () => {
    it('should subscribe and emit events', () => {
      const listener = vi.fn();
      bus.subscribe('test:event', listener);

      bus.emit('test:event', { data: 'hello' });

      expect(listener).toHaveBeenCalledWith({ data: 'hello' });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should support multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      bus.subscribe('test:event', listener1);
      bus.subscribe('test:event', listener2);

      bus.emit('test:event', { data: 'hello' });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = bus.subscribe('test:event', listener);

      bus.emit('test:event', { data: 'hello' });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      bus.emit('test:event', { data: 'world' });
      expect(listener).toHaveBeenCalledTimes(1); // Not called again
    });
  });

  describe('once', () => {
    it('should unsubscribe after first emit', () => {
      const listener = vi.fn();
      bus.once('test:event', listener);

      bus.emit('test:event', { data: 'hello' });
      expect(listener).toHaveBeenCalledTimes(1);

      bus.emit('test:event', { data: 'world' });
      expect(listener).toHaveBeenCalledTimes(1); // Not called again
    });
  });

  describe('clear', () => {
    it('should remove all listeners for an event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      bus.subscribe('test:event', listener1);
      bus.subscribe('test:event', listener2);
      bus.clear('test:event');

      bus.emit('test:event', { data: 'hello' });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should clear all listeners when no event name provided', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      bus.subscribe('event1', listener1);
      bus.subscribe('event2', listener2);
      bus.clear();

      bus.emit('event1', {});
      bus.emit('event2', {});

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('getListenerCount', () => {
    it('should return correct listener count', () => {
      bus.subscribe('test:event', () => {});
      bus.subscribe('test:event', () => {});
      expect(bus.getListenerCount('test:event')).toBe(2);
    });

    it('should return 0 for non-existent event', () => {
      expect(bus.getListenerCount('non:existent')).toBe(0);
    });
  });
});
```

### 2. Integration Test Store + Events

```typescript
// apps/chatbot-mfe/src/store/chatbot.store.spec.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { eventBus } from '@myapp/frontend/event-bus';
import {
  useChatbotStore,
  useChatbotStoreInitialization,
} from './chatbot.store';

describe('Chatbot Store - Event Integration', () => {
  beforeEach(() => {
    eventBus.clear();
    useChatbotStore.getState().clearState();
  });

  it('should set user context on login event', async () => {
    const { result } = renderHook(() => {
      useChatbotStoreInitialization();
      return useChatbotStore();
    });

    await act(async () => {
      eventBus.emit('user:logged-in', {
        userId: 'user-123',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        accessToken: 'token123',
        refreshToken: 'refresh123',
        loginTime: new Date().toISOString(),
      });
    });

    await waitFor(() => {
      expect(result.current.currentUserContext).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
      });
    });
  });

  it('should clear state on logout event', async () => {
    const { result } = renderHook(() => {
      useChatbotStoreInitialization();
      return useChatbotStore();
    });

    // Setup initial state
    act(() => {
      result.current.setUserContext({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
      });
      result.current.setConversations([{ id: 'conv-1', title: 'Test' }]);
    });

    // Emit logout
    await act(async () => {
      eventBus.emit('user:logged-out', {
        userId: 'user-123',
        logoutTime: new Date().toISOString(),
        reason: 'user_initiated',
      });
    });

    await waitFor(() => {
      expect(result.current.currentUserContext).toBeNull();
      expect(result.current.conversations).toEqual([]);
    });
  });
});
```

### 3. Mock EventBus for Testing

```typescript
// libs/frontend/event-bus/src/lib/event-bus.mock.ts

/**
 * Mock EventBus for testing
 * Useful for testing components that emit/listen to events
 */
export function createMockEventBus() {
  const listeners = new Map<string, Set<Function>>();
  const emittedEvents: Array<{ name: string; data: any }> = [];

  return {
    subscribe: vi.fn((eventName: string, listener: Function) => {
      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
      }
      listeners.get(eventName)!.add(listener);

      return () => {
        listeners.get(eventName)?.delete(listener);
      };
    }),

    emit: vi.fn(async (eventName: string, data: any) => {
      emittedEvents.push({ name: eventName, data });
      const eventListeners = listeners.get(eventName);
      if (eventListeners) {
        for (const listener of eventListeners) {
          await listener(data);
        }
      }
    }),

    getEmittedEvents: () => [...emittedEvents],
    clearEmittedEvents: () => emittedEvents.splice(0),
    clearListeners: (eventName?: string) => {
      if (eventName) {
        listeners.delete(eventName);
      } else {
        listeners.clear();
      }
    },
  };
}

// Usage in tests
vi.mock('@myapp/frontend/event-bus', () => ({
  eventBus: createMockEventBus(),
}));
```

---

## TROUBLESHOOTING

### Issue 1: Events not being received

```typescript
// ❌ Problem: Listener added AFTER emit
eventBus.emit('user:logged-in', data);
useEventListener('user:logged-in', (event) => {
  console.log('Never called!');
});

// ✅ Solution: Subscribe before emit
useEventListener('user:logged-in', (event) => {
  console.log('Called!');
});
eventBus.emit('user:logged-in', data);

// ✅ Or use useEffect for component listeners
useEffect(() => {
  return useEventListener('user:logged-in', (event) => {
    console.log('Works on mount');
  });
}, []);
```

### Issue 2: Memory leaks from listeners

```typescript
// ❌ Problem: Not unsubscribing in cleanup
useEffect(() => {
  useEventListener('user:logged-in', handleLogin); // Memory leak!
}, []);

// ✅ Solution: Unsubscribe in cleanup
useEffect(() => {
  const unsubscribe = useEventListener('user:logged-in', handleLogin);
  return () => unsubscribe(); // Clean up!
}, []);

// ✅ Or use custom hook that handles cleanup
function useSafeEventListener(eventName, callback) {
  useEffect(() => {
    return eventBus.subscribe(eventName, callback);
  }, [eventName, callback]);
}
```

### Issue 3: Type errors with event emitter

```typescript
// ❌ Problem: Wrong event data type
const { emit } = useEventEmitter();
emit('user:logged-in', {
  // Missing required fields!
  userId: 'user-123',
});

// ✅ Solution: Use type-safe emit
emit('user:logged-in', {
  userId: 'user-123',
  user: {
    /* all required fields */
  },
  accessToken: 'token',
  refreshToken: 'refresh',
  loginTime: new Date().toISOString(),
});

// Or let TypeScript guide you
const { emit } = useEventEmitter();
emit('user:logged-in', {
  // TypeScript will show autocomplete and error on missing fields
});
```

### Issue 4: Circular event subscriptions

```typescript
// ❌ Problem: Event loops
useEventListener('conversation:created', async (event) => {
  await emit('conversation:created', event); // Loop!
});

// ✅ Solution: Use different event names
useEventListener('conversation:created', async (event) => {
  // Process
  await emit('conversation:processed', event);
});

// ✅ Or add guard
let processing = false;

useEventListener('conversation:created', async (event) => {
  if (processing) return;
  processing = true;
  try {
    // Process
  } finally {
    processing = false;
  }
});
```

### Issue 5: Listeners count growing

```typescript
// ❌ Problem: Subscribing in render (React)
function MyComponent() {
  // This creates NEW listener on every render!
  eventBus.subscribe('user:logged-in', (event) => {
    console.log(event);
  });

  return <div>...</div>;
}

// ✅ Solution: Use useEffect
function MyComponent() {
  useEffect(() => {
    return eventBus.subscribe('user:logged-in', (event) => {
      console.log(event);
    });
  }, []); // Only subscribe once!

  return <div>...</div>;
}

// ✅ Or use custom hook
useEventListener('user:logged-in', (event) => {
  console.log(event);
}); // Handles cleanup automatically
```

---

**Version:** 1.0  
**Last Updated:** November 18, 2025  
**Maintainer:** Frontend Architecture Team
