import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string; // Can be UUID (from PostgreSQL) or ObjectId (from MongoDB)
  mongoConversationId?: mongoose.Types.ObjectId; // MongoDB reference for lookups
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  metadata?: {
    model?: string;
    finishReason?: string;
    migratedFrom?: string;
    postgresId?: string;
    migratedAt?: Date;
  };
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    mongoConversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      sparse: true,
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
    tokens: {
      type: Number,
      default: 0,
    },
    metadata: {
      model: String,
      finishReason: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for efficient queries (time-series pattern)
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
