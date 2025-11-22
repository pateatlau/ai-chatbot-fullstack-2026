/**
 * Theme Configuration
 * Defines light and dark theme color palettes
 */

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
    inverse: string;
  };
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
    linkHover: string;
  };
  // Border colors
  border: {
    default: string;
    focus: string;
    hover: string;
    error: string;
    success: string;
    warning: string;
  };
  // Interactive colors
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    danger: string;
    dangerHover: string;
    success: string;
    warning: string;
  };
  // Status colors
  status: {
    info: string;
    success: string;
    warning: string;
    error: string;
    infoBg: string;
    successBg: string;
    warningBg: string;
    errorBg: string;
  };
}

export const lightTheme: ThemeColors = {
  bg: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    elevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
    inverse: '#111827',
  },
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    disabled: '#d1d5db',
    inverse: '#ffffff',
    link: '#4f46e5',
    linkHover: '#4338ca',
  },
  border: {
    default: '#f3f4f6',
    focus: '#6366f1',
    hover: '#e5e7eb',
    error: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
  },
  interactive: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryActive: '#4338ca',
    secondary: '#f3f4f6',
    secondaryHover: '#e5e7eb',
    danger: '#ef4444',
    dangerHover: '#dc2626',
    success: '#22c55e',
    warning: '#f59e0b',
  },
  status: {
    info: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    infoBg: '#dbeafe',
    successBg: '#dcfce7',
    warningBg: '#fef3c7',
    errorBg: '#fee2e2',
  },
};

export const darkTheme: ThemeColors = {
  bg: {
    primary: '#111827',
    secondary: '#1f2937',
    tertiary: '#374151',
    elevated: '#1f2937',
    overlay: 'rgba(0, 0, 0, 0.75)',
    inverse: '#ffffff',
  },
  text: {
    primary: '#f9fafb',
    secondary: '#d1d5db',
    tertiary: '#9ca3af',
    disabled: '#6b7280',
    inverse: '#111827',
    link: '#818cf8',
    linkHover: '#a5b4fc',
  },
  border: {
    default: '#4b5563',
    focus: '#818cf8',
    hover: '#6b7280',
    error: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
  },
  interactive: {
    primary: '#6366f1',
    primaryHover: '#818cf8',
    primaryActive: '#a5b4fc',
    secondary: '#374151',
    secondaryHover: '#4b5563',
    danger: '#ef4444',
    dangerHover: '#f87171',
    success: '#22c55e',
    warning: '#f59e0b',
  },
  status: {
    info: '#60a5fa',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    infoBg: '#1e3a8a',
    successBg: '#065f46',
    warningBg: '#78350f',
    errorBg: '#7f1d1d',
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;
