import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
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
import redis from '../lib/redis';
import { EmailService } from './email.service';

export class AuthService {
  async register(input: CreateUserInput): Promise<LoginResponse> {
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

    // Create user with specified role
    const userId = uuidv4();
    const userRole = input.role;
    await query(
      `INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [userId, input.email, hashedPassword, input.name, userRole, true]
    );

    // Auto-login user after registration
    // Generate tokens
    // @ts-ignore - TypeScript strict mode JWT secret type issue
    const accessToken = jwt.sign(
      {
        userId: userId,
        email: input.email,
        role: userRole,
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
        userId: userId,
        type: 'refresh',
      },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await query(
      `INSERT INTO sessions (id, "userId", "refreshToken", "expiresAt", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [sessionId, userId, refreshToken, expiresAt]
    );

    // Return login response format
    return {
      user: {
        id: userId,
        email: input.email,
        name: input.name,
        role: userRole,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
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
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    try {
      // Verify the refresh token to get user info
      const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

      // Delete session from database
      await query('DELETE FROM sessions WHERE "refreshToken" = $1', [
        refreshToken,
      ]);

      // Add refresh token to blacklist in Redis
      const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
      await redis.setex(`blacklist:refresh:${refreshToken}`, expiresIn, '1');

      // If there's an access token in the request (should be checked in controller)
      // we should blacklist it too, but that requires middleware changes
    } catch (error) {
      // Even if token is invalid, try to delete session
      await query('DELETE FROM sessions WHERE "refreshToken" = $1', [
        refreshToken,
      ]);
    }

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

  /**
   * Request password reset - generates token and sends email
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Find user by email
    const userResult = await query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );

    // Always return success to prevent email enumeration
    if (userResult.rows.length === 0) {
      return {
        message:
          'If an account exists with that email, you will receive a password reset link.',
      };
    }

    const user = userResult.rows[0];

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Invalidate any existing unused tokens for this user
    await query(
      `UPDATE password_reset_tokens 
       SET used = true 
       WHERE "userId" = $1 AND used = false`,
      [user.id]
    );

    // Store hashed token in database
    await query(
      `INSERT INTO password_reset_tokens (id, "userId", token, "expiresAt", used, "createdAt")
       VALUES ($1, $2, $3, $4, false, NOW())`,
      [uuidv4(), user.id, hashedToken, expiresAt]
    );

    // Send password reset email
    try {
      await EmailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name
      );
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't throw error - user shouldn't know if email failed
    }

    return {
      message:
        'If an account exists with that email, you will receive a password reset link.',
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    // Hash the token to match what's stored
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid token
    const tokenResult = await query(
      `SELECT * FROM password_reset_tokens 
       WHERE token = $1 AND used = false AND "expiresAt" > NOW()`,
      [hashedToken]
    );

    if (tokenResult.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    const resetToken = tokenResult.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await query(
      `UPDATE users 
       SET password = $1, "updatedAt" = NOW()
       WHERE id = $2`,
      [hashedPassword, resetToken.userId]
    );

    // Mark token as used
    await query(
      `UPDATE password_reset_tokens 
       SET used = true 
       WHERE id = $1`,
      [resetToken.id]
    );

    // Invalidate all existing sessions for security
    await query('DELETE FROM sessions WHERE "userId" = $1', [
      resetToken.userId,
    ]);

    return {
      message:
        'Password reset successfully. Please login with your new password.',
    };
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const result = await redis.get(`blacklist:refresh:${token}`);
      return result !== null;
    } catch (error) {
      console.error('Redis error checking blacklist:', error);
      return false; // Fail open
    }
  }

  /**
   * Blacklist an access token (for logout)
   */
  async blacklistAccessToken(token: string): Promise<void> {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

      if (expiresIn > 0) {
        await redis.setex(`blacklist:access:${token}`, expiresIn, '1');
      }
    } catch (error) {
      console.error('Error blacklisting token:', error);
    }
  }

  /**
   * Check if access token is blacklisted
   */
  async isAccessTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const result = await redis.get(`blacklist:access:${token}`);
      return result !== null;
    } catch (error) {
      console.error('Redis error checking access token blacklist:', error);
      return false; // Fail open
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    input: { name?: string; avatar?: string | null }
  ): Promise<{ message: string; user: any }> {
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(input.name);
      paramIndex++;
    }

    if (input.avatar !== undefined) {
      updates.push(`avatar = $${paramIndex}`);
      values.push(input.avatar);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push(`"updatedAt" = NOW()`);
    values.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, role, avatar, "isActive", "createdAt", "updatedAt"
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    return {
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    // Get user with password
    const userResult = await query(
      'SELECT id, password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await query(
      `UPDATE users 
       SET password = $1, "updatedAt" = NOW()
       WHERE id = $2`,
      [hashedPassword, userId]
    );

    // Invalidate all existing sessions for security
    await query('DELETE FROM sessions WHERE "userId" = $1', [userId]);

    return {
      message: 'Password changed successfully. Please login again.',
    };
  }
}
