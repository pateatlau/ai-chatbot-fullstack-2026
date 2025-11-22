import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/design-tokens';

export interface ThemeToggleProps {
  className?: string;
}

/**
 * Theme Toggle Component
 * Allows users to switch between light, dark, and system themes
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Light Mode Button */}
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'p-2 rounded-md transition-colors',
          theme === 'light'
            ? 'bg-primary-100 text-primary-600'
            : 'text-gray-500 hover:bg-gray-100'
        )}
        title="Light theme"
        aria-label="Light theme"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </button>

      {/* Dark Mode Button */}
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'p-2 rounded-md transition-colors',
          theme === 'dark'
            ? 'bg-primary-100 text-primary-600'
            : 'text-gray-500 hover:bg-gray-100'
        )}
        title="Dark theme"
        aria-label="Dark theme"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      {/* System Theme Button */}
      <button
        onClick={() => setTheme('system')}
        className={cn(
          'p-2 rounded-md transition-colors',
          theme === 'system'
            ? 'bg-primary-100 text-primary-600'
            : 'text-gray-500 hover:bg-gray-100'
        )}
        title="System theme"
        aria-label="System theme"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      </button>
    </div>
  );
}

export default ThemeToggle;
