import OpenAI from 'openai';
import prisma from '../lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class OpenAIService {
  private static readonly MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  private static readonly MAX_TOKENS = parseInt(
    process.env.OPENAI_MAX_TOKENS || '2000',
    10
  );
  private static readonly CONTEXT_WINDOW = parseInt(
    process.env.OPENAI_CONTEXT_WINDOW || '10',
    10
  );

  /**
   * Create a mock streaming response for development/testing
   */
  private static async *createMockStream(
    userMessage: string
  ): AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk> {
    const responses = [
      "I'm a mock AI assistant. ",
      'Your message was: "' + userMessage + '". ',
      'This is a simulated response for testing purposes. ',
      'The real OpenAI integration requires API credits. ',
      'Feel free to test all the chatbot features with this mock! ',
      '✨',
    ];

    for (const text of responses) {
      // Simulate streaming delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      yield {
        id: 'mock-' + Date.now(),
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: 'mock-model',
        choices: [
          {
            index: 0,
            delta: { content: text, role: 'assistant' },
            finish_reason: null,
          },
        ],
      } as OpenAI.Chat.Completions.ChatCompletionChunk;
    }

    // Final chunk with finish_reason
    yield {
      id: 'mock-' + Date.now(),
      object: 'chat.completion.chunk',
      created: Date.now(),
      model: 'mock-model',
      choices: [
        {
          index: 0,
          delta: {},
          finish_reason: 'stop',
        },
      ],
    } as OpenAI.Chat.Completions.ChatCompletionChunk;
  }

  /**
   * Get chat completion with streaming
   */
  static async getChatCompletionStream(
    conversationId: string,
    userMessage: string
  ): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const useMock = process.env.USE_MOCK_AI === 'true';

    console.log(
      'OpenAI Service: Starting stream for conversation:',
      conversationId
    );
    console.log('Using mock AI:', useMock);

    if (useMock) {
      console.log('Returning mock stream for testing');
      return this.createMockStream(userMessage);
    }

    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    console.log(
      'API Key starts with:',
      process.env.OPENAI_API_KEY?.substring(0, 10)
    );

    // Get conversation history
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'asc' },
      take: this.CONTEXT_WINDOW,
    });

    // Build message array
    const chatMessages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.',
      },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    // Create streaming completion
    const stream = await openai.chat.completions.create({
      model: this.MODEL,
      messages: chatMessages,
      max_tokens: this.MAX_TOKENS,
      stream: true,
      temperature: 0.7,
    });

    return stream;
  }

  /**
   * Estimate token count (rough approximation)
   */
  static estimateTokenCount(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Track token usage for a user
   */
  static async trackTokenUsage(userId: string, tokens: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.tokenUsage.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        tokens: {
          increment: tokens,
        },
      },
      create: {
        userId,
        date: today,
        tokens,
      },
    });
  }

  /**
   * Get user's token usage for today
   */
  static async getTodayTokenUsage(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await prisma.tokenUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    return usage?.tokens || 0;
  }
}
