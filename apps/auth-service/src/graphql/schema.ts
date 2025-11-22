import gql from 'graphql-tag';

export const typeDefs = gql`
  # Federation directive
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  # User type with federation support
  type User @key(fields: "id") {
    id: ID!
    email: String!
    username: String
    firstName: String
    lastName: String
    role: UserRole!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
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

  # Authentication response
  type AuthResponse {
    success: Boolean!
    message: String
    user: User
    token: String
    refreshToken: String
  }

  # Login input
  input LoginInput {
    email: String!
    password: String!
  }

  # Register input
  input RegisterInput {
    email: String!
    password: String!
    username: String
    firstName: String
    lastName: String
  }

  # Update profile input
  input UpdateProfileInput {
    username: String
    firstName: String
    lastName: String
  }

  # Query type
  type Query {
    # Get current authenticated user
    me: User

    # Get user by ID (requires federation reference)
    user(id: ID!): User

    # Get user by email
    userByEmail(email: String!): User

    # Check if email exists
    emailExists(email: String!): Boolean!

    # Health check for subgraph
    health: String! @shareable
  }

  # Mutation type
  type Mutation {
    # User authentication
    login(input: LoginInput!): AuthResponse!
    register(input: RegisterInput!): AuthResponse!
    logout: AuthResponse!
    refreshToken: AuthResponse!

    # User profile management
    updateProfile(input: UpdateProfileInput!): User
    changePassword(oldPassword: String!, newPassword: String!): AuthResponse!

    # Admin operations
    updateUserRole(userId: ID!, role: UserRole!): User
    deactivateUser(userId: ID!): User
    activateUser(userId: ID!): User
  }

  # Subscription type (for future real-time features)
  type Subscription {
    userStatusChanged: User!
  }
`;
