import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import chatRoutes from './routes/chat.routes';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import OpenAI from 'openai';
import { swaggerSpec } from './swagger';
import jwt from 'jsonwebtoken';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

// Load environment variables with smart path resolution
const envPath =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../../../apps/chatbot-service/.env')
    : path.join(__dirname, '../../.env');

let result = dotenv.config({ path: envPath });

// Try alternative paths if first attempt fails
if (result.error) {
  const altPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '../../../.env'),
    path.join(__dirname, '../../apps/chatbot-service/.env'),
  ];

  for (const altPath of altPaths) {
    result = dotenv.config({ path: altPath });
    if (!result.error) {
      console.log(
        `[dotenv] Loaded ${Object.keys(result.parsed || {}).length} variables from ${altPath}`
      );
      break;
    }
  }
}

if (!result.error && result.parsed) {
  console.log(`[dotenv] Loaded ${Object.keys(result.parsed).length} variables`);
}

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

const app = express();

// Initialize clients for health checks
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-api-key',
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Chatbot Service API Documentation',
  })
);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the chatbot service and its dependencies (Database, Redis, OpenAI)
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
    service: 'chatbot-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dependencies: {},
    config: {
      useMockAI: process.env.USE_MOCK_AI === 'true',
    },
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

  // Check OpenAI (only if not using mock)
  if (process.env.USE_MOCK_AI !== 'true' && process.env.OPENAI_API_KEY) {
    const openaiStart = Date.now();
    try {
      // Simple API check - list models endpoint
      await openai.models.list();
      health.dependencies.openai = {
        status: 'up',
        responseTime: Date.now() - openaiStart,
      };
    } catch (error) {
      health.dependencies.openai = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      // OpenAI down is not critical if we have mock mode
      if (process.env.USE_MOCK_AI !== 'true') {
        health.status = 'degraded';
      }
    }
  } else {
    health.dependencies.openai = {
      status: 'mock',
      message: 'Using mock AI responses',
    };
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

// API routes
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

// JWT context builder for GraphQL
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
  const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

  apolloServer = new ApolloServer({
    schema,
  });

  await apolloServer.start();
  return apolloServer;
};

// Start server with GraphQL support
const startServer = async () => {
  try {
    // Start Apollo Server
    await startApolloServer();

    // Mount Apollo GraphQL middleware BEFORE REST routes
    app.use(
      '/graphql',
      expressMiddleware(apolloServer, {
        context: async ({ req }) => buildContext(req),
      })
    );

    // Then start Express server
    app.listen(port, host, () => {
      console.log(
        `[ ready ] Chatbot Service running at http://${host}:${port}`
      );
      console.log(
        `[ ready ] GraphQL endpoint at http://${host}:${port}/graphql`
      );
      console.log(`[ ready ] REST API at http://${host}:${port}/api/chat`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
