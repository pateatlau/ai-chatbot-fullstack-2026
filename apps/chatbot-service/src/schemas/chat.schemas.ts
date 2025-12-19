import { z } from 'zod';

/**
 * Schema for creating a new conversation
 */
export const createConversationSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be 200 characters or less')
    .optional(),
});

/**
 * Schema for updating a conversation
 */
export const updateConversationSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be 200 characters or less'),
});

/**
 * Schema for creating a message
 */
export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content cannot be empty')
    .max(10000, 'Message must be 10,000 characters or less'),
});

/**
 * Schema for pagination query parameters
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Page must be greater than 0'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
});

/**
 * Schema for UUID parameters
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Type exports
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type UuidParamInput = z.infer<typeof uuidParamSchema>;
