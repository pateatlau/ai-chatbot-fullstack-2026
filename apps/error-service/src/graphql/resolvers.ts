import { IResolvers } from '@graphql-tools/utils';
import { errorLogService } from '../services/error-log.service';
import { ErrorSeverity, ErrorStatus } from '../types';

export const resolvers: IResolvers = {
  Query: {
    errorLog: async (_parent, { id }) => {
      return errorLogService.getErrorLogById(id);
    },

    errorLogs: async (
      _parent,
      { limit, offset, app, page, severity, status, fromDate, toDate }
    ) => {
      return errorLogService.getErrorLogs({
        limit,
        offset,
        app,
        page,
        severity,
        status,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
      });
    },

    errorLogsCount: async (
      _parent,
      { app, page, severity, status, fromDate, toDate }
    ) => {
      return errorLogService.countErrorLogs({
        app,
        page,
        severity,
        status,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
      });
    },

    errorStats: async (_parent, { fromDate, toDate }) => {
      return errorLogService.getErrorStats(
        fromDate ? new Date(fromDate) : undefined,
        toDate ? new Date(toDate) : undefined
      );
    },

    errorTrends: async (_parent, { app, page, interval, fromDate, toDate }) => {
      return errorLogService.getErrorTrends({
        app,
        page,
        interval,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
      });
    },

    recentCriticalErrors: async (_parent, { limit }) => {
      return errorLogService.getRecentCriticalErrors(limit);
    },

    errorsByApp: async (_parent, { limit }) => {
      return errorLogService.getErrorsByApp(limit);
    },

    health: () => 'OK',
  },

  Mutation: {
    createErrorLog: async (_parent, { input }) => {
      // Map severity string to enum
      const severity = Object.values(ErrorSeverity).includes(input.severity)
        ? input.severity
        : ErrorSeverity.MEDIUM;

      return errorLogService.createErrorLog({
        ...input,
        severity,
      });
    },

    createErrorLogsBatch: async (_parent, { input }) => {
      const entries = input.map((item: any) => ({
        ...item,
        severity: Object.values(ErrorSeverity).includes(item.severity)
          ? item.severity
          : ErrorSeverity.MEDIUM,
      }));

      return errorLogService.createErrorLogsBatch(entries);
    },

    updateErrorLogStatus: async (_parent, { id, status }) => {
      return errorLogService.updateErrorLogStatus(id, status);
    },

    acknowledgeErrorLog: async (_parent, { id }) => {
      return errorLogService.acknowledgeErrorLog(id);
    },

    resolveErrorLog: async (_parent, { id }) => {
      return errorLogService.resolveErrorLog(id);
    },

    deleteErrorLogsBefore: async (_parent, { date }) => {
      return errorLogService.deleteErrorLogsBefore(new Date(date));
    },
  },
};
