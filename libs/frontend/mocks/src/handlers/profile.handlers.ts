import { http, HttpResponse, delay } from 'msw';

// Mock user database (shared with auth handlers)
const mockUsers = new Map<string, any>();

// Helper to extract user ID from token
function getUserIdFromToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));

    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload.sub;
  } catch (error) {
    return null;
  }
}

// Helper to find user by ID
function findUserById(userId: string): any | null {
  return Array.from(mockUsers.values()).find((u) => u.id === userId) || null;
}

export const profileHandlers = [
  // Get current user profile
  http.get('/api/users/me', async ({ request }) => {
    await delay(300);

    const userId = getUserIdFromToken(request.headers.get('Authorization'));

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = findUserById(userId);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar || null,
      isActive: user.isActive ?? true,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }),

  // Update current user profile
  http.patch('/api/users/me', async ({ request }) => {
    await delay(500);

    const userId = getUserIdFromToken(request.headers.get('Authorization'));

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = findUserById(userId);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = (await request.json()) as {
      name?: string;
      avatar?: string;
    };

    // Validate name if provided
    if (body.name !== undefined) {
      if (body.name.length < 2 || body.name.length > 100) {
        return HttpResponse.json(
          { message: 'Name must be between 2 and 100 characters' },
          { status: 400 }
        );
      }
      user.name = body.name;
    }

    // Validate avatar if provided
    if (body.avatar !== undefined) {
      if (body.avatar && !body.avatar.startsWith('http')) {
        return HttpResponse.json(
          { message: 'Avatar must be a valid URL' },
          { status: 400 }
        );
      }
      user.avatar = body.avatar;
    }

    user.updatedAt = new Date().toISOString();

    // Update user in mockUsers map
    for (const [email, userData] of mockUsers.entries()) {
      if (userData.id === userId) {
        mockUsers.set(email, user);
        break;
      }
    }

    return HttpResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar || null,
      isActive: user.isActive ?? true,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }),

  // Change password
  http.post('/api/users/change-password', async ({ request }) => {
    await delay(600);

    const userId = getUserIdFromToken(request.headers.get('Authorization'));

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = findUserById(userId);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = (await request.json()) as {
      currentPassword: string;
      newPassword: string;
    };

    // Validate required fields
    if (!body.currentPassword || !body.newPassword) {
      return HttpResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Verify current password
    if (user.password !== body.currentPassword) {
      return HttpResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (body.newPassword.length < 8) {
      return HttpResponse.json(
        { message: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(body.newPassword)) {
      return HttpResponse.json(
        { message: 'New password must contain an uppercase letter' },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(body.newPassword)) {
      return HttpResponse.json(
        { message: 'New password must contain a lowercase letter' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(body.newPassword)) {
      return HttpResponse.json(
        { message: 'New password must contain a number' },
        { status: 400 }
      );
    }

    if (!/[^A-Za-z0-9]/.test(body.newPassword)) {
      return HttpResponse.json(
        { message: 'New password must contain a special character' },
        { status: 400 }
      );
    }

    // Update password
    user.password = body.newPassword;
    user.updatedAt = new Date().toISOString();

    // Update user in mockUsers map
    for (const [email, userData] of mockUsers.entries()) {
      if (userData.id === userId) {
        mockUsers.set(email, user);
        break;
      }
    }

    return HttpResponse.json({
      message: 'Password changed successfully',
    });
  }),

  // Get user settings (preferences)
  http.get('/api/users/settings', async ({ request }) => {
    await delay(250);

    const userId = getUserIdFromToken(request.headers.get('Authorization'));

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = findUserById(userId);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return mock settings
    return HttpResponse.json({
      theme: user.settings?.theme || 'light',
      language: user.settings?.language || 'en',
      notifications: {
        email: user.settings?.notifications?.email ?? true,
        push: user.settings?.notifications?.push ?? true,
      },
    });
  }),

  // Update user settings (preferences)
  http.patch('/api/users/settings', async ({ request }) => {
    await delay(400);

    const userId = getUserIdFromToken(request.headers.get('Authorization'));

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = findUserById(userId);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = (await request.json()) as {
      theme?: 'light' | 'dark';
      language?: string;
      notifications?: {
        email?: boolean;
        push?: boolean;
      };
    };

    // Initialize settings if not exists
    if (!user.settings) {
      user.settings = {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
        },
      };
    }

    // Update settings
    if (body.theme) {
      user.settings.theme = body.theme;
    }

    if (body.language) {
      user.settings.language = body.language;
    }

    if (body.notifications) {
      if (body.notifications.email !== undefined) {
        user.settings.notifications.email = body.notifications.email;
      }
      if (body.notifications.push !== undefined) {
        user.settings.notifications.push = body.notifications.push;
      }
    }

    user.updatedAt = new Date().toISOString();

    // Update user in mockUsers map
    for (const [email, userData] of mockUsers.entries()) {
      if (userData.id === userId) {
        mockUsers.set(email, user);
        break;
      }
    }

    return HttpResponse.json(user.settings);
  }),

  // Get active sessions
  http.get('/api/users/sessions', async ({ request }) => {
    await delay(300);

    const userId = getUserIdFromToken(request.headers.get('Authorization'));

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = findUserById(userId);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return mock sessions
    return HttpResponse.json([
      {
        id: 'session-1',
        device: 'Chrome on macOS',
        location: 'San Francisco, CA',
        ipAddress: '192.168.1.1',
        lastActive: new Date().toISOString(),
        current: true,
      },
      {
        id: 'session-2',
        device: 'Safari on iPhone',
        location: 'San Francisco, CA',
        ipAddress: '192.168.1.2',
        lastActive: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        current: false,
      },
    ]);
  }),

  // Revoke session
  http.delete('/api/users/sessions/:sessionId', async ({ request, params }) => {
    await delay(400);

    const userId = getUserIdFromToken(request.headers.get('Authorization'));

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = findUserById(userId);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { sessionId } = params;

    // Prevent revoking current session
    if (sessionId === 'session-1') {
      return HttpResponse.json(
        { message: 'Cannot revoke current session' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      message: 'Session revoked successfully',
    });
  }),
];

// Export utility to seed profile mock data (shares users with auth)
export function seedProfileMockUsers(users: Map<string, any>) {
  // Add avatar and settings to existing users
  for (const [email, user] of users.entries()) {
    if (!user.avatar) {
      user.avatar = null;
    }
    if (!user.settings) {
      user.settings = {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
        },
      };
    }
    users.set(email, user);
  }

  console.log('🎭 Profile mock data seeded');
}
