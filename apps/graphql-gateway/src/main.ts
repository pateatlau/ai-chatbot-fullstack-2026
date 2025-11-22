import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} from '@apollo/gateway';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

// Subgraph URLs
const AUTH_SUBGRAPH_URL =
  process.env.AUTH_SUBGRAPH_URL || 'http://localhost:3000/graphql';
const CHATBOT_SUBGRAPH_URL =
  process.env.CHATBOT_SUBGRAPH_URL || 'http://localhost:3001/graphql';
const ADMIN_SUBGRAPH_URL =
  process.env.ADMIN_SUBGRAPH_URL || 'http://localhost:3002/graphql';

interface ContextValue {
  token?: string;
}

async function startServer() {
  try {
    // Create Apollo Gateway with header forwarding
    const gateway = new ApolloGateway({
      supergraphSdl: new IntrospectAndCompose({
        subgraphs: [
          { name: 'auth', url: AUTH_SUBGRAPH_URL },
          { name: 'chatbot', url: CHATBOT_SUBGRAPH_URL },
          { name: 'admin', url: ADMIN_SUBGRAPH_URL },
        ],
        pollIntervalInMs: 10000, // Poll every 10 seconds
      }),
      buildService({ url }) {
        return new RemoteGraphQLDataSource({
          url,
          willSendRequest({ request, context }: any) {
            // Forward the authorization header to subgraphs
            if (context.token) {
              request.http.headers.set(
                'authorization',
                `Bearer ${context.token}`
              );
            }
          },
        });
      },
    });

    // Create Apollo Server
    const server = new ApolloServer<ContextValue>({
      gateway,
    });

    // Start Apollo Server
    await server.start();
    console.log('✅ Apollo Server started');

    // Create Express app
    const app = express();

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Readiness check endpoint
    app.get('/ready', (req, res) => {
      res.json({
        ready: true,
        timestamp: new Date().toISOString(),
      });
    });

    // GraphQL endpoint with middleware
    app.use(
      '/graphql',
      cors<cors.CorsRequest>({
        origin: [
          'http://localhost:5173', // Shell
          'http://localhost:5174', // Auth MFE
          'http://localhost:5175', // Chatbot MFE
          'http://localhost:5176', // Admin MFE
          'http://localhost:5177', // Profile MFE
        ],
        credentials: true, // Allow cookies
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
      express.json({ limit: '50mb' }),
      expressMiddleware(server, {
        context: async ({ req }: any) => ({
          token: req.headers.authorization?.replace('Bearer ', ''),
        }),
      })
    );

    // Start Express server
    app.listen(port, host, () => {
      console.log(
        `🚀 GraphQL Gateway running on http://${host}:${port}/graphql`
      );
      console.log(`💚 Health check: http://${host}:${port}/health`);
      console.log(`📊 Ready check: http://${host}:${port}/ready`);
      console.log(`\nConnected subgraphs:`);
      console.log(`  - Auth:    ${AUTH_SUBGRAPH_URL}`);
      console.log(`  - Chatbot: ${CHATBOT_SUBGRAPH_URL}`);
      console.log(`  - Admin:   ${ADMIN_SUBGRAPH_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
