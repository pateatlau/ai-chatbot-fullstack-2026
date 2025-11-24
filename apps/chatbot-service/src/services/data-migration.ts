import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { Conversation, Message, AuditLog } from '../models';

const prisma = new PrismaClient();

/**
 * Data Migration Service
 * Handles exporting data from PostgreSQL and importing into MongoDB
 * Supports incremental migration and data validation
 */

export interface MigrationStats {
  conversationsMigrated: number;
  messagesMigrated: number;
  auditLogsMigrated: number;
  totalTime: number;
  errors: string[];
}

class DataMigrationService {
  /**
   * Export all conversations and messages from PostgreSQL
   */
  async exportPostgresData() {
    console.log('📤 Exporting data from PostgreSQL...');

    try {
      const conversations = await prisma.conversation.findMany({
        include: {
          messages: true,
        },
      });

      const auditLogs = await prisma.auditLog.findMany();

      return {
        conversations,
        auditLogs,
        count: {
          conversations: conversations.length,
          messages: conversations.reduce(
            (sum, c) => sum + c.messages.length,
            0
          ),
          auditLogs: auditLogs.length,
        },
      };
    } catch (error) {
      console.error('❌ Failed to export data from PostgreSQL:', error);
      throw error;
    }
  }

  /**
   * Migrate conversations to MongoDB
   */
  async migrateConversations(postgresConversations: any[]) {
    console.log(
      `🔄 Migrating ${postgresConversations.length} conversations to MongoDB...`
    );

    const stats = {
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const pgConv of postgresConversations) {
      try {
        // Check if already exists by postgresId
        const exists = await Conversation.findOne({
          'metadata.postgresId': pgConv.id,
        });
        if (exists) {
          stats.skipped++;
          continue;
        }

        // Migrate conversation
        await Conversation.create({
          userId: pgConv.userId,
          title: pgConv.title,
          messageIds: [],
          metadata: {
            migratedFrom: 'postgresql',
            postgresId: pgConv.id,
            migratedAt: new Date(),
          },
          createdAt: pgConv.createdAt,
          updatedAt: pgConv.updatedAt,
        });

        stats.migrated++;

        if (stats.migrated % 100 === 0) {
          console.log(`  ✓ Migrated ${stats.migrated} conversations...`);
        }
      } catch (error) {
        stats.errors.push(
          `Failed to migrate conversation ${pgConv.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    console.log(
      `✅ Conversations migration complete: ${stats.migrated} migrated, ${stats.skipped} skipped`
    );
    return stats;
  }

  /**
   * Migrate messages to MongoDB
   */
  async migrateMessages(postgresConversations: any[]) {
    console.log(
      `🔄 Migrating messages to MongoDB (${postgresConversations.reduce((sum, c) => sum + c.messages.length, 0)} total)...`
    );

    const stats = {
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    let totalMessages = 0;

    for (const pgConv of postgresConversations) {
      // Get MongoDB conversation
      const mongoConv = await Conversation.findOne({
        'metadata.postgresId': pgConv.id,
      });

      if (!mongoConv) {
        stats.errors.push(
          `No MongoDB conversation found for PostgreSQL ID: ${pgConv.id}`
        );
        continue;
      }

      for (const pgMsg of pgConv.messages) {
        try {
          // Check if already exists
          const exists = await Message.findOne({
            'metadata.postgresId': pgMsg.id,
          });

          if (exists) {
            stats.skipped++;
            continue;
          }

          // Migrate message
          const msgData: any = {
            conversationId: mongoConv._id.toString(),
            mongoConversationId: mongoConv._id,
            role: pgMsg.role as 'user' | 'assistant' | 'system',
            content: pgMsg.content,
            tokens: pgMsg.tokenCount || 0,
            metadata: {
              migratedFrom: 'postgresql',
              postgresId: pgMsg.id,
              migratedAt: new Date(),
            },
            createdAt: pgMsg.createdAt,
          };

          await Message.create(msgData);

          stats.migrated++;
          totalMessages++;

          if (stats.migrated % 500 === 0) {
            console.log(`  ✓ Migrated ${stats.migrated} messages...`);
          }
        } catch (error) {
          stats.errors.push(
            `Failed to migrate message ${pgMsg.id}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    console.log(
      `✅ Messages migration complete: ${stats.migrated} migrated, ${stats.skipped} skipped`
    );
    return stats;
  }

  /**
   * Migrate audit logs to MongoDB
   */
  async migrateAuditLogs(postgresAuditLogs: any[]) {
    console.log(
      `🔄 Migrating ${postgresAuditLogs.length} audit logs to MongoDB...`
    );

    const stats = {
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const pgAudit of postgresAuditLogs) {
      try {
        // Check if already exists
        const exists = await AuditLog.findOne({
          'metadata.postgresId': pgAudit.id,
        });

        if (exists) {
          stats.skipped++;
          continue;
        }

        // Parse action and resource type from PostgreSQL format
        const [resourceType, action] = pgAudit.resource.split(':');

        // Migrate audit log
        await AuditLog.create({
          userId: pgAudit.userId,
          action: `${resourceType}:${pgAudit.action}` as any,
          resourceType: resourceType as 'conversation' | 'message',
          resourceId: pgAudit.resource,
          changes: JSON.parse(pgAudit.changes || '{}'),
          metadata: {
            migratedFrom: 'postgresql',
            postgresId: pgAudit.id,
            migratedAt: new Date(),
          },
          createdAt: pgAudit.timestamp,
        });

        stats.migrated++;

        if (stats.migrated % 100 === 0) {
          console.log(`  ✓ Migrated ${stats.migrated} audit logs...`);
        }
      } catch (error) {
        stats.errors.push(
          `Failed to migrate audit log ${pgAudit.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    console.log(
      `✅ Audit logs migration complete: ${stats.migrated} migrated, ${stats.skipped} skipped`
    );
    return stats;
  }

  /**
   * Full migration pipeline
   */
  async migrateAll(): Promise<MigrationStats> {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 STARTING FULL DATA MIGRATION');
    console.log('='.repeat(60) + '\n');

    const startTime = performance.now();
    const allStats: MigrationStats = {
      conversationsMigrated: 0,
      messagesMigrated: 0,
      auditLogsMigrated: 0,
      totalTime: 0,
      errors: [],
    };

    try {
      // Step 1: Export PostgreSQL data
      console.log('STEP 1: Exporting PostgreSQL data...');
      const pgData = await this.exportPostgresData();
      console.log(`  ✓ Exported ${pgData.count.conversations} conversations`);
      console.log(`  ✓ Exported ${pgData.count.messages} messages`);
      console.log(`  ✓ Exported ${pgData.count.auditLogs} audit logs\n`);

      // Step 2: Migrate conversations
      console.log('STEP 2: Migrating conversations...');
      const convStats = await this.migrateConversations(pgData.conversations);
      allStats.conversationsMigrated = convStats.migrated;
      allStats.errors.push(...convStats.errors);
      console.log('');

      // Step 3: Migrate messages
      console.log('STEP 3: Migrating messages...');
      const msgStats = await this.migrateMessages(pgData.conversations);
      allStats.messagesMigrated = msgStats.migrated;
      allStats.errors.push(...msgStats.errors);
      console.log('');

      // Step 4: Migrate audit logs
      console.log('STEP 4: Migrating audit logs...');
      const auditStats = await this.migrateAuditLogs(pgData.auditLogs);
      allStats.auditLogsMigrated = auditStats.migrated;
      allStats.errors.push(...auditStats.errors);
      console.log('');

      // Calculate total time
      allStats.totalTime = performance.now() - startTime;

      // Summary
      console.log('='.repeat(60));
      console.log('📊 MIGRATION SUMMARY');
      console.log('='.repeat(60));
      console.log(
        `✅ Conversations: ${allStats.conversationsMigrated} migrated`
      );
      console.log(`✅ Messages: ${allStats.messagesMigrated} migrated`);
      console.log(`✅ Audit Logs: ${allStats.auditLogsMigrated} migrated`);
      console.log(`⏱️  Total Time: ${(allStats.totalTime / 1000).toFixed(2)}s`);

      if (allStats.errors.length > 0) {
        console.log(`\n⚠️  Errors: ${allStats.errors.length}`);
        allStats.errors.slice(0, 5).forEach((err) => console.log(`  • ${err}`));
        if (allStats.errors.length > 5) {
          console.log(`  ... and ${allStats.errors.length - 5} more`);
        }
      } else {
        console.log(`\n✅ NO ERRORS - Migration successful!`);
      }
      console.log('='.repeat(60) + '\n');

      return allStats;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Verify data consistency between databases
   */
  async verifyConsistency() {
    console.log('\n🔍 Verifying data consistency...\n');

    try {
      // Count documents in both databases
      const pgConvCount = await prisma.conversation.count();
      const mongoConvCount = await Conversation.countDocuments();

      const pgMsgCount = await prisma.message.count();
      const mongoMsgCount = await Message.countDocuments();

      const pgAuditCount = await prisma.auditLog.count();
      const mongoAuditCount = await AuditLog.countDocuments();

      console.log('📊 Document Counts:');
      console.log(
        `  Conversations: PostgreSQL=${pgConvCount}, MongoDB=${mongoConvCount}`
      );
      console.log(
        `  Messages:      PostgreSQL=${pgMsgCount}, MongoDB=${mongoMsgCount}`
      );
      console.log(
        `  Audit Logs:    PostgreSQL=${pgAuditCount}, MongoDB=${mongoAuditCount}\n`
      );

      const allMatch =
        pgConvCount === mongoConvCount &&
        pgMsgCount === mongoMsgCount &&
        pgAuditCount === mongoAuditCount;

      if (allMatch) {
        console.log('✅ All data counts match - Consistency verified!\n');
      } else {
        console.log('⚠️  Data counts do not match - Review needed\n');
      }

      return {
        conversations: {
          postgres: pgConvCount,
          mongo: mongoConvCount,
          match: pgConvCount === mongoConvCount,
        },
        messages: {
          postgres: pgMsgCount,
          mongo: mongoMsgCount,
          match: pgMsgCount === mongoMsgCount,
        },
        auditLogs: {
          postgres: pgAuditCount,
          mongo: mongoAuditCount,
          match: pgAuditCount === mongoAuditCount,
        },
        allMatch,
      };
    } catch (error) {
      console.error('❌ Consistency check failed:', error);
      throw error;
    }
  }
}

export const dataMigrationService = new DataMigrationService();
export default dataMigrationService;
