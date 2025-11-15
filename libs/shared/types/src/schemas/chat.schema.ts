import { z } from 'zod';

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  role: z.enum(['USER', 'ASSISTANT', 'SYSTEM']),
  content: z.string().min(1).max(10000),
  createdAt: z.string().datetime(),
});

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  content: z.string().min(1, 'Message cannot be empty').max(10000),
});

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().max(200),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export const UpdateConversationSchema = z.object({
  title: z.string().min(1).max(200),
});

export const ConversationListSchema = z.object({
  conversations: z.array(ConversationSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const MessageListSchema = z.object({
  messages: z.array(ChatMessageSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type UpdateConversationInput = z.infer<typeof UpdateConversationSchema>;
export type ConversationList = z.infer<typeof ConversationListSchema>;
export type MessageList = z.infer<typeof MessageListSchema>;
