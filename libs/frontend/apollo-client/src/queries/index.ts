import { gql } from '@apollo/client';

// ============================================================================
// AUTHENTICATION QUERIES & MUTATIONS
// ============================================================================

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      username
      firstName
      lastName
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($input: PaginationInput) {
    users(input: $input) {
      users {
        id
        email
        username
        firstName
        lastName
        role
        isActive
        createdAt
        updatedAt
      }
      total
      page
      limit
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      username
      firstName
      lastName
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      username
      firstName
      lastName
      role
      isActive
      updatedAt
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($userId: ID!, $newPassword: String!) {
    resetPassword(userId: $userId, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      user {
        id
        email
        username
        firstName
        lastName
        role
      }
      token
      refreshToken
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      user {
        id
        email
        username
        firstName
        lastName
        role
      }
      token
      refreshToken
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      success
      message
      token
      refreshToken
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      username
      firstName
      lastName
      role
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`;

// ============================================================================
// CHAT / CONVERSATION QUERIES & MUTATIONS
// ============================================================================

export const GET_CONVERSATIONS = gql`
  query GetConversations($input: PaginationInput) {
    conversations(input: $input) {
      id
      title
      messageCount
      lastMessage
      lastMessageDate
      createdAt
      updatedAt
    }
  }
`;

export const GET_CONVERSATION = gql`
  query GetConversation($id: ID!) {
    conversation(id: $id) {
      id
      title
      messageCount
      createdAt
      messages {
        id
        role
        content
        tokenCount
        createdAt
      }
    }
  }
`;

export const GET_CHAT_STATS = gql`
  query GetChatStats {
    chatStats {
      totalConversations
      totalMessages
      totalTokensUsed
      averageConversationLength
    }
  }
`;

export const SEARCH_CONVERSATIONS = gql`
  query SearchConversations($query: String!, $input: PaginationInput) {
    searchConversations(query: $query, input: $input) {
      id
      title
      messageCount
      lastMessage
      createdAt
    }
  }
`;

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($input: CreateConversationInput) {
    createConversation(input: $input) {
      id
      title
      createdAt
    }
  }
`;

export const UPDATE_CONVERSATION = gql`
  mutation UpdateConversation($id: ID!, $input: UpdateConversationInput!) {
    updateConversation(id: $id, input: $input) {
      success
      message
      conversation {
        id
        title
        updatedAt
      }
    }
  }
`;

export const DELETE_CONVERSATION = gql`
  mutation DeleteConversation($id: ID!) {
    deleteConversation(id: $id) {
      success
      message
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($conversationId: ID!, $input: SendMessageInput!) {
    sendMessage(conversationId: $conversationId, input: $input) {
      success
      message {
        id
        conversationId
        role
        content
        tokenCount
        createdAt
      }
      conversationId
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($conversationId: ID!, $messageId: ID!) {
    deleteMessage(conversationId: $conversationId, messageId: $messageId) {
      success
      message
    }
  }
`;

// ============================================================================
// ADMIN QUERIES & MUTATIONS
// ============================================================================

export const GET_SYSTEM_STATS = gql`
  query GetSystemStats {
    systemStats {
      totalUsers
      totalConversations
      totalMessages
      activeUsers24h
      totalTokensUsed
      averageResponseTime
      systemUptime
    }
  }
`;

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($input: PaginationInput) {
    auditLogs(input: $input) {
      id
      userId
      action
      resource
      changes
      ipAddress
      userAgent
      timestamp
      status
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: UserRole!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      role
    }
  }
`;

export const DEACTIVATE_USER = gql`
  mutation DeactivateUser($userId: ID!) {
    deactivateUser(userId: $userId) {
      id
      isActive
    }
  }
`;

export const ACTIVATE_USER = gql`
  mutation ActivateUser($userId: ID!) {
    activateUser(userId: $userId) {
      id
      isActive
    }
  }
`;

// ============================================================================
// HEALTH CHECK QUERY
// ============================================================================

export const HEALTH_CHECK = gql`
  query HealthCheck {
    health
  }
`;

export const GATEWAY_HEALTH_CHECK = gql`
  query GatewayHealthCheck {
    _service {
      sdl
    }
  }
`;
