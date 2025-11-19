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
  name?: string;
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

    // Get user by ID
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

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'INVALID_CREDENTIALS' },
        });
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
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
          name: user.name,
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
      const { email, password, name } = args.input;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new GraphQLError('Email already registered', {
          extensions: { code: 'EMAIL_EXISTS' },
        });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
          role: 'USER',
          isActive: true,
        },
      });

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
          name: user.name,
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
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        refreshToken: null,
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
