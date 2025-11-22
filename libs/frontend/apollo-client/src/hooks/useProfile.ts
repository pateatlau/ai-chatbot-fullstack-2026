import { useQuery, useMutation, useApolloClient } from '@apollo/client';
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
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const client = useApolloClient();

  const [updateProfile] = useMutation(UPDATE_PROFILE, {
    onCompleted: (data) => {
      if (data?.updateProfile) {
        // Refetch GET_ME query to keep profile in sync
        client
          .refetchQueries({
            include: [GET_ME],
          })
          .catch((err) => {
            console.error('Error refetching profile:', err);
          });
      }
    },
    errorPolicy: 'all',
  });

  return (variables: any) =>
    updateProfile({
      variables: { input: variables },
    });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  const [changePassword] = useMutation(CHANGE_PASSWORD, {
    errorPolicy: 'all',
  });

  return (oldPassword: string, newPassword: string) =>
    changePassword({
      variables: { oldPassword, newPassword },
    });
}

/**
 * Combined hook for profile operations (similar to useChat pattern)
 */
export function useProfileOperations() {
  const profileQuery = useQuery(GET_ME, {
    errorPolicy: 'all',
  });

  const client = useApolloClient();

  const [updateProfileMutation] = useMutation(UPDATE_PROFILE, {
    onCompleted: (data) => {
      if (data?.updateProfile) {
        client
          .refetchQueries({
            include: [GET_ME],
          })
          .catch((err) => {
            console.error('Error refetching profile:', err);
          });
      }
    },
    errorPolicy: 'all',
  });

  const [changePasswordMutation] = useMutation(CHANGE_PASSWORD, {
    errorPolicy: 'all',
  });

  const updateProfile = (variables: any) =>
    updateProfileMutation({
      variables: { input: variables },
    });

  const changePassword = (oldPassword: string, newPassword: string) =>
    changePasswordMutation({
      variables: { oldPassword, newPassword },
    });

  return {
    ...profileQuery,
    updateProfile,
    changePassword,
  };
}
