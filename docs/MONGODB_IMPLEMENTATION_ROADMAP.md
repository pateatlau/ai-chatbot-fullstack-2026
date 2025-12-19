# MongoDB Full-Stack Implementation Roadmap

## Parallel Frontend & Backend Development (Nx Monorepo with MongoDB)

**Version:** 1.0  
**Date:** November 17, 2025  
**Architecture:** **Unified Monorepo (Nx) with MongoDB + Mongoose**  
**Timeline:** 5 Weeks  
**Team Composition:** 4-8 developers (2-4 Backend, 2-4 Frontend)

---

## 📋 EXECUTIVE SUMMARY

This roadmap adapts the successful PostgreSQL + Prisma architecture to use **MongoDB + Mongoose**, maintaining all other aspects of the tech stack including:

- ✅ Nx monorepo build system
- ✅ Microservices backend (3 services)
- ✅ Module Federation microfrontends (5 MFEs)
- ✅ React 18 + TypeScript 5.3
- ✅ Express 4.18 backend services
- ✅ Docker deployment infrastructure
- ✅ Comprehensive testing strategy

**Key Changes from PostgreSQL Version:**

| Component           | PostgreSQL Version     | MongoDB Version                    |
| ------------------- | ---------------------- | ---------------------------------- |
| **Database**        | PostgreSQL 15          | **MongoDB 7.0+**                   |
| **ORM/ODM**         | Prisma 6.x             | **Mongoose 8.x**                   |
| **Schema Language** | Prisma Schema Language | **Mongoose Schema (TypeScript)**   |
| **Migrations**      | Prisma Migrate         | **mongoose-migrate / manual**      |
| **Query Builder**   | Prisma Client          | **Mongoose Models**                |
| **Transactions**    | Native SQL             | **MongoDB Transactions (4.0+)**    |
| **Relations**       | Foreign Keys           | **Refs + Populate**                |
| **Validation**      | Zod + Prisma           | **Zod + Mongoose Validators**      |
| **Type Safety**     | Generated Types        | **Manual TypeScript Interfaces**   |
| **Studio GUI**      | Prisma Studio          | **MongoDB Compass / Studio 3T**    |
| **Connection Pool** | Prisma Pool            | **Mongoose Connection Pool**       |
| **Cloud Option**    | AWS RDS, Neon          | **MongoDB Atlas / AWS DocumentDB** |

---

## 🎯 IMPLEMENTATION TRACKER

> **Target Timeline:** 5 Weeks  
> **Recommended Approach:** Follow PostgreSQL roadmap phases, substitute MongoDB patterns

### 📊 Phase Completion Template

| Phase                              | Status    | Completion | Time | Key Deliverables                               |
| ---------------------------------- | --------- | ---------- | ---- | ---------------------------------------------- |
| **Phase 0: Nx Monorepo Setup**     | Pending   | 0%         | ~1h  | Nx workspace, 19 projects, shared libraries    |
| **Phase 1: Shell Integration**     | Pending   | 0%         | ~2h  | Module Federation, routing, base tests         |
| **Phase 2: Chatbot MFE**           | Pending   | 0%         | ~3h  | Chat UI, streaming, MongoDB integration        |
| **Phase 3: E2E Testing**           | Pending   | 0%         | ~3h  | 54 E2E tests, CI/CD workflow                   |
| **Phase 4: Production Ready**      | Pending   | 0%         | ~3h  | Docker with MongoDB, CI/CD, load testing, docs |
| **Phase 5: Optional Enhancements** | Pending   | 0%         | ~2h  | Health checks, Swagger, monitoring             |
| **Total Project**                  | **Ready** | **0%**     | ~14h | **Production-ready MongoDB application**       |

---

## 🗄️ MONGODB ARCHITECTURE

### Database Design Philosophy

**Document-Oriented Design vs Relational:**

| Aspect            | PostgreSQL (Relational)      | MongoDB (Document)                  |
| ----------------- | ---------------------------- | ----------------------------------- |
| **Data Model**    | Normalized tables with FKs   | Embedded documents + references     |
| **Schema**        | Strict, predefined           | Flexible, dynamic (with validation) |
| **Relationships** | JOIN operations              | Embedding or $lookup aggregation    |
| **Transactions**  | ACID across tables           | ACID across documents (replica set) |
| **Queries**       | SQL                          | MongoDB Query Language (MQL)        |
| **Scaling**       | Vertical + read replicas     | Horizontal sharding + replica sets  |
| **Best For**      | Complex joins, ACID critical | Nested data, high write throughput  |

### MongoDB Stack Components

```
Application Layer
├── Express 4.18 (REST API)
├── Mongoose 8.x (ODM)
└── Zod 3.24 (Validation)

Database Layer
├── MongoDB 7.0+ (Primary)
├── Redis 7.x (Caching/Sessions)
└── MongoDB Atlas (Cloud) / Self-hosted

Connection Management
├── Mongoose Connection Pool
├── Automatic Reconnection
├── Connection Monitoring
└── Graceful Shutdown
```

### Mongoose Schema Patterns

**1. Embedded Documents (One-to-Few):**

```typescript
// User with embedded profile
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
  },
  settings: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

**2. References (One-to-Many):**

```typescript
// Conversation references User
const ConversationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Message references Conversation
const MessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
```

**3. Hybrid Approach (Denormalization):**

```typescript
// Embed frequently accessed data, reference detailed data
const ConversationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // Embedded user snapshot (denormalized for performance)
  userSnapshot: {
    email: String,
    name: String,
  },
  title: String,
  messageCount: { type: Number, default: 0 },
  lastMessage: {
    content: String,
    role: String,
    timestamp: Date,
  },
  // Reference to full message history
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
});
```

---

## 🏗️ MONGODB DATA MODELS

### Auth Service Models

**User Model (`apps/auth-service/src/models/user.model.ts`):**

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: 'user' | 'admin';
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  };
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profile: {
      firstName: String,
      lastName: String,
      avatar: String,
      bio: { type: String, maxlength: 500 },
    },
    settings: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: 'en',
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLoginAt: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });

// Pre-save hook: Hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Methods
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generatePasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return resetToken;
};

export const User = mongoose.model<IUser>('User', UserSchema);
```

**Session Model (`apps/auth-service/src/models/session.model.ts`):**

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  deviceInfo: {
    userAgent?: string;
    ip?: string;
    device?: string;
    browser?: string;
  };
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    deviceInfo: {
      userAgent: String,
      ip: String,
      device: String,
      browser: String,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for user sessions
SessionSchema.index({ userId: 1, expiresAt: 1 });

// TTL index to automatically delete expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
```

### Chatbot Service Models

**Conversation Model (`apps/chatbot-service/src/models/conversation.model.ts`):**

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  messageCount: number;
  lastMessage?: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
  metadata: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessage: {
      role: {
        type: String,
        enum: ['user', 'assistant'],
      },
      content: String,
      timestamp: Date,
    },
    metadata: {
      model: {
        type: String,
        default: 'gpt-4',
      },
      temperature: {
        type: Number,
        min: 0,
        max: 2,
        default: 0.7,
      },
      maxTokens: {
        type: Number,
        default: 2000,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ConversationSchema.index({ userId: 1, updatedAt: -1 }); // For listing user conversations
ConversationSchema.index({ createdAt: -1 }); // For recent conversations

export const Conversation = mongoose.model<IConversation>(
  'Conversation',
  ConversationSchema
);
```

**Message Model (`apps/chatbot-service/src/models/message.model.ts`):**

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokenCount?: number;
  metadata: {
    model?: string;
    finishReason?: string;
    promptTokens?: number;
    completionTokens?: number;
  };
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tokenCount: Number,
    metadata: {
      model: String,
      finishReason: String,
      promptTokens: Number,
      completionTokens: Number,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for fetching conversation messages
MessageSchema.index({ conversationId: 1, createdAt: 1 });

// Index for cleanup operations
MessageSchema.index({ createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
```

### Admin Service Models

**Audit Log Model (`apps/admin-service/src/models/audit-log.model.ts`):**

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: String,
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for common queries
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });

// TTL index for automatic cleanup (optional: retain logs for 90 days)
// AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
```

---

## 🔌 MONGOOSE CONNECTION SETUP

### Database Connection Utility

**File:** `libs/backend/database/src/mongodb.ts`

```typescript
import mongoose from 'mongoose';
import { logger } from '@myapp/backend/logger';

interface MongoConnectionOptions {
  uri: string;
  options?: mongoose.ConnectOptions;
}

class MongoDBConnection {
  private static instance: MongoDBConnection;
  private isConnected = false;

  private constructor() {}

  static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  async connect({ uri, options = {} }: MongoConnectionOptions): Promise<void> {
    if (this.isConnected) {
      logger.info('MongoDB: Using existing connection');
      return;
    }

    try {
      const defaultOptions: mongoose.ConnectOptions = {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        ...options,
      };

      await mongoose.connect(uri, defaultOptions);

      this.isConnected = true;
      logger.info('MongoDB: Connected successfully');

      // Connection event listeners
      mongoose.connection.on('connected', () => {
        logger.info('MongoDB: Connection established');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB: Connection error', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB: Connection lost');
        this.isConnected = false;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });
    } catch (error) {
      logger.error('MongoDB: Connection failed', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.info('MongoDB: Disconnected successfully');
    } catch (error) {
      logger.error('MongoDB: Disconnect error', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      state: string;
      host?: string;
      port?: number;
      name?: string;
    };
  }> {
    try {
      const state = mongoose.connection.readyState;
      const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };

      if (state === 1) {
        // Ping database
        await mongoose.connection.db.admin().ping();

        return {
          status: 'healthy',
          details: {
            state: stateMap[state],
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name,
          },
        };
      }

      return {
        status: 'unhealthy',
        details: {
          state: stateMap[state] || 'unknown',
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          state: 'error',
        },
      };
    }
  }

  getConnection(): typeof mongoose {
    return mongoose;
  }
}

export const mongoConnection = MongoDBConnection.getInstance();
```

### Service Integration

**Auth Service Main (`apps/auth-service/src/main.ts`):**

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { mongoConnection } from '@myapp/backend/database';
import { logger } from '@myapp/backend/logger';
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-db';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', async (req, res) => {
  const dbHealth = await mongoConnection.healthCheck();
  const isHealthy = dbHealth.status === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbHealth,
  });
});

// Start server
async function start() {
  try {
    // Connect to MongoDB
    await mongoConnection.connect({
      uri: MONGODB_URI,
      options: {
        dbName: 'auth-db',
      },
    });

    app.listen(PORT, () => {
      logger.info(`Auth Service listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
```

---

## 🔄 MIGRATION STRATEGIES

### Option 1: mongoose-migrate (Recommended)

**Installation:**

```bash
npm install --save-dev migrate-mongoose
```

**Migration Structure:**

```
apps/auth-service/
├── migrations/
│   ├── 001-create-indexes.ts
│   ├── 002-add-user-settings.ts
│   └── 003-migrate-legacy-users.ts
└── migrate-mongo-config.ts
```

**Sample Migration (`001-create-indexes.ts`):**

```typescript
import { Db } from 'mongodb';

export async function up(db: Db): Promise<void> {
  // Create indexes for User collection
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db
    .collection('users')
    .createIndex({ 'profile.firstName': 1, 'profile.lastName': 1 });

  // Create indexes for Session collection
  await db.collection('sessions').createIndex({ userId: 1 });
  await db.collection('sessions').createIndex({ refreshToken: 1 });
  await db
    .collection('sessions')
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  console.log('Indexes created successfully');
}

export async function down(db: Db): Promise<void> {
  await db.collection('users').dropIndexes();
  await db.collection('sessions').dropIndexes();
  console.log('Indexes dropped successfully');
}
```

**Running Migrations:**

```bash
# Add to package.json scripts
"migrate:up": "migrate-mongoose up",
"migrate:down": "migrate-mongoose down",
"migrate:create": "migrate-mongoose create"

# Create new migration
npm run migrate:create add-user-preferences

# Run migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down
```

### Option 2: Manual Seed Scripts

**Seed Script (`apps/auth-service/src/scripts/seed.ts`):**

```typescript
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { mongoConnection } from '@myapp/backend/database';

async function seed() {
  await mongoConnection.connect({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-db',
  });

  // Create admin user
  const adminUser = await User.create({
    email: 'admin@example.com',
    password: 'Admin123!',
    role: 'admin',
    isEmailVerified: true,
    profile: {
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  console.log('Admin user created:', adminUser.email);

  // Create test users
  const testUsers = await User.insertMany([
    {
      email: 'user1@example.com',
      password: 'User123!',
      role: 'user',
      isEmailVerified: true,
    },
    {
      email: 'user2@example.com',
      password: 'User123!',
      role: 'user',
      isEmailVerified: false,
    },
  ]);

  console.log(`Created ${testUsers.length} test users`);

  await mongoConnection.disconnect();
}

seed().catch(console.error);
```

---

## 🔍 QUERY PATTERNS

### Common CRUD Operations

**Create:**

```typescript
// Create single document
const user = await User.create({
  email: 'test@example.com',
  password: 'hashedPassword',
  role: 'user',
});

// Create multiple documents
const messages = await Message.insertMany([
  { conversationId, role: 'user', content: 'Hello' },
  { conversationId, role: 'assistant', content: 'Hi there!' },
]);
```

**Read:**

```typescript
// Find by ID
const user = await User.findById(userId);

// Find one with conditions
const user = await User.findOne({ email: 'test@example.com' });

// Find many with filtering
const users = await User.find({ role: 'user', isEmailVerified: true })
  .select('email profile')
  .sort({ createdAt: -1 })
  .limit(10);

// Pagination
const page = 1;
const limit = 20;
const users = await User.find({ role: 'user' })
  .skip((page - 1) * limit)
  .limit(limit);

const total = await User.countDocuments({ role: 'user' });
```

**Update:**

```typescript
// Update one
const user = await User.findByIdAndUpdate(
  userId,
  { 'profile.firstName': 'John', lastLoginAt: new Date() },
  { new: true, runValidators: true } // Return updated doc, run validators
);

// Update many
const result = await User.updateMany(
  { isEmailVerified: false },
  { $set: { 'settings.notifications': false } }
);
console.log(`${result.modifiedCount} users updated`);

// Increment counter
await Conversation.findByIdAndUpdate(conversationId, {
  $inc: { messageCount: 1 },
});
```

**Delete:**

```typescript
// Delete one
await User.findByIdAndDelete(userId);

// Delete many
const result = await Session.deleteMany({
  expiresAt: { $lt: new Date() },
});
console.log(`${result.deletedCount} expired sessions deleted`);
```

### Advanced Queries

**Population (Joins):**

```typescript
// Populate single reference
const conversation = await Conversation.findById(conversationId).populate(
  'userId',
  'email profile'
);

// Populate array of references
const conversation =
  await Conversation.findById(conversationId).populate('messages');

// Nested population
const message = await Message.findById(messageId).populate({
  path: 'conversationId',
  populate: {
    path: 'userId',
    select: 'email profile',
  },
});
```

**Aggregation Pipeline:**

```typescript
// Get user statistics
const userStats = await User.aggregate([
  {
    $match: { role: 'user' },
  },
  {
    $lookup: {
      from: 'conversations',
      localField: '_id',
      foreignField: 'userId',
      as: 'conversations',
    },
  },
  {
    $project: {
      email: 1,
      conversationCount: { $size: '$conversations' },
      lastLogin: '$lastLoginAt',
    },
  },
  {
    $sort: { conversationCount: -1 },
  },
  {
    $limit: 10,
  },
]);

// Group messages by date
const messagesByDate = await Message.aggregate([
  {
    $group: {
      _id: {
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
      },
      count: { $sum: 1 },
    },
  },
  {
    $sort: { _id: -1 },
  },
]);
```

**Text Search:**

```typescript
// Add text index to schema
ConversationSchema.index({ title: 'text', 'lastMessage.content': 'text' });

// Search conversations
const results = await Conversation.find({
  $text: { $search: 'mongodb query' },
}).sort({ score: { $meta: 'textScore' } });
```

---

## 🔐 TRANSACTIONS

### Multi-Document Transactions

**Example: Create Conversation with First Message:**

```typescript
import mongoose from 'mongoose';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';

async function createConversationWithMessage(
  userId: string,
  title: string,
  firstMessage: string
) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Create conversation
    const conversation = await Conversation.create(
      [
        {
          userId,
          title,
          messageCount: 1,
          lastMessage: {
            role: 'user',
            content: firstMessage,
            timestamp: new Date(),
          },
        },
      ],
      { session }
    );

    // Create first message
    await Message.create(
      [
        {
          conversationId: conversation[0]._id,
          role: 'user',
          content: firstMessage,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return conversation[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

**Transaction Requirements:**

- MongoDB 4.0+ with replica set
- Not supported in standalone MongoDB
- For development, use single-node replica set:

```bash
# docker-compose.yml
services:
  mongodb:
    image: mongo:7.0
    command: ["--replSet", "rs0"]
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

# Initialize replica set (run once)
docker exec -it <container> mongo --eval "rs.initiate()"
```

---

## 📦 DOCKER CONFIGURATION

### MongoDB Docker Compose

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: auth-db
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d # Init scripts
    command: ['--replSet', 'rs0'] # Enable replica set for transactions
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # Initialize replica set
  mongo-setup:
    image: mongo:7.0
    depends_on:
      mongodb:
        condition: service_healthy
    restart: 'no'
    entrypoint:
      [
        'bash',
        '-c',
        'sleep 5 && mongosh --host mongodb:27017 --eval "rs.initiate({_id: \"rs0\", members: [{_id: 0, host: \"mongodb:27017\"}]})"',
      ]

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend services (connect to mongodb)
  auth-service:
    build:
      context: .
      dockerfile: apps/auth-service/Dockerfile
    environment:
      MONGODB_URI: mongodb://admin:${MONGO_ROOT_PASSWORD}@mongodb:27017/auth-db?authSource=admin&replicaSet=rs0
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    ports:
      - '3000:3000'
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy

  chatbot-service:
    build:
      context: .
      dockerfile: apps/chatbot-service/Dockerfile
    environment:
      MONGODB_URI: mongodb://admin:${MONGO_ROOT_PASSWORD}@mongodb:27017/chatbot-db?authSource=admin&replicaSet=rs0
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      PORT: 3001
    ports:
      - '3001:3001'
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy

  admin-service:
    build:
      context: .
      dockerfile: apps/admin-service/Dockerfile
    environment:
      MONGODB_URI: mongodb://admin:${MONGO_ROOT_PASSWORD}@mongodb:27017/admin-db?authSource=admin&replicaSet=rs0
      REDIS_URL: redis://redis:6379
      PORT: 3002
    ports:
      - '3002:3002'
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  mongodb_data:
  redis_data:
```

### Environment Variables

**File:** `.env.example`

```bash
# MongoDB Configuration
MONGO_ROOT_PASSWORD=your-secure-root-password
MONGODB_URI=mongodb://admin:your-secure-root-password@localhost:27017/auth-db?authSource=admin&replicaSet=rs0

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-64-character-secret-key-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Service Ports
AUTH_SERVICE_PORT=3000
CHATBOT_SERVICE_PORT=3001
ADMIN_SERVICE_PORT=3002

# Frontend URLs
SHELL_URL=http://localhost:5173
AUTH_MFE_URL=http://localhost:5174
CHATBOT_MFE_URL=http://localhost:5175
ADMIN_MFE_URL=http://localhost:5176
PROFILE_MFE_URL=http://localhost:5177

# Environment
NODE_ENV=development
```

---

## 🧪 TESTING WITH MONGODB

### Unit Testing with MongoDB Memory Server

**Installation:**

```bash
npm install --save-dev mongodb-memory-server @shelf/jest-mongodb
```

**Jest Configuration (`apps/auth-service/jest.config.ts`):**

```typescript
export default {
  displayName: 'auth-service',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/auth-service',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};
```

**Test Setup (`apps/auth-service/src/test/setup.ts`):**

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

// Setup: Before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

// Cleanup: After each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Teardown: After all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});
```

**Sample Test (`apps/auth-service/src/services/auth.service.spec.ts`):**

```typescript
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test123!',
      };

      const user = await authService.register(userData);

      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.role).toBe('user');
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test123!',
      };

      await authService.register(userData);

      await expect(authService.register(userData)).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await User.create({
        email: 'test@example.com',
        password: 'Test123!',
      });
    });

    it('should return tokens for valid credentials', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'Test123!',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error for invalid credentials', async () => {
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'WrongPassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

### E2E Testing

E2E tests remain identical to PostgreSQL version - they test HTTP endpoints regardless of database implementation.

---

## 🚀 DEPLOYMENT OPTIONS

### MongoDB Atlas (Recommended for Production)

**Advantages:**

- Fully managed service (backups, monitoring, scaling)
- Free tier available (512MB)
- Built-in security (encryption, network isolation)
- Global clusters for multi-region
- Performance insights

**Setup:**

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster (M0 free or M10+ paid)
3. Configure network access (IP whitelist or VPC peering)
4. Create database user
5. Get connection string

**Connection String Format:**

```
mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
```

### AWS DocumentDB (MongoDB-Compatible)

**Features:**

- AWS-native MongoDB-compatible service
- Automatic backups, point-in-time recovery
- VPC integration
- Scales up to 64TB
- Compatible with MongoDB 3.6/4.0/5.0 APIs

**Limitations:**

- Not 100% MongoDB compatible (no transactions in older versions)
- Requires change streams for transactions
- Higher cost than Atlas

### Self-Hosted MongoDB

**Docker Production Setup:**

```yaml
version: '3.8'

services:
  mongodb-primary:
    image: mongo:7.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    volumes:
      - mongo-primary:/data/db
    command: mongod --replSet rs0 --bind_ip_all
    networks:
      - mongo-cluster

  mongodb-secondary:
    image: mongo:7.0
    restart: always
    depends_on:
      - mongodb-primary
    volumes:
      - mongo-secondary:/data/db
    command: mongod --replSet rs0 --bind_ip_all
    networks:
      - mongo-cluster

  mongodb-arbiter:
    image: mongo:7.0
    restart: always
    depends_on:
      - mongodb-primary
    command: mongod --replSet rs0 --bind_ip_all
    networks:
      - mongo-cluster

volumes:
  mongo-primary:
  mongo-secondary:

networks:
  mongo-cluster:
```

---

## 📚 KEY DIFFERENCES SUMMARY

### Development Workflow Changes

| Task                  | PostgreSQL + Prisma         | MongoDB + Mongoose            |
| --------------------- | --------------------------- | ----------------------------- |
| **Schema Definition** | `schema.prisma`             | Mongoose Schema files         |
| **Generate Client**   | `npx prisma generate`       | Not needed (models exported)  |
| **Migrations**        | `npx prisma migrate dev`    | Custom scripts or tools       |
| **Database GUI**      | `npx prisma studio`         | MongoDB Compass / Studio 3T   |
| **Seeding**           | `prisma/seed.ts`            | Custom seed scripts           |
| **Type Safety**       | Generated types             | Manual TypeScript interfaces  |
| **Relations**         | Automatic via Prisma Client | Manual populate() calls       |
| **Transactions**      | Automatic                   | Manual session management     |
| **Query Performance** | Optimized SQL               | MongoDB aggregation pipelines |

### Performance Considerations

**MongoDB Advantages:**

- ✅ Flexible schema (no migrations for minor changes)
- ✅ Excellent for embedded documents
- ✅ Horizontal scaling via sharding
- ✅ High write throughput
- ✅ Geospatial queries built-in

**MongoDB Challenges:**

- ⚠️ Manual index optimization required
- ⚠️ Joins (lookups) less efficient than SQL
- ⚠️ Transactions require replica set
- ⚠️ Schema validation more manual
- ⚠️ Memory-intensive for large working sets

---

## 📖 RECOMMENDED PACKAGES

```json
{
  "dependencies": {
    "mongoose": "^8.0.0",
    "mongodb": "^6.3.0", // Driver (installed with mongoose)
    "@typegoose/typegoose": "^12.0.0", // Optional: Type-safe models
    "mongoose-paginate-v2": "^1.8.0", // Pagination helper
    "mongoose-autopopulate": "^1.1.0" // Auto-populate plugin
  },
  "devDependencies": {
    "mongodb-memory-server": "^9.1.0", // In-memory testing
    "@shelf/jest-mongodb": "^4.2.0", // Jest preset
    "@types/mongoose": "^5.11.97" // TypeScript types
  }
}
```

---

## 🎓 LEARNING RESOURCES

### Official Documentation

- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [MongoDB University](https://university.mongodb.com/) - Free courses

### Migration Guides

- [SQL to MongoDB Mapping](https://www.mongodb.com/docs/manual/reference/sql-comparison/)
- [Prisma to Mongoose Migration](https://gist.github.com/examples/prisma-to-mongoose)

### Best Practices

- [MongoDB Schema Design Patterns](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)
- [Mongoose Performance Tips](https://mongoosejs.com/docs/guide.html#performance)

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 0: MongoDB Setup

- [ ] Install MongoDB (Docker or local)
- [ ] Install Mongoose in all backend services
- [ ] Create database connection utility
- [ ] Configure environment variables
- [ ] Set up replica set for transactions
- [ ] Test health checks

### Phase 1: Schema Design

- [ ] Design User schema with embedded profile
- [ ] Design Conversation schema with references
- [ ] Design Message schema with metadata
- [ ] Design Session schema with TTL
- [ ] Design AuditLog schema
- [ ] Add indexes for common queries
- [ ] Create TypeScript interfaces

### Phase 2: Service Implementation

- [ ] Implement Auth Service with User model
- [ ] Implement Chatbot Service with Conversation/Message models
- [ ] Implement Admin Service with AuditLog model
- [ ] Add authentication middleware
- [ ] Add validation middleware (Zod + Mongoose)
- [ ] Add error handling

### Phase 3: Testing

- [ ] Set up MongoDB Memory Server for tests
- [ ] Write unit tests for models
- [ ] Write unit tests for services
- [ ] Write integration tests
- [ ] Write E2E tests (unchanged from PostgreSQL)

### Phase 4: Production

- [ ] Choose deployment option (Atlas/DocumentDB/Self-hosted)
- [ ] Configure production connection strings
- [ ] Set up backups
- [ ] Configure monitoring
- [ ] Load testing
- [ ] Security audit

---

## 🔄 MIGRATION FROM POSTGRESQL

If migrating from existing PostgreSQL database:

1. **Export data from PostgreSQL:**

```bash
# Using Prisma
npx prisma db pull
npx prisma generate
```

2. **Transform and import to MongoDB:**

```typescript
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { User } from './models/user.model';

const prisma = new PrismaClient();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);

  const users = await prisma.user.findMany();

  for (const user of users) {
    await User.create({
      email: user.email,
      password: user.password,
      role: user.role,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  console.log(`Migrated ${users.length} users`);
}

migrate();
```

---

## 📞 SUPPORT & RESOURCES

**Community:**

- [Mongoose Slack](https://mongoosejs.slack.com/)
- [MongoDB Community Forums](https://www.mongodb.com/community/forums/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/mongoose)

**Commercial Support:**

- MongoDB Atlas Support Plans
- MongoDB Professional Services

---

**Version**: 1.0  
**Last Updated**: November 17, 2025  
**Compatibility**: MongoDB 5.0+, Mongoose 8.0+, Node.js 20.x  
**Status**: Ready for Implementation

---

For detailed implementation guidance on each phase, refer to the original [CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md](./CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md) and substitute database operations with MongoDB/Mongoose equivalents as documented above.
