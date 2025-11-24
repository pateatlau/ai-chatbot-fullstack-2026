/**
 * Health Check Routes for Chatbot Service
 * Provides liveness and readiness probes for Kubernetes/Docker
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { connectMongoDB } from '../services/mongodb';

const router = express.Router();
const prisma = new PrismaClient();

// Cache for health check results to avoid overwhelming databases
let lastHealthCheck: any = null;
let lastHealthCheckTime = 0;
const HEALTH_CACHE_TTL = 5000; // 5 seconds

/**
 * Liveness Probe - Is the service alive?
 * Returns 200 if the service process is running
 * Used by Kubernetes to restart unhealthy containers
 */
router.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
  });
});

/**
 * Readiness Probe - Is the service ready to handle traffic?
 * Returns 200 only if all dependencies are available
 * Used by Kubernetes to route traffic
 */
router.get('/health/ready', async (req: Request, res: Response) => {
  // Use cached result if recent
  const now = Date.now();
  if (lastHealthCheck && now - lastHealthCheckTime < HEALTH_CACHE_TTL) {
    const statusCode = lastHealthCheck.ready ? 200 : 503;
    return res.status(statusCode).json(lastHealthCheck);
  }

  const health = {
    ready: true,
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, any>,
  };

  try {
    // Check PostgreSQL connection
    const pgStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const pgLatency = Date.now() - pgStart;
    health.checks.postgresql = {
      status: 'up',
      latency: pgLatency,
      message: 'Connected',
    };
  } catch (error: any) {
    health.ready = false;
    health.checks.postgresql = {
      status: 'down',
      error: error.message,
      message: 'Connection failed',
    };
  }

  try {
    // Check MongoDB connection
    const mongoStart = Date.now();
    if (!mongoose.connection.readyState) {
      await connectMongoDB();
    }
    await mongoose.connection.db?.admin().ping();
    const mongoLatency = Date.now() - mongoStart;
    health.checks.mongodb = {
      status: 'up',
      latency: mongoLatency,
      message: 'Connected',
      readyState: mongoose.connection.readyState,
    };
  } catch (error: any) {
    health.ready = false;
    health.checks.mongodb = {
      status: 'down',
      error: error.message,
      message: 'Connection failed',
    };
  }

  // Cache the result
  lastHealthCheck = health;
  lastHealthCheckTime = now;

  const statusCode = health.ready ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * Full Health Check - Detailed status of all services
 * Returns comprehensive diagnostic information
 */
router.get('/health', async (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {} as Record<string, any>,
    configuration: {
      mongodbReadPercentage: parseInt(
        process.env.MONGODB_READ_PERCENTAGE || '0'
      ),
      dualReadEnabled: process.env.DUAL_READ_ENABLED === 'true',
      dualWriteEnabled: process.env.DUAL_WRITE_ENABLED === 'true',
    },
  };

  // PostgreSQL Health
  try {
    const pgStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const pgLatency = Date.now() - pgStart;

    health.services.postgresql = {
      status: 'up',
      latency: pgLatency,
      message: 'Connected and responsive',
    };
  } catch (error: any) {
    health.status = 'degraded';
    health.services.postgresql = {
      status: 'down',
      error: error.message,
      message: 'PostgreSQL connection failed',
    };
  }

  // MongoDB Health
  try {
    const mongoStart = Date.now();
    if (!mongoose.connection.readyState) {
      await connectMongoDB();
    }

    await mongoose.connection.db?.admin().ping();
    const mongoLatency = Date.now() - mongoStart; // Get database stats
    const dbStats = await mongoose.connection.db?.stats();

    health.services.mongodb = {
      status: 'up',
      latency: mongoLatency,
      message: 'Connected and responsive',
      readyState: mongoose.connection.readyState,
      readyStateLabel: [
        'disconnected',
        'connected',
        'connecting',
        'disconnecting',
      ][mongoose.connection.readyState],
      database: mongoose.connection.name,
      collections: dbStats?.collections || 0,
      dataSize: dbStats?.dataSize || 0,
      storageSize: dbStats?.storageSize || 0,
    };
  } catch (error: any) {
    health.status = 'degraded';
    health.services.mongodb = {
      status: 'down',
      error: error.message,
      message: 'MongoDB connection failed',
    };
  }

  // Overall health assessment
  const allServicesUp = Object.values(health.services).every(
    (service: any) => service.status === 'up'
  );

  if (!allServicesUp) {
    health.status = health.status === 'degraded' ? 'degraded' : 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * Metrics endpoint for Prometheus
 * Returns metrics in Prometheus format
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics: string[] = [];

    // Add basic process metrics
    metrics.push(`# HELP chatbot_uptime_seconds Service uptime in seconds`);
    metrics.push(`# TYPE chatbot_uptime_seconds gauge`);
    metrics.push(`chatbot_uptime_seconds ${process.uptime()}`);

    metrics.push(`# HELP chatbot_memory_usage_bytes Memory usage in bytes`);
    metrics.push(`# TYPE chatbot_memory_usage_bytes gauge`);
    const memUsage = process.memoryUsage();
    metrics.push(`chatbot_memory_usage_bytes{type="rss"} ${memUsage.rss}`);
    metrics.push(
      `chatbot_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}`
    );
    metrics.push(
      `chatbot_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}`
    );
    metrics.push(
      `chatbot_memory_usage_bytes{type="external"} ${memUsage.external}`
    );

    // Add MongoDB read percentage
    metrics.push(
      `# HELP chatbot_mongodb_read_percentage MongoDB read traffic percentage`
    );
    metrics.push(`# TYPE chatbot_mongodb_read_percentage gauge`);
    metrics.push(
      `chatbot_mongodb_read_percentage ${process.env.MONGODB_READ_PERCENTAGE || 0}`
    );

    // Add dual-read status
    metrics.push(
      `# HELP chatbot_dual_read_enabled Dual-read mode status (0=disabled, 1=enabled)`
    );
    metrics.push(`# TYPE chatbot_dual_read_enabled gauge`);
    metrics.push(
      `chatbot_dual_read_enabled ${process.env.DUAL_READ_ENABLED === 'true' ? 1 : 0}`
    );

    // Add database health
    try {
      await prisma.$queryRaw`SELECT 1`;
      metrics.push(
        `# HELP chatbot_postgresql_healthy PostgreSQL health status`
      );
      metrics.push(`# TYPE chatbot_postgresql_healthy gauge`);
      metrics.push(`chatbot_postgresql_healthy 1`);
    } catch {
      metrics.push(`chatbot_postgresql_healthy 0`);
    }

    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db?.admin().ping();
        metrics.push(`# HELP chatbot_mongodb_healthy MongoDB health status`);
        metrics.push(`# TYPE chatbot_mongodb_healthy gauge`);
        metrics.push(`chatbot_mongodb_healthy 1`);
      } else {
        metrics.push(`chatbot_mongodb_healthy 0`);
      }
    } catch {
      metrics.push(`chatbot_mongodb_healthy 0`);
    }

    res.set('Content-Type', 'text/plain; version=0.0.4');
    res.send(metrics.join('\n') + '\n');
  } catch (error: any) {
    res.status(500).send(`# Error generating metrics: ${error.message}\n`);
  }
});

export default router;
