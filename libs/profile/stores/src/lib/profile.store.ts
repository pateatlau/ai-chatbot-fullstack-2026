// libs/profile/stores/src/lib/profile.store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getEventBus, EVENT_NAMES, useEventBus } from '@myapp/shared/event-bus';
import { useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'es' | 'fr' | 'de';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showLocation: boolean;
  };
}

export interface ProfileState {
  // State
  profile: UserProfile | null;
  settings: ProfileSettings;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions - Profile
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;

  // Actions - Settings
  setSettings: (settings: ProfileSettings) => void;
  updateSettings: (updates: Partial<ProfileSettings>) => void;
  setTheme: (theme: ProfileSettings['theme']) => void;
  setLanguage: (language: ProfileSettings['language']) => void;

  // Actions - Loading/Error
  setLoading: (isLoading: boolean) => void;
  setSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultSettings: ProfileSettings = {
  theme: 'auto',
  language: 'en',
  notifications: {
    email: true,
    push: false,
    inApp: true,
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showLocation: false,
  },
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      settings: defaultSettings,
      isLoading: false,
      isSaving: false,
      error: null,

      // Profile actions
      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) => {
        const currentProfile = get().profile;
        if (!currentProfile) return;

        const updatedProfile = {
          ...currentProfile,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        set({ profile: updatedProfile });

        // Note: Profile update events are emitted by auth.store
        // This store just listens and syncs
      },

      clearProfile: () => set({ profile: null }),

      // Settings actions
      setSettings: (settings) => set({ settings }),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      setTheme: (theme) => {
        get().updateSettings({ theme });

        // Emit theme changed event
        const eventBus = getEventBus();
        eventBus.emit(EVENT_NAMES.THEME_CHANGED, {
          theme,
          timestamp: Date.now(),
        });
      },

      setLanguage: (language) => {
        get().updateSettings({ language });
      },

      // Loading/error actions
      setLoading: (isLoading) => set({ isLoading }),
      setSaving: (isSaving) => set({ isSaving }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        // Profile data comes from auth, don't persist here
      }),
    }
  )
);

/**
 * Hook to sync profile store with auth events
 * Call this in the Profile MFE root component
 */
export function useProfileSync() {
  const setProfile = useProfileStore((state) => state.setProfile);
  const clearProfile = useProfileStore((state) => state.clearProfile);

  // Listen to user login event
  useEventBus(EVENT_NAMES.USER_LOGGED_IN, (event) => {
    setProfile({
      id: event.user.id,
      email: event.user.email,
      name: event.user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  // Listen to user logout event
  useEventBus(EVENT_NAMES.USER_LOGGED_OUT, () => {
    clearProfile();
  });

  // Listen to profile update event
  useEventBus(EVENT_NAMES.USER_PROFILE_UPDATED, (event) => {
    const currentProfile = useProfileStore.getState().profile;
    if (currentProfile && currentProfile.id === event.userId) {
      useProfileStore.getState().updateProfile(event.changes);
    }
  });
}
