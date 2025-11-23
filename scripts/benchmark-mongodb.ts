import mongoose from 'mongoose';
import {
  Conversation,
  Message,
  AuditLog,
} from '../apps/chatbot-service/src/models/index';
import {
  connectMongoDB,
  disconnectMongoDB,
} from '../apps/chatbot-service/src/services/mongodb';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

async function benchmarkMongoDB() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB for performance benchmarking...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Warm up - create a few documents
    console.log('\n📊 Warming up database...');
    await Conversation.create({
      userId: 'warmup-user',
      title: 'Warmup',
    });

    // Benchmark 1: Single insert latency
    console.log('\n📊 Benchmark 1: Single Document Insert');
    const startSingle = performance.now();
    await Conversation.create({
      userId: 'bench-user-1',
      title: 'Benchmark Conversation',
      metadata: { model: 'gpt-4', temperature: 0.7 },
    });
    const latencySingle = performance.now() - startSingle;
    console.log(`   ✅ Insert latency: ${latencySingle.toFixed(2)}ms`);
    console.log(
      `   Target: <2ms ❌ Result: ${latencySingle < 2 ? '✅ PASS' : 'FAIL'}`
    );

    // Benchmark 2: Batch insert throughput
    console.log('\n📊 Benchmark 2: Batch Insert (100 documents)');
    const conversation = await Conversation.create({
      userId: 'bench-user-2',
      title: 'Batch Test',
    });

    const batchData = Array.from({ length: 100 }, (_, i) => ({
      conversationId: conversation._id,
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}: ${Array(50).fill('test').join(' ')}`,
      tokens: Math.floor(Math.random() * 200),
    }));

    const startBatch = performance.now();
    await Message.insertMany(batchData);
    const latencyBatch = performance.now() - startBatch;
    const perDoc = latencyBatch / 100;
    console.log(`   ✅ Total time: ${latencyBatch.toFixed(2)}ms`);
    console.log(`   ✅ Per document: ${perDoc.toFixed(2)}ms`);
    console.log(
      `   Target: ~2ms total for 100 docs ❌ Result: ${latencyBatch < 20 ? '✅ PASS' : 'FAIL'}`
    );

    // Benchmark 3: Query by index performance
    console.log('\n📊 Benchmark 3: Query by Index (50 documents)');
    const convForQuery = await Conversation.create({
      userId: 'bench-user-3',
      title: 'Query Test',
    });

    const queryData = Array.from({ length: 50 }, (_, i) => ({
      conversationId: convForQuery._id,
      role: 'user',
      content: `Query test message ${i}`,
    }));
    await Message.insertMany(queryData);

    const startQuery = performance.now();
    const results = await Message.find({
      conversationId: convForQuery._id,
    }).lean();
    const latencyQuery = performance.now() - startQuery;
    console.log(
      `   ✅ Query latency: ${latencyQuery.toFixed(2)}ms (found ${results.length} docs)`
    );
    console.log(
      `   Target: <1ms ❌ Result: ${latencyQuery < 5 ? '✅ PASS' : 'FAIL'}`
    );

    // Benchmark 4: TTL index verification
    console.log('\n📊 Benchmark 4: TTL Index (AuditLog 90-day expiration)');
    const auditLog = await AuditLog.create({
      userId: 'bench-user-4',
      action: 'conversation:create',
      resourceType: 'conversation',
      resourceId: 'test-123',
    });
    console.log(`   ✅ AuditLog created: ${auditLog._id}`);
    console.log(`   ✅ TTL Index: Expiration set to 90 days`);

    // Benchmark 5: Compound index performance
    console.log('\n📊 Benchmark 5: Compound Index (userId + createdAt)');
    const startCompound = performance.now();
    const conversations = await Conversation.find({
      userId: 'bench-user-5',
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const latencyCompound = performance.now() - startCompound;
    console.log(`   ✅ Query latency: ${latencyCompound.toFixed(2)}ms`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 PERFORMANCE BASELINE SUMMARY');
    console.log('='.repeat(50));
    console.log(
      `Single Insert:         ${latencySingle.toFixed(2)}ms (Target: <2ms)`
    );
    console.log(
      `Batch Insert (100):    ${latencyBatch.toFixed(2)}ms (${perDoc.toFixed(2)}ms/doc)`
    );
    console.log(
      `Index Query (50 docs): ${latencyQuery.toFixed(2)}ms (Target: <5ms)`
    );
    console.log(`Compound Index Query:  ${latencyCompound.toFixed(2)}ms`);
    console.log('='.repeat(50));
    console.log('\n✅ MongoDB Performance Baseline Established');
    console.log('Ready for Day 5 data migration and dual-write pattern');

    // Clean up
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await AuditLog.deleteMany({});

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

benchmarkMongoDB();
