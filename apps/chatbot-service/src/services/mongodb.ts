import mongoose, { Connection } from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

const MONGODB_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: false,
  w: 'majority' as const,
};

let mongoConnection: Connection | null = null;

export async function connectMongoDB(): Promise<void> {
  if (mongoConnection) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    console.log(`🔌 Connecting to MongoDB...`);

    await mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);
    mongoConnection = mongoose.connection;

    console.log('✅ MongoDB connected successfully');
    console.log(
      `📊 Pool Size: ${MONGODB_OPTIONS.maxPoolSize}/${MONGODB_OPTIONS.minPoolSize}`
    );

    // Set up event listeners
    mongoConnection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoConnection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
      mongoConnection = null;
    });

    mongoConnection.on('reconnected', () => {
      console.info('🔄 MongoDB reconnected');
    });
  } catch (error) {
    console.error('❌ Failed to connect MongoDB:', error);
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (!mongoConnection) return;

  try {
    await mongoose.disconnect();
    mongoConnection = null;
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect MongoDB:', error);
    throw error;
  }
}

export function isMongoDBConnected(): boolean {
  return mongoConnection?.readyState === 1;
}

export function getMongoDBConnection(): Connection | null {
  return mongoConnection;
}

export default {
  connectMongoDB,
  disconnectMongoDB,
  isMongoDBConnected,
  getMongoDBConnection,
};
