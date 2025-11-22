import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null; // Tokens are no longer persisted to localStorage
  refreshToken: string | null; // Tokens are stored in HttpOnly cookies only
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (
    user: User,
    accessToken?: string | null,
    refreshToken?: string | null
  ) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken: accessToken || null, // Store token for cross-port API calls (also in HttpOnly cookie)
          refreshToken: refreshToken || null, // Store token for cross-port API calls (also in HttpOnly cookie)
          isAuthenticated: true,
          isLoading: false,
        });

        // Emit user logged in event
        const eventBus = getEventBus();
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as 'user' | 'admin',
          },
          timestamp: Date.now(),
        });
      },

      clearAuth: () => {
        const currentUser = useAuthStore.getState().user;

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Emit user logged out event
        if (currentUser) {
          const eventBus = getEventBus();
          eventBus.emit(EVENT_NAMES.USER_LOGGED_OUT, {
            userId: currentUser.id,
            timestamp: Date.now(),
          });
        }
      },

      setUser: (user) => {
        const currentUser = useAuthStore.getState().user;
        set({ user });

        // Emit user profile updated event if there are changes
        if (currentUser && user) {
          const changes: {
            name?: string;
            email?: string;
            avatar?: string;
          } = {};

          if (currentUser.name !== user.name) {
            changes.name = user.name;
          }
          if (currentUser.email !== user.email) {
            changes.email = user.email;
          }
          if (currentUser.avatar !== user.avatar && user.avatar) {
            changes.avatar = user.avatar;
          }

          if (Object.keys(changes).length > 0) {
            const eventBus = getEventBus();
            eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
              userId: user.id,
              changes,
              timestamp: Date.now(),
            });
          }
        }
      },

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }), // Store for cross-port API calls

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken, // Persisted for dev cross-port API calls
        refreshToken: state.refreshToken, // Persisted for dev cross-port API calls
        // NOTE: Also stored in HttpOnly cookies for production use
      }),
    }
  )
);
