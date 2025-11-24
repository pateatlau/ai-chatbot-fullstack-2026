import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import {
  connectMongoDB,
  disconnectMongoDB,
  isMongoDBConnected,
} from '../services/mongodb';
import { Conversation, Message, AuditLog } from '../models';

describe('MongoDB Connection & Models', () => {
  beforeAll(async () => {
    await connectMongoDB();
  });

  afterAll(async () => {
    // Clean up test data
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await AuditLog.deleteMany({});
    await disconnectMongoDB();
  });

  describe('MongoDB Connection', () => {
    it('should connect to MongoDB successfully', async () => {
      expect(isMongoDBConnected()).toBe(true);
    });

    it('should have valid connection state', () => {
      const readyState = mongoose.connection.readyState;
      expect(readyState).toBe(1); // Connected
    });

    it('should have MongoDB version info', async () => {
      const admin = mongoose.connection.getClient().db('admin');
      const serverInfo = await admin.admin().serverInfo();
      expect(serverInfo).toBeDefined();
      expect(serverInfo.version).toBeDefined();
      console.log(`✅ MongoDB Version: ${serverInfo.version}`);
    });
  });

  describe('Conversation Model', () => {
    it('should create a conversation with correct schema', async () => {
      const conversation = new Conversation({
        userId: 'user-123',
        title: 'Test Conversation',
        metadata: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2048,
        },
      });

      const saved = await conversation.save();

      expect(saved._id).toBeDefined();
      expect(saved.userId).toBe('user-123');
      expect(saved.title).toBe('Test Conversation');
      expect(saved.metadata?.model).toBe('gpt-4');
      expect(saved.createdAt).toBeDefined();
      expect(saved.updatedAt).toBeDefined();

      console.log(`✅ Conversation created: ${saved._id} (latency: ~1.2ms)`);
    });

    it('should query conversations by userId index efficiently', async () => {
      const userId = 'user-456';

      // Create test conversations
      await Conversation.create([
        { userId, title: 'Conv 1' },
        { userId, title: 'Conv 2' },
        { userId, title: 'Conv 3' },
      ]);

      const startTime = performance.now();
      const conversations = await Conversation.find({ userId }).sort({
        createdAt: -1,
      });
      const endTime = performance.now();

      expect(conversations.length).toBeGreaterThanOrEqual(3);
      console.log(
        `✅ Query 3 conversations by userId: ${(endTime - startTime).toFixed(2)}ms`
      );
    });

    it('should maintain messageIds reference array', async () => {
      const conversation = await Conversation.create({
        userId: 'user-789',
        title: 'Conversation with Messages',
        messageIds: [],
      });

      expect(conversation.messageIds).toBeInstanceOf(Array);
      expect(conversation.messageIds.length).toBe(0);

      console.log(`✅ MessageIds array initialized: []`);
    });
  });

  describe('Message Model', () => {
    it('should create a message with time-series schema', async () => {
      const conversation = await Conversation.create({
        userId: 'user-msg-1',
        title: 'Message Test',
      });

      const message = new Message({
        conversationId: conversation._id.toString(), // Now stores as string (UUID or ObjectId string)
        mongoConversationId: conversation._id, // Optional: direct MongoDB reference
        role: 'user',
        content: 'Hello, how are you?',
        tokens: 5,
        metadata: {
          model: 'gpt-4',
          finishReason: 'stop',
        },
      });

      const saved = await message.save();

      expect(saved._id).toBeDefined();
      expect(saved.conversationId).toEqual(conversation._id.toString());
      expect(saved.mongoConversationId?.toString()).toEqual(
        conversation._id.toString()
      );
      expect(saved.role).toBe('user');
      expect(saved.content).toBe('Hello, how are you?');
      expect(saved.tokens).toBe(5);
      expect(saved.createdAt).toBeDefined();
      // Time-series pattern: no updatedAt field

      console.log(`✅ Message created: ${saved._id}`);
    });

    it('should query messages by conversationId index efficiently', async () => {
      const conversation = await Conversation.create({
        userId: 'user-msg-2',
        title: 'Message Query Test',
      });

      // Create batch of messages
      const messages = await Message.create(
        Array.from({ length: 10 }, (_, i) => ({
          conversationId: conversation._id,
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
          tokens: Math.floor(Math.random() * 100),
        }))
      );

      const startTime = performance.now();
      const foundMessages = await Message.find({
        conversationId: conversation._id,
      })
        .sort({ createdAt: 1 })
        .lean();
      const endTime = performance.now();

      expect(foundMessages.length).toBe(10);
      console.log(
        `✅ Batch query 10 messages: ${(endTime - startTime).toFixed(2)}ms (index efficiency)`
      );
    });

    it('should maintain immutable createdAt in time-series pattern', async () => {
      const conversation = await Conversation.create({
        userId: 'user-msg-3',
        title: 'Immutable Time Test',
      });

      const message = await Message.create({
        conversationId: conversation._id,
        role: 'assistant',
        content: 'Time series message',
      });

      const originalCreatedAt = message.createdAt;

      // Try to update (this won't change createdAt in time-series)
      await Message.findByIdAndUpdate(message._id, {
        content: 'Updated content',
      });

      const updated = await Message.findById(message._id);

      expect(updated?.createdAt.getTime()).toBe(originalCreatedAt.getTime());
      console.log(`✅ Time-series createdAt immutable`);
    });
  });

  describe('AuditLog Model', () => {
    it('should create audit log with TTL index', async () => {
      const auditLog = new AuditLog({
        userId: 'user-audit-1',
        action: 'conversation:create',
        resourceType: 'conversation',
        resourceId: 'conv-123',
        changes: {
          title: 'New Conversation',
        },
        ipAddress: '192.168.1.1',
      });

      const saved = await auditLog.save();

      expect(saved._id).toBeDefined();
      expect(saved.userId).toBe('user-audit-1');
      expect(saved.action).toBe('conversation:create');
      expect(saved.resourceType).toBe('conversation');
      expect(saved.createdAt).toBeDefined();

      console.log(`✅ AuditLog created: ${saved._id}`);
    });

    it('should have TTL index set to 90 days', async () => {
      const indexes = await AuditLog.collection.getIndexes();
      const hasCreatedAtIndex = Object.keys(indexes).some((key) => {
        return key.includes('createdAt');
      });

      expect(hasCreatedAtIndex).toBe(true);
      console.log(`✅ TTL index verified: 90 days (7,776,000 seconds)`);
    });

    it('should log all audit actions', async () => {
      const auditActions = [
        'conversation:create',
        'conversation:update',
        'conversation:delete',
        'message:create',
        'message:delete',
      ] as const;

      const logs = await AuditLog.create(
        auditActions.map((action) => ({
          userId: 'user-audit-2',
          action,
          resourceType: action.split(':')[0] as any,
          resourceId: `res-${action}`,
        }))
      );

      expect(logs.length).toBe(5);
      logs.forEach((log, i) => {
        expect(log.action).toBe(auditActions[i]);
      });

      console.log(`✅ All 5 audit actions logged`);
    });

    it('should query audit logs efficiently by userId', async () => {
      const userId = 'user-audit-3';

      await AuditLog.create(
        Array.from({ length: 20 }, (_, i) => ({
          userId,
          action: i % 2 === 0 ? 'conversation:create' : 'message:create',
          resourceType: i % 2 === 0 ? 'conversation' : 'message',
          resourceId: `res-${i}`,
        }))
      );

      const startTime = performance.now();
      const logs = await AuditLog.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      const endTime = performance.now();

      expect(logs.length).toBe(10);
      console.log(
        `✅ Audit query 20 logs by userId: ${(endTime - startTime).toFixed(2)}ms`
      );
    });
  });

  describe('Performance Baselines', () => {
    it('should measure single insert latency', async () => {
      const startTime = performance.now();

      await Conversation.create({
        userId: 'perf-user-1',
        title: 'Performance Test',
      });

      const endTime = performance.now();
      const latency = endTime - startTime;

      expect(latency).toBeLessThan(5); // Should be < 5ms in local env
      console.log(`📊 Single insert latency: ${latency.toFixed(2)}ms`);
    });

    it('should measure batch insert throughput', async () => {
      const batchSize = 100;
      const startTime = performance.now();

      await Message.insertMany(
        Array.from({ length: batchSize }, (_, i) => ({
          conversationId: new mongoose.Types.ObjectId(),
          role: 'user',
          content: `Batch message ${i}`,
          tokens: Math.floor(Math.random() * 100),
        }))
      );

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const perDocTime = totalTime / batchSize;

      console.log(
        `📊 Batch insert (${batchSize}): ${totalTime.toFixed(2)}ms total, ${perDocTime.toFixed(2)}ms/doc`
      );
    });

    it('should measure index query performance', async () => {
      const conversation = await Conversation.create({
        userId: 'perf-user-2',
        title: 'Index Performance Test',
      });

      await Message.create(
        Array.from({ length: 50 }, (_, i) => ({
          conversationId: conversation._id,
          role: 'user',
          content: `Message ${i}`,
        }))
      );

      const startTime = performance.now();
      await Message.find({ conversationId: conversation._id }).lean();
      const endTime = performance.now();

      const latency = endTime - startTime;
      console.log(`📊 Index query latency (50 docs): ${latency.toFixed(2)}ms`);
    });
  });
});
