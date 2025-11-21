/**
 * Design System Animation & State Utilities
 * Consistent animations and interactive states
 */

export const animations = {
  // Transitions
  transitions: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-300 ease-in-out',
    slow: 'transition-all duration-500 ease-in-out',
  },

  // Hover effects
  hover: {
    scaleUp: 'hover:scale-105 transition-transform duration-200',
    scaleDown: 'hover:scale-95 transition-transform duration-200',
    shadowUp: 'hover:shadow-lg transition-shadow duration-200',
    brighten: 'hover:opacity-90 transition-opacity duration-200',
    darken: 'hover:opacity-75 transition-opacity duration-200',
  },

  // Active effects
  active: {
    scale: 'active:scale-95 transition-transform duration-100',
    shadow: 'active:shadow-inner transition-shadow duration-100',
  },

  // Focus effects
  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    visible:
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  },

  // Loading states
  loading: {
    spin: 'animate-spin',
    pulse: 'animate-pulse',
  },

  // Entrance animations
  fadeIn: 'animate-in fade-in duration-300',
  slideInUp: 'animate-in slide-in-from-bottom-4 duration-300',
  slideInDown: 'animate-in slide-in-from-top-4 duration-300',
};

export const interactionStates = {
  // Button states
  button: {
    base: 'inline-flex items-center justify-center font-medium cursor-pointer transition-all duration-200',
    hover: 'hover:opacity-90 hover:shadow-md',
    active: 'active:scale-95 active:shadow-inner',
    disabled:
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50',
    focus:
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  },

  // Input states
  input: {
    base: 'transition-all duration-200',
    focus:
      'focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none',
    error: 'border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:ring-green-500',
    disabled: 'opacity-50 cursor-not-allowed bg-gray-100',
  },

  // Link states
  link: {
    base: 'text-primary-600 underline transition-colors duration-200',
    hover: 'hover:text-primary-700',
    active: 'text-primary-800',
    visited: 'visited:text-purple-600',
  },

  // Card states
  card: {
    base: 'transition-all duration-200',
    hover: 'hover:shadow-lg hover:border-primary-300',
    interactive: 'cursor-pointer hover:shadow-lg hover:scale-102',
  },
};

// Composition patterns
export const statePatterns = {
  interactiveButton:
    'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',

  interactiveCard:
    'transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-primary-300 active:scale-99',

  focusableInput:
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',

  editableText:
    'transition-colors duration-200 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
};
