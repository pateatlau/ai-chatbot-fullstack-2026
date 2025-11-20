import gql from 'graphql-tag';

export const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@external"]
    )

  # Extend User from Auth Service
  extend type User @key(fields: "id") {
    id: ID! @external
    role: UserRole!
    permissions: [String!]!
  }

  # Admin-specific user role
  enum UserRole {
    SUPER_ADMIN
    ADMIN
    MODERATOR
    USER
  }

  # Service admin type
  type Admin @key(fields: "id") {
    id: ID!
    userId: String!
    user: User!
    role: UserRole!
    permissions: [String!]!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # System statistics
  type SystemStats {
    totalUsers: Int!
    totalConversations: Int!
    totalMessages: Int!
    activeUsers24h: Int!
    totalTokensUsed: Int!
    averageResponseTime: Float!
    systemUptime: Int!
  }

  # Audit log entry
  type AuditLog @key(fields: "id") {
    id: ID!
    userId: String!
    action: String!
    resource: String!
    changes: String!
    timestamp: DateTime!
  }

  # Scalar
  scalar DateTime

  # Input types
  input AssignRoleInput {
    userId: ID!
    role: UserRole!
  }

  input UpdatePermissionsInput {
    userId: ID!
    permissions: [String!]!
  }

  # Query
  type Query {
    # Admin queries
    admin(id: ID!): Admin
    admins(input: PaginationInput): [Admin!]!

    # System management
    systemStats: SystemStats!
    auditLogs(input: PaginationInput): [AuditLog!]!

    # Health and metrics
    health: String!
  }

  # Mutation
  type Mutation {
    # Role management
    assignRole(input: AssignRoleInput!): Admin!
    updatePermissions(input: UpdatePermissionsInput!): Admin!
    removeAdmin(userId: ID!): Admin!

    # System management
    clearAuditLogs(beforeDate: DateTime!): Boolean!
  }

  # Input
  input PaginationInput {
    page: Int
    limit: Int
  }
`;
