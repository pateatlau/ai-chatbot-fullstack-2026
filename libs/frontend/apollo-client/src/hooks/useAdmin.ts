import { useQuery, useMutation } from '@apollo/client';
import {
  GET_SYSTEM_STATS,
  GET_AUDIT_LOGS,
  UPDATE_USER_ROLE,
  DEACTIVATE_USER,
  ACTIVATE_USER,
} from '../queries';

/**
 * Hook to fetch system statistics
 */
export function useSystemStats() {
  return useQuery(GET_SYSTEM_STATS, {
    pollInterval: 60000, // Poll every 60 seconds
    errorPolicy: 'all',
  });
}

/**
 * Hook to fetch audit logs with pagination
 */
export function useAuditLogs(page = 1, limit = 50) {
  return useQuery(GET_AUDIT_LOGS, {
    variables: {
      input: { page, limit },
    },
    errorPolicy: 'all',
  });
}

/**
 * Hook to update a user's role
 */
export function useUpdateUserRole() {
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE, {
    refetchQueries: [{ query: GET_AUDIT_LOGS }],
    errorPolicy: 'all',
  });

  return (userId: string, role: 'USER' | 'ADMIN' | 'MODERATOR') => {
    return updateUserRole({
      variables: {
        userId,
        role,
      },
    });
  };
}

/**
 * Hook to deactivate a user account
 */
export function useDeactivateUser() {
  const [deactivateUser] = useMutation(DEACTIVATE_USER, {
    refetchQueries: [{ query: GET_SYSTEM_STATS }, { query: GET_AUDIT_LOGS }],
    errorPolicy: 'all',
  });

  return (userId: string) => {
    return deactivateUser({
      variables: { userId },
    });
  };
}

/**
 * Hook to activate a user account
 */
export function useActivateUser() {
  const [activateUser] = useMutation(ACTIVATE_USER, {
    refetchQueries: [{ query: GET_SYSTEM_STATS }, { query: GET_AUDIT_LOGS }],
    errorPolicy: 'all',
  });

  return (userId: string) => {
    return activateUser({
      variables: { userId },
    });
  };
}
