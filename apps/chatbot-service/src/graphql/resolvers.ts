import { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { chatEventEmitter } from '../lib/event-emitter';

const prisma = new PrismaClient();

interface AuthContext {
  userId?: string;
  user?: any;
  token?: string;
}

interface PaginationInput {
  page?: number;
  limit?: number;
}

export const resolvers = {
  Query: {
    // Get user's conversations (paginated)
    conversations: async (_parent: any, args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const page = args.input?.page || 1;
      const limit = args.input?.limit || 20;
      const skip = (page - 1) * limit;

      return prisma.conversation.findMany({
        where: {
          userId: context.userId,
          isDeleted: false,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    },

    // Get single conversation with messages
    conversation: async (
      _parent: any,
      args: { id: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id: args.id },
        include: {
          messages: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conversation) {
        throw new GraphQLError('Conversation not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (conversation.userId !== context.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return conversation;
    },

    // Get conversation messages (paginated)
    conversationMessages: async (
      _parent: any,
      args: { conversationId: string; input: PaginationInput },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const page = args.input?.page || 1;
      const limit = args.input?.limit || 50;
      const skip = (page - 1) * limit;

      // Verify conversation belongs to user
      const conversation = await prisma.conversation.findUnique({
        where: { id: args.conversationId },
      });

      if (!conversation || conversation.userId !== context.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.message.findMany({
        where: {
          conversationId: args.conversationId,
          isDeleted: false,
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      });
    },

    // Get user chat statistics
    chatStats: async (_parent: any, _args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const [conversations, messages, tokenData] = await Promise.all([
        prisma.conversation.count({
          where: { userId: context.userId, isDeleted: false },
        }),
        prisma.message.count({
          where: { conversation: { userId: context.userId } },
        }),
        prisma.message.aggregate({
          where: { conversation: { userId: context.userId } },
          _sum: { tokenCount: true },
        }),
      ]);

      const activeConversations = await prisma.conversation.count({
        where: {
          userId: context.userId,
          isDeleted: false,
          messages: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      });

      return {
        totalConversations: conversations,
        totalMessages: messages,
        totalTokensUsed: tokenData._sum.tokenCount || 0,
        averageMessagesPerConversation:
          conversations > 0 ? messages / conversations : 0,
        activeConversations,
      };
    },

    // Search conversations by title
    searchConversations: async (
      _parent: any,
      args: { query: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return prisma.conversation.findMany({
        where: {
          userId: context.userId,
          isDeleted: false,
          title: { contains: args.query, mode: 'insensitive' },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    },

    // Health check
    health: () => 'Chatbot Subgraph OK',
  },

  Mutation: {
    // Create conversation
    createConversation: async (
      _parent: any,
      args: { input?: { title?: string } },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return prisma.conversation.create({
        data: {
          userId: context.userId,
          title:
            args.input?.title ||
            `Conversation ${new Date().toLocaleDateString()}`,
        },
      });
    },

    // Update conversation
    updateConversation: async (
      _parent: any,
      args: { id: string; input: { title: string } },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id: args.id },
      });

      if (!conversation || conversation.userId !== context.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.conversation.update({
        where: { id: args.id },
        data: { title: args.input.title },
      });
    },

    // Delete conversation (soft delete)
    deleteConversation: async (
      _parent: any,
      args: { id: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id: args.id },
      });

      if (!conversation || conversation.userId !== context.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.conversation.update({
        where: { id: args.id },
        data: { isDeleted: true },
      });
    },

    // Send message
    sendMessage: async (
      _parent: any,
      args: { conversationId: string; input: { content: string } },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!args.input.content || args.input.content.length === 0) {
        throw new GraphQLError('Message content cannot be empty', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      if (args.input.content.length > 10000) {
        throw new GraphQLError('Message content exceeds 10000 characters', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Verify conversation belongs to user
      const conversation = await prisma.conversation.findUnique({
        where: { id: args.conversationId },
      });

      if (!conversation || conversation.userId !== context.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Create user message
      const userMessage = await prisma.message.create({
        data: {
          conversationId: args.conversationId,
          role: 'user',
          content: args.input.content,
        },
      });

      // Broadcast to subscribed clients
      chatEventEmitter.emitMessageReceived({
        conversationId: args.conversationId,
        message: userMessage,
      });

      // TODO: Call OpenAI API and create assistant message via SSE streaming
      // For now, return success response

      return {
        success: true,
        message: userMessage,
        conversationId: args.conversationId,
      };
    },

    // Delete message (soft delete)
    deleteMessage: async (
      _parent: any,
      args: { id: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const message = await prisma.message.findUnique({
        where: { id: args.id },
        include: { conversation: true },
      });

      if (!message || message.conversation.userId !== context.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.message.update({
        where: { id: args.id },
        data: { isDeleted: true },
      });
    },
  },

  // Federation type extension resolvers
  User: {
    __resolveReference: async (user: { id: string }) => {
      return {
        id: user.id,
        conversations: await prisma.conversation.findMany({
          where: { userId: user.id, isDeleted: false },
        }),
      };
    },
  },

  // Field resolvers
  Conversation: {
    user: async (parent: any) => {
      // Reference to User from auth-service
      return { __typename: 'User', id: parent.userId };
    },
    messageCount: async (parent: any) => {
      return prisma.message.count({
        where: { conversationId: parent.id, isDeleted: false },
      });
    },
    messages: async (parent: any) => {
      return prisma.message.findMany({
        where: { conversationId: parent.id, isDeleted: false },
        orderBy: { createdAt: 'asc' },
      });
    },
    lastMessage: async (parent: any) => {
      return prisma.message.findFirst({
        where: { conversationId: parent.id, isDeleted: false },
        orderBy: { createdAt: 'desc' },
      });
    },
    lastMessageDate: async (parent: any) => {
      const lastMsg = await prisma.message.findFirst({
        where: { conversationId: parent.id, isDeleted: false },
        orderBy: { createdAt: 'desc' },
      });
      return lastMsg?.createdAt || parent.updatedAt;
    },
  },

  Message: {
    role: (parent: any) => {
      // Convert database string to GraphQL enum (uppercase)
      return parent.role?.toUpperCase() || 'USER';
    },
    conversation: async (parent: any) => {
      return prisma.conversation.findUnique({
        where: { id: parent.conversationId },
      });
    },
  },

  // Subscriptions
  Subscription: {
    // Real-time message streaming
    messageReceived: {
      subscribe: async (
        _parent: any,
        args: { conversationId: string },
        context: AuthContext
      ) => {
        if (!context.userId) {
          throw new GraphQLError('Not authenticated', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        // Verify user owns the conversation
        const conversation = await prisma.conversation.findUnique({
          where: { id: args.conversationId },
        });

        if (!conversation || conversation.userId !== context.userId) {
          throw new GraphQLError('Unauthorized', {
            extensions: { code: 'FORBIDDEN' },
          });
        }

        // Create async iterator for this conversation
        return (async function* () {
          // Yield existing messages first (last 5)
          const messages = await prisma.message.findMany({
            where: {
              conversationId: args.conversationId,
              isDeleted: false,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          });

          for (const message of messages.reverse()) {
            yield { messageReceived: message };
          }

          // Then listen for new messages
          yield new Promise((resolve) => {
            const unsubscribe = chatEventEmitter.onMessageReceived(
              args.conversationId,
              (message) => {
                unsubscribe();
                resolve({ messageReceived: message });
              }
            );

            // Timeout after 30 seconds
            setTimeout(() => {
              unsubscribe();
              resolve({ messageReceived: null });
            }, 30000);
          });
        })();
      },
    },

    // Conversation updates
    conversationUpdated: {
      subscribe: async (
        _parent: any,
        args: { userId: string },
        context: AuthContext
      ) => {
        if (!context.userId) {
          throw new GraphQLError('Not authenticated', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        // Only user can subscribe to their own conversations
        if (args.userId !== context.userId) {
          throw new GraphQLError('Unauthorized', {
            extensions: { code: 'FORBIDDEN' },
          });
        }

        return (async function* () {
          yield new Promise((resolve) => {
            const unsubscribe = chatEventEmitter.onConversationUpdated(
              args.userId,
              (conversation) => {
                unsubscribe();
                resolve({ conversationUpdated: conversation });
              }
            );

            // Timeout
            setTimeout(() => {
              unsubscribe();
            }, 60000);
          });
        })();
      },
    },
  },
};
