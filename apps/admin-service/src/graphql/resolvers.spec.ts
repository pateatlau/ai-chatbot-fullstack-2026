/**
 * @jest-environment node
 */
import { resolvers } from './resolvers';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    admin: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('Admin Service Resolvers', () => {
  let mockPrisma: any;
  const mockContext = {
    userId: 'test-user-123',
    token: 'mock-token',
  };

  const superAdminContext = {
    userId: 'super-admin-123',
    token: 'mock-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
  });

  describe('Query: admin', () => {
    it('should throw UNAUTHENTICATED error when no userId', async () => {
      const unauthContext = { token: 'mock-token' };

      try {
        await resolvers.Query.admin(null, { id: 'admin-123' }, unauthContext);
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.extensions.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should throw FORBIDDEN error when user is not SUPER_ADMIN', async () => {
      mockPrisma.admin.findUnique.mockResolvedValueOnce({
        userId: 'test-user-123',
        role: 'ADMIN',
      });

      try {
        await resolvers.Query.admin(null, { id: 'admin-123' }, mockContext);
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.extensions.code).toBe('FORBIDDEN');
      }
    });

    it('should return admin when SUPER_ADMIN requests', async () => {
      const mockAdmin = {
        id: 'admin-123',
        userId: 'super-admin-123',
        role: 'SUPER_ADMIN',
        permissions: ['MANAGE_USERS', 'VIEW_AUDIT_LOGS'],
        isActive: true,
      };

      mockPrisma.admin.findUnique
        .mockResolvedValueOnce({
          userId: 'super-admin-123',
          role: 'SUPER_ADMIN',
        }) // Requester check
        .mockResolvedValueOnce(mockAdmin); // Get admin result

      const result = await resolvers.Query.admin(
        null,
        { id: 'admin-123' },
        superAdminContext
      );

      expect(result).toEqual(mockAdmin);
      expect(mockPrisma.admin.findUnique).toHaveBeenCalledWith({
        where: { id: 'admin-123' },
      });
    });
  });

  describe('Query: admins', () => {
    it('should throw UNAUTHENTICATED error when no userId', async () => {
      const unauthContext = { token: 'mock-token' };

      try {
        await resolvers.Query.admins(
          null,
          { input: { page: 1, limit: 20 } },
          unauthContext
        );
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.extensions.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should return paginated admins', async () => {
      const mockAdmins = [
        {
          id: 'admin-1',
          userId: 'user-1',
          role: 'ADMIN',
          permissions: [],
          isActive: true,
        },
        {
          id: 'admin-2',
          userId: 'user-2',
          role: 'MODERATOR',
          permissions: [],
          isActive: true,
        },
      ];

      mockPrisma.admin.findUnique.mockResolvedValueOnce({
        userId: 'requester-123',
        role: 'ADMIN',
      });
      mockPrisma.admin.findMany.mockResolvedValueOnce(mockAdmins);

      const result = await resolvers.Query.admins(
        null,
        { input: { page: 1, limit: 20 } },
        mockContext
      );

      expect(result).toEqual(mockAdmins);
      expect(mockPrisma.admin.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should calculate correct pagination offset', async () => {
      mockPrisma.admin.findUnique.mockResolvedValueOnce({
        userId: 'requester-123',
        role: 'ADMIN',
      });
      mockPrisma.admin.findMany.mockResolvedValueOnce([]);

      await resolvers.Query.admins(
        null,
        { input: { page: 3, limit: 10 } },
        mockContext
      );

      expect(mockPrisma.admin.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (3-1) * 10 = 20
          take: 10,
        })
      );
    });
  });

  describe('Query: systemStats', () => {
    it('should throw UNAUTHENTICATED error when no userId', async () => {
      const unauthContext = { token: 'mock-token' };

      try {
        await resolvers.Query.systemStats(null, {}, unauthContext);
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.extensions.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should return system stats with placeholder values', async () => {
      mockPrisma.admin.findUnique.mockResolvedValueOnce({
        userId: 'requester-123',
        role: 'ADMIN',
      });

      const result = await resolvers.Query.systemStats(null, {}, mockContext);

      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('totalConversations');
      expect(result).toHaveProperty('totalMessages');
      expect(result).toHaveProperty('systemUptime');
      expect(typeof result.systemUptime).toBe('number');
    });
  });

  describe('Query: auditLogs', () => {
    it('should throw UNAUTHENTICATED error when no userId', async () => {
      const unauthContext = { token: 'mock-token' };

      try {
        await resolvers.Query.auditLogs(
          null,
          { input: { page: 1 } },
          unauthContext
        );
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.extensions.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should return paginated audit logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          userId: 'admin-123',
          action: 'ASSIGN_ROLE',
          resource: 'User:123',
          changes: '{"role":"ADMIN"}',
          timestamp: new Date(),
        },
      ];

      mockPrisma.admin.findUnique.mockResolvedValueOnce({
        userId: 'requester-123',
        role: 'ADMIN',
      });
      mockPrisma.auditLog.findMany.mockResolvedValueOnce(mockLogs);

      const result = await resolvers.Query.auditLogs(
        null,
        { input: { page: 1, limit: 50 } },
        mockContext
      );

      expect(result).toEqual(mockLogs);
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        })
      );
    });
  });

  describe('Query: health', () => {
    it('should return health status string', async () => {
      const result = await resolvers.Query.health();
      expect(result).toBe('Admin Subgraph OK');
    });
  });

  describe('Mutation: assignRole', () => {
    it('should throw UNAUTHENTICATED error when no userId', async () => {
      const unauthContext = { token: 'mock-token' };

      try {
        await resolvers.Mutation.assignRole(
          null,
          { input: { userId: 'user-123', role: 'ADMIN' } },
          unauthContext
        );
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.extensions.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should throw FORBIDDEN error when user is not SUPER_ADMIN', async () => {
      mockPrisma.admin.findUnique.mockResolvedValueOnce({
        userId: 'requester-123',
        role: 'ADMIN',
      });

      try {
        await resolvers.Mutation.assignRole(
          null,
          { input: { userId: 'user-123', role: 'ADMIN' } },
          mockContext
        );
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.extensions.code).toBe('FORBIDDEN');
      }
    });

    it('should assign role and create audit log', async () => {
      const mockAdmin = {
        id: 'admin-123',
        userId: 'user-123',
        role: 'ADMIN',
        permissions: [],
        isActive: true,
      };

      mockPrisma.admin.findUnique.mockResolvedValueOnce({
        userId: 'super-admin-123',
        role: 'SUPER_ADMIN',
      });
      mockPrisma.admin.upsert.mockResolvedValueOnce(mockAdmin);
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      const result = await resolvers.Mutation.assignRole(
        null,
        { input: { userId: 'user-123', role: 'ADMIN' } },
        superAdminContext
      );

      expect(result).toEqual(mockAdmin);
      expect(mockPrisma.admin.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        update: { role: 'ADMIN' },
        create: {
          userId: 'user-123',
          role: 'ADMIN',
          permissions: [],
          isActive: true,
        },
      });
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('Mutation: updatePermissions', () => {
    it('should throw UNAUTHENTICATED error when no userId', async () => {
      const unauthContext = { token: 'mock-token' };

      try {
        await resolvers.Mutation.updatePermissions(
          null,
          { input: { userId: 'user-123', permissions: ['PERM_1'] } },
          unauthContext
        );
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.extensions.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should update permissions for SUPER_ADMIN', async () => {
      const mockAdmin = {
        id: 'admin-123',
        userId: 'user-123',
        role: 'ADMIN',
        permissions: ['MANAGE_USERS', 'VIEW_AUDIT_LOGS'],
        isActive: true,
      };

      mockPrisma.admin.findUnique.mockResolvedValueOnce({
        userId: 'super-admin-123',
        role: 'SUPER_ADMIN',
      });
      mockPrisma.admin.update.mockResolvedValueOnce(mockAdmin);

      const result = await resolvers.Mutation.updatePermissions(
        null,
        {
          input: {
            userId: 'user-123',
            permissions: ['MANAGE_USERS', 'VIEW_AUDIT_LOGS'],
          },
        },
        superAdminContext
      );

      expect(result).toEqual(mockAdmin);
      expect(mockPrisma.admin.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: { permissions: ['MANAGE_USERS', 'VIEW_AUDIT_LOGS'] },
      });
    });
  });

  describe('Mutation: removeAdmin', () => {
    it('should throw UNAUTHENTICATED error when no userId', async () => {
      const unauthContext = { token: 'mock-token' };

      try {
        await resolvers.Mutation.removeAdmin(
          null,
          { userId: 'user-123' },
          unauthContext
        );
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.extensions.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should remove admin access', async () => {
      const mockAdmin = {
        id: 'admin-123',
        userId: 'user-123',
        role: 'ADMIN',
        permissions: [],
        isActive: false,
      };

      mockPrisma.admin.findUnique.mockResolvedValueOnce({
        userId: 'super-admin-123',
        role: 'SUPER_ADMIN',
      });
      mockPrisma.admin.update.mockResolvedValueOnce(mockAdmin);

      const result = await resolvers.Mutation.removeAdmin(
        null,
        { userId: 'user-123' },
        superAdminContext
      );

      expect(result).toEqual(mockAdmin);
      expect(mockPrisma.admin.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: { isActive: false },
      });
    });
  });

  describe('Mutation: clearAuditLogs', () => {
    it('should throw UNAUTHENTICATED error when no userId', async () => {
      const unauthContext = { token: 'mock-token' };

      try {
        await resolvers.Mutation.clearAuditLogs(
          null,
          { beforeDate: '2024-01-01' },
          unauthContext
        );
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.extensions.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should clear old audit logs for SUPER_ADMIN', async () => {
      mockPrisma.admin.findUnique.mockResolvedValueOnce({
        userId: 'super-admin-123',
        role: 'SUPER_ADMIN',
      });
      mockPrisma.auditLog.deleteMany.mockResolvedValueOnce({ count: 100 });

      const result = await resolvers.Mutation.clearAuditLogs(
        null,
        { beforeDate: '2024-01-01' },
        superAdminContext
      );

      expect(result).toBe(true);
      expect(mockPrisma.auditLog.deleteMany).toHaveBeenCalledWith({
        where: {
          timestamp: { lt: new Date('2024-01-01') },
        },
      });
    });
  });

  describe('User Reference Resolution', () => {
    it('should resolve User reference with admin role and permissions', async () => {
      const mockAdmin = {
        userId: 'user-123',
        role: 'ADMIN',
        permissions: ['MANAGE_USERS'],
      };

      mockPrisma.admin.findUnique.mockResolvedValueOnce(mockAdmin);

      const result = await resolvers.User.__resolveReference({
        id: 'user-123',
      });

      expect(result).toEqual({
        id: 'user-123',
        role: 'ADMIN',
        permissions: ['MANAGE_USERS'],
      });
    });

    it('should resolve User reference with default USER role when no admin record', async () => {
      mockPrisma.admin.findUnique.mockResolvedValueOnce(null);

      const result = await resolvers.User.__resolveReference({
        id: 'user-123',
      });

      expect(result).toEqual({
        id: 'user-123',
        role: 'USER',
        permissions: [],
      });
    });
  });
});
