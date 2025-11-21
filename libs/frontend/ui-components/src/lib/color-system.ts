/**
 * Design System Color Utilities
 * Provides semantic color functions for consistent theming
 */

export const colorMap = {
  // Background colors
  bg: {
    primary: 'bg-primary-50',
    secondary: 'bg-gray-50',
    muted: 'bg-gray-100',
    interactive: 'bg-primary-600',
    danger: 'bg-red-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
  },

  // Text colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    light: 'text-gray-400',
    inverse: 'text-white',
    interactive: 'text-primary-600',
    danger: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  },

  // Border colors
  border: {
    default: 'border-gray-200',
    interactive: 'border-primary-300',
    focus: 'border-primary-500',
    danger: 'border-red-300',
    success: 'border-green-300',
    warning: 'border-yellow-300',
  },

  // Semantic status colors
  status: {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  },
};

export const iconColors = {
  primary: 'text-primary-600',
  secondary: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  muted: 'text-gray-500',
};

export const gradients = {
  primary: 'bg-linear-to-br from-primary-600 via-primary-500 to-primary-700',
  secondary: 'bg-linear-to-r from-blue-500 to-blue-600',
  success: 'bg-linear-to-r from-green-500 to-green-600',
  subtle: 'bg-linear-to-r from-primary-50 to-blue-50',
  dark: 'bg-linear-to-br from-gray-800 to-gray-900',
};
