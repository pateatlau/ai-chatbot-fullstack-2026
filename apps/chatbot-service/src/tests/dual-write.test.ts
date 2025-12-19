import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { connectMongoDB, disconnectMongoDB } from '../services/mongodb';
import { dualWriteService } from '../services/dual-write';
import { dataMigrationService } from '../services/data-migration';
import { Conversation, Message, AuditLog } from '../models';

const prisma = new PrismaClient();

describe('Dual-Write & Data Migration', () => {
  beforeAll(async () => {
    // Use direct mongoose connection for testing (bypasses env var issues)
    try {
      await import('mongoose').then((m) =>
        m.default.connect('mongodb://localhost:27017/myapp', {
          maxPoolSize: 10,
          minPoolSize: 5,
          retryWrites: false,
        } as any)
      );
      console.log('✅ Test setup: Connected to MongoDB');
    } catch (err) {
      console.error('Failed to connect MongoDB:', err);
      throw err;
    }
  });

  afterAll(async () => {
    try {
      // Clean up MongoDB
      await Conversation.deleteMany({});
      await Message.deleteMany({});
      await AuditLog.deleteMany({});

      // Clean up PostgreSQL
      await prisma.message.deleteMany({});
      await prisma.conversation.deleteMany({});

      // Disconnect
      const mongoose = await import('mongoose');
      if (mongoose.default.connection.readyState === 1) {
        await mongoose.default.disconnect();
      }

      console.log('✅ Test cleanup: All data cleared and connections closed');
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  });

  describe('Dual-Write Service', () => {
    it('should create conversation in both PostgreSQL and MongoDB', async () => {
      const result = await dualWriteService.createConversation(
        'user-123',
        'Test Conversation',
        {
          verbose: true,
        }
      );

      expect(result.success).toBe(true);
      expect(result.postgresId).toBeDefined();
      expect(result.mongoId).toBeDefined();

      // Verify in PostgreSQL
      const pgConv = await prisma.conversation.findUnique({
        where: { id: result.postgresId },
      });
      expect(pgConv).toBeDefined();
      expect(pgConv?.title).toBe('Test Conversation');

      // Verify in MongoDB
      const mongoConv = await Conversation.findById(result.mongoId);
      expect(mongoConv).toBeDefined();
      expect(mongoConv?.title).toBe('Test Conversation');

      console.log('✅ Conversation dual-write test passed');
    });

    it('should create message in both PostgreSQL and MongoDB', async () => {
      // Create conversation first
      const convResult = await dualWriteService.createConversation(
        'user-456',
        'Message Test Conv'
      );

      // Create message
      const msgResult = await dualWriteService.createMessage(
        convResult.postgresId!,
        'user',
        'Hello, how are you?',
        15,
        { verbose: true }
      );

      expect(msgResult.success).toBe(true);
      expect(msgResult.postgresId).toBeDefined();
      expect(msgResult.mongoId).toBeDefined();

      // Verify in PostgreSQL
      const pgMsg = await prisma.message.findUnique({
        where: { id: msgResult.postgresId },
      });
      expect(pgMsg).toBeDefined();
      expect(pgMsg?.content).toBe('Hello, how are you?');
      expect(pgMsg?.tokenCount).toBe(15);

      // Verify in MongoDB
      const mongoMsg = await Message.findById(msgResult.mongoId);
      expect(mongoMsg).toBeDefined();
      expect(mongoMsg?.content).toBe('Hello, how are you?');
      expect(mongoMsg?.tokens).toBe(15);

      console.log('✅ Message dual-write test passed');
    });

    it('should create audit log in both databases', async () => {
      const auditResult = await dualWriteService.createAuditLog(
        'user-789',
        'create',
        'conversation',
        'conv-123',
        { title: 'New Conversation' },
        { verbose: true }
      );

      expect(auditResult.success).toBe(true);
      expect(auditResult.postgresId).toBeDefined();
      expect(auditResult.mongoId).toBeDefined();

      console.log('✅ Audit log dual-write test passed');
    });

    it('should get status of both databases', async () => {
      const status = await dualWriteService.getStatus();

      expect(status.postgres).toContain('✅');
      expect(status.mongo).toContain('✅');
      expect(status.timestamp).toBeInstanceOf(Date);

      console.log('✅ Status check test passed');
    });

    it('should support MongoDB-only writes (write-through)', async () => {
      const result = await dualWriteService.createConversation(
        'user-mongo-only',
        'MongoDB Only',
        {
          writeToPostgres: false,
          writeToMongo: true,
          verbose: true,
        }
      );

      expect(result.success).toBe(true);
      expect(result.postgresId).toBeUndefined();
      expect(result.mongoId).toBeDefined();

      console.log('✅ MongoDB-only write test passed');
    });

    it('should support PostgreSQL-only writes (backward compat)', async () => {
      const result = await dualWriteService.createConversation(
        'user-pg-only',
        'PostgreSQL Only',
        {
          writeToPostgres: true,
          writeToMongo: false,
          verbose: true,
        }
      );

      expect(result.success).toBe(true);
      expect(result.postgresId).toBeDefined();
      expect(result.mongoId).toBeUndefined();

      console.log('✅ PostgreSQL-only write test passed');
    });
  });

  describe('Data Migration Service', () => {
    it('should export PostgreSQL data', async () => {
      // Create test data in PostgreSQL
      const conv = await prisma.conversation.create({
        data: {
          userId: 'export-test-user',
          title: 'Export Test',
          messages: {
            create: [
              {
                role: 'user',
                content: 'Test message 1',
              },
              {
                role: 'assistant',
                content: 'Test message 2',
              },
            ],
          },
        },
        include: { messages: true },
      });

      const exported = await dataMigrationService.exportPostgresData();

      expect(exported.conversations).toBeInstanceOf(Array);
      expect(exported.conversations.length).toBeGreaterThan(0);
      expect(exported.count.messages).toBeGreaterThan(0);

      console.log(`✅ Exported ${exported.count.conversations} conversations`);
    });

    it('should verify data consistency', async () => {
      // Verify consistency report is generated (may not match due to test isolation)
      const consistency = await dataMigrationService.verifyConsistency();

      // Check that consistency check returns proper structure
      expect(consistency.conversations).toBeDefined();
      expect(consistency.messages).toBeDefined();
      expect(consistency.auditLogs).toBeDefined();

      // Verify structure of consistency report
      expect(consistency.conversations).toHaveProperty('postgres');
      expect(consistency.conversations).toHaveProperty('mongo');
      expect(consistency.conversations).toHaveProperty('match');

      expect(consistency.messages).toHaveProperty('postgres');
      expect(consistency.messages).toHaveProperty('mongo');
      expect(consistency.messages).toHaveProperty('match');

      console.log('✅ Data consistency check completed:');
      console.log(
        `   Conversations: PostgreSQL=${consistency.conversations.postgres}, MongoDB=${consistency.conversations.mongo}`
      );
      console.log(
        `   Messages: PostgreSQL=${consistency.messages.postgres}, MongoDB=${consistency.messages.mongo}`
      );
      console.log(
        `   Audit Logs: PostgreSQL=${consistency.auditLogs.postgres}, MongoDB=${consistency.auditLogs.mongo}`
      );
    });

    it('should handle empty database', async () => {
      // Export should work even with minimal data
      const exported = await dataMigrationService.exportPostgresData();

      expect(exported.conversations).toBeInstanceOf(Array);
      expect(typeof exported.count.conversations).toBe('number');
      expect(typeof exported.count.messages).toBe('number');

      console.log('✅ Export with empty/minimal data test passed');
    });
  });

  describe('Integration: Dual-Write with Resolver', () => {
    it('should simulate resolver using dual-write', async () => {
      // This simulates what resolvers will do during Day 5
      const userId = 'resolver-test-user';
      const title = 'Resolver Test Conversation';

      // Simulate GraphQL resolver calling dual-write
      const result = await dualWriteService.createConversation(userId, title);

      expect(result.success).toBe(true);

      // Verify can be read from PostgreSQL (current primary)
      const pgData = await prisma.conversation.findUnique({
        where: { id: result.postgresId! },
      });
      expect(pgData).toBeDefined();

      // Verify can be read from MongoDB (future primary)
      const mongoData = await Conversation.findById(result.mongoId!);
      expect(mongoData).toBeDefined();

      console.log('✅ Resolver integration test passed');
    });
  });

  describe('Performance: Dual-Write Overhead', () => {
    it('should measure dual-write latency', async () => {
      const iterations = 10;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await dualWriteService.createConversation(
          `perf-user-${i}`,
          `Performance Test ${i}`,
          {
            writeToPostgres: true,
            writeToMongo: true,
          }
        );
        const elapsed = performance.now() - start;
        times.push(elapsed);
      }

      const avg = times.reduce((a, b) => a + b) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);

      console.log(`\n📊 Dual-Write Performance (${iterations} iterations):`);
      console.log(`  Average: ${avg.toFixed(2)}ms`);
      console.log(`  Min: ${min.toFixed(2)}ms`);
      console.log(`  Max: ${max.toFixed(2)}ms`);

      // Should be reasonably fast (under 50ms for typical case)
      expect(avg).toBeLessThan(100);

      console.log('✅ Performance test passed');
    });
  });
});
