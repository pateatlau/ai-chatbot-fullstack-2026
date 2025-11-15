import { http, HttpResponse, delay } from 'msw';

// Mock user database
const mockUsers = new Map<string, any>();

// Mock JWT token generator
function generateMockToken(userId: string, role: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    })
  );
  return `${header}.${payload}.mock-signature`;
}

export const authHandlers = [
  // Register endpoint
  http.post('/api/auth/register', async ({ request }) => {
    await delay(800); // Simulate network delay

    const body = (await request.json()) as {
      name: string;
      email: string;
      password: string;
      role: string;
    };

    // Validate required fields
    if (!body.email || !body.password || !body.name || !body.role) {
      return HttpResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (mockUsers.has(body.email)) {
      return HttpResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create mock user
    const userId = `user-${Date.now()}`;
    const user = {
      id: userId,
      email: body.email,
      name: body.name,
      role: body.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.set(body.email, { ...user, password: body.password });

    // Generate tokens
    const accessToken = generateMockToken(userId, body.role);
    const refreshToken = generateMockToken(userId, body.role);

    return HttpResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
      { status: 201 }
    );
  }),

  // Login endpoint
  http.post('/api/auth/login', async ({ request }) => {
    await delay(600); // Simulate network delay

    const body = (await request.json()) as {
      email: string;
      password: string;
    };

    // Validate required fields
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = mockUsers.get(body.email);

    if (!user || user.password !== body.password) {
      return HttpResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = generateMockToken(user.id, user.role);
    const refreshToken = generateMockToken(user.id, user.role);

    return HttpResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  }),

  // Get current user endpoint
  http.get('/api/auth/me', async ({ request }) => {
    await delay(300);

    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Decode mock token (simplified)
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) {
        throw new Error('Invalid token');
      }

      const payload = JSON.parse(atob(parts[1]));

      // Check if token is expired
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return HttpResponse.json({ message: 'Token expired' }, { status: 401 });
      }

      // Find user by ID
      const user = Array.from(mockUsers.values()).find(
        (u) => u.id === payload.sub
      );

      if (!user) {
        return HttpResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      return HttpResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  }),

  // Logout endpoint
  http.post('/api/auth/logout', async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Refresh token endpoint
  http.post('/api/auth/refresh', async ({ request }) => {
    await delay(400);

    const body = (await request.json()) as { refreshToken: string };

    if (!body.refreshToken) {
      return HttpResponse.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    try {
      const parts = body.refreshToken.split('.');
      if (parts.length !== 3 || !parts[1]) {
        throw new Error('Invalid token');
      }

      const payload = JSON.parse(atob(parts[1]));

      // Check if token is expired
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return HttpResponse.json(
          { message: 'Refresh token expired' },
          { status: 401 }
        );
      }

      // Generate new tokens
      const accessToken = generateMockToken(payload.sub, payload.role);
      const refreshToken = generateMockToken(payload.sub, payload.role);

      return HttpResponse.json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return HttpResponse.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      );
    }
  }),
];

// Export utility to seed mock data
export function seedMockUsers() {
  // Clear existing users
  mockUsers.clear();

  // Add some default users
  mockUsers.set('admin@example.com', {
    id: 'user-admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    password: 'Admin@123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  mockUsers.set('user@example.com', {
    id: 'user-regular-1',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'USER',
    password: 'User@123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log('🎭 Mock users seeded:', mockUsers.size);
}
