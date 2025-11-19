# Chatbot MFE - Implementation Plan & Components Guide

**Phase:** Week 2-3 Implementation  
**Status:** 🚀 Ready for Development  
**Target Completion:** End of Week 3  
**Priority:** HIGH - Core user-facing feature

---

## 📋 Project Overview

The Chatbot MFE (Micro Frontend) is a React application that provides the chat interface for users to interact with the AI-powered chatbot. It will be integrated into the Shell application via Module Federation.

### Key Features

- ✅ Real-time conversation management
- ✅ Server-Sent Events (SSE) streaming for AI responses
- ✅ Markdown message rendering
- ✅ User-friendly chat UI
- ✅ Responsive design with TailwindCSS
- ✅ State management with Zustand
- ✅ Integrated with Chatbot Service API

---

## 🏗️ Architecture

### File Structure

```
apps/chatbot-mfe/
├── src/
│   ├── app/
│   │   ├── app.tsx              # Root component
│   │   └── app.module.ts        # Module Federation config
│   ├── pages/
│   │   ├── ChatPage.tsx         # Main chat page
│   │   ├── ConversationList.tsx # Sidebar with conversations
│   │   └── ChatDetail.tsx       # Individual conversation view
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── MessageList.tsx       # Display messages
│   │   │   ├── MessageItem.tsx       # Individual message
│   │   │   ├── MessageInput.tsx      # User input
│   │   │   ├── ConversationHeader.tsx # Title & controls
│   │   │   └── TypingIndicator.tsx   # AI typing indicator
│   │   ├── Conversations/
│   │   │   ├── ConversationItem.tsx  # List item
│   │   │   ├── ConversationMenu.tsx  # Actions menu
│   │   │   └── NewConversationBtn.tsx # Create new
│   │   └── Common/
│   │       ├── MarkdownRenderer.tsx   # Message markdown
│   │       ├── LoadingSpinner.tsx     # Loading state
│   │       └── EmptyState.tsx         # Empty conversation
│   ├── stores/
│   │   ├── chatbot.store.ts     # Zustand store
│   │   └── index.ts              # Exports
│   ├── services/
│   │   ├── chatbot-api.service.ts # API calls
│   │   ├── sse-handler.ts         # SSE streaming
│   │   └── message-formatter.ts   # Message utilities
│   ├── types/
│   │   ├── chat.types.ts         # Type definitions
│   │   └── api.types.ts          # API response types
│   ├── hooks/
│   │   ├── useChat.ts            # Chat logic hook
│   │   ├── useSSE.ts             # SSE handling hook
│   │   ├── useConversations.ts   # Conversations hook
│   │   └── useMardown.ts         # Markdown hook
│   ├── utils/
│   │   ├── formatters.ts         # String formatting
│   │   ├── validators.ts         # Input validation
│   │   └── constants.ts          # App constants
│   ├── styles/
│   │   ├── globals.css           # Global styles
│   │   └── tailwind.config.ts    # Tailwind config
│   └── main.tsx                  # Entry point
├── public/
│   └── index.html
├── vite.config.ts               # Vite configuration
├── module-federation.config.ts  # Module Federation config
└── package.json
```

---

## 🛠️ Component Specifications

### 1. ChatPage.tsx (Main Container)

**Purpose:** Main page component orchestrating the chat interface

**Props:** None (uses store)

**State Management:**

- Current conversation ID
- Messages list
- Loading state
- Error state
- SSE connection status

**Responsibilities:**

- Layout: Sidebar + main chat area
- Route handling for conversation selection
- Error boundary
- Permission checks

**Code Template:**

```typescript
import React, { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatbot.store';
import ConversationList from './ConversationList';
import ChatDetail from './ChatDetail';

export const ChatPage: React.FC = () => {
  const {
    conversations,
    selectedConversationId,
    fetchConversations,
    error
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ErrorState message={error} onRetry={fetchConversations} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 flex flex-col">
        <ConversationList conversations={conversations} />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <ChatDetail conversationId={selectedConversationId} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};

export default ChatPage;
```

---

### 2. ChatDetail.tsx (Conversation View)

**Purpose:** Display and manage individual conversation

**Props:**

- `conversationId: string` - Selected conversation ID

**State Management:**

- Conversation details
- Messages
- Input value
- Streaming state
- SSE connection

**Responsibilities:**

- Fetch conversation and messages
- Handle SSE connection
- Display message history
- Handle user input submission
- Show typing indicator during streaming

**Code Template:**

```typescript
import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatbot.store';
import MessageList from '@/components/Chat/MessageList';
import MessageInput from '@/components/Chat/MessageInput';
import ConversationHeader from '@/components/Chat/ConversationHeader';
import { useSSE } from '@/hooks/useSSE';

interface Props {
  conversationId: string;
}

export const ChatDetail: React.FC<Props> = ({ conversationId }) => {
  const {
    selectedConversation,
    messages,
    isStreaming,
    fetchConversationDetails,
    sendMessage,
    addMessage,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { connectSSE } = useSSE(conversationId, addMessage);

  useEffect(() => {
    fetchConversationDetails(conversationId);
  }, [conversationId, fetchConversationDetails]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message optimistically
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date(),
    });

    // Send message and connect SSE for response
    try {
      connectSSE(content);
      await sendMessage(conversationId, content);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error toast
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ConversationHeader conversation={selectedConversation} />

      {/* Messages */}
      <MessageList messages={messages} isStreaming={isStreaming} />
      <div ref={messagesEndRef} />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isDisabled={isStreaming}
      />
    </div>
  );
};

export default ChatDetail;
```

---

### 3. MessageList.tsx (Message Display)

**Purpose:** Render list of messages with proper formatting

**Props:**

- `messages: Message[]` - Array of messages
- `isStreaming: boolean` - Whether AI is responding

**Features:**

- Markdown rendering with code highlighting
- User vs assistant message styling
- Timestamp display
- Copy button on code blocks
- Typing indicator

**Code Template:**

```typescript
import React from 'react';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import { Message } from '@/types/chat.types';

interface Props {
  messages: Message[];
  isStreaming: boolean;
}

export const MessageList: React.FC<Props> = ({ messages, isStreaming }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))
      )}

      {isStreaming && <TypingIndicator />}
    </div>
  );
};

export default MessageList;
```

---

### 4. MessageItem.tsx (Individual Message)

**Purpose:** Display a single message with formatting

**Props:**

- `message: Message` - Message to display

**Features:**

- Different styling for user vs assistant
- Markdown rendering
- Code block handling
- Message actions (copy, delete, retry)

**Code Template:**

```typescript
import React, { useState } from 'react';
import { Message } from '@/types/chat.types';
import MarkdownRenderer from '../Common/MarkdownRenderer';

interface Props {
  message: Message;
}

export const MessageItem: React.FC<Props> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-md px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}

        <div className="text-xs opacity-70 mt-1">
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>

        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-2 text-xs opacity-70 hover:opacity-100"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
```

---

### 5. MessageInput.tsx (User Input)

**Purpose:** Handle user message input and submission

**Props:**

- `onSendMessage: (content: string) => void` - Send message callback
- `isDisabled: boolean` - Whether input is disabled

**Features:**

- Textarea with auto-expand
- Enter to send (Shift+Enter for newline)
- Character count
- Validation feedback
- Loading state

**Code Template:**

```typescript
import React, { useState, useRef, useEffect } from 'react';

interface Props {
  onSendMessage: (content: string) => void;
  isDisabled: boolean;
}

export const MessageInput: React.FC<Props> = ({
  onSendMessage,
  isDisabled
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-expand textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (input.trim() && !isDisabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for newline)"
          disabled={isDisabled}
          className="flex-1 resize-none border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={isDisabled || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
        >
          Send
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {input.length}/10000
      </div>
    </div>
  );
};

export default MessageInput;
```

---

### 6. ConversationList.tsx (Sidebar)

**Purpose:** Display list of user conversations

**Props:**

- `conversations: Conversation[]` - List of conversations

**Features:**

- List item preview (title + last message)
- New conversation button
- Delete/archive actions
- Search/filter
- Active state indication

**Code Template:**

```typescript
import React, { useState } from 'react';
import { useChatStore } from '@/stores/chatbot.store';
import ConversationItem from './ConversationItem';
import { Conversation } from '@/types/chat.types';

interface Props {
  conversations: Conversation[];
}

export const ConversationList: React.FC<Props> = ({ conversations }) => {
  const {
    selectedConversationId,
    selectConversation,
    createNewConversation
  } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={createNewConversation}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          + New Conversation
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search conversations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="m-4 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm m-4">No conversations</p>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === selectedConversationId}
              onSelect={() => selectConversation(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
```

---

### 7. MarkdownRenderer.tsx (Message Formatting)

**Purpose:** Render markdown with syntax highlighting

**Props:**

- `content: string` - Markdown content to render

**Features:**

- React-markdown integration
- Code block syntax highlighting
- Emoji support
- Table rendering
- Link handling

**Code Template:**

```typescript
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface Props {
  content: string;
}

export const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';

          if (inline) {
            return (
              <code
                className="bg-gray-100 px-1.5 py-0.5 rounded text-sm"
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <SyntaxHighlighter
              style={atomOneDark}
              language={language}
              className="rounded-lg my-2"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          );
        },
        p: ({ children }) => <p className="mb-2">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2">{children}</ol>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {children}
          </a>
        ),
      }}
      className="prose prose-sm max-w-none"
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
```

---

## 🌊 SSE Integration

### SSE Handler Service

**File:** `services/sse-handler.ts`

```typescript
export class SSEHandler {
  private eventSource: EventSource | null = null;

  connect(
    conversationId: string,
    onData: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): void {
    const token = localStorage.getItem('authToken');

    this.eventSource = new EventSource(
      `${API_BASE_URL}/api/chat/conversations/${conversationId}/stream`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    this.eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        onData(data.chunk);
      } catch (error) {
        onError('Failed to parse SSE data');
      }
    });

    this.eventSource.addEventListener('end', () => {
      onComplete();
      this.disconnect();
    });

    this.eventSource.addEventListener('error', (error) => {
      onError('SSE connection error');
      this.disconnect();
    });
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
```

### SSE Hook

```typescript
export const useSSE = (
  conversationId: string,
  onMessageChunk: (chunk: string) => void
) => {
  const handler = useRef(new SSEHandler());

  const connectSSE = (userMessage: string) => {
    handler.current.connect(
      conversationId,
      (chunk) => {
        onMessageChunk(chunk);
      },
      () => {
        // Streaming complete
      },
      (error) => {
        console.error('SSE Error:', error);
      }
    );
  };

  useEffect(() => {
    return () => {
      handler.current.disconnect();
    };
  }, []);

  return { connectSSE };
};
```

---

## 🏪 Zustand Store

**File:** `stores/chatbot.store.ts`

```typescript
import { create } from 'zustand';
import { Conversation, Message } from '@/types/chat.types';
import { chatbotApi } from '@/services/chatbot-api.service';

interface ChatStore {
  // State
  conversations: Conversation[];
  selectedConversationId: string | null;
  selectedConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchConversationDetails: (id: string) => Promise<void>;
  selectConversation: (id: string) => void;
  createNewConversation: () => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  setIsStreaming: (value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  conversations: [],
  selectedConversationId: null,
  selectedConversation: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,

  // Actions
  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const conversations = await chatbotApi.getConversations();
      set({ conversations, error: null });
    } catch (error) {
      set({ error: 'Failed to fetch conversations' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchConversationDetails: async (id: string) => {
    set({ isLoading: true });
    try {
      const [conversation, messages] = await Promise.all([
        chatbotApi.getConversation(id),
        chatbotApi.getMessages(id),
      ]);
      set({
        selectedConversation: conversation,
        selectedConversationId: id,
        messages,
        error: null,
      });
    } catch (error) {
      set({ error: 'Failed to fetch conversation' });
    } finally {
      set({ isLoading: false });
    }
  },

  selectConversation: (id: string) => {
    set({ selectedConversationId: id });
  },

  createNewConversation: async () => {
    try {
      const conversation = await chatbotApi.createConversation();
      set(({ conversations }) => ({
        conversations: [conversation, ...conversations],
        selectedConversationId: conversation.id,
        messages: [],
      }));
    } catch (error) {
      set({ error: 'Failed to create conversation' });
    }
  },

  sendMessage: async (conversationId: string, content: string) => {
    set({ isStreaming: true });
    try {
      await chatbotApi.sendMessage(conversationId, { content });
    } catch (error) {
      set({ error: 'Failed to send message' });
    } finally {
      set({ isStreaming: false });
    }
  },

  addMessage: (message: Message) => {
    set(({ messages }) => ({
      messages: [...messages, message],
    }));
  },

  updateConversationTitle: async (id: string, title: string) => {
    try {
      const updated = await chatbotApi.updateConversation(id, { title });
      set(({ conversations }) => ({
        conversations: conversations.map((c) => (c.id === id ? updated : c)),
      }));
    } catch (error) {
      set({ error: 'Failed to update title' });
    }
  },

  deleteConversation: async (id: string) => {
    try {
      await chatbotApi.deleteConversation(id);
      set(({ conversations }) => ({
        conversations: conversations.filter((c) => c.id !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete conversation' });
    }
  },

  setIsStreaming: (value: boolean) => set({ isStreaming: value }),
  setError: (error: string | null) => set({ error }),
}));
```

---

## 📡 API Service

**File:** `services/chatbot-api.service.ts`

```typescript
import axios from 'axios';
import {
  Conversation,
  Message,
  CreateMessagePayload,
} from '@/types/chat.types';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatbotApi = {
  // Conversations
  getConversations: async (page = 1, limit = 20): Promise<Conversation[]> => {
    const { data } = await api.get(`/api/chat/conversations`, {
      params: { page, limit },
    });
    return data;
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const { data } = await api.get(`/api/chat/conversations/${id}`);
    return data;
  },

  createConversation: async (title?: string): Promise<Conversation> => {
    const { data } = await api.post(`/api/chat/conversations`, { title });
    return data;
  },

  updateConversation: async (
    id: string,
    payload: { title: string }
  ): Promise<Conversation> => {
    const { data } = await api.patch(`/api/chat/conversations/${id}`, payload);
    return data;
  },

  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/api/chat/conversations/${id}`);
  },

  // Messages
  getMessages: async (
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<Message[]> => {
    const { data } = await api.get(
      `/api/chat/conversations/${conversationId}/messages`,
      { params: { page, limit } }
    );
    return data;
  },

  sendMessage: async (
    conversationId: string,
    payload: CreateMessagePayload
  ): Promise<Message> => {
    const { data } = await api.post(
      `/api/chat/conversations/${conversationId}/messages`,
      payload
    );
    return data;
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/api/chat/messages/${messageId}`);
  },
};
```

---

## 🎨 Styling

### TailwindCSS Configuration

```typescript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
      },
    },
  },
  plugins: [],
};
```

### Global Styles

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Message animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message {
  animation: slideIn 0.3s ease-out;
}

/* Typing indicator */
@keyframes typing {
  0%,
  60%,
  100% {
    opacity: 0.4;
  }
  30% {
    opacity: 1;
  }
}

.typing-dot {
  animation: typing 1.4s infinite;
}
```

---

## 🚀 Implementation Timeline

### Week 2: Core Components

- [ ] Day 1: Setup project, install dependencies, configure Vite
- [ ] Day 2-3: Implement MessageList, MessageItem, MarkdownRenderer
- [ ] Day 4-5: Implement MessageInput, ConversationList
- **Deliverable:** Basic chat UI rendering

### Week 2-3: SSE Integration

- [ ] Day 1-2: Implement SSE handler and hook
- [ ] Day 3: Connect SSE to MessageList
- [ ] Day 4-5: Test streaming responses
- **Deliverable:** Real-time AI responses streaming

### Week 3: Polish & Integration

- [ ] Day 1-2: Zustand store finalization
- [ ] Day 3: Error handling and loading states
- [ ] Day 4: Module Federation integration with Shell
- [ ] Day 5: Testing and refinement
- **Deliverable:** Production-ready Chatbot MFE

---

## ✅ Acceptance Criteria

### Functional Requirements

- ✅ Display list of user conversations
- ✅ Show conversation messages with proper formatting
- ✅ Send new messages to chatbot service
- ✅ Receive AI responses via SSE streaming
- ✅ Create new conversations
- ✅ Edit conversation titles
- ✅ Delete conversations
- ✅ Show loading and error states

### Non-Functional Requirements

- ✅ Response time < 100ms for UI updates
- ✅ SSE streaming latency < 1s
- ✅ Proper error handling and recovery
- ✅ Mobile responsive design
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Code coverage > 80%

### Integration Requirements

- ✅ Module Federation integration with Shell
- ✅ Share auth state with Shell app
- ✅ Properly handle authentication flow
- ✅ Error boundary implementation
- ✅ Proper cleanup on unmount

---

## 🐛 Common Issues & Solutions

### Issue: SSE Connection Timeouts

**Solution:** Check network connectivity, verify token is valid, increase timeout threshold

### Issue: Messages Not Scrolling to Bottom

**Solution:** Use `useEffect` with `scrollIntoView` and check ref assignment

### Issue: Module Federation Remote Not Loading

**Solution:** Ensure remote port matches config, check CORS headers, verify shared dependencies

### Issue: State Not Persisting Between Routes

**Solution:** Initialize store from localStorage or API on component mount

---

## 📚 References

- [React Hooks Documentation](https://react.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Server-Sent Events API](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Module Federation Examples](https://webpack.js.org/concepts/module-federation/)

---

**Status:** ✅ Implementation Plan Complete  
**Next Step:** Begin Week 2 core component development  
**Questions?** Refer to Shell app (shell/src/app) for Module Federation patterns
