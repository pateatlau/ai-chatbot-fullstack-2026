#!/usr/bin/env ts-node
/**
 * MongoDB Data Migration Script
 *
 * This script migrates data from PostgreSQL to MongoDB as part of Day 5.
 *
 * Usage:
 *   npm run migrate:to-mongo
 *   or
 *   ts-node scripts/migrate-to-mongodb.ts
 *
 * Features:
 * - Exports data from PostgreSQL (Prisma)
 * - Imports data to MongoDB (Mongoose)
 * - Validates data consistency
 * - Reports migration statistics
 */

import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { dataMigrationService } from '../apps/chatbot-service/src/services/data-migration';
import {
  connectMongoDB,
  disconnectMongoDB,
} from '../apps/chatbot-service/src/services/mongodb';

const prisma = new PrismaClient();

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 MongoDB DATA MIGRATION - DAY 5');
  console.log('='.repeat(70) + '\n');

  try {
    // Step 1: Check PostgreSQL connection
    console.log('📋 Step 1: Checking PostgreSQL connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ PostgreSQL connected\n');

    // Step 2: Check MongoDB connection
    console.log('📋 Step 2: Checking MongoDB connection...');
    await connectMongoDB();
    console.log('✅ MongoDB connected\n');

    // Step 3: Display current data counts
    console.log('📋 Step 3: Displaying current data counts...\n');

    const pgConvCount = await prisma.conversation.count();
    const pgMsgCount = await prisma.message.count();

    console.log(`PostgreSQL:`);
    console.log(`  - Conversations: ${pgConvCount}`);
    console.log(`  - Messages: ${pgMsgCount}\n`);

    // Step 4: Confirm migration
    console.log('📋 Step 4: Starting migration...');
    console.log('⚠️  This will migrate all data from PostgreSQL to MongoDB.');
    console.log('⚠️  Existing MongoDB data will be skipped (no duplicates).\n');

    // Step 5: Run migration
    console.log('📋 Step 5: Executing migration...\n');
    const stats = await dataMigrationService.migrateAll();

    // Step 6: Verify consistency
    console.log('\n📋 Step 6: Verifying data consistency...\n');
    const consistency = await dataMigrationService.verifyConsistency();

    // Step 7: Final report
    console.log('\n' + '='.repeat(70));
    console.log('📊 MIGRATION COMPLETE');
    console.log('='.repeat(70));
    console.log(`\n✅ Conversations migrated: ${stats.conversationsMigrated}`);
    console.log(`✅ Messages migrated: ${stats.messagesMigrated}`);
    console.log(`✅ Audit logs migrated: ${stats.auditLogsMigrated}`);
    console.log(`⏱️  Total time: ${(stats.totalTime / 1000).toFixed(2)}s`);

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
      console.log('First 5 errors:');
      stats.errors.slice(0, 5).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
      if (stats.errors.length > 5) {
        console.log(`  ... and ${stats.errors.length - 5} more`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('Data Consistency Check:');
    console.log('='.repeat(70));
    console.log(
      `Conversations: PostgreSQL=${consistency.conversations.postgres}, MongoDB=${consistency.conversations.mongo} ${consistency.conversations.match ? '✅' : '❌'}`
    );
    console.log(
      `Messages: PostgreSQL=${consistency.messages.postgres}, MongoDB=${consistency.messages.mongo} ${consistency.messages.match ? '✅' : '❌'}`
    );
    console.log(
      `Audit Logs: PostgreSQL=${consistency.auditLogs.postgres}, MongoDB=${consistency.auditLogs.mongo} ${consistency.auditLogs.match ? '✅' : '❌'}`
    );
    console.log('='.repeat(70) + '\n');

    if (consistency.allMatch) {
      console.log(
        '🎉 MIGRATION SUCCESSFUL - All data migrated and verified!\n'
      );
      process.exit(0);
    } else {
      console.log(
        '⚠️  MIGRATION COMPLETED WITH WARNINGS - Review consistency report\n'
      );
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await disconnectMongoDB();
    await prisma.$disconnect();
  }
}

main();
