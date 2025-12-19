import { EventEmitter } from 'events';

export interface MessageEvent {
  conversationId: string;
  message: {
    id: string;
    conversationId: string;
    role: string;
    content: string;
    tokenCount: number;
    createdAt: Date;
    isDeleted: boolean;
  };
}

export interface ConversationEvent {
  userId: string;
  conversation: {
    id: string;
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
  };
}

class ChatEventEmitter extends EventEmitter {
  /**
   * Emit when new message is received
   */
  emitMessageReceived(event: MessageEvent) {
    this.emit(`message-${event.conversationId}`, event.message);
  }

  /**
   * Emit when conversation is updated
   */
  emitConversationUpdated(event: ConversationEvent) {
    this.emit(`conversation-${event.userId}`, event.conversation);
  }

  /**
   * Subscribe to message events for a conversation
   */
  onMessageReceived(conversationId: string, callback: (message: any) => void) {
    this.on(`message-${conversationId}`, callback);
    return () => this.off(`message-${conversationId}`, callback);
  }

  /**
   * Subscribe to conversation updates for a user
   */
  onConversationUpdated(userId: string, callback: (conversation: any) => void) {
    this.on(`conversation-${userId}`, callback);
    return () => this.off(`conversation-${userId}`, callback);
  }

  /**
   * Clean up all listeners (useful for testing)
   */
  clearAllListeners() {
    this.removeAllListeners();
  }
}

export const chatEventEmitter = new ChatEventEmitter();
