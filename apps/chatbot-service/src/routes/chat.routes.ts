import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { OpenAIService } from '../services/openai.service';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../middleware/validate';
import {
  createConversationSchema,
  updateConversationSchema,
  createMessageSchema,
  paginationSchema,
  uuidParamSchema,
} from '../schemas/chat.schemas';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * POST /api/chat/conversations
 * Create a new conversation
 */
router.post(
  '/conversations',
  validateBody(createConversationSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { title } = req.body;

      const conversation = await prisma.conversation.create({
        data: {
          userId,
          title: title || 'New Conversation',
        },
      });

      res.status(201).json(conversation);
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  }
);

/**
 * GET /api/chat/conversations
 * List user's conversations (paginated)
 */
router.get(
  '/conversations',
  validateQuery(paginationSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
          where: {
            userId,
            isDeleted: false,
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
          include: {
            _count: {
              select: { messages: true },
            },
          },
        }),
        prisma.conversation.count({
          where: {
            userId,
            isDeleted: false,
          },
        }),
      ]);

      res.json({
        conversations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('List conversations error:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }
);

/**
 * GET /api/chat/conversations/:id
 * Get a single conversation with messages
 */
router.get(
  '/conversations/:id',
  validateParams(uuidParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          userId,
          isDeleted: false,
        },
        include: {
          messages: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      res.json(conversation);
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  }
);

/**
 * PATCH /api/chat/conversations/:id
 * Update conversation (e.g., change title)
 */
router.patch(
  '/conversations/:id',
  validateParams(uuidParamSchema),
  validateBody(updateConversationSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { title } = req.body;

      const conversation = await prisma.conversation.findFirst({
        where: { id, userId, isDeleted: false },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const updated = await prisma.conversation.update({
        where: { id },
        data: { title: title.trim() },
      });

      res.json(updated);
    } catch (error) {
      console.error('Update conversation error:', error);
      res.status(500).json({ error: 'Failed to update conversation' });
    }
  }
);

/**
 * DELETE /api/chat/conversations/:id
 * Soft delete a conversation
 */
router.delete(
  '/conversations/:id',
  validateParams(uuidParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const conversation = await prisma.conversation.findFirst({
        where: { id, userId, isDeleted: false },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      await prisma.conversation.update({
        where: { id },
        data: { isDeleted: true },
      });

      res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  }
);

/**
 * POST /api/chat/conversations/:id/messages
 * Send a message (with streaming AI response)
 */
router.post(
  '/conversations/:id/messages',
  validateParams(uuidParamSchema),
  validateBody(createMessageSchema),
  rateLimitMiddleware(),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.id as string;
      const { content } = req.body;

      // Verify conversation exists and belongs to user
      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId, isDeleted: false },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Save user message
      const userMessage = await prisma.message.create({
        data: {
          conversationId,
          role: 'user',
          content: content.trim(),
          tokenCount: OpenAIService.estimateTokenCount(content),
        },
      });

      // Set up SSE headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullResponse = '';
      let totalTokens = 0;

      try {
        // Get streaming response from OpenAI
        const stream = await OpenAIService.getChatCompletionStream(
          conversationId,
          content.trim()
        );

        // Send initial event with user message
        res.write(
          `data: ${JSON.stringify({ type: 'userMessage', message: userMessage })}\n\n`
        );

        // Stream AI response
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';

          if (delta) {
            fullResponse += delta;
            res.write(
              `data: ${JSON.stringify({ type: 'delta', content: delta })}\n\n`
            );
          }
        }

        // Estimate tokens
        totalTokens = OpenAIService.estimateTokenCount(fullResponse);

        // Save AI message to database
        const aiMessage = await prisma.message.create({
          data: {
            conversationId,
            role: 'assistant',
            content: fullResponse,
            tokenCount: totalTokens,
          },
        });

        // Track token usage
        await OpenAIService.trackTokenUsage(userId, totalTokens);

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        // Send completion event
        res.write(
          `data: ${JSON.stringify({ type: 'complete', message: aiMessage })}\n\n`
        );
        res.end();
      } catch (streamError) {
        console.error('Streaming error:', streamError);
        const errorMessage =
          streamError instanceof Error
            ? streamError.message
            : 'Failed to generate response';
        res.write(
          `data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`
        );
        res.end();
      }
    } catch (error) {
      console.error('Send message error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to send message' });
      }
    }
  }
);

/**
 * GET /api/chat/conversations/:id/messages
 * Get messages for a conversation (paginated)
 */
router.get(
  '/conversations/:id/messages',
  validateParams(uuidParamSchema),
  validateQuery(paginationSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.id as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      // Verify conversation belongs to user
      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId, isDeleted: false },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: {
            conversationId,
            isDeleted: false,
          },
          orderBy: { createdAt: 'asc' },
          skip,
          take: limit,
        }),
        prisma.message.count({
          where: {
            conversationId,
            isDeleted: false,
          },
        }),
      ]);

      res.json({
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }
);

/**
 * DELETE /api/chat/messages/:id
 * Soft delete a message
 */
router.delete(
  '/messages/:id',
  validateParams(uuidParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      // Find message and verify ownership through conversation
      const message = await prisma.message.findFirst({
        where: {
          id,
          conversation: {
            userId,
          },
          isDeleted: false,
        },
      });

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      await prisma.message.update({
        where: { id },
        data: { isDeleted: true },
      });

      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  }
);

/**
 * GET /api/chat/stats
 * Get user's chat statistics
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [totalConversations, totalMessages, todayTokens] = await Promise.all([
      prisma.conversation.count({
        where: { userId, isDeleted: false },
      }),
      prisma.message.count({
        where: {
          conversation: { userId },
          isDeleted: false,
        },
      }),
      OpenAIService.getTodayTokenUsage(userId),
    ]);

    res.json({
      totalConversations,
      totalMessages,
      todayTokens,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
