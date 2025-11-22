import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
  useUpdateProfile as useUpdateProfileAuth,
  useChangePassword as useChangePasswordAuth,
} from './useAuth';
import { GET_ME, UPDATE_PROFILE, CHANGE_PASSWORD } from '../queries';

/**
 * Hook to fetch current user profile
 */
export function useProfile() {
  return useQuery(GET_ME, {
    errorPolicy: 'all',
  });
}

/**
 * Combined hook for profile operations (similar to useChat pattern)
 * Combines profile fetching with update and password change operations
 */
export function useProfileOperations() {
  const profileQuery = useQuery(GET_ME, {
    errorPolicy: 'all',
  });

  const updateProfile = useUpdateProfileAuth();
  const changePassword = useChangePasswordAuth();

  return {
    ...profileQuery,
    updateProfile,
    changePassword,
  };
}
