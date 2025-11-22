/**
 * ThemeToggle Component
 * Provides a button to toggle between light and dark themes
 */

import React from 'react';
import { useTheme } from './ThemeProvider';

// Inline SVG icons
const SunIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 rounded-lg p-2 
        transition-colors duration-200
        bg-bg-secondary hover:bg-bg-tertiary
        border border-border-default hover:border-border-hover
        text-text-primary
        focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2
        ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MoonIcon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <SunIcon className="h-5 w-5" aria-hidden="true" />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {theme === 'light' ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};
