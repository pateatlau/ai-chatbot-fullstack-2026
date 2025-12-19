import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chatbot Service API',
      version: '1.0.0',
      description:
        'AI chatbot service with OpenAI integration and Server-Sent Events streaming',
      contact: {
        name: 'API Support',
        email: 'support@myapp.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
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
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Conversation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Conversation unique identifier',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Owner user ID',
            },
            title: {
              type: 'string',
              description: 'Conversation title',
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
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            conversationId: {
              type: 'string',
              format: 'uuid',
            },
            role: {
              type: 'string',
              enum: ['user', 'assistant', 'system'],
            },
            content: {
              type: 'string',
              description: 'Message content',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CreateConversationRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              example: 'New Chat Session',
            },
          },
        },
        SendMessageRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              minLength: 1,
              maxLength: 4000,
              example: 'What is the weather today?',
            },
            conversationId: {
              type: 'string',
              format: 'uuid',
              description: 'Optional: existing conversation ID',
            },
          },
        },
        StreamResponse: {
          type: 'object',
          description: 'Server-Sent Events stream format',
          properties: {
            event: {
              type: 'string',
              enum: ['token', 'done', 'error'],
            },
            data: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'Token content or error message',
                },
                conversationId: {
                  type: 'string',
                  format: 'uuid',
                },
                messageId: {
                  type: 'string',
                  format: 'uuid',
                },
              },
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
              example: 'chatbot-service',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            uptime: {
              type: 'number',
              description: 'Service uptime in seconds',
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
                redis: {
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
                openai: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['up', 'down', 'mock'],
                    },
                    message: {
                      type: 'string',
                    },
                    responseTime: {
                      type: 'number',
                    },
                  },
                },
              },
            },
            config: {
              type: 'object',
              properties: {
                useMockAI: {
                  type: 'boolean',
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
        name: 'Conversations',
        description: 'Conversation management endpoints',
      },
      {
        name: 'Chat',
        description: 'Chat messaging and streaming',
      },
      {
        name: 'Health',
        description: 'Service health and monitoring',
      },
    ],
  },
  apis: [
    './apps/chatbot-service/src/routes/*.ts',
    './apps/chatbot-service/src/main.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
