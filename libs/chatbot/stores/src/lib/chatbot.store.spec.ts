import { act, renderHook } from '@testing-library/react';
import { useChatbotStore } from './chatbot.store';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

describe('useChatbotStore', () => {
  let eventBus: ReturnType<typeof getEventBus>;

  beforeEach(() => {
    // Reset store state before each test
    useChatbotStore.setState({
      conversations: [],
      currentConversationId: null,
      messages: {},
      isLoading: false,
      isSending: false,
      error: null,
    });

    // Get fresh event bus instance
    eventBus = getEventBus();
    eventBus.clear();
  });

  afterEach(() => {
    eventBus.clear();
  });

  describe('Conversation Management', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useChatbotStore());

      expect(result.current.conversations).toEqual([]);
      expect(result.current.currentConversationId).toBeNull();
      expect(result.current.messages).toEqual({});
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should add a conversation and emit CONVERSATION_CREATED event', () => {
      const { result } = renderHook(() => useChatbotStore());
      const mockListener = jest.fn();

      // Subscribe to event
      eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, mockListener);

      const newConversation = {
        id: 'conv-1',
        userId: 'user-123',
        title: 'Test Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      act(() => {
        result.current.addConversation(newConversation);
      });

      // Verify state updated
      expect(result.current.conversations).toHaveLength(1);
      expect(result.current.conversations[0]).toEqual(newConversation);

      // Verify event emitted
      expect(mockListener).toHaveBeenCalledTimes(1);
      const emittedEvent = mockListener.mock.calls[0]?.[0];
      expect(emittedEvent.conversationId).toBe('conv-1');
      expect(emittedEvent.userId).toBe('user-123');
      expect(emittedEvent.title).toBe('Test Conversation');
      expect(emittedEvent.timestamp).toBeDefined();
    });

    it('should update a conversation and emit CONVERSATION_UPDATED event', () => {
      const { result } = renderHook(() => useChatbotStore());
      const mockListener = jest.fn();

      // Add initial conversation
      const conversation = {
        id: 'conv-1',
        userId: 'user-123',
        title: 'Original Title',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      act(() => {
        result.current.addConversation(conversation);
      });

      // Subscribe to update event
      eventBus.subscribe(EVENT_NAMES.CONVERSATION_UPDATED, mockListener);

      // Update conversation
      act(() => {
        result.current.updateConversation('conv-1', { title: 'Updated Title' });
      });

      // Verify state updated
      expect(result.current.conversations[0]?.title).toBe('Updated Title');
      expect(result.current.conversations[0]?.updatedAt).toBeGreaterThanOrEqual(
        conversation.updatedAt
      );

      // Verify event emitted (only when title changes)
      expect(mockListener).toHaveBeenCalledTimes(1);
      const emittedEvent = mockListener.mock.calls[0]?.[0];
      expect(emittedEvent.conversationId).toBe('conv-1');
      expect(emittedEvent.updates.title).toBe('Updated Title');
    });

    it('should not emit CONVERSATION_UPDATED event when title does not change', () => {
      const { result } = renderHook(() => useChatbotStore());
      const mockListener = jest.fn();

      // Add initial conversation
      act(() => {
        result.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: 'Same Title',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      eventBus.subscribe(EVENT_NAMES.CONVERSATION_UPDATED, mockListener);

      // Update without changing title
      act(() => {
        result.current.updateConversation('conv-1', {});
      });

      // Event should not be emitted
      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should delete a conversation and emit CONVERSATION_DELETED event', () => {
      const { result } = renderHook(() => useChatbotStore());
      const mockListener = jest.fn();

      // Add conversation
      act(() => {
        result.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: 'To Delete',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      eventBus.subscribe(EVENT_NAMES.CONVERSATION_DELETED, mockListener);

      // Delete conversation
      act(() => {
        result.current.deleteConversation('conv-1');
      });

      // Verify state updated
      expect(result.current.conversations).toHaveLength(0);
      expect(result.current.currentConversationId).toBeNull();

      // Verify event emitted
      expect(mockListener).toHaveBeenCalledTimes(1);
      const emittedEvent = mockListener.mock.calls[0]?.[0];
      expect(emittedEvent.conversationId).toBe('conv-1');
      expect(emittedEvent.userId).toBe('user-123');
      expect(emittedEvent.timestamp).toBeDefined();
    });

    it('should handle deleting non-existent conversation gracefully', () => {
      const { result } = renderHook(() => useChatbotStore());
      const mockListener = jest.fn();

      eventBus.subscribe(EVENT_NAMES.CONVERSATION_DELETED, mockListener);

      act(() => {
        result.current.deleteConversation('non-existent');
      });

      // Should not crash or emit event
      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should set current conversation', () => {
      const { result } = renderHook(() => useChatbotStore());

      // Add conversations
      act(() => {
        result.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: 'First',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        result.current.addConversation({
          id: 'conv-2',
          userId: 'user-123',
          title: 'Second',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Set current conversation
      act(() => {
        result.current.setCurrentConversation('conv-2');
      });

      expect(result.current.currentConversationId).toBe('conv-2');
    });
  });

  describe('Message Management', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useChatbotStore());
      // Add a conversation for message tests
      act(() => {
        result.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: 'Test Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });
    });

    it('should send a message and emit CHAT_MESSAGE_SENT event', () => {
      const { result } = renderHook(() => useChatbotStore());
      const mockListener = jest.fn();

      eventBus.subscribe(EVENT_NAMES.CHAT_MESSAGE_SENT, mockListener);

      act(() => {
        result.current.sendMessage('conv-1', 'Hello, AI!');
      });

      // Verify message added to state
      const messages = result.current.messages['conv-1'];
      expect(messages).toHaveLength(1);
      expect(messages?.[0]?.role).toBe('user');
      expect(messages?.[0]?.content).toBe('Hello, AI!');
      expect(messages?.[0]?.conversationId).toBe('conv-1');

      // Verify event emitted
      expect(mockListener).toHaveBeenCalledTimes(1);
      const emittedEvent = mockListener.mock.calls[0]?.[0];
      expect(emittedEvent.content).toBe('Hello, AI!');
      expect(emittedEvent.conversationId).toBe('conv-1');
      expect(emittedEvent.timestamp).toBeDefined();
    });

    it('should receive a message and emit CHAT_MESSAGE_RECEIVED event', () => {
      const { result } = renderHook(() => useChatbotStore());
      const mockListener = jest.fn();

      eventBus.subscribe(EVENT_NAMES.CHAT_MESSAGE_RECEIVED, mockListener);

      const assistantMessage = {
        id: 'msg-ai-1',
        conversationId: 'conv-1',
        role: 'assistant' as const,
        content: 'Hello, human!',
        timestamp: Date.now(),
      };

      act(() => {
        result.current.receiveMessage(assistantMessage);
      });

      // Verify message added to state
      const messages = result.current.messages['conv-1'];
      expect(messages).toHaveLength(1);
      expect(messages?.[0]).toEqual(assistantMessage);

      // Verify event emitted
      expect(mockListener).toHaveBeenCalledTimes(1);
      const emittedEvent = mockListener.mock.calls[0]?.[0];
      expect(emittedEvent.content).toBe('Hello, human!');
      expect(emittedEvent.role).toBe('assistant');
      expect(emittedEvent.conversationId).toBe('conv-1');
      expect(emittedEvent.timestamp).toBeDefined();
    });

    it('should handle sending multiple messages', () => {
      const { result } = renderHook(() => useChatbotStore());

      act(() => {
        result.current.sendMessage('conv-1', 'First message');
        result.current.sendMessage('conv-1', 'Second message');
        result.current.sendMessage('conv-1', 'Third message');
      });

      const messages = result.current.messages['conv-1'];
      expect(messages).toHaveLength(3);
      expect(messages?.map((m) => m.content)).toEqual([
        'First message',
        'Second message',
        'Third message',
      ]);
    });

    it('should separate messages by conversation', () => {
      const { result } = renderHook(() => useChatbotStore());

      // Add another conversation
      act(() => {
        result.current.addConversation({
          id: 'conv-2',
          userId: 'user-123',
          title: 'Second Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Send messages to different conversations
      act(() => {
        result.current.sendMessage('conv-1', 'Message in conv-1');
        result.current.sendMessage('conv-2', 'Message in conv-2');
      });

      // Get messages for specific conversation
      const conv1Messages = result.current.messages['conv-1'];
      const conv2Messages = result.current.messages['conv-2'];

      expect(conv1Messages).toHaveLength(1);
      expect(conv2Messages).toHaveLength(1);
      expect(conv1Messages?.[0]?.content).toBe('Message in conv-1');
      expect(conv2Messages?.[0]?.content).toBe('Message in conv-2');
    });
  });

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useChatbotStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => useChatbotStore());
      const errorMessage = 'Failed to send message';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Event Integration', () => {
    it('should emit all events with correct payload structure', () => {
      const { result } = renderHook(() => useChatbotStore());
      const events: Array<{ name: string; payload: any }> = [];

      // Subscribe to all chatbot events
      eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, (payload: any) => {
        events.push({ name: 'CONVERSATION_CREATED', payload });
      });
      eventBus.subscribe(EVENT_NAMES.CONVERSATION_UPDATED, (payload: any) => {
        events.push({ name: 'CONVERSATION_UPDATED', payload });
      });
      eventBus.subscribe(EVENT_NAMES.CONVERSATION_DELETED, (payload: any) => {
        events.push({ name: 'CONVERSATION_DELETED', payload });
      });
      eventBus.subscribe(EVENT_NAMES.CHAT_MESSAGE_SENT, (payload: any) => {
        events.push({ name: 'CHAT_MESSAGE_SENT', payload });
      });
      eventBus.subscribe(EVENT_NAMES.CHAT_MESSAGE_RECEIVED, (payload: any) => {
        events.push({ name: 'CHAT_MESSAGE_RECEIVED', payload });
      });

      // Perform actions
      act(() => {
        result.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: 'Test',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        result.current.updateConversation('conv-1', { title: 'Updated' });
        result.current.sendMessage('conv-1', 'Hello');
        result.current.receiveMessage({
          id: 'msg-1',
          conversationId: 'conv-1',
          role: 'assistant',
          content: 'Hi',
          timestamp: Date.now(),
        });
        result.current.deleteConversation('conv-1');
      });

      // Verify all events were emitted
      expect(events).toHaveLength(5);
      expect(events.map((e) => e.name)).toEqual([
        'CONVERSATION_CREATED',
        'CONVERSATION_UPDATED',
        'CHAT_MESSAGE_SENT',
        'CHAT_MESSAGE_RECEIVED',
        'CONVERSATION_DELETED',
      ]);

      // Verify event payloads have timestamps
      events.forEach((event) => {
        expect(event.payload.timestamp).toBeDefined();
        expect(typeof event.payload.timestamp).toBe('number');
      });
    });

    it('should maintain event order', () => {
      const { result } = renderHook(() => useChatbotStore());
      const eventOrder: string[] = [];

      eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, () => {
        eventOrder.push('CREATED');
      });
      eventBus.subscribe(EVENT_NAMES.CHAT_MESSAGE_SENT, () => {
        eventOrder.push('SENT');
      });
      eventBus.subscribe(EVENT_NAMES.CHAT_MESSAGE_RECEIVED, () => {
        eventOrder.push('RECEIVED');
      });

      act(() => {
        result.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: 'Test',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        result.current.sendMessage('conv-1', 'User message');
        result.current.receiveMessage({
          id: 'msg-1',
          conversationId: 'conv-1',
          role: 'assistant',
          content: 'Assistant reply',
          timestamp: Date.now(),
        });
      });

      expect(eventOrder).toEqual(['CREATED', 'SENT', 'RECEIVED']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message content', () => {
      const { result } = renderHook(() => useChatbotStore());

      act(() => {
        result.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: 'Test',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        result.current.sendMessage('conv-1', '');
      });

      const messages = result.current.messages['conv-1'];
      expect(messages).toHaveLength(1);
      expect(messages?.[0]?.content).toBe('');
    });

    it('should handle very long message content', () => {
      const { result } = renderHook(() => useChatbotStore());
      const longMessage = 'A'.repeat(10000);

      act(() => {
        result.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: 'Test',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        result.current.sendMessage('conv-1', longMessage);
      });

      const messages = result.current.messages['conv-1'];
      expect(messages?.[0]?.content).toBe(longMessage);
      expect(messages?.[0]?.content.length).toBe(10000);
    });

    it('should handle rapid consecutive actions', () => {
      const { result } = renderHook(() => useChatbotStore());

      act(() => {
        // Add multiple conversations rapidly
        for (let i = 0; i < 10; i++) {
          result.current.addConversation({
            id: `conv-${i}`,
            userId: 'user-123',
            title: `Conversation ${i}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      });

      expect(result.current.conversations).toHaveLength(10);
    });

    it('should handle special characters in content', () => {
      const { result } = renderHook(() => useChatbotStore());
      const specialContent = '\\n\\t"\\\'<>&@#$%^&*()[]{}';

      act(() => {
        result.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: specialContent,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      expect(result.current.conversations[0]?.title).toBe(specialContent);
    });
  });
});
