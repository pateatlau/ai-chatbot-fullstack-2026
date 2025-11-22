import { useMutation, useApolloClient, useQuery } from '@apollo/client';
import {
  GET_ME,
  REGISTER,
  LOGIN,
  LOGOUT,
  REFRESH_TOKEN,
  UPDATE_PROFILE,
  CHANGE_PASSWORD,
} from '../queries';

/**
 * Hook to fetch the current authenticated user
 * Returns null if not authenticated
 */
export function useMe() {
  return useQuery(GET_ME, {
    errorPolicy: 'all',
    skip: !localStorage.getItem('accessToken'),
  });
}

/**
 * Hook to register a new user
 * Automatically stores JWT tokens in localStorage
 */
export function useRegister() {
  const [register] = useMutation(REGISTER);

  return async (email: string, password: string, name: string) => {
    try {
      const result = await register({
        variables: {
          input: { email, password, firstName: name },
        },
      });

      if (result.data?.register?.token) {
        localStorage.setItem('accessToken', result.data.register.token);
        if (result.data.register.refreshToken) {
          localStorage.setItem(
            'refreshToken',
            result.data.register.refreshToken
          );
        }
      }

      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };
}

/**
 * Hook to login an existing user
 * Automatically stores JWT tokens in localStorage
 */
export function useLogin() {
  const [login] = useMutation(LOGIN);

  return async (email: string, password: string) => {
    try {
      const result = await login({
        variables: {
          input: { email, password },
        },
      });

      if (result.data?.login?.token) {
        localStorage.setItem('accessToken', result.data.login.token);
        if (result.data.login.refreshToken) {
          localStorage.setItem('refreshToken', result.data.login.refreshToken);
        }
      }

      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
}

/**
 * Hook to logout the current user
 * Clears Apollo cache and removes tokens from localStorage
 */
export function useLogout() {
  const [logout] = useMutation(LOGOUT);
  const client = useApolloClient();

  return async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout error (continuing anyway):', error);
    } finally {
      client.clearStore();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  };
}

/**
 * Hook to refresh the access token
 */
export function useRefreshToken() {
  const [refresh] = useMutation(REFRESH_TOKEN);

  return async () => {
    try {
      const result = await refresh();

      if (result.data?.refreshToken?.token) {
        localStorage.setItem('accessToken', result.data.refreshToken.token);
        if (result.data.refreshToken.refreshToken) {
          localStorage.setItem(
            'refreshToken',
            result.data.refreshToken.refreshToken
          );
        }
      }

      return result;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw error;
    }
  };
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const [updateProfile] = useMutation(UPDATE_PROFILE, {
    refetchQueries: [{ query: GET_ME }],
  });

  return (name: string) => {
    return updateProfile({
      variables: {
        input: { firstName: name },
      },
    });
  };
}

/**
 * Hook to change user password
 */
export function useChangePassword() {
  const [changePassword] = useMutation(CHANGE_PASSWORD);

  return (currentPassword: string, newPassword: string) => {
    return changePassword({
      variables: {
        oldPassword: currentPassword,
        newPassword: newPassword,
      },
    });
  };
}
