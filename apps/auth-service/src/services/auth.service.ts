import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
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
import { query } from '../lib/db';

export class AuthService {
  async register(
    input: CreateUserInput
  ): Promise<{ message: string; userId: string }> {
    // Check if user already exists
    const existingUserResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [input.email]
    );

    if (existingUserResult.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 12);

    // Create user
    const userId = uuidv4();
    await query(
      `INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [userId, input.email, hashedPassword, input.name, 'USER', true]
    );

    return {
      message: 'User registered successfully',
      userId,
    };
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    // Find user
    const userResult = await query('SELECT * FROM users WHERE email = $1', [
      input.email,
    ]);

    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = userResult.rows[0];

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
    // @ts-ignore - TypeScript strict mode JWT secret type issue
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'access',
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const sessionId = uuidv4();
    // @ts-ignore - TypeScript strict mode JWT secret type issue
    const refreshToken = jwt.sign(
      {
        sessionId,
        userId: user.id,
        type: 'refresh',
      },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await query(
      `INSERT INTO sessions (id, "userId", "refreshToken", "expiresAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [sessionId, user.id, refreshToken, expiresAt]
    );

    // Calculate expiresIn based on JWT_EXPIRES_IN
    let expiresIn = 900; // 15 minutes default
    if (JWT_EXPIRES_IN.endsWith('m')) {
      expiresIn = parseInt(JWT_EXPIRES_IN) * 60;
    } else if (JWT_EXPIRES_IN.endsWith('h')) {
      expiresIn = parseInt(JWT_EXPIRES_IN) * 3600;
    }

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    // Delete session from database
    await query('DELETE FROM sessions WHERE "refreshToken" = $1', [
      refreshToken,
    ]);

    return { message: 'Logged out successfully' };
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // Check if session exists and is not expired
    const sessionResult = await query(
      `SELECT s.*, u.* FROM sessions s
       JOIN users u ON s."userId" = u.id
       WHERE s."refreshToken" = $1 AND s."expiresAt" > NOW()`,
      [refreshToken]
    );

    if (sessionResult.rows.length === 0) {
      throw new Error('Session not found or expired');
    }

    const session = sessionResult.rows[0];

    // Delete old session
    await query('DELETE FROM sessions WHERE id = $1', [session.id]);

    // Generate new tokens
    // @ts-ignore - TypeScript strict mode JWT secret type issue
    const newAccessToken = jwt.sign(
      {
        userId: session.userId,
        email: session.email,
        role: session.role,
        type: 'access',
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const newSessionId = uuidv4();
    // @ts-ignore - TypeScript strict mode JWT secret type issue
    const newRefreshToken = jwt.sign(
      {
        sessionId: newSessionId,
        userId: session.userId,
        type: 'refresh',
      },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    // Create new session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query(
      `INSERT INTO sessions (id, "userId", "refreshToken", "expiresAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [newSessionId, session.userId, newRefreshToken, expiresAt]
    );

    let expiresIn = 900;
    if (JWT_EXPIRES_IN.endsWith('m')) {
      expiresIn = parseInt(JWT_EXPIRES_IN) * 60;
    } else if (JWT_EXPIRES_IN.endsWith('h')) {
      expiresIn = parseInt(JWT_EXPIRES_IN) * 3600;
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    };
  }

  async getMe(userId: string) {
    const userResult = await query(
      `SELECT id, email, name, role, avatar, "isActive", "createdAt", "updatedAt"
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    return userResult.rows[0];
  }
}
