import { PrismaClient } from '@prisma/client';
import { Conversation, Message } from '../models';

/**
 * Read Switcher Service
 * Handles gradual switching of read operations from PostgreSQL to MongoDB
 *
 * Traffic Distribution Strategy:
 * - Phase 1: 10% MongoDB, 90% PostgreSQL
 * - Phase 2: 25% MongoDB, 75% PostgreSQL
 * - Phase 3: 50% MongoDB, 50% PostgreSQL
 * - Phase 4: 75% MongoDB, 25% PostgreSQL
 * - Phase 5: 90% MongoDB, 10% PostgreSQL
 * - Phase 6: 100% MongoDB
 */

const prisma = new PrismaClient();

export enum ReadSource {
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
}

export interface ReadSwitcherConfig {
  mongodbPercentage: number; // 0-100
  enableDualRead?: boolean; // Read from both and compare
  verbose?: boolean;
}

class ReadSwitcherService {
  private config: ReadSwitcherConfig = {
    mongodbPercentage: 0, // Start with 0% MongoDB reads
    enableDualRead: false,
    verbose: false,
  };

  /**
   * Set the MongoDB read percentage (0-100)
   */
  setMongoDBPercentage(percentage: number): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }
    this.config.mongodbPercentage = percentage;
    console.log(`📊 MongoDB read percentage set to ${percentage}%`);
  }

  /**
   * Enable dual-read mode (read from both databases and compare)
   */
  enableDualRead(enable: boolean = true): void {
    this.config.enableDualRead = enable;
    console.log(`🔄 Dual-read mode: ${enable ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Determine which database to read from based on configuration
   */
  private getReadSource(): ReadSource {
    // If 100% MongoDB, always use MongoDB
    if (this.config.mongodbPercentage === 100) {
      return ReadSource.MONGODB;
    }

    // If 0% MongoDB, always use PostgreSQL
    if (this.config.mongodbPercentage === 0) {
      return ReadSource.POSTGRESQL;
    }

    // Otherwise, use random selection based on percentage
    const random = Math.random() * 100;
    return random < this.config.mongodbPercentage
      ? ReadSource.MONGODB
      : ReadSource.POSTGRESQL;
  }

  /**
   * Get a single conversation by ID
   */
  async getConversation(conversationId: string): Promise<any> {
    const source = this.getReadSource();

    if (this.config.enableDualRead) {
      return this.getConversationDualRead(conversationId);
    }

    if (source === ReadSource.MONGODB) {
      return this.getConversationFromMongoDB(conversationId);
    } else {
      return this.getConversationFromPostgreSQL(conversationId);
    }
  }

  /**
   * Get conversations for a user
   */
  async getConversationsByUser(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    const source = this.getReadSource();

    if (this.config.enableDualRead) {
      return this.getConversationsByUserDualRead(userId, limit, offset);
    }

    if (source === ReadSource.MONGODB) {
      return this.getConversationsByUserFromMongoDB(userId, limit, offset);
    } else {
      return this.getConversationsByUserFromPostgreSQL(userId, limit, offset);
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    limit: number = 50
  ): Promise<any[]> {
    const source = this.getReadSource();

    if (this.config.enableDualRead) {
      return this.getMessagesDualRead(conversationId, limit);
    }

    if (source === ReadSource.MONGODB) {
      return this.getMessagesFromMongoDB(conversationId, limit);
    } else {
      return this.getMessagesFromPostgreSQL(conversationId, limit);
    }
  }

  // ==================== PostgreSQL Read Methods ====================

  private async getConversationFromPostgreSQL(id: string): Promise<any> {
    if (this.config.verbose)
      console.log(`📖 Reading conversation from PostgreSQL: ${id}`);

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { messages: true },
    });

    return conversation;
  }

  private async getConversationsByUserFromPostgreSQL(
    userId: string,
    limit: number,
    offset: number
  ): Promise<any[]> {
    if (this.config.verbose)
      console.log(
        `📖 Reading conversations from PostgreSQL for user: ${userId}`
      );

    return prisma.conversation.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { updatedAt: 'desc' },
      include: { messages: true },
    });
  }

  private async getMessagesFromPostgreSQL(
    conversationId: string,
    limit: number
  ): Promise<any[]> {
    if (this.config.verbose)
      console.log(`📖 Reading messages from PostgreSQL: ${conversationId}`);

    return prisma.message.findMany({
      where: { conversationId },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }

  // ==================== MongoDB Read Methods ====================

  private async getConversationFromMongoDB(id: string): Promise<any> {
    if (this.config.verbose)
      console.log(`📖 Reading conversation from MongoDB: ${id}`);

    // Try to find by MongoDB _id first
    let conversation = await Conversation.findById(id);

    // If not found, try by PostgreSQL ID in metadata
    if (!conversation) {
      conversation = await Conversation.findOne({
        'metadata.postgresId': id,
      });
    }

    if (!conversation) return null;

    // Get messages
    const messages = await Message.find({
      $or: [{ conversationId: id }, { mongoConversationId: conversation._id }],
    }).sort({ createdAt: 1 });

    return {
      id: conversation._id.toString(),
      userId: conversation.userId,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: messages.map((msg) => ({
        id: msg._id.toString(),
        conversationId: conversation!._id.toString(),
        role: msg.role,
        content: msg.content,
        tokenCount: msg.tokens,
        createdAt: msg.createdAt,
      })),
    };
  }

  private async getConversationsByUserFromMongoDB(
    userId: string,
    limit: number,
    offset: number
  ): Promise<any[]> {
    if (this.config.verbose)
      console.log(`📖 Reading conversations from MongoDB for user: ${userId}`);

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit);

    const results = [];
    for (const conv of conversations) {
      const messages = await Message.find({
        mongoConversationId: conv._id,
      }).sort({ createdAt: 1 });

      results.push({
        id: conv._id.toString(),
        userId: conv.userId,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messages: messages.map((msg) => ({
          id: msg._id.toString(),
          conversationId: conv._id.toString(),
          role: msg.role,
          content: msg.content,
          tokenCount: msg.tokens,
          createdAt: msg.createdAt,
        })),
      });
    }

    return results;
  }

  private async getMessagesFromMongoDB(
    conversationId: string,
    limit: number
  ): Promise<any[]> {
    if (this.config.verbose)
      console.log(`📖 Reading messages from MongoDB: ${conversationId}`);

    // Find conversation first
    let conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      conversation = await Conversation.findOne({
        'metadata.postgresId': conversationId,
      });
    }

    if (!conversation) return [];

    const messages = await Message.find({
      mongoConversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .limit(limit);

    return messages.map((msg) => ({
      id: msg._id.toString(),
      conversationId: conversation!._id.toString(),
      role: msg.role,
      content: msg.content,
      tokenCount: msg.tokens,
      createdAt: msg.createdAt,
    }));
  }

  // ==================== Dual-Read Methods (Verification) ====================

  private async getConversationDualRead(id: string): Promise<any> {
    console.log(
      `🔄 Dual-read: Fetching conversation ${id} from both databases`
    );

    const [pgResult, mongoResult] = await Promise.all([
      this.getConversationFromPostgreSQL(id).catch((e) => {
        console.error('PostgreSQL error:', e);
        return null;
      }),
      this.getConversationFromMongoDB(id).catch((e) => {
        console.error('MongoDB error:', e);
        return null;
      }),
    ]);

    // Compare results
    const match = this.compareConversations(pgResult, mongoResult);
    if (!match) {
      console.warn(`⚠️  Data mismatch for conversation ${id}`);
    } else {
      console.log(`✅ Data match verified for conversation ${id}`);
    }

    // Return MongoDB result if available, otherwise PostgreSQL
    return mongoResult || pgResult;
  }

  private async getConversationsByUserDualRead(
    userId: string,
    limit: number,
    offset: number
  ): Promise<any[]> {
    console.log(`🔄 Dual-read: Fetching conversations for user ${userId}`);

    const [pgResult, mongoResult] = await Promise.all([
      this.getConversationsByUserFromPostgreSQL(userId, limit, offset).catch(
        () => []
      ),
      this.getConversationsByUserFromMongoDB(userId, limit, offset).catch(
        () => []
      ),
    ]);

    // Compare counts
    if (pgResult.length !== mongoResult.length) {
      console.warn(
        `⚠️  Count mismatch: PostgreSQL=${pgResult.length}, MongoDB=${mongoResult.length}`
      );
    } else {
      console.log(`✅ Count match: ${pgResult.length} conversations`);
    }

    return mongoResult.length > 0 ? mongoResult : pgResult;
  }

  private async getMessagesDualRead(
    conversationId: string,
    limit: number
  ): Promise<any[]> {
    console.log(
      `🔄 Dual-read: Fetching messages for conversation ${conversationId}`
    );

    const [pgResult, mongoResult] = await Promise.all([
      this.getMessagesFromPostgreSQL(conversationId, limit).catch(() => []),
      this.getMessagesFromMongoDB(conversationId, limit).catch(() => []),
    ]);

    if (pgResult.length !== mongoResult.length) {
      console.warn(
        `⚠️  Message count mismatch: PostgreSQL=${pgResult.length}, MongoDB=${mongoResult.length}`
      );
    } else {
      console.log(`✅ Message count match: ${pgResult.length} messages`);
    }

    return mongoResult.length > 0 ? mongoResult : pgResult;
  }

  // ==================== Comparison Utilities ====================

  private compareConversations(pg: any, mongo: any): boolean {
    if (!pg || !mongo) return false;

    // Compare basic fields
    if (pg.userId !== mongo.userId) return false;
    if (pg.title !== mongo.title) return false;
    if (pg.messages?.length !== mongo.messages?.length) return false;

    return true;
  }

  /**
   * Get current configuration
   */
  getConfig(): ReadSwitcherConfig {
    return { ...this.config };
  }

  /**
   * Get statistics about read operations
   */
  getStats(): {
    mongodbPercentage: number;
    dualReadEnabled: boolean;
    expectedSource: string;
  } {
    return {
      mongodbPercentage: this.config.mongodbPercentage,
      dualReadEnabled: this.config.enableDualRead || false,
      expectedSource:
        this.config.mongodbPercentage === 100
          ? 'MongoDB'
          : this.config.mongodbPercentage === 0
            ? 'PostgreSQL'
            : `${this.config.mongodbPercentage}% MongoDB, ${100 - this.config.mongodbPercentage}% PostgreSQL`,
    };
  }
}

export const readSwitcherService = new ReadSwitcherService();
export default readSwitcherService;
