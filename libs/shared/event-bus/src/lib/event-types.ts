// libs/shared/event-bus/src/lib/event-types.ts

/**
 * Centralized Event Type Definitions for Inter-MFE Communication
 */

// ============================================================================
// USER EVENTS
// ============================================================================

export interface UserLoggedInEvent {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
  timestamp: number;
}

export interface UserLoggedOutEvent {
  userId: string;
  timestamp: number;
}

export interface UserProfileUpdatedEvent {
  userId: string;
  changes: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  timestamp: number;
}

export interface UserRoleChangedEvent {
  userId: string;
  oldRole: 'user' | 'admin';
  newRole: 'user' | 'admin';
  timestamp: number;
}

// ============================================================================
// TOAST/NOTIFICATION EVENTS
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastShowEvent {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  timestamp: number;
}

export interface ToastDismissEvent {
  id: string;
  timestamp: number;
}

// ============================================================================
// NAVIGATION EVENTS
// ============================================================================

export interface NavigationRequestedEvent {
  path: string;
  source: 'auth-mfe' | 'chatbot-mfe' | 'admin-mfe' | 'profile-mfe' | 'shell';
  timestamp: number;
}

export interface RouteChangedEvent {
  from: string;
  to: string;
  timestamp: number;
}

// ============================================================================
// CHATBOT EVENTS
// ============================================================================

export interface ChatMessageSentEvent {
  messageId: string;
  conversationId: string;
  userId: string;
  content: string;
  timestamp: number;
}

export interface ChatMessageReceivedEvent {
  messageId: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ConversationCreatedEvent {
  conversationId: string;
  userId: string;
  title: string;
  timestamp: number;
}

export interface ConversationDeletedEvent {
  conversationId: string;
  userId: string;
  timestamp: number;
}

export interface ConversationUpdatedEvent {
  conversationId: string;
  updates: {
    title?: string;
  };
  timestamp: number;
}

// ============================================================================
// ADMIN EVENTS
// ============================================================================

export interface AdminDashboardRefreshEvent {
  source: 'manual' | 'auto';
  timestamp: number;
}

export interface UserBannedEvent {
  userId: string;
  adminId: string;
  reason: string;
  timestamp: number;
}

export interface UserUnbannedEvent {
  userId: string;
  adminId: string;
  timestamp: number;
}

// ============================================================================
// THEME EVENTS
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeChangedEvent {
  theme: ThemeMode;
  timestamp: number;
}

// ============================================================================
// ERROR EVENTS
// ============================================================================

export interface ErrorOccurredEvent {
  error: {
    message: string;
    code?: string;
    stack?: string;
  };
  source: string;
  timestamp: number;
}

export interface NetworkErrorEvent {
  endpoint: string;
  method: string;
  statusCode?: number;
  message: string;
  timestamp: number;
}

// ============================================================================
// EVENT NAME CONSTANTS
// ============================================================================

export const EVENT_NAMES = {
  // User events
  USER_LOGGED_IN: 'user:logged-in',
  USER_LOGGED_OUT: 'user:logged-out',
  USER_PROFILE_UPDATED: 'user:profile-updated',
  USER_ROLE_CHANGED: 'user:role-changed',

  // Toast events
  TOAST_SHOW: 'toast:show',
  TOAST_DISMISS: 'toast:dismiss',

  // Navigation events
  NAVIGATION_REQUESTED: 'navigation:requested',
  ROUTE_CHANGED: 'route:changed',

  // Chatbot events
  CHAT_MESSAGE_SENT: 'chat:message-sent',
  CHAT_MESSAGE_RECEIVED: 'chat:message-received',
  CONVERSATION_CREATED: 'conversation:created',
  CONVERSATION_DELETED: 'conversation:deleted',
  CONVERSATION_UPDATED: 'conversation:updated',

  // Admin events
  ADMIN_DASHBOARD_REFRESH: 'admin:dashboard-refresh',
  USER_BANNED: 'user:banned',
  USER_UNBANNED: 'user:unbanned',

  // Theme events
  THEME_CHANGED: 'theme:changed',

  // Error events
  ERROR_OCCURRED: 'error:occurred',
  NETWORK_ERROR: 'network:error',
} as const;

// Type-safe event name type
export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

// ============================================================================
// EVENT MAP (for type-safe emit/subscribe)
// ============================================================================

export interface EventMap {
  [EVENT_NAMES.USER_LOGGED_IN]: UserLoggedInEvent;
  [EVENT_NAMES.USER_LOGGED_OUT]: UserLoggedOutEvent;
  [EVENT_NAMES.USER_PROFILE_UPDATED]: UserProfileUpdatedEvent;
  [EVENT_NAMES.USER_ROLE_CHANGED]: UserRoleChangedEvent;
  [EVENT_NAMES.TOAST_SHOW]: ToastShowEvent;
  [EVENT_NAMES.TOAST_DISMISS]: ToastDismissEvent;
  [EVENT_NAMES.NAVIGATION_REQUESTED]: NavigationRequestedEvent;
  [EVENT_NAMES.ROUTE_CHANGED]: RouteChangedEvent;
  [EVENT_NAMES.CHAT_MESSAGE_SENT]: ChatMessageSentEvent;
  [EVENT_NAMES.CHAT_MESSAGE_RECEIVED]: ChatMessageReceivedEvent;
  [EVENT_NAMES.CONVERSATION_CREATED]: ConversationCreatedEvent;
  [EVENT_NAMES.CONVERSATION_DELETED]: ConversationDeletedEvent;
  [EVENT_NAMES.CONVERSATION_UPDATED]: ConversationUpdatedEvent;
  [EVENT_NAMES.ADMIN_DASHBOARD_REFRESH]: AdminDashboardRefreshEvent;
  [EVENT_NAMES.USER_BANNED]: UserBannedEvent;
  [EVENT_NAMES.USER_UNBANNED]: UserUnbannedEvent;
  [EVENT_NAMES.THEME_CHANGED]: ThemeChangedEvent;
  [EVENT_NAMES.ERROR_OCCURRED]: ErrorOccurredEvent;
  [EVENT_NAMES.NETWORK_ERROR]: NetworkErrorEvent;
}
