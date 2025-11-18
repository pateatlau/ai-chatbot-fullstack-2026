import axios, { AxiosInstance } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:3001/api';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface CreateConversationRequest {
  title?: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: PaginationInfo;
}

export interface ConversationStats {
  totalConversations: number;
  totalMessages: number;
  messagesThisWeek: number;
}

export interface TokenUsageStats {
  totalTokens: number;
  totalCost: number;
  usageByDay: Array<{
    date: string;
    tokens: number;
    cost: number;
  }>;
}

class ChatbotAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include cookies in requests automatically
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear auth storage
          // Let the shell app's auth handling take care of it
          localStorage.removeItem('auth-storage');
          // Don't redirect here - let React Router and ProtectedRoute handle it
        }
        return Promise.reject(error);
      }
    );
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    const response = await this.client.get<ConversationsResponse>(
      '/chat/conversations'
    );
    // Extract just the conversations array from paginated response
    return response.data.conversations;
  }

  async getConversation(
    id: string
  ): Promise<Conversation & { messages: Message[] }> {
    const response = await this.client.get<
      Conversation & { messages: Message[] }
    >(`/chat/conversations/${id}`);
    return response.data;
  }

  async createConversation(
    data: CreateConversationRequest
  ): Promise<Conversation> {
    const response = await this.client.post<Conversation>(
      '/chat/conversations',
      data
    );
    return response.data;
  }

  async deleteConversation(id: string): Promise<void> {
    await this.client.delete(`/chat/conversations/${id}`);
  }

  async updateConversationTitle(
    id: string,
    title: string
  ): Promise<Conversation> {
    const response = await this.client.patch<Conversation>(
      `/chat/conversations/${id}`,
      {
        title,
      }
    );
    return response.data;
  }

  // Messages
  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await this.client.get<any>(
      `/chat/conversations/${conversationId}/messages`
    );
    // Handle both paginated and array responses
    if (response.data.messages && Array.isArray(response.data.messages)) {
      return response.data.messages;
    }
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Send a message and receive streaming response via Server-Sent Events
   * Note: This returns a Promise that resolves with a fetch Response object
   * that you can read as a stream
   */
  async sendMessageStream(
    conversationId: string,
    content: string
  ): Promise<Response> {
    const response = await fetch(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in fetch requests
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(
          errorJson.error || errorJson.message || 'Failed to send message'
        );
      } catch {
        throw new Error(
          errorText || `Request failed with status ${response.status}`
        );
      }
    }
    return response;
  }

  /**
   * Non-streaming message send (fallback)
   */
  async sendMessage(
    conversationId: string,
    data: SendMessageRequest
  ): Promise<Message> {
    const response = await this.client.post<Message>(
      `/chat/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  }

  // Stats
  async getConversationStats(): Promise<ConversationStats> {
    const response = await this.client.get<ConversationStats>(
      '/chat/stats/conversations'
    );
    return response.data;
  }

  async getTokenUsage(days: number = 7): Promise<TokenUsageStats> {
    const response = await this.client.get<TokenUsageStats>(
      '/chat/stats/tokens',
      {
        params: { days },
      }
    );
    return response.data;
  }
}

export const chatbotAPI = new ChatbotAPI();
