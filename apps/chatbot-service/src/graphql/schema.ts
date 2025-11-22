import gql from 'graphql-tag';

export const typeDefs = gql`
  # Federation directive
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@external", "@shareable"]
    )

  # Reference external User type from auth-service
  extend type User @key(fields: "id") {
    id: ID! @external
    conversations: [Conversation!]!
  }

  # Conversation entity
  type Conversation @key(fields: "id") {
    id: ID!
    userId: String!
    user: User!
    title: String!
    messageCount: Int!
    lastMessage: String
    lastMessageDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    isDeleted: Boolean!
    messages: [Message!]!
  }

  # Message entity
  type Message @key(fields: "id") {
    id: ID!
    conversationId: String!
    conversation: Conversation!
    role: MessageRole!
    content: String!
    tokenCount: Int!
    createdAt: DateTime!
    isDeleted: Boolean!
  }

  # Message role enum
  enum MessageRole {
    USER
    ASSISTANT
  }

  # User role enum - shared across all services
  enum UserRole {
    SUPER_ADMIN
    ADMIN
    MODERATOR
    USER
    GUEST
  }

  # Scalar for DateTime
  scalar DateTime

  # Pagination input
  input PaginationInput {
    page: Int
    limit: Int
  }

  # Chat statistics
  type ChatStats {
    totalConversations: Int!
    totalMessages: Int!
    totalTokensUsed: Int!
    averageMessagesPerConversation: Float!
    activeConversations: Int!
  }

  # Send message response (with streaming support)
  type SendMessageResponse {
    success: Boolean!
    message: Message
    conversationId: String!
  }

  # Conversation input types
  input CreateConversationInput {
    title: String
  }

  input UpdateConversationInput {
    title: String!
  }

  input SendMessageInput {
    content: String!
  }

  input PaginationInput {
    page: Int
    limit: Int
  }

  # Query type
  type Query {
    # Get user's conversations (paginated)
    conversations(input: PaginationInput): [Conversation!]!

    # Get single conversation with messages
    conversation(id: ID!): Conversation

    # Get conversation messages (paginated)
    conversationMessages(
      conversationId: ID!
      input: PaginationInput
    ): [Message!]!

    # Get user chat statistics
    chatStats: ChatStats!

    # Search conversations by title
    searchConversations(query: String!): [Conversation!]!

    # Health check for subgraph
    health: String! @shareable
  }

  # Mutation type
  type Mutation {
    # Conversation management
    createConversation(input: CreateConversationInput): Conversation!
    updateConversation(id: ID!, input: UpdateConversationInput!): Conversation!
    deleteConversation(id: ID!): Conversation!

    # Message management
    sendMessage(
      conversationId: ID!
      input: SendMessageInput!
    ): SendMessageResponse!
    deleteMessage(id: ID!): Message!
  }

  # Subscription type (for real-time updates)
  type Subscription {
    # Real-time message streaming
    messageReceived(conversationId: ID!): Message!

    # Conversation updates
    conversationUpdated(userId: ID!): Conversation!
  }
`;
