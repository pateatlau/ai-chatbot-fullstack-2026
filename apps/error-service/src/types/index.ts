export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ErrorStatus {
  NEW = 'NEW',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
}

export interface ErrorLogEntry {
  id: string;
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  context?: string;
  severity: ErrorSeverity;
  status: ErrorStatus;
  app: string;
  page?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  environment: string;
  timestamp: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  metadata?: Record<string, any>;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByApp: Array<{ app: string; count: number }>;
  errorsByPage: Array<{ page: string; app: string; count: number }>;
  errorsBySeverity: Array<{ severity: ErrorSeverity; count: number }>;
  criticalErrors: number;
  resolvedErrors: number;
  unresolvedErrors: number;
}

export interface ErrorTrend {
  timestamp: Date;
  errorCount: number;
}

export interface AppErrorCount {
  app: string;
  count: number;
}
