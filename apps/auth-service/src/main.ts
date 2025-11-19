import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { swaggerSpec } from './swagger';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import jwt from 'jsonwebtoken';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// Initialize clients for health checks
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies from requests

// CORS middleware (for development - updated for cookie support)
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true'); // Allow credentials (cookies)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JWT authentication context builder
const buildContext = (req: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  let userId: string | undefined;

  if (token) {
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret'
      );
      userId = decoded.userId;
    } catch (err) {
      // Token invalid or expired
    }
  }

  return { userId, token };
};

// Initialize Apollo Server
let apolloServer: ApolloServer;

const startApolloServer = async () => {
  apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();
  return apolloServer;
};

// Swagger API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Auth Service API Documentation',
  })
);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the auth service and its dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: Service is degraded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
// Enhanced health check with dependency status
app.get('/health', async (_req, res) => {
  const startTime = Date.now();
  const health: any = {
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dependencies: {},
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.dependencies.database = {
      status: 'up',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    health.dependencies.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    health.status = 'degraded';
  }

  // Check Redis
  const redisStart = Date.now();
  try {
    await redis.ping();
    health.dependencies.redis = {
      status: 'up',
      responseTime: Date.now() - redisStart,
    };
  } catch (error) {
    health.dependencies.redis = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    health.status = 'degraded';
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  health.memory = {
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Routes
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.send({ message: 'Auth Service API', version: '1.0.0' });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

// Start server with Apollo GraphQL
const startServer = async () => {
  try {
    // Start Apollo Server
    await startApolloServer();

    // Mount Apollo GraphQL middleware
    app.use(
      '/graphql',
      expressMiddleware(apolloServer, {
        context: async ({ req }) => buildContext(req),
      })
    );

    // Start Express server
    app.listen(port, host, () => {
      console.log(`[ ready ] Auth Service running at http://${host}:${port}`);
      console.log(
        `[ ready ] GraphQL endpoint at http://${host}:${port}/graphql`
      );
      console.log(`[ ready ] REST API at http://${host}:${port}/api/auth`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
