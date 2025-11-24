#!/usr/bin/env node
/**
 * Read Switcher CLI
 * Control the gradual migration from PostgreSQL to MongoDB reads
 *
 * Usage:
 *   npm run read-switch:status
 *   npm run read-switch:set 10
 *   npm run read-switch:set 25
 *   npm run read-switch:set 50
 *   npm run read-switch:set 100
 *   npm run read-switch:dual-read on
 *   npm run read-switch:test
 */

import { readSwitcherService } from '../apps/chatbot-service/src/services/read-switcher';
import {
  connectMongoDB,
  disconnectMongoDB,
} from '../apps/chatbot-service/src/services/mongodb';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const command = process.argv[2];
const arg = process.argv[3];

async function showStatus() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 READ SWITCHER STATUS');
  console.log('='.repeat(60) + '\n');

  const stats = readSwitcherService.getStats();
  const config = readSwitcherService.getConfig();

  console.log(`MongoDB Read Percentage: ${stats.mongodbPercentage}%`);
  console.log(
    `Dual-Read Mode: ${stats.dualReadEnabled ? '✅ ENABLED' : '❌ DISABLED'}`
  );
  console.log(`Expected Source: ${stats.expectedSource}\n`);

  // Show data counts
  console.log('📊 Data Status:');
  try {
    const pgConvCount = await prisma.conversation.count();
    const pgMsgCount = await prisma.message.count();

    await connectMongoDB();
    const { Conversation, Message } = await import(
      '../apps/chatbot-service/src/models'
    );
    const mongoConvCount = await Conversation.countDocuments();
    const mongoMsgCount = await Message.countDocuments();

    console.log(
      `  PostgreSQL: ${pgConvCount} conversations, ${pgMsgCount} messages`
    );
    console.log(
      `  MongoDB: ${mongoConvCount} conversations, ${mongoMsgCount} messages`
    );

    if (pgConvCount === mongoConvCount && pgMsgCount === mongoMsgCount) {
      console.log(`  ✅ Data counts match`);
    } else {
      console.log(`  ⚠️  Data counts differ`);
    }
  } catch (error) {
    console.error('Error checking data:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

async function setPercentage(percentage: string) {
  const pct = parseInt(percentage, 10);

  if (isNaN(pct) || pct < 0 || pct > 100) {
    console.error('❌ Error: Percentage must be a number between 0 and 100');
    process.exit(1);
  }

  console.log(`\n📊 Setting MongoDB read percentage to ${pct}%...\n`);
  readSwitcherService.setMongoDBPercentage(pct);

  await showStatus();

  console.log('✅ Read percentage updated successfully!\n');
}

async function toggleDualRead(mode: string) {
  const enable = mode === 'on' || mode === 'true' || mode === '1';

  console.log(`\n🔄 ${enable ? 'Enabling' : 'Disabling'} dual-read mode...\n`);
  readSwitcherService.enableDualRead(enable);

  await showStatus();

  console.log(`✅ Dual-read mode ${enable ? 'enabled' : 'disabled'}!\n`);
}

async function runTest() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTING READ SWITCHER');
  console.log('='.repeat(60) + '\n');

  try {
    await connectMongoDB();

    console.log('Testing with different percentages...\n');

    // Test 0% MongoDB (all PostgreSQL)
    console.log('1️⃣  Testing 0% MongoDB (100% PostgreSQL)');
    readSwitcherService.setMongoDBPercentage(0);
    const result1 = await readSwitcherService.getConversationsByUser(
      'test-user-1',
      5
    );
    console.log(`   ✅ Retrieved ${result1.length} conversations\n`);

    // Test 50% MongoDB
    console.log('2️⃣  Testing 50% MongoDB (50% PostgreSQL)');
    readSwitcherService.setMongoDBPercentage(50);
    const result2 = await readSwitcherService.getConversationsByUser(
      'test-user-1',
      5
    );
    console.log(`   ✅ Retrieved ${result2.length} conversations\n`);

    // Test 100% MongoDB
    console.log('3️⃣  Testing 100% MongoDB (0% PostgreSQL)');
    readSwitcherService.setMongoDBPercentage(100);
    const result3 = await readSwitcherService.getConversationsByUser(
      'test-user-1',
      5
    );
    console.log(`   ✅ Retrieved ${result3.length} conversations\n`);

    // Test dual-read mode
    console.log('4️⃣  Testing dual-read mode');
    readSwitcherService.setMongoDBPercentage(50);
    readSwitcherService.enableDualRead(true);
    const result4 = await readSwitcherService.getConversationsByUser(
      'test-user-1',
      5
    );
    console.log(
      `   ✅ Retrieved ${result4.length} conversations with dual-read\n`
    );

    console.log('='.repeat(60));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

async function showHelp() {
  console.log(`
📖 Read Switcher CLI - Help

COMMANDS:

  status              Show current read switcher status
  set <percentage>    Set MongoDB read percentage (0-100)
  dual-read <on|off>  Enable/disable dual-read mode
  test                Run test suite
  help                Show this help message

EXAMPLES:

  npm run read-switch:status
  npm run read-switch:set 10
  npm run read-switch:set 25
  npm run read-switch:set 50
  npm run read-switch:set 75
  npm run read-switch:set 100
  npm run read-switch:dual-read on
  npm run read-switch:dual-read off
  npm run read-switch:test

GRADUAL MIGRATION STRATEGY:

  Phase 1: 10% MongoDB  → Monitor for 1 hour
  Phase 2: 25% MongoDB  → Monitor for 1 hour
  Phase 3: 50% MongoDB  → Monitor for 2 hours
  Phase 4: 75% MongoDB  → Monitor for 2 hours
  Phase 5: 90% MongoDB  → Monitor for 1 hour
  Phase 6: 100% MongoDB → Full cutover

DUAL-READ MODE:

  Reads from both databases and compares results.
  Use this during early phases to verify data consistency.
  Disable for better performance in later phases.
`);
}

async function main() {
  try {
    switch (command) {
      case 'status':
        await showStatus();
        break;

      case 'set':
        if (!arg) {
          console.error('❌ Error: Missing percentage argument');
          console.log('Usage: npm run read-switch:set <percentage>');
          process.exit(1);
        }
        await setPercentage(arg);
        break;

      case 'dual-read':
        if (!arg) {
          console.error('❌ Error: Missing mode argument');
          console.log('Usage: npm run read-switch:dual-read <on|off>');
          process.exit(1);
        }
        await toggleDualRead(arg);
        break;

      case 'test':
        await runTest();
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await disconnectMongoDB();
    await prisma.$disconnect();
  }
}

main();
