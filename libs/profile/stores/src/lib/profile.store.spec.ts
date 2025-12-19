import { act, renderHook } from '@testing-library/react';
import { useProfileStore, useProfileSync } from './profile.store';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useProfileStore', () => {
  let eventBus: ReturnType<typeof getEventBus>;

  beforeEach(() => {
    // Clear localStorage
    localStorageMock.clear();

    // Reset store state before each test
    useProfileStore.setState({
      profile: null,
      settings: {
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
      },
      isLoading: false,
      isSaving: false,
      error: null,
    });

    // Get fresh event bus instance
    eventBus = getEventBus();
    eventBus.clear();
  });

  afterEach(() => {
    eventBus.clear();
    localStorageMock.clear();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useProfileStore());

      expect(result.current.profile).toBeNull();
      expect(result.current.settings.theme).toBe('auto');
      expect(result.current.settings.language).toBe('en');
      expect(result.current.settings.notifications.email).toBe(true);
      expect(result.current.settings.privacy.profileVisibility).toBe('public');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Profile Management', () => {
    const mockProfile = {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      bio: 'Test bio',
      location: 'San Francisco',
      website: 'https://example.com',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    it('should set profile', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile(mockProfile);
      });

      expect(result.current.profile).toEqual(mockProfile);
    });

    it('should update profile', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile(mockProfile);
        result.current.updateProfile({
          name: 'Updated Name',
          bio: 'Updated bio',
        });
      });

      expect(result.current.profile?.name).toBe('Updated Name');
      expect(result.current.profile?.bio).toBe('Updated bio');
      expect(result.current.profile?.updatedAt).not.toBe(mockProfile.updatedAt);
    });

    it('should not update profile when profile is null', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.updateProfile({ name: 'Should not update' });
      });

      expect(result.current.profile).toBeNull();
    });

    it('should clear profile', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile(mockProfile);
        result.current.clearProfile();
      });

      expect(result.current.profile).toBeNull();
    });

    it('should handle partial profile updates', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile(mockProfile);
        result.current.updateProfile({
          avatar: 'https://new-avatar.com/pic.jpg',
        });
      });

      expect(result.current.profile?.avatar).toBe(
        'https://new-avatar.com/pic.jpg'
      );
      expect(result.current.profile?.name).toBe('Test User');
    });
  });

  describe('Settings Management', () => {
    it('should set complete settings', () => {
      const { result } = renderHook(() => useProfileStore());

      const newSettings = {
        theme: 'dark' as const,
        language: 'es' as const,
        notifications: {
          email: false,
          push: true,
          inApp: false,
        },
        privacy: {
          profileVisibility: 'private' as const,
          showEmail: true,
          showLocation: true,
        },
      };

      act(() => {
        result.current.setSettings(newSettings);
      });

      expect(result.current.settings).toEqual(newSettings);
    });

    it('should update partial settings', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.updateSettings({
          notifications: {
            email: false,
            push: true,
            inApp: false,
          },
        });
      });

      expect(result.current.settings.notifications.email).toBe(false);
      expect(result.current.settings.notifications.push).toBe(true);
      expect(result.current.settings.theme).toBe('auto'); // Unchanged
    });

    it('should set theme and emit THEME_CHANGED event', () => {
      const { result } = renderHook(() => useProfileStore());
      const mockListener = jest.fn();

      eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, mockListener);

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.settings.theme).toBe('dark');

      // Verify event emitted
      expect(mockListener).toHaveBeenCalledTimes(1);
      const emittedEvent = mockListener.mock.calls[0]?.[0];
      expect(emittedEvent.theme).toBe('dark');
      expect(emittedEvent.timestamp).toBeDefined();
    });

    it('should set language', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setLanguage('fr');
      });

      expect(result.current.settings.language).toBe('fr');
    });

    it('should change theme multiple times', () => {
      const { result } = renderHook(() => useProfileStore());
      const mockListener = jest.fn();

      eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, mockListener);

      act(() => {
        result.current.setTheme('dark');
        result.current.setTheme('light');
        result.current.setTheme('auto');
      });

      expect(result.current.settings.theme).toBe('auto');
      expect(mockListener).toHaveBeenCalledTimes(3);
    });
  });

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should set saving state', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setSaving(true);
      });

      expect(result.current.isSaving).toBe(true);

      act(() => {
        result.current.setSaving(false);
      });

      expect(result.current.isSaving).toBe(false);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => useProfileStore());
      const errorMessage = 'Failed to update profile';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should clear error state', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setError('Some error');
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('useProfileSync Hook', () => {
    it('should sync profile on USER_LOGGED_IN event', () => {
      const { result: storeResult } = renderHook(() => useProfileStore());
      const { result: syncResult } = renderHook(() => useProfileSync());

      const loginEvent = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          role: 'user' as const,
        },
        timestamp: Date.now(),
      };

      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, loginEvent);
      });

      expect(storeResult.current.profile).toBeDefined();
      expect(storeResult.current.profile?.id).toBe('user-123');
      expect(storeResult.current.profile?.email).toBe('user@example.com');
      expect(storeResult.current.profile?.name).toBe('Test User');
    });

    it('should clear profile on USER_LOGGED_OUT event', () => {
      const { result: storeResult } = renderHook(() => useProfileStore());
      const { result: syncResult } = renderHook(() => useProfileSync());

      // First set a profile
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Test User',
            role: 'user',
          },
          timestamp: Date.now(),
        });
      });

      expect(storeResult.current.profile).not.toBeNull();

      // Then logout
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_OUT, {
          userId: 'user-123',
          timestamp: Date.now(),
        });
      });

      expect(storeResult.current.profile).toBeNull();
    });

    it('should sync profile updates on USER_PROFILE_UPDATED event', () => {
      const { result: storeResult } = renderHook(() => useProfileStore());
      const { result: syncResult } = renderHook(() => useProfileSync());

      // First login
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Test User',
            role: 'user',
          },
          timestamp: Date.now(),
        });
      });

      // Then update profile
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
          userId: 'user-123',
          changes: {
            name: 'Updated Name',
            email: 'updated@example.com',
          },
          timestamp: Date.now(),
        });
      });

      expect(storeResult.current.profile?.name).toBe('Updated Name');
      expect(storeResult.current.profile?.email).toBe('updated@example.com');
    });

    it('should not update profile for different user', () => {
      const { result: storeResult } = renderHook(() => useProfileStore());
      const { result: syncResult } = renderHook(() => useProfileSync());

      // Login as user-123
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Test User',
            role: 'user',
          },
          timestamp: Date.now(),
        });
      });

      const originalName = storeResult.current.profile?.name;

      // Try to update different user
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
          userId: 'user-456', // Different user
          changes: {
            name: 'Should Not Update',
          },
          timestamp: Date.now(),
        });
      });

      expect(storeResult.current.profile?.name).toBe(originalName);
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should persist settings to localStorage', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setTheme('dark');
        result.current.setLanguage('es');
      });

      // Check localStorage
      const stored = localStorageMock.getItem('profile-storage');
      expect(stored).toBeDefined();

      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.settings.theme).toBe('dark');
        expect(parsed.state.settings.language).toBe('es');
      }
    });

    it('should not persist profile to localStorage', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile({
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        });
      });

      const stored = localStorageMock.getItem('profile-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.profile).toBeUndefined();
      }
    });
  });

  describe('Event Integration', () => {
    it('should emit THEME_CHANGED event with correct payload', () => {
      const { result } = renderHook(() => useProfileStore());
      const events: Array<{ theme: string; timestamp: number }> = [];

      eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, (payload: any) => {
        events.push(payload);
      });

      act(() => {
        result.current.setTheme('dark');
        result.current.setTheme('light');
      });

      expect(events).toHaveLength(2);
      expect(events[0]?.theme).toBe('dark');
      expect(events[1]?.theme).toBe('light');
      events.forEach((event) => {
        expect(typeof event.timestamp).toBe('number');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null avatar', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile({
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          avatar: null,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        });
      });

      expect(result.current.profile?.avatar).toBeNull();
    });

    it('should handle optional profile fields', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile({
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        });
      });

      expect(result.current.profile?.bio).toBeUndefined();
      expect(result.current.profile?.location).toBeUndefined();
      expect(result.current.profile?.website).toBeUndefined();
    });

    it('should handle all theme options', () => {
      const { result } = renderHook(() => useProfileStore());
      const themes: Array<'light' | 'dark' | 'auto'> = [
        'light',
        'dark',
        'auto',
      ];

      themes.forEach((theme) => {
        act(() => {
          result.current.setTheme(theme);
        });
        expect(result.current.settings.theme).toBe(theme);
      });
    });

    it('should handle all language options', () => {
      const { result } = renderHook(() => useProfileStore());
      const languages: Array<'en' | 'es' | 'fr' | 'de'> = [
        'en',
        'es',
        'fr',
        'de',
      ];

      languages.forEach((language) => {
        act(() => {
          result.current.setLanguage(language);
        });
        expect(result.current.settings.language).toBe(language);
      });
    });

    it('should handle complex settings updates', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.updateSettings({
          notifications: {
            email: false,
            push: true,
            inApp: false,
          },
          privacy: {
            profileVisibility: 'private',
            showEmail: true,
            showLocation: true,
          },
        });
      });

      expect(result.current.settings.notifications.email).toBe(false);
      expect(result.current.settings.notifications.push).toBe(true);
      expect(result.current.settings.privacy.profileVisibility).toBe('private');
      expect(result.current.settings.privacy.showEmail).toBe(true);
    });
  });
});
