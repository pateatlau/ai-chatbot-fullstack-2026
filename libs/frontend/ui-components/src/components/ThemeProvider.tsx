import { ReactNode, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

/**
 * Theme Provider Component
 * Should wrap the entire application to manage theme initialization and persistence
 * Place this at the root level of your app
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  // Initialize theme on mount
  useEffect(() => {
    // This will trigger the theme application logic in useTheme
    // The hook's useEffect will handle applying the theme
  }, []);

  return <>{children}</>;
}

export default ThemeProvider;
