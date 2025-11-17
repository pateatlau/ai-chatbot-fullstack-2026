import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Admin Service API',
      version: '1.0.0',
      description: 'Administrative service for user management, analytics, and system monitoring',
      contact: {
        name: 'API Support',
        email: 'support@myapp.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
      {
        url: 'https://api.myapp.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (Admin role required)',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        UserStats: {
          type: 'object',
          properties: {
            totalUsers: {
              type: 'number',
              description: 'Total number of users',
            },
            activeUsers: {
              type: 'number',
              description: 'Users active in last 30 days',
            },
            newUsersThisMonth: {
              type: 'number',
              description: 'New registrations this month',
            },
            adminUsers: {
              type: 'number',
              description: 'Number of admin users',
            },
          },
        },
        ChatStats: {
          type: 'object',
          properties: {
            totalConversations: {
              type: 'number',
            },
            totalMessages: {
              type: 'number',
            },
            averageMessagesPerConversation: {
              type: 'number',
            },
            messagesThisMonth: {
              type: 'number',
            },
          },
        },
        SystemStats: {
          type: 'object',
          properties: {
            uptime: {
              type: 'number',
              description: 'System uptime in seconds',
            },
            memoryUsage: {
              type: 'object',
              properties: {
                heapUsed: { type: 'string' },
                heapTotal: { type: 'string' },
                rss: { type: 'string' },
              },
            },
            databaseConnections: {
              type: 'number',
            },
            redisConnected: {
              type: 'boolean',
            },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
            },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            action: {
              type: 'string',
              description: 'Action performed',
            },
            resource: {
              type: 'string',
              description: 'Resource affected',
            },
            details: {
              type: 'object',
              description: 'Additional details',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded'],
            },
            service: {
              type: 'string',
              example: 'admin-service',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            uptime: {
              type: 'number',
            },
            dependencies: {
              type: 'object',
              properties: {
                database: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['up', 'down'],
                    },
                    responseTime: {
                      type: 'number',
                    },
                  },
                },
              },
            },
            memory: {
              type: 'object',
              properties: {
                heapUsed: { type: 'string' },
                heapTotal: { type: 'string' },
                rss: { type: 'string' },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints (Admin only)',
      },
      {
        name: 'Analytics',
        description: 'System analytics and statistics (Admin only)',
      },
      {
        name: 'Audit',
        description: 'Audit logs and monitoring (Admin only)',
      },
      {
        name: 'Health',
        description: 'Service health and monitoring',
      },
    ],
  },
  apis: ['./apps/admin-service/src/routes/*.ts', './apps/admin-service/src/main.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
