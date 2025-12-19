import { PrismaClient } from '@prisma/client';
import { ErrorSeverity, ErrorStatus } from './types';

const prisma = new PrismaClient();

export class ErrorLogService {
  /**
   * Create a single error log entry
   */
  async createErrorLog(data: {
    errorId: string;
    message: string;
    stack?: string;
    componentStack?: string;
    context?: string;
    severity: ErrorSeverity;
    app: string;
    page?: string;
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    url?: string;
    environment: string;
    metadata?: Record<string, any>;
  }) {
    return prisma.errorLog.create({
      data: {
        errorId: data.errorId,
        message: data.message,
        stack: data.stack,
        componentStack: data.componentStack,
        context: data.context,
        severity: data.severity,
        status: ErrorStatus.NEW,
        app: data.app,
        page: data.page,
        userId: data.userId,
        sessionId: data.sessionId,
        userAgent: data.userAgent,
        url: data.url,
        environment: data.environment,
        metadata: data.metadata,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Create multiple error log entries
   */
  async createErrorLogsBatch(
    entries: Array<{
      errorId: string;
      message: string;
      stack?: string;
      componentStack?: string;
      context?: string;
      severity: ErrorSeverity;
      app: string;
      page?: string;
      userId?: string;
      sessionId?: string;
      userAgent?: string;
      url?: string;
      environment: string;
      metadata?: Record<string, any>;
    }>
  ) {
    return Promise.all(entries.map((entry) => this.createErrorLog(entry)));
  }

  /**
   * Get error log by ID
   */
  async getErrorLogById(id: string) {
    return prisma.errorLog.findUnique({
      where: { id },
    });
  }

  /**
   * Get error logs with filtering
   */
  async getErrorLogs(filters: {
    limit: number;
    offset: number;
    app?: string;
    page?: string;
    severity?: ErrorSeverity;
    status?: ErrorStatus;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const where: any = {};

    if (filters.app) where.app = filters.app;
    if (filters.page) where.page = filters.page;
    if (filters.severity) where.severity = filters.severity;
    if (filters.status) where.status = filters.status;

    if (filters.fromDate || filters.toDate) {
      where.timestamp = {};
      if (filters.fromDate) where.timestamp.gte = filters.fromDate;
      if (filters.toDate) where.timestamp.lte = filters.toDate;
    }

    return prisma.errorLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters.limit,
      skip: filters.offset,
    });
  }

  /**
   * Count error logs with filtering
   */
  async countErrorLogs(filters: {
    app?: string;
    page?: string;
    severity?: ErrorSeverity;
    status?: ErrorStatus;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const where: any = {};

    if (filters.app) where.app = filters.app;
    if (filters.page) where.page = filters.page;
    if (filters.severity) where.severity = filters.severity;
    if (filters.status) where.status = filters.status;

    if (filters.fromDate || filters.toDate) {
      where.timestamp = {};
      if (filters.fromDate) where.timestamp.gte = filters.fromDate;
      if (filters.toDate) where.timestamp.lte = filters.toDate;
    }

    return prisma.errorLog.count({ where });
  }

  /**
   * Get error statistics
   */
  async getErrorStats(fromDate?: Date, toDate?: Date) {
    const where: any = {};

    if (fromDate || toDate) {
      where.timestamp = {};
      if (fromDate) where.timestamp.gte = fromDate;
      if (toDate) where.timestamp.lte = toDate;
    }

    const [
      totalErrors,
      errorsByApp,
      errorsBySeverity,
      criticalErrors,
      resolvedErrors,
    ] = await Promise.all([
      prisma.errorLog.count({ where }),
      prisma.errorLog.groupBy({
        by: ['app'],
        where,
        _count: true,
      }),
      prisma.errorLog.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
      prisma.errorLog.count({
        where: { ...where, severity: ErrorSeverity.CRITICAL },
      }),
      prisma.errorLog.count({
        where: { ...where, status: ErrorStatus.RESOLVED },
      }),
    ]);

    return {
      totalErrors,
      errorsByApp: errorsByApp.map((item: any) => ({
        app: item.app,
        count: item._count,
      })),
      errorsBySeverity: errorsBySeverity.map((item: any) => ({
        severity: item.severity,
        count: item._count,
      })),
      criticalErrors,
      resolvedErrors,
      unresolvedErrors: totalErrors - resolvedErrors,
    };
  }

  /**
   * Get error trends
   */
  async getErrorTrends(filters: {
    app?: string;
    page?: string;
    interval?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const where: any = {};

    if (filters.app) where.app = filters.app;
    if (filters.page) where.page = filters.page;

    const fromDate =
      filters.fromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default 7 days
    const toDate = filters.toDate || new Date();

    where.timestamp = {
      gte: fromDate,
      lte: toDate,
    };

    const errors = await prisma.errorLog.findMany({
      where,
      select: { timestamp: true },
    });

    // Group by interval
    const trends: Record<string, number> = {};
    errors.forEach((error: any) => {
      const timestamp = new Date(error.timestamp);
      let key: string;

      switch (filters.interval) {
        case 'hour':
          key = timestamp.toISOString().slice(0, 13);
          break;
        case 'day':
          key = timestamp.toISOString().slice(0, 10);
          break;
        case 'week':
          const weekStart = new Date(timestamp);
          weekStart.setDate(timestamp.getDate() - timestamp.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        default:
          key = timestamp.toISOString().slice(0, 10);
      }

      trends[key] = (trends[key] || 0) + 1;
    });

    return Object.entries(trends).map(([timestamp, errorCount]) => ({
      timestamp: new Date(timestamp),
      errorCount,
    }));
  }

  /**
   * Get recent critical errors
   */
  async getRecentCriticalErrors(limit: number = 10) {
    return prisma.errorLog.findMany({
      where: { severity: ErrorSeverity.CRITICAL },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Get errors by app
   */
  async getErrorsByApp(limit: number = 50) {
    const results = await prisma.errorLog.groupBy({
      by: ['app'],
      _count: true,
      orderBy: { _count: { app: 'desc' } },
      take: limit,
    });

    return results.map((item: any) => ({
      app: item.app,
      count: item._count,
    }));
  }

  /**
   * Update error log status
   */
  async updateErrorLogStatus(id: string, status: ErrorStatus) {
    return prisma.errorLog.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Acknowledge error log
   */
  async acknowledgeErrorLog(id: string) {
    return prisma.errorLog.update({
      where: { id },
      data: {
        status: ErrorStatus.ACKNOWLEDGED,
        acknowledgedAt: new Date(),
      },
    });
  }

  /**
   * Resolve error log
   */
  async resolveErrorLog(id: string) {
    return prisma.errorLog.update({
      where: { id },
      data: {
        status: ErrorStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    });
  }

  /**
   * Delete error logs older than date
   */
  async deleteErrorLogsBefore(date: Date) {
    const result = await prisma.errorLog.deleteMany({
      where: {
        timestamp: {
          lt: date,
        },
      },
    });

    return result.count;
  }
}

export const errorLogService = new ErrorLogService();
