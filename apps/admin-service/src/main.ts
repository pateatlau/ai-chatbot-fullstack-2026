import * as dotenv from 'dotenv';
import * as path from 'path';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import adminRoutes from './routes/admin.routes';
import { PrismaClient } from '@prisma/client';
import { swaggerSpec } from './swagger';
import jwt from 'jsonwebtoken';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

// Load environment variables from the workspace root
// In development: apps/admin-service/.env
// In production (dist): look up to workspace root
const possibleEnvPaths = [
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../../../apps/admin-service/.env'),
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), 'apps/admin-service/.env'),
  path.join(process.cwd(), '.env'),
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(
      `[dotenv] Loaded ${Object.keys(result.parsed || {}).length} variables from ${envPath}`
    );
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('[dotenv] Warning: Could not load .env from any path');
}

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3002;

const app = express();

// Initialize Prisma client for health checks
const prisma = new PrismaClient();

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173', // Shell
      'http://localhost:5174', // Auth MFE
      'http://localhost:5175', // Chatbot MFE
      'http://localhost:5176', // Admin MFE
      'http://localhost:5177', // Profile MFE
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(cookieParser()); // Parse cookies for HttpOnly token access
app.use(express.json());

// JWT context builder for GraphQL
interface JWTContext {
  userId?: string;
  token?: string;
}

const buildContext = (req: express.Request): JWTContext => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  let userId: string | undefined;

  console.log(
    `[Admin Service] Received auth header: ${authHeader ? 'YES' : 'NO'}`
  );
  if (token) {
    console.log(`[Admin Service] Token length: ${token.length}`);
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret'
      );
      userId = decoded.userId;
      console.log(`[Admin Service] Token verified, userId: ${userId}`);
    } catch (err: any) {
      console.error(
        `[Admin Service] Token verification failed:`,
        err?.message || err
      );
    }
  } else {
    console.warn(`[Admin Service] No token provided`);
  }

  return { userId, token };
};

// Initialize Apollo Server
let apolloServer: ApolloServer;
(async () => {
  const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

  apolloServer = new ApolloServer({
    schema,
  });
  await apolloServer.start();

  app.use(
    '/graphql',
    cors<express.Request>({
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
      ],
      credentials: true,
    }),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => buildContext(req),
    })
  );
})();

// Swagger API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Admin Service API Documentation',
  })
);

// Root endpoint
app.get('/', (_req, res) => {
  res.send({ message: 'Admin Service API', version: '1.0.0' });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the admin service and its dependencies
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
    service: 'admin-service',
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
app.use('/api/admin', adminRoutes);

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  }
);

app.listen(port, host, () => {
  console.log(`[ ready ] Admin Service running at http://${host}:${port}`);
  console.log(`[ info  ] API endpoints: http://${host}:${port}/api/admin`);
});
