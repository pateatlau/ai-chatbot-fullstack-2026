import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { GraphQLError } from 'graphql';

const prisma = new PrismaClient();

interface AuthContext {
  userId?: string;
  user?: any;
  token?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

interface UpdateProfileInput {
  username?: string;
  firstName?: string;
  lastName?: string;
}

export const resolvers = {
  Query: {
    // Get current authenticated user
    me: async (_parent: any, _args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return prisma.user.findUnique({
        where: { id: context.userId },
      });
    },

    // Get user by ID (federation reference resolution)
    user: async (_parent: any, args: { id: string }) => {
      return prisma.user.findUnique({
        where: { id: args.id },
      });
    },

    // Get user by email
    userByEmail: async (
      _parent: any,
      args: { email: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return prisma.user.findUnique({
        where: { email: args.email },
      });
    },

    // Check if email exists
    emailExists: async (_parent: any, args: { email: string }) => {
      const user = await prisma.user.findUnique({
        where: { email: args.email },
      });
      return !!user;
    },

    // Health check for subgraph
    health: () => {
      return 'Auth subgraph is healthy';
    },
  },

  Mutation: {
    // Login mutation
    login: async (_parent: any, args: { input: LoginInput }) => {
      const { email, password } = args.input;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'INVALID_CREDENTIALS' },
        });
      }

      // Verify password
      const isPasswordValid = await bcryptjs.compare(
        password,
        user.passwordHash
      );
      if (!isPasswordValid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'INVALID_CREDENTIALS' },
        });
      }

      if (!user.isActive) {
        throw new GraphQLError('User account is inactive', {
          extensions: { code: 'ACCOUNT_INACTIVE' },
        });
      }

      // Generate tokens
      const jwtSecret = process.env.JWT_SECRET || 'default-secret';
      const refreshSecret =
        process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
      const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
      const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        {
          expiresIn,
        }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, email: user.email, type: 'refresh' },
        refreshSecret,
        { expiresIn: refreshExpiresIn }
      );

      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        refreshToken,
      };
    },

    // Register mutation
    register: async (_parent: any, args: { input: RegisterInput }) => {
      const { email, password, username, firstName, lastName } = args.input;

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new GraphQLError('Email already registered', {
          extensions: { code: 'EMAIL_EXISTS' },
        });
      }

      // Hash password
      const passwordHash = await bcryptjs.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          username: username || email.split('@')[0],
          firstName: firstName || '',
          lastName: lastName || '',
          role: 'USER',
          isActive: true,
        },
      });

      // Generate tokens
      const jwtSecret = process.env.JWT_SECRET || 'default-secret';
      const refreshSecret =
        process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
      const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
      const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        {
          expiresIn,
        }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, email: user.email, type: 'refresh' },
        refreshSecret,
        { expiresIn: refreshExpiresIn }
      );

      return {
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        refreshToken,
      };
    },

    // Logout mutation
    logout: async (_parent: any, _args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return {
        success: true,
        message: 'Logged out successfully',
        user: null,
        token: null,
        refreshToken: null,
      };
    },

    // Refresh token mutation
    refreshToken: async (_parent: any, _args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: context.userId },
      });

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'USER_NOT_FOUND' },
        });
      }

      // Generate new token
      const jwtSecret = process.env.JWT_SECRET || 'default-secret';
      const expiresIn = process.env.JWT_EXPIRES_IN || '15m';

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        {
          expiresIn,
        }
      );

      return {
        success: true,
        message: 'Token refreshed',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        refreshToken: null,
      };
    },

    // Update profile mutation
    updateProfile: async (
      _parent: any,
      args: { input: UpdateProfileInput },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const { username, firstName, lastName } = args.input;

      const user = await prisma.user.update({
        where: { id: context.userId },
        data: {
          ...(username && { username }),
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
        },
      });

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    },

    // Change password mutation
    changePassword: async (
      _parent: any,
      args: { oldPassword: string; newPassword: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: context.userId },
      });

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'USER_NOT_FOUND' },
        });
      }

      // Verify old password
      const isOldPasswordValid = await bcryptjs.compare(
        args.oldPassword,
        user.passwordHash
      );
      if (!isOldPasswordValid) {
        throw new GraphQLError('Invalid password', {
          extensions: { code: 'INVALID_PASSWORD' },
        });
      }

      // Hash new password
      const newPasswordHash = await bcryptjs.hash(args.newPassword, 10);

      await prisma.user.update({
        where: { id: context.userId },
        data: { passwordHash: newPasswordHash },
      });

      return {
        success: true,
        message: 'Password changed successfully',
        user: null,
        token: null,
        refreshToken: null,
      };
    },

    // Update user role (admin only)
    updateUserRole: async (
      _parent: any,
      args: { userId: string; role: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check if requester is admin
      const requester = await prisma.user.findUnique({
        where: { id: context.userId },
      });

      if (requester?.role !== 'ADMIN') {
        throw new GraphQLError('Forbidden', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const user = await prisma.user.update({
        where: { id: args.userId },
        data: { role: args.role },
      });

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    },

    // Deactivate user (admin only)
    deactivateUser: async (
      _parent: any,
      args: { userId: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check if requester is admin
      const requester = await prisma.user.findUnique({
        where: { id: context.userId },
      });

      if (requester?.role !== 'ADMIN') {
        throw new GraphQLError('Forbidden', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const user = await prisma.user.update({
        where: { id: args.userId },
        data: { isActive: false },
      });

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    },

    // Activate user (admin only)
    activateUser: async (
      _parent: any,
      args: { userId: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check if requester is admin
      const requester = await prisma.user.findUnique({
        where: { id: context.userId },
      });

      if (requester?.role !== 'ADMIN') {
        throw new GraphQLError('Forbidden', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const user = await prisma.user.update({
        where: { id: args.userId },
        data: { isActive: true },
      });

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    },
  },

  // Federation reference resolver
  User: {
    __resolveReference: async (user: { id: string }) => {
      return prisma.user.findUnique({
        where: { id: user.id },
      });
    },
  },
};
