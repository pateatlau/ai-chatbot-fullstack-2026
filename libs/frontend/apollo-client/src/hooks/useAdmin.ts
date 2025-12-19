import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
  GET_USERS,
  GET_USER,
  UPDATE_USER,
  DELETE_USER,
  RESET_PASSWORD,
  GET_SYSTEM_STATS,
  GET_AUDIT_LOGS,
  UPDATE_USER_ROLE,
  DEACTIVATE_USER,
  ACTIVATE_USER,
} from '../queries';

/**
 * Hook to fetch paginated list of users
 */
export function useGetUsers(page = 1, limit = 10) {
  return useQuery(GET_USERS, {
    variables: {
      input: { page, limit },
    },
    errorPolicy: 'all',
  });
}

/**
 * Hook to fetch a single user by ID
 */
export function useGetUser(id: string | null) {
  return useQuery(GET_USER, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const client = useApolloClient();

  const [updateUserMutation] = useMutation(UPDATE_USER, {
    onCompleted: (data) => {
      if (data?.updateUser) {
        // Refetch users list to keep in sync
        client
          .refetchQueries({
            include: [GET_USERS, GET_USER],
          })
          .catch((err) => {
            console.error('Error refetching users:', err);
          });
      }
    },
    errorPolicy: 'all',
  });

  return (id: string, variables: any) =>
    updateUserMutation({
      variables: { id, input: variables },
    });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const client = useApolloClient();

  const [deleteUserMutation] = useMutation(DELETE_USER, {
    onCompleted: (data) => {
      if (data?.deleteUser?.success) {
        // Refetch users list after deletion
        client
          .refetchQueries({
            include: [GET_USERS],
          })
          .catch((err) => {
            console.error('Error refetching users:', err);
          });
      }
    },
    errorPolicy: 'all',
  });

  return (id: string) =>
    deleteUserMutation({
      variables: { id },
    });
}

/**
 * Hook to reset a user's password
 */
export function useResetPassword() {
  const [resetPasswordMutation] = useMutation(RESET_PASSWORD, {
    errorPolicy: 'all',
  });

  return (userId: string, newPassword: string) =>
    resetPasswordMutation({
      variables: { userId, newPassword },
    });
}

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
