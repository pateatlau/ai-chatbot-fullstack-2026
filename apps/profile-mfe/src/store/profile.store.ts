import {
  useProfileStore as useSharedProfileStore,
  useProfileSync,
} from '@ai-chatbot/profile-stores';
import { EVENT_NAMES, useEventBus } from '@myapp/shared/event-bus';

/**
 * MFE-local Profile Store Hook
 *
 * Re-exports the shared profile store for use within the Profile MFE.
 * This provides a clean separation between the MFE and shared libraries.
 */
export const useProfileStore = useSharedProfileStore;

/**
 * Re-export useProfileSync hook for convenience
 *
 * This hook automatically syncs profile data with auth events:
 * - USER_LOGGED_IN: Sets profile from user data
 * - USER_LOGGED_OUT: Clears profile data
 * - USER_PROFILE_UPDATED: Updates profile with changes
 */
export { useProfileSync };

/**
 * Initialize Profile Store with Event Bus subscriptions
 *
 * This hook should be called once at the MFE root level (ProfilePage.tsx or App.tsx)
 * to set up all event listeners and ensure proper cleanup.
 *
 * Note: useProfileSync() hook already handles login/logout/update events,
 * so this initialization is mainly for additional profile-specific events.
 *
 * @example
 * function ProfilePage() {
 *   useProfileStoreInitialization();
 *   useProfileSync(); // Also call this for automatic profile sync
 *   const { profile, settings } = useProfileStore();
 *   // ...
 * }
 */
export function useProfileStoreInitialization() {
  // Listen for theme changes from external sources
  // (e.g., system theme change, admin override)
  useEventBus(EVENT_NAMES.THEME_CHANGED, (event) => {
    const { settings, setTheme } = useProfileStore.getState();

    // Only update if theme is different
    if (settings.theme !== event.theme) {
      console.log('[Profile MFE] External theme change detected:', event.theme);
      setTheme(event.theme);
    }
  });

  // Listen for user role changes (admin promotion/demotion)
  useEventBus(EVENT_NAMES.USER_ROLE_CHANGED, (event) => {
    const { profile } = useProfileStore.getState();

    if (profile && profile.id === event.userId) {
      console.log('[Profile MFE] User role changed:', event.newRole);
      // Role is not part of profile state, but we log it
      // In a real app, you might refetch user data or update a separate role field
    }
  });

  // Cleanup is handled automatically by useEventBus hook
}

/**
 * Hook to broadcast theme changes to other MFEs
 *
 * This is useful when the user changes their theme preference in the Profile MFE,
 * and you want other MFEs to immediately update their UI.
 *
 * @example
 * function ThemeSelector() {
 *   const { settings, setTheme } = useProfileStore();
 *   useThemeBroadcaster();
 *
 *   const handleThemeChange = (newTheme) => {
 *     setTheme(newTheme); // This will emit THEME_CHANGED event
 *   };
 * }
 */
export function useThemeBroadcaster() {
  // Theme changes are automatically broadcast by the store's setTheme action
  // This hook is kept for reference and potential future enhancements

  // Example: Apply theme to document
  useEventBus(EVENT_NAMES.THEME_CHANGED, (event) => {
    console.log('[Profile MFE] Applying theme:', event.theme);
    document.documentElement.setAttribute('data-theme', event.theme);
  });
}

/**
 * Hook to handle profile avatar uploads
 *
 * This demonstrates how to coordinate file uploads with event emission
 * for cross-MFE avatar synchronization.
 */
export function useProfileAvatarUpload() {
  const { profile, updateProfile } = useProfileStore();

  const uploadAvatar = async (file: File): Promise<void> => {
    try {
      console.log('[Profile MFE] Uploading avatar:', file.name);

      // In a real app, upload to storage service
      // const avatarUrl = await uploadFileToS3(file);
      const avatarUrl = URL.createObjectURL(file); // Mock URL for demo

      // Update profile with new avatar
      if (profile) {
        updateProfile({
          avatar: avatarUrl,
        });
      }

      // Event will be automatically emitted by updateProfile action
      console.log('[Profile MFE] Avatar uploaded successfully');
    } catch (error) {
      console.error('[Profile MFE] Avatar upload failed:', error);
      throw error;
    }
  };

  return { uploadAvatar };
}

/**
 * Hook to manage notification preferences
 *
 * Coordinates notification settings with the event bus for cross-MFE sync
 */
export function useNotificationPreferences() {
  const { settings, updateSettings } = useProfileStore();

  const updateNotifications = (
    notifications: Partial<typeof settings.notifications>
  ) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        ...notifications,
      },
    });
  };

  const enableAllNotifications = () => {
    updateNotifications({
      email: true,
      push: true,
      inApp: true,
    });
  };

  const disableAllNotifications = () => {
    updateNotifications({
      email: false,
      push: false,
      inApp: false,
    });
  };

  return {
    notifications: settings.notifications,
    updateNotifications,
    enableAllNotifications,
    disableAllNotifications,
  };
}
