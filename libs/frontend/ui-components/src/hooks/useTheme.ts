import { useEffect } from 'react';
import { useSettingsStore } from '@myapp/frontend/stores';

/**
 * Hook to manage theme application
 * Applies the selected theme to the document and manages CSS variables
 */
export function useTheme() {
  const { settings, updateSettings } = useSettingsStore();
  const { theme } = settings;

  // Determine the effective theme (resolve 'system' to actual theme)
  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return theme as 'light' | 'dark';
  };

  const effectiveTheme = getEffectiveTheme();

  // Apply theme to document
  useEffect(() => {
    const htmlElement = document.documentElement;
    const currentTheme = getEffectiveTheme();

    // Remove both classes first
    htmlElement.classList.remove('light', 'dark');

    // Add the current theme class
    htmlElement.classList.add(currentTheme);

    // Set the color-scheme meta tag for browser UI
    htmlElement.style.colorScheme = currentTheme;

    // Apply CSS variables for the theme
    applyThemeVariables(currentTheme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const htmlElement = document.documentElement;
      const newTheme = mediaQuery.matches ? 'dark' : 'light';
      htmlElement.classList.remove('light', 'dark');
      htmlElement.classList.add(newTheme);
      htmlElement.style.colorScheme = newTheme;
      applyThemeVariables(newTheme);
    };

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme: newTheme });
  };

  return {
    theme,
    effectiveTheme,
    setTheme,
  };
}

/**
 * Apply CSS custom properties for the theme
 */
function applyThemeVariables(theme: 'light' | 'dark') {
  const root = document.documentElement;

  if (theme === 'dark') {
    // Dark mode colors
    root.style.setProperty('--color-bg-primary', '#ffffff');
    root.style.setProperty('--color-bg-secondary', '#f3f4f6');
    root.style.setProperty('--color-text-primary', '#111827');
    root.style.setProperty('--color-text-secondary', '#6b7280');
    root.style.setProperty('--color-border', '#e5e7eb');
  } else {
    // Light mode colors
    root.style.setProperty('--color-bg-primary', '#ffffff');
    root.style.setProperty('--color-bg-secondary', '#f9fafb');
    root.style.setProperty('--color-text-primary', '#111827');
    root.style.setProperty('--color-text-secondary', '#6b7280');
    root.style.setProperty('--color-border', '#e5e7eb');
  }
}
