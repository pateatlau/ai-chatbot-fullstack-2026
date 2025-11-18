// libs/shared/event-bus/src/index.ts

export { EventBus, getEventBus, resetEventBus } from './lib/event-bus';
export type { EventBusOptions } from './lib/event-bus';

export {
  EVENT_NAMES,
  type EventName,
  type EventMap,
  type UserLoggedInEvent,
  type UserLoggedOutEvent,
  type UserProfileUpdatedEvent,
  type UserRoleChangedEvent,
  type ToastShowEvent,
  type ToastDismissEvent,
  type ToastType,
  type NavigationRequestedEvent,
  type RouteChangedEvent,
  type ChatMessageSentEvent,
  type ChatMessageReceivedEvent,
  type ConversationCreatedEvent,
  type ConversationDeletedEvent,
  type ConversationUpdatedEvent,
  type AdminDashboardRefreshEvent,
  type UserBannedEvent,
  type UserUnbannedEvent,
  type ThemeChangedEvent,
  type ThemeMode,
  type ErrorOccurredEvent,
  type NetworkErrorEvent,
} from './lib/event-types';

export {
  useEventBus,
  useEventEmitter,
  useEventBusInstance,
} from './lib/hooks/useEventBus';
