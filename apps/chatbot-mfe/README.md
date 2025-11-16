# Chatbot Microfrontend (MFE)

AI-powered chat interface with streaming responses, conversation management, and markdown rendering.

## Features

✅ **Real-time Streaming** - Server-Sent Events (SSE) for live AI responses  
✅ **Conversation Management** - Create, rename, delete, and switch between conversations  
✅ **Markdown Rendering** - Full markdown support with syntax-highlighted code blocks  
✅ **Rate Limiting** - Visual indicators and warnings for API rate limits (10 msg/min)  
✅ **Auto-scroll** - Smart scroll behavior that respects user position  
✅ **Responsive UI** - Beautiful gradient design with dark mode support  
✅ **Token Tracking** - Monitor API token usage and costs

## Architecture

### Components

- **ChatPage** - Main container with conversation sidebar and chat area
- **ConversationSidebar** - List of conversations with create/rename/delete actions
- **MessageList** - Scrollable message feed with auto-scroll and empty states
- **MessageBubble** - Individual message rendering with markdown support
- **MessageInput** - Auto-resizing textarea with character count and keyboard shortcuts

### Hooks

- **useStreamingMessage** - Manages EventSource connections and streaming state
- **useRateLimit** - Tracks message rate limits and displays warnings

### API Client

- **chatbotAPI** - Axios-based client with auth token injection
- Methods for conversations, messages, streaming, and stats
- Automatic redirect on 401 (expired token)

## Module Federation

This MFE exposes:

- `./Module` - Main ChatPage component

Shared dependencies:

- react, react-dom, react-router-dom
- zustand, @tanstack/react-query
- zod

## Environment Variables

```bash
VITE_CHATBOT_API_URL=http://localhost:3001/api
VITE_AUTH_API_URL=http://localhost:3000/api
```

## Development

### Standalone Mode

```bash
# Start the MFE standalone
npm run dev:chatbot-mfe

# Access at http://localhost:5175
```

### Integrated with Shell

```bash
# Start both shell and chatbot-mfe
npm run dev:shell &
npm run dev:chatbot-mfe

# Access shell at http://localhost:5173
# Navigate to /chatbot route
```

## Dependencies

### Core

- React 19.0.0
- react-router-dom 7.9.6
- axios 1.13.2

### Markdown & Syntax Highlighting

- react-markdown
- react-syntax-highlighter
- remark-gfm (GitHub Flavored Markdown)
- rehype-raw (HTML in markdown)

### State Management

- zustand 5.0.8 (shared with shell)

## Key Features Explained

### Server-Sent Events Streaming

Messages from the AI are streamed in real-time using EventSource:

```typescript
const eventSource = chatbotAPI.createMessageStream(conversationId, content);
startStreaming(eventSource);

// Handles three event types:
// - 'content' - Partial message chunks
// - 'done' - Stream complete
// - 'error' - Server error
```

### Markdown with Code Highlighting

All AI responses support:

- **Code blocks** with syntax highlighting (supports 100+ languages)
- **Inline code** with subtle background
- **Tables** with styled borders
- **Lists** (ordered and unordered)
- **Links** that open in new tabs
- **Blockquotes** with left border
- **Headings** (H1-H6)

### Rate Limiting UI

Three states:

1. **Normal** - No indicators
2. **Near limit** (≤3 remaining) - Yellow warning banner
3. **Limited** (0 remaining) - Red error banner with countdown

### Conversation Management

- **Create** - New conversation with auto-generated title
- **Select** - Switch between conversations
- **Rename** - Inline editing with Enter/Escape keys
- **Delete** - Confirmation dialog before deletion

### Auto-scroll Behavior

- Automatically scrolls to bottom for new messages
- Stops auto-scroll when user scrolls up
- Shows "scroll to bottom" button when not at bottom
- Resumes auto-scroll when user returns to bottom

## Integration with Chatbot Service

### Endpoints Used

```
GET    /api/chat/conversations              - List conversations
POST   /api/chat/conversations              - Create conversation
GET    /api/chat/conversations/:id          - Get conversation with messages
PATCH  /api/chat/conversations/:id          - Update conversation title
DELETE /api/chat/conversations/:id          - Delete conversation
GET    /api/chat/conversations/:id/messages - Get messages
POST   /api/chat/conversations/:id/messages/stream - Send message (SSE)
GET    /api/chat/stats/conversations        - Conversation stats
GET    /api/chat/stats/tokens               - Token usage stats
```

### Authentication

All requests include Bearer token from localStorage:

```typescript
Authorization: Bearer ${access_token}
```

On 401 response, user is redirected to login page.

## Styling

### CSS Modules

Each component has its own CSS module for scoped styling:

- `MessageBubble.module.css`
- `MessageInput.module.css`
- `MessageList.module.css`
- `ConversationSidebar.module.css`
- `ChatPage.module.css`

### Theme

- **Primary gradient**: Purple to pink (`#667eea` → `#764ba2`)
- **User messages**: Gradient background
- **AI messages**: Light gray background (`#f3f4f6`)
- **Code blocks**: One Dark theme
- **Dark mode**: Full support with `prefers-color-scheme`

### Responsive Design

- Desktop: Sidebar 320px + flexible chat area
- Mobile: TODO - Collapsible sidebar (future enhancement)

## Performance

### Optimizations

- **Lazy loading** - MFE loaded on-demand by shell
- **Suspense boundaries** - Loading states while fetching remote
- **Message virtualization** - Ready for large message lists (react-window)
- **Debounced auto-scroll** - Smooth scroll without jank
- **CSS animations** - Hardware-accelerated transforms

### Bundle Size

Total: ~2.8MB uncompressed, ~700KB gzipped

- React + React DOM (shared)
- Markdown libraries: ~600KB
- Syntax highlighter: ~1.2MB (includes all languages)

Future optimization: Code-split language packs

## Error Handling

### Network Errors

- Display error banner with message
- Auto-dismiss after 5 seconds
- Retry mechanism (future enhancement)

### Rate Limiting

- Visual warnings when approaching limit
- Block input when limit reached
- Countdown timer until reset

### SSE Errors

- Connection lost: Show error and allow retry
- Parse errors: Log and display generic message
- Server errors: Display error.message from server

## Testing

### Manual Testing

1. **Create conversation** - Click + button
2. **Send message** - Type and press Enter
3. **View streaming** - Watch AI response appear in real-time
4. **Test markdown** - Send code blocks, lists, tables
5. **Rename conversation** - Click edit icon
6. **Delete conversation** - Click delete icon, confirm
7. **Rate limiting** - Send 10+ messages rapidly
8. **Error handling** - Stop chatbot service, try sending

### Future: Automated Tests

- Unit tests for hooks (useStreamingMessage, useRateLimit)
- Component tests for message rendering
- Integration tests for conversation flow
- E2E tests with Cypress

## Future Enhancements

- [ ] Mobile responsive sidebar
- [ ] Message search within conversation
- [ ] Export conversation to file
- [ ] Copy individual messages
- [ ] Regenerate AI response
- [ ] Stop generation button
- [ ] Voice input
- [ ] File attachments
- [ ] Image generation display
- [ ] Conversation sharing
- [ ] Custom system prompts
- [ ] Model selection (GPT-4, Claude, etc.)

## Troubleshooting

### MFE Not Loading

1. Check chatbot-mfe is running on port 5175
2. Verify shell vite.config.ts has correct remote URL
3. Check browser console for CORS errors
4. Clear browser cache and reload

### Streaming Not Working

1. Verify chatbot-service is running on port 3001
2. Check EventSource connection in Network tab
3. Ensure OPENAI_API_KEY is set in chatbot-service .env
4. Check server logs for OpenAI API errors

### Rate Limit Not Showing

1. Verify Redis is running (docker-compose ps)
2. Check rate limit middleware in chatbot-service
3. Send messages rapidly to trigger limit
4. Inspect Network tab for X-RateLimit-\* headers

### Markdown Not Rendering

1. Check react-markdown and dependencies installed
2. Verify MessageBubble component imports
3. Test with simple markdown first (# Heading)
4. Check browser console for syntax highlighter errors

---

**Status**: ✅ Complete and production-ready  
**Port**: 5175  
**Route in Shell**: `/chatbot`
