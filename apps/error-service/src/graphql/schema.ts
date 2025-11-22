import gql from 'graphql-tag';

export const typeDefs = gql`
  # Federation directive
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  # Error severity levels
  enum ErrorSeverity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  # Error status
  enum ErrorStatus {
    NEW
    ACKNOWLEDGED
    INVESTIGATING
    RESOLVED
  }

  # Error log entry
  type ErrorLog @key(fields: "id") {
    id: ID!
    errorId: String!
    message: String!
    stack: String
    componentStack: String
    context: String
    severity: ErrorSeverity!
    status: ErrorStatus!
    app: String!
    page: String
    userId: String
    sessionId: String
    userAgent: String
    url: String
    environment: String!
    timestamp: DateTime!
    resolvedAt: DateTime
    acknowledgedAt: DateTime
    metadata: JSON
  }

  # Error statistics
  type ErrorStats {
    totalErrors: Int!
    errorsByApp: [AppErrorCount!]!
    errorsByPage: [PageErrorCount!]!
    errorsBySeverity: [SeverityCount!]!
    criticalErrors: Int!
    resolvedErrors: Int!
    unresolvedErrors: Int!
  }

  # App error count
  type AppErrorCount {
    app: String!
    count: Int!
  }

  # Page error count
  type PageErrorCount {
    page: String!
    app: String!
    count: Int!
  }

  # Severity count
  type SeverityCount {
    severity: ErrorSeverity!
    count: Int!
  }

  # Error trend data
  type ErrorTrend {
    timestamp: DateTime!
    errorCount: Int!
  }

  # Scalar types
  scalar DateTime
  scalar JSON

  # Query type
  type Query {
    # Get error log by ID
    errorLog(id: ID!): ErrorLog

    # List error logs with filtering
    errorLogs(
      limit: Int! = 50
      offset: Int! = 0
      app: String
      page: String
      severity: ErrorSeverity
      status: ErrorStatus
      fromDate: DateTime
      toDate: DateTime
    ): [ErrorLog!]!

    # Get error count
    errorLogsCount(
      app: String
      page: String
      severity: ErrorSeverity
      status: ErrorStatus
      fromDate: DateTime
      toDate: DateTime
    ): Int!

    # Get error statistics
    errorStats(fromDate: DateTime, toDate: DateTime): ErrorStats!

    # Get error trends
    errorTrends(
      app: String
      page: String
      interval: String! = "hour"
      fromDate: DateTime
      toDate: DateTime
    ): [ErrorTrend!]!

    # Get recent critical errors
    recentCriticalErrors(limit: Int! = 10): [ErrorLog!]!

    # Get errors by app
    errorsByApp(limit: Int! = 50): [AppErrorCount!]!

    # Health check for subgraph
    health: String!
  }

  # Mutation type
  type Mutation {
    # Create error log entry
    createErrorLog(input: CreateErrorLogInput!): ErrorLog!

    # Update error log status
    updateErrorLogStatus(id: ID!, status: ErrorStatus!): ErrorLog!

    # Acknowledge error
    acknowledgeErrorLog(id: ID!): ErrorLog!

    # Resolve error
    resolveErrorLog(id: ID!): ErrorLog!

    # Batch create error logs
    createErrorLogsBatch(input: [CreateErrorLogInput!]!): [ErrorLog!]!

    # Delete error logs older than date
    deleteErrorLogsBefore(date: DateTime!): Int!
  }

  # Input types
  input CreateErrorLogInput {
    errorId: String!
    message: String!
    stack: String
    componentStack: String
    context: String
    severity: ErrorSeverity!
    app: String!
    page: String
    userId: String
    sessionId: String
    userAgent: String
    url: String
    environment: String!
    metadata: JSON
  }

  # Subscription type (for real-time error monitoring)
  type Subscription {
    errorLogCreated: ErrorLog!
    criticalErrorDetected: ErrorLog!
  }
`;
