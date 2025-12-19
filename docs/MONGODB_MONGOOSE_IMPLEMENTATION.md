# 🗄️ MongoDB/MONGOOSE IMPLEMENTATION GUIDE - Days 4-7

**Date:** November 27-30, 2025 (or after GraphQL completion)  
**Duration:** 4 days (32 hours)  
**Status:** 🟢 Planning Complete

---

## 🎯 MONGODB/MONGOOSE OBJECTIVES

### Day 4: Setup & Schema Design (8 hours)

- Install Mongoose
- Create connection service
- Design all schemas
- Create migration plan

### Day 5: Chatbot Service Migration (8 hours)

- Migrate Conversation & Message models
- Update all resolvers
- Migrate data from Prisma
- Integration testing

### Day 6: Admin Service Integration (8 hours)

- Create Admin & AuditLog models
- Implement resolvers
- System stats calculation
- Integration testing

### Day 7: Finalization & Testing (8 hours)

- Complete data validation
- Performance benchmarking
- Optimize indexes
- Production sign-off

---

## 📋 MONGOOSE SCHEMAS TO CREATE

### 1. Conversation Schema

**File:** `/apps/chatbot-service/src/models/conversation.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  userId: string;
  title: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: () => `Conversation ${new Date().toLocaleDateString()}`,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, isDeleted: 1 });

export const Conversation = mongoose.model<IConversation>(
  'Conversation',
  conversationSchema
);
```

---

### 2. Message Schema

**File:** `/apps/chatbot-service/src/models/message.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  tokenCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tokenCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, isDeleted: 1 });
messageSchema.index({ role: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
```

---

### 3. AuditLog Schema

**File:** `/apps/admin-service/src/models/audit-log.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  action: string;
  resource: string;
  changes: Record<string, any>;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'],
    },
    resource: {
      type: String,
      required: true,
      enum: ['CONVERSATION', 'MESSAGE', 'USER', 'ADMIN'],
    },
    changes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// TTL index - auto-delete after 90 days
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// Compound indexes
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, resource: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
```

---

## 🔌 MONGODB CONNECTION SERVICE

**File:** `/apps/shared/lib/mongodb/connection.ts`

```typescript
import mongoose, { Connection } from 'mongoose';

let cachedConnection: Connection | null = null;

export async function connectMongoDB(): Promise<Connection> {
  if (cachedConnection) {
    console.log('[MongoDB] Using cached connection');
    return cachedConnection;
  }

  const mongoUrl =
    process.env.MONGODB_URL || 'mongodb://localhost:27017/chatbot';

  try {
    console.log('[MongoDB] Connecting to:', mongoUrl.split('@')[0]);

    await mongoose.connect(mongoUrl, {
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = mongoose.connection;

    cachedConnection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err);
    });

    cachedConnection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected');
      cachedConnection = null;
    });

    console.log('✅ [MongoDB] Connected successfully');
    return cachedConnection;
  } catch (error) {
    console.error('❌ [MongoDB] Connection failed:', error);
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
    console.log('[MongoDB] Disconnected');
  }
}

export function getMongoConnection(): Connection | null {
  return cachedConnection;
}
```

---

## 📊 MIGRATION SCRIPT

**File:** `/scripts/migrate-prisma-to-mongoose.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { connectMongoDB } from '../apps/shared/lib/mongodb/connection';
import { Conversation } from '../apps/chatbot-service/src/models/conversation.model';
import { Message } from '../apps/chatbot-service/src/models/message.model';

async function migrateData() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 Starting migration from Prisma to Mongoose...');

    // Connect to MongoDB
    await connectMongoDB();

    // Migrate Conversations
    console.log('📝 Migrating Conversations...');
    const conversations = await prisma.conversation.findMany();

    for (const conv of conversations) {
      await Conversation.create({
        _id: conv.id, // Use same ID
        userId: conv.userId,
        title: conv.title,
        isDeleted: conv.isDeleted,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      });
    }
    console.log(`✅ Migrated ${conversations.length} conversations`);

    // Migrate Messages
    console.log('📝 Migrating Messages...');
    const messages = await prisma.message.findMany();

    for (const msg of messages) {
      await Message.create({
        _id: msg.id, // Use same ID
        conversationId: msg.conversationId,
        role: msg.role,
        content: msg.content,
        tokenCount: msg.tokenCount,
        isDeleted: msg.isDeleted,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      });
    }
    console.log(`✅ Migrated ${messages.length} messages`);

    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateData().catch(console.error);
```

---

## 🔧 SERVICE LAYER EXAMPLE

**File:** `/apps/chatbot-service/src/services/mongoose/conversation.service.ts`

```typescript
import { Conversation } from '../../models/conversation.model';
import { Message } from '../../models/message.model';

export class ConversationService {
  /**
   * Find conversations for user
   */
  async findByUserId(userId: string, skip = 0, limit = 20) {
    return Conversation.find({ userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Find single conversation
   */
  async findById(id: string) {
    return Conversation.findById(id).populate('messages').lean();
  }

  /**
   * Create conversation
   */
  async create(userId: string, title?: string) {
    return Conversation.create({
      userId,
      title: title || `Conversation ${new Date().toLocaleDateString()}`,
    });
  }

  /**
   * Update conversation
   */
  async update(id: string, updates: Partial<any>) {
    return Conversation.findByIdAndUpdate(id, updates, { new: true });
  }

  /**
   * Delete (soft delete)
   */
  async delete(id: string) {
    return Conversation.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
  }

  /**
   * Count conversations
   */
  async count(userId: string) {
    return Conversation.countDocuments({ userId, isDeleted: false });
  }

  /**
   * Search conversations
   */
  async search(userId: string, query: string) {
    return Conversation.find({
      userId,
      isDeleted: false,
      title: { $regex: query, $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .lean();
  }
}

export const conversationService = new ConversationService();
```

---

## ⚡ QUICK IMPLEMENTATION STEPS

### Day 4 Steps:

1. Install mongoose: `npm install mongoose`
2. Create connection service
3. Create all 3 schemas (Conversation, Message, AuditLog)
4. Write schema unit tests
5. Create migration script
6. Test schemas work

### Day 5 Steps:

1. Update chatbot-service main.ts to connect MongoDB
2. Replace Prisma with Mongoose in resolvers
3. Create service layer
4. Run migration script
5. Verify all queries work
6. Test through gateway

### Day 6 Steps:

1. Create Admin models (Admin, AuditLog)
2. Implement Admin resolvers using Mongoose
3. Create audit logging middleware
4. Implement system stats aggregation
5. Test through gateway

### Day 7 Steps:

1. Validate all data migrated
2. Performance benchmarking
3. Optimize slow queries
4. Create indexes
5. Production sign-off

---

## 🧪 KEY VALIDATIONS

### After Day 4:

```bash
# Test Mongoose connection
node -e "
require('./apps/shared/lib/mongodb/connection').connectMongoDB()
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Failed:', err))
"
```

### After Day 5:

```bash
# Test migration
ts-node scripts/migrate-prisma-to-mongoose.ts

# Verify data in MongoDB
# mongosh mongodb://localhost:27017
# use chatbot
# db.conversations.find().count()
# db.messages.find().count()
```

### After Day 6:

```bash
# Test Admin queries through gateway
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ systemStats { totalUsers totalConversations } }"}'
```

---

## 📊 MONGOOSE VS PRISMA COMPARISON

| Aspect               | Prisma        | Mongoose              |
| -------------------- | ------------- | --------------------- |
| **Database**         | SQL + MongoDB | MongoDB only          |
| **Current Use**      | Auth, Chatbot | Will use              |
| **Schema**           | schema.prisma | Code-based            |
| **Validation**       | Built-in      | Schema validation     |
| **Relations**        | Automatic     | Manual references     |
| **Performance**      | Good          | Excellent for MongoDB |
| **Document queries** | Limited       | Full MongoDB          |

---

## 🔒 IMPORTANT NOTES

1. **Keep Auth Service with Prisma/PostgreSQL** - No changes to auth
2. **Migrate Only Chatbot & Admin** - These will use MongoDB
3. **Preserve IDs** - Use same IDs during migration for consistency
4. **Test Everything** - Run integration tests after each step
5. **Backup Data** - Before migration, backup PostgreSQL

---

## 📚 RESOURCES

**Mongoose Documentation:** https://mongoosejs.com/docs/guide.html  
**MongoDB Atlas:** https://www.mongodb.com/cloud/atlas  
**Local MongoDB:** Already running in Docker

---

## ✅ SUCCESS CRITERIA

- [ ] Mongoose installed and configured
- [ ] All 3 schemas created and tested
- [ ] Data successfully migrated
- [ ] All queries working through Mongoose
- [ ] No data loss during migration
- [ ] Performance acceptable
- [ ] All tests passing
- [ ] Production ready

---

**Status:** 🟢 Ready to implement after GraphQL completion  
**Next:** Complete Days 1-3 (GraphQL), then start Day 4 (Mongoose)
