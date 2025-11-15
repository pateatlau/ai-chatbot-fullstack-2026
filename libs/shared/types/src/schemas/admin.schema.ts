import { z } from 'zod';
import { UserSchema } from './user.schema';

export const UserListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'name', 'email', 'role']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
  isActive: z.boolean().optional(),
});

export const UserListSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const UpdateUserByAdminSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().url().nullable().optional(),
});

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime(),
});

export const AuditLogListSchema = z.object({
  logs: z.array(AuditLogSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const AnalyticsOverviewSchema = z.object({
  totalUsers: z.number(),
  activeUsers: z.number(),
  totalConversations: z.number(),
  totalMessages: z.number(),
  avgMessagesPerConversation: z.number(),
  userGrowthRate: z.number(),
});

export const UserGrowthDataSchema = z.object({
  date: z.string(),
  count: z.number(),
});

export const ConversationStatsSchema = z.object({
  date: z.string(),
  count: z.number(),
  messages: z.number(),
});

export const AnalyticsDateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type UserListQuery = z.infer<typeof UserListQuerySchema>;
export type UserList = z.infer<typeof UserListSchema>;
export type UpdateUserByAdminInput = z.infer<typeof UpdateUserByAdminSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type AuditLogList = z.infer<typeof AuditLogListSchema>;
export type AnalyticsOverview = z.infer<typeof AnalyticsOverviewSchema>;
export type UserGrowthData = z.infer<typeof UserGrowthDataSchema>;
export type ConversationStats = z.infer<typeof ConversationStatsSchema>;
export type AnalyticsDateRange = z.infer<typeof AnalyticsDateRangeSchema>;
