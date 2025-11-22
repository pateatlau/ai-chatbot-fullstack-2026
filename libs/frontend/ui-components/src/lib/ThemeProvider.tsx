/**
 * ThemeProvider Component
 * Manages theme state and provides theme context to the application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, themes } from './theme-config';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
  /**
   * If true, only provides theme context without modifying the root element.
   * Useful for MFEs that run inside a shell that already has a ThemeProvider.
   */
  passive?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  storageKey = 'app-theme',
  passive = false,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Check localStorage for saved theme preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(storageKey) as ThemeMode | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    // Listen for storage events to sync theme across tabs and MFEs
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === storageKey &&
        (e.newValue === 'light' || e.newValue === 'dark')
      ) {
        console.log('[ThemeProvider] Storage event received:', e.newValue);
        setThemeState(e.newValue);
      }
    };

    // Listen for custom event for same-window theme changes
    const handleThemeChange = (e: CustomEvent<ThemeMode>) => {
      console.log(
        '[ThemeProvider] Theme change event received:',
        e.detail,
        'passive:',
        passive
      );
      setThemeState(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('theme-change', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'theme-change',
        handleThemeChange as EventListener
      );
    };
  }, [storageKey, passive]);

  useEffect(() => {
    const root = window.document.documentElement;
    console.log(
      '[ThemeProvider] Effect triggered - theme:',
      theme,
      'passive:',
      passive
    );

    if (passive) {
      // In passive mode: ONLY notify the shell, don't touch DOM at all
      // The shell's ThemeProvider will handle everything
      console.log(
        '[ThemeProvider] Passive mode - notifying shell via storage event'
      );

      // Save to localStorage
      const oldValue = localStorage.getItem(storageKey);
      localStorage.setItem(storageKey, theme);

      // Manually dispatch a storage event for same-window (storage events normally only fire cross-window)
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: storageKey,
          oldValue: oldValue,
          newValue: theme,
          storageArea: localStorage,
          url: window.location.href,
        })
      );

      return;
    }

    // Full mode: Apply theme class and CSS variables
    console.log('[ThemeProvider] Full mode - setting class and CSS variables');
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Apply CSS variables for the current theme
    const themeColors = themes[theme];
    Object.entries(themeColors).forEach(([category, colors]) => {
      Object.entries(colors as Record<string, string>).forEach(
        ([name, value]) => {
          root.style.setProperty(`--${category}-${name}`, value as string);
        }
      );
    });

    // Save to localStorage
    localStorage.setItem(storageKey, theme);

    // Dispatch custom event for same-window synchronization
    window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }));
  }, [theme, storageKey, passive]);
  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
