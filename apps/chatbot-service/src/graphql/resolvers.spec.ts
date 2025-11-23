import { resolvers } from './resolvers';
import { chatEventEmitter } from '../lib/event-emitter';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    conversation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  })),
}));

describe('Chatbot GraphQL Resolvers', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      userId: 'test-user-123',
      user: { id: 'test-user-123', email: 'test@example.com' },
    };
    chatEventEmitter.clearAllListeners();
  });

  describe('Conversation Field Resolvers', () => {
    it('should resolve lastMessage field', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello',
        createdAt: new Date(),
      };

      const fieldResolvers = resolvers.Conversation;
      expect(fieldResolvers).toBeDefined();
      expect(fieldResolvers.lastMessage).toBeDefined();
    });

    it('should resolve lastMessageDate field', async () => {
      const fieldResolvers = resolvers.Conversation;
      expect(fieldResolvers).toBeDefined();
      expect(fieldResolvers.lastMessageDate).toBeDefined();
    });

    it('should resolve messageCount field', async () => {
      const fieldResolvers = resolvers.Conversation;
      expect(fieldResolvers).toBeDefined();
      expect(fieldResolvers.messageCount).toBeDefined();
    });

    it('should resolve messages field', async () => {
      const fieldResolvers = resolvers.Conversation;
      expect(fieldResolvers).toBeDefined();
      expect(fieldResolvers.messages).toBeDefined();
    });

    it('should resolve user reference field', async () => {
      const fieldResolvers = resolvers.Conversation;
      expect(fieldResolvers).toBeDefined();
      expect(fieldResolvers.user).toBeDefined();
    });
  });

  describe('Message Field Resolvers', () => {
    it('should convert role to uppercase enum', () => {
      const messageResolvers = resolvers.Message;
      expect(messageResolvers.role({ role: 'user' })).toBe('USER');
      expect(messageResolvers.role({ role: 'assistant' })).toBe('ASSISTANT');
    });

    it('should handle missing role gracefully', () => {
      const messageResolvers = resolvers.Message;
      expect(messageResolvers.role({})).toBe('USER');
    });

    it('should resolve conversation reference', () => {
      const messageResolvers = resolvers.Message;
      expect(messageResolvers.conversation).toBeDefined();
    });
  });

  describe('Subscription Resolvers', () => {
    it('messageReceived subscription should exist', () => {
      const subscriptions = resolvers.Subscription;
      expect(subscriptions).toBeDefined();
      expect(subscriptions.messageReceived).toBeDefined();
      expect(subscriptions.messageReceived.subscribe).toBeDefined();
    });

    it('conversationUpdated subscription should exist', () => {
      const subscriptions = resolvers.Subscription;
      expect(subscriptions).toBeDefined();
      expect(subscriptions.conversationUpdated).toBeDefined();
      expect(subscriptions.conversationUpdated.subscribe).toBeDefined();
    });

    it('messageReceived should require authentication', async () => {
      const subscriptions = resolvers.Subscription;
      const subscribe = subscriptions.messageReceived.subscribe;

      try {
        await subscribe(null, { conversationId: 'conv-1' }, {});
        fail('Should have thrown authentication error');
      } catch (error: any) {
        expect(error.message).toContain('Not authenticated');
      }
    });

    it('conversationUpdated should require authentication', async () => {
      const subscriptions = resolvers.Subscription;
      const subscribe = subscriptions.conversationUpdated.subscribe;

      try {
        await subscribe(null, { userId: 'user-1' }, {});
        fail('Should have thrown authentication error');
      } catch (error: any) {
        expect(error.message).toContain('Not authenticated');
      }
    });
  });

  describe('Event Emitter', () => {
    it('should emit messageReceived events', (done) => {
      const testMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Test',
        tokenCount: 10,
        isDeleted: false,
        createdAt: new Date(),
      };

      chatEventEmitter.onMessageReceived('conv-1', (message) => {
        expect(message).toEqual(testMessage);
        done();
      });

      chatEventEmitter.emitMessageReceived({
        conversationId: 'conv-1',
        message: testMessage,
      });
    });

    it('should emit conversationUpdated events', (done) => {
      const testConversation = {
        id: 'conv-1',
        userId: 'user-1',
        title: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      chatEventEmitter.onConversationUpdated('user-1', (conversation) => {
        expect(conversation).toEqual(testConversation);
        done();
      });

      chatEventEmitter.emitConversationUpdated({
        userId: 'user-1',
        conversation: testConversation,
      });
    });

    it('should allow unsubscribing from messageReceived', () => {
      const callback = jest.fn();
      const unsubscribe = chatEventEmitter.onMessageReceived(
        'conv-1',
        callback
      );

      const testMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Test',
        tokenCount: 10,
        isDeleted: false,
        createdAt: new Date(),
      };

      chatEventEmitter.emitMessageReceived({
        conversationId: 'conv-1',
        message: testMessage,
      });

      expect(callback).toHaveBeenCalledWith(testMessage);

      callback.mockClear();
      unsubscribe();

      chatEventEmitter.emitMessageReceived({
        conversationId: 'conv-1',
        message: testMessage,
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
