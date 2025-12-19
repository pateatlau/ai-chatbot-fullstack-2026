import { PrismaClient } from '@prisma/client';
import { Conversation, Message, AuditLog } from '../models';

/**
 * Dual-Write Service
 * Handles writing to both PostgreSQL (Prisma) and MongoDB (Mongoose)
 * This is the foundation for the gradual migration strategy
 */

const prisma = new PrismaClient();

export interface DualWriteOptions {
  writeToPostgres?: boolean;
  writeToMongo?: boolean;
  verbose?: boolean;
}

class DualWriteService {
  private defaultOptions: DualWriteOptions = {
    writeToPostgres: true,
    writeToMongo: true,
    verbose: false,
  };

  /**
   * Create a new conversation in both databases
   */
  async createConversation(
    userId: string,
    title: string,
    options: DualWriteOptions = {}
  ) {
    const opts = { ...this.defaultOptions, ...options };
    const results: any = {};

    try {
      // Write to PostgreSQL
      if (opts.writeToPostgres) {
        if (opts.verbose)
          console.log(`📝 Writing Conversation to PostgreSQL...`);
        results.postgres = await prisma.conversation.create({
          data: {
            userId,
            title,
          },
        });
        if (opts.verbose)
          console.log(
            `✅ Conversation created in PostgreSQL: ${results.postgres.id}`
          );
      }

      // Write to MongoDB
      if (opts.writeToMongo) {
        if (opts.verbose) console.log(`📝 Writing Conversation to MongoDB...`);
        results.mongo = await Conversation.create({
          userId,
          title,
          messageIds: [],
        });
        if (opts.verbose)
          console.log(
            `✅ Conversation created in MongoDB: ${results.mongo._id}`
          );

        // Update PostgreSQL record with MongoDB ID
        if (results.postgres && results.mongo) {
          await prisma.conversation.update({
            where: { id: results.postgres.id },
            data: { mongoId: results.mongo._id.toString() },
          });
        }
      }

      return {
        success: true,
        postgresId: results.postgres?.id,
        mongoId: results.mongo?._id?.toString(),
      };
    } catch (error) {
      console.error('❌ Failed to create conversation:', error);
      throw error;
    }
  }

  /**
   * Create a new message in both databases
   */
  async createMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    tokenCount: number = 0,
    options: DualWriteOptions = {}
  ) {
    const opts = { ...this.defaultOptions, ...options };
    const results: any = {};

    try {
      // Write to PostgreSQL
      if (opts.writeToPostgres) {
        if (opts.verbose) console.log(`📝 Writing Message to PostgreSQL...`);
        results.postgres = await prisma.message.create({
          data: {
            conversationId,
            role,
            content,
            tokenCount,
          },
        });
        if (opts.verbose)
          console.log(
            `✅ Message created in PostgreSQL: ${results.postgres.id}`
          );
      }

      // Write to MongoDB
      if (opts.writeToMongo) {
        if (opts.verbose) console.log(`📝 Writing Message to MongoDB...`);

        // If conversationId is PostgreSQL UUID, look up the MongoDB ObjectId
        let mongoConversationId: any = undefined;
        if (conversationId && conversationId.includes('-')) {
          // This looks like a UUID, find corresponding MongoDB conversation
          const pgConv = await prisma.conversation.findUnique({
            where: { id: conversationId },
          });
          if (pgConv?.mongoId) {
            mongoConversationId = pgConv.mongoId;
          }
        }

        results.mongo = await Message.create({
          conversationId,
          mongoConversationId,
          role,
          content,
          tokens: tokenCount,
        });
        if (opts.verbose)
          console.log(`✅ Message created in MongoDB: ${results.mongo._id}`);
      }

      return {
        success: true,
        postgresId: results.postgres?.id,
        mongoId: results.mongo?._id,
      };
    } catch (error) {
      console.error('❌ Failed to create message:', error);
      throw error;
    }
  }

  /**
   * Create audit log in both databases
   */
  async createAuditLog(
    userId: string,
    action: string,
    resourceType: 'conversation' | 'message',
    resourceId: string,
    changes?: Record<string, unknown>,
    options: DualWriteOptions = {}
  ) {
    const opts = { ...this.defaultOptions, ...options };
    const results: any = {};

    try {
      // Write to PostgreSQL
      if (opts.writeToPostgres) {
        if (opts.verbose) console.log(`📝 Writing AuditLog to PostgreSQL...`);
        results.postgres = await prisma.auditLog.create({
          data: {
            userId,
            action,
            resource: `${resourceType}:${resourceId}`,
            changes: JSON.stringify(changes || {}),
          },
        });
        if (opts.verbose)
          console.log(
            `✅ AuditLog created in PostgreSQL: ${results.postgres.id}`
          );
      }

      // Write to MongoDB
      if (opts.writeToMongo) {
        if (opts.verbose) console.log(`📝 Writing AuditLog to MongoDB...`);
        const auditAction = `${resourceType}:${action}`;
        results.mongo = await AuditLog.create({
          userId,
          action: auditAction as any,
          resourceType,
          resourceId,
          changes,
        });
        if (opts.verbose)
          console.log(`✅ AuditLog created in MongoDB: ${results.mongo._id}`);
      }

      return {
        success: true,
        postgresId: results.postgres?.id,
        mongoId: results.mongo?._id,
      };
    } catch (error) {
      console.error('❌ Failed to create audit log:', error);
      throw error;
    }
  }

  /**
   * Get connection status for both databases
   */
  async getStatus() {
    try {
      // Test PostgreSQL
      let postgresConnected = false;
      try {
        await prisma.$queryRaw`SELECT 1`;
        postgresConnected = true;
      } catch (err) {
        postgresConnected = false;
      }

      // Test MongoDB
      const mongoConversationCount = await Conversation.countDocuments();
      const mongoConnected = mongoConversationCount >= 0;

      return {
        postgres: postgresConnected ? '✅ Connected' : '❌ Disconnected',
        mongo: mongoConnected ? '✅ Connected' : '❌ Disconnected',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ Failed to get status:', error);
      throw error;
    }
  }

  /**
   * Disable dual-write (write to PostgreSQL only)
   * Used when ready to read from MongoDB
   */
  async switchToMongoRead(conversationId: string) {
    // This is a placeholder for Day 6
    // Will be used to gradually switch read paths to MongoDB
    return {
      conversationId,
      status: 'Ready for Day 6 read switching',
    };
  }
}

export const dualWriteService = new DualWriteService();
export default dualWriteService;
