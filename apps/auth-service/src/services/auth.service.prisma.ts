import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type {
  LoginInput,
  LoginResponse,
  CreateUserInput,
} from '@myapp/shared/types';
import {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} from '../config/jwt.config';

// Lazy initialization of Prisma Client
let prisma: PrismaClient | null = null;

function getPrismaClient() {
  if (!prisma) {
    console.log(
      'Initializing Prisma Client with DATABASE_URL:',
      process.env.DATABASE_URL
    );
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ['error', 'warn'],
    });
  }
  return prisma;
}

export class AuthService {
  async register(
    input: CreateUserInput
  ): Promise<{ message: string; userId: string }> {
    const prisma = getPrismaClient();
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: 'USER',
      },
    });

    return {
      message: 'User registered successfully',
      userId: user.id,
    };
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    const prisma = getPrismaClient();
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(
      user.id,
      user.email,
      user.role
    );
    const refreshToken = this.generateRefreshToken(user.id);

    // Calculate expiration (7 days from now if rememberMe, 1 day otherwise)
    const expiresAt = new Date();
    if (input.rememberMe) {
      expiresAt.setDate(expiresAt.getDate() + 7);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 1);
    }

    // Store refresh token in database
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'USER' | 'ADMIN' | 'MODERATOR',
      },
    };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const prisma = getPrismaClient();
    // Delete session from database
    await prisma.session.deleteMany({
      where: { refreshToken },
    });

    return { message: 'Logged out successfully' };
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const prisma = getPrismaClient();
    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // Check if session exists and is not expired
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (new Date() > session.expiresAt) {
      // Delete expired session
      await prisma.session.delete({
        where: { id: session.id },
      });
      throw new Error('Session expired');
    }

    // Generate new tokens
    const newAccessToken = this.generateAccessToken(
      session.user.id,
      session.user.email,
      session.user.role
    );
    const newRefreshToken = this.generateRefreshToken(session.user.id);

    // Update session with new refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  async getMe(userId: string) {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  private generateAccessToken(
    userId: string,
    email: string,
    role: string
  ): string {
    return jwt.sign(
      {
        userId,
        email,
        role,
        type: 'access',
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      {
        userId,
        type: 'refresh',
      },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );
  }
}
