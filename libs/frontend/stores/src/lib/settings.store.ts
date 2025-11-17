import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

interface SettingsState {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  emailNotifications: true,
  pushNotifications: false,
  weeklyDigest: true,
  theme: 'light',
  language: 'en',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () =>
        set(() => ({
          settings: defaultSettings,
        })),
    }),
    {
      name: 'user-settings',
    }
  )
);
