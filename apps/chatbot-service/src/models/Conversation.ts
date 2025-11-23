import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  userId: string;
  title: string;
  messageIds: mongoose.Types.ObjectId[];
  metadata?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
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
      required: true,
      trim: true,
    },
    messageIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    metadata: {
      model: String,
      temperature: Number,
      maxTokens: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, updatedAt: -1 });

export const Conversation = mongoose.model<IConversation>(
  'Conversation',
  conversationSchema
);

export default Conversation;
