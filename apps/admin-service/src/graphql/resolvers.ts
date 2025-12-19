import { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql';

const prisma = new PrismaClient();

interface AuthContext {
  userId?: string;
  token?: string;
}

interface PaginationInput {
  page?: number;
  limit?: number;
}

export const resolvers = {
  Query: {
    admin: async (_parent: any, args: { id: string }, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester || requester.role !== 'SUPER_ADMIN') {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.admin.findUnique({
        where: { id: args.id },
      });
    },

    admins: async (_parent: any, args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester) {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const page = args.input?.page || 1;
      const limit = args.input?.limit || 20;
      const skip = (page - 1) * limit;

      return prisma.admin.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });
    },

    systemStats: async (_parent: any, _args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester) {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // TODO: Aggregate stats from all services
      // This requires cross-service communication
      // For now, return placeholder stats

      return {
        totalUsers: 0,
        totalConversations: 0,
        totalMessages: 0,
        activeUsers24h: 0,
        totalTokensUsed: 0,
        averageResponseTime: 0,
        systemUptime: Math.floor(process.uptime()),
      };
    },

    auditLogs: async (_parent: any, args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester) {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const page = args.input?.page || 1;
      const limit = args.input?.limit || 50;
      const skip = (page - 1) * limit;

      return prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      });
    },

    health: () => 'Admin Subgraph OK',
  },

  Mutation: {
    assignRole: async (
      _parent: any,
      args: { input: { userId: string; role: string } },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is super admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester || requester.role !== 'SUPER_ADMIN') {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Create or update admin record
      const admin = await prisma.admin.upsert({
        where: { userId: args.input.userId },
        update: { role: args.input.role },
        create: {
          userId: args.input.userId,
          role: args.input.role,
          permissions: [],
          isActive: true,
        },
      });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId: context.userId,
          action: 'ASSIGN_ROLE',
          resource: `User:${args.input.userId}`,
          changes: JSON.stringify({ role: args.input.role }),
        },
      });

      return admin;
    },

    updatePermissions: async (
      _parent: any,
      args: { input: { userId: string; permissions: string[] } },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is super admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester || requester.role !== 'SUPER_ADMIN') {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const admin = await prisma.admin.update({
        where: { userId: args.input.userId },
        data: { permissions: args.input.permissions },
      });

      return admin;
    },

    removeAdmin: async (
      _parent: any,
      args: { userId: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is super admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester || requester.role !== 'SUPER_ADMIN') {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.admin.update({
        where: { userId: args.userId },
        data: { isActive: false },
      });
    },

    clearAuditLogs: async (
      _parent: any,
      args: { beforeDate: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is super admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester || requester.role !== 'SUPER_ADMIN') {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await prisma.auditLog.deleteMany({
        where: {
          timestamp: { lt: new Date(args.beforeDate) },
        },
      });

      return true;
    },
  },

  User: {
    __resolveReference: async (user: { id: string }) => {
      const admin = await prisma.admin.findUnique({
        where: { userId: user.id },
      });

      return {
        id: user.id,
        role: admin?.role || 'USER',
        permissions: admin?.permissions || [],
      };
    },
  },
};
