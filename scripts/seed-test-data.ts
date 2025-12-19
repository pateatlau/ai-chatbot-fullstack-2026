#!/usr/bin/env ts-node
/**
 * Seed Test Data Script
 * Creates sample conversations and messages in PostgreSQL for migration testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data to PostgreSQL...\n');

  try {
    // Check if we already have test data
    const existingConvCount = await prisma.conversation.count();

    if (existingConvCount > 0) {
      console.log(`ℹ️  Found ${existingConvCount} existing conversations.`);
      console.log('   Skipping seed to avoid duplicates.');
      console.log('   (Delete existing data if you want to reseed)\n');
      return;
    }

    // Create test conversations with messages
    console.log('Creating test conversations...');

    const conv1 = await prisma.conversation.create({
      data: {
        userId: 'test-user-1',
        title: 'First Test Conversation',
        messages: {
          create: [
            {
              role: 'user',
              content: 'Hello, how are you?',
              tokenCount: 5,
            },
            {
              role: 'assistant',
              content:
                'I am doing well, thank you! How can I assist you today?',
              tokenCount: 15,
            },
            {
              role: 'user',
              content: 'Can you help me with TypeScript?',
              tokenCount: 8,
            },
            {
              role: 'assistant',
              content:
                'Of course! TypeScript is a superset of JavaScript that adds static typing...',
              tokenCount: 25,
            },
          ],
        },
      },
      include: { messages: true },
    });

    const conv2 = await prisma.conversation.create({
      data: {
        userId: 'test-user-1',
        title: 'Second Test Conversation',
        messages: {
          create: [
            {
              role: 'user',
              content: 'What is MongoDB?',
              tokenCount: 5,
            },
            {
              role: 'assistant',
              content:
                'MongoDB is a NoSQL database that stores data in flexible, JSON-like documents...',
              tokenCount: 30,
            },
          ],
        },
      },
      include: { messages: true },
    });

    const conv3 = await prisma.conversation.create({
      data: {
        userId: 'test-user-2',
        title: 'User 2 Conversation',
        messages: {
          create: [
            {
              role: 'user',
              content: 'Tell me about Nx monorepos',
              tokenCount: 7,
            },
            {
              role: 'assistant',
              content: 'Nx is a powerful build system for monorepos...',
              tokenCount: 20,
            },
          ],
        },
      },
      include: { messages: true },
    });

    // Count results
    const totalConversations = await prisma.conversation.count();
    const totalMessages = await prisma.message.count();

    console.log('\n✅ Test data created successfully!\n');
    console.log('📊 Statistics:');
    console.log(`   - Conversations: ${totalConversations}`);
    console.log(`   - Messages: ${totalMessages}`);
    console.log(`   - Users: 2 (test-user-1, test-user-2)`);

    console.log('\n📋 Sample Data:');
    console.log(`   1. "${conv1.title}" - ${conv1.messages.length} messages`);
    console.log(`   2. "${conv2.title}" - ${conv2.messages.length} messages`);
    console.log(`   3. "${conv3.title}" - ${conv3.messages.length} messages`);

    console.log('\n✅ Ready for migration test!\n');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
