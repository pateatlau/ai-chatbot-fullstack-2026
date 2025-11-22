/**
 * Design System - Tailwind Design Tokens
 * Central source of truth for all design values across the application
 * All styling MUST use these tokens for consistency
 */

export const designTokens = {
  // Color Palette
  colors: {
    primary: {
      50: 'bg-primary-50',
      100: 'bg-primary-100',
      200: 'bg-primary-200',
      300: 'bg-primary-300',
      400: 'bg-primary-400',
      500: 'bg-primary-500',
      600: 'bg-primary-600',
      700: 'bg-primary-700',
      800: 'bg-primary-800',
      900: 'bg-primary-900',
    },
    secondary: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
    },
    success: {
      50: 'bg-green-50',
      100: 'bg-green-100',
      500: 'bg-green-500',
      600: 'bg-green-600',
      700: 'bg-green-700',
    },
    warning: {
      50: 'bg-yellow-50',
      100: 'bg-yellow-100',
      500: 'bg-yellow-500',
      600: 'bg-yellow-600',
    },
    danger: {
      50: 'bg-red-50',
      100: 'bg-red-100',
      500: 'bg-red-500',
      600: 'bg-red-600',
    },
    neutral: {
      0: 'bg-white',
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      200: 'bg-gray-200',
      300: 'bg-gray-300',
      400: 'bg-gray-400',
      500: 'bg-gray-500',
      600: 'bg-gray-600',
      700: 'bg-gray-700',
      800: 'bg-gray-800',
      900: 'bg-gray-900',
    },
  },

  // Text Colors
  textColors: {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    light: 'text-gray-400',
    inverse: 'text-white',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  },

  // Spacing Scale (Tailwind default: 4px unit)
  spacing: {
    xs: 'gap-1', // 4px
    sm: 'gap-2', // 8px
    md: 'gap-3', // 12px
    lg: 'gap-4', // 16px
    xl: 'gap-6', // 24px
    '2xl': 'gap-8', // 32px
    '3xl': 'gap-12', // 48px
  },

  padding: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    compact: 'px-3 py-2',
    normal: 'px-4 py-3',
    spacious: 'px-6 py-4',
  },

  margin: {
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-3',
    lg: 'm-4',
    xl: 'm-6',
    '2xl': 'm-8',
  },

  // Border Radius
  borderRadius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    base: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },

  // Border Styles
  border: {
    light: 'border border-gray-200',
    normal: 'border border-gray-300',
    bold: 'border-2 border-gray-400',
    primary: 'border border-primary-200',
    focus: 'border border-primary-500',
  },

  // Shadow System
  shadows: {
    none: 'shadow-none',
    xs: 'shadow-sm',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  },

  // Typography Scales
  typography: {
    // Headings
    h1: 'text-4xl md:text-5xl font-bold leading-tight',
    h2: 'text-3xl md:text-4xl font-bold leading-tight',
    h3: 'text-2xl md:text-3xl font-semibold leading-tight',
    h4: 'text-xl md:text-2xl font-semibold leading-snug',
    h5: 'text-lg md:text-xl font-semibold',
    h6: 'text-base md:text-lg font-semibold',

    // Body Text
    body: 'text-base leading-relaxed',
    bodySmall: 'text-sm leading-relaxed',
    bodyExtraSmall: 'text-xs leading-relaxed',

    // Labels
    label: 'text-sm font-medium',
    caption: 'text-xs font-medium',

    // Special
    code: 'font-mono text-sm bg-gray-100 px-2 py-1 rounded',
  },

  // Transitions
  transitions: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  },

  // States
  states: {
    hover: 'hover:opacity-90 hover:shadow-md',
    active: 'active:scale-95',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    focus:
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    focusVisible:
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  },

  // Component Sizes
  sizes: {
    xs: 'w-full sm:max-w-xs',
    sm: 'w-full sm:max-w-sm',
    md: 'w-full sm:max-w-md',
    lg: 'w-full sm:max-w-lg',
    xl: 'w-full sm:max-w-xl',
    '2xl': 'w-full sm:max-w-2xl',
  },

  // Grid Layouts
  grid: {
    cols1: 'grid grid-cols-1',
    cols2: 'grid grid-cols-1 md:grid-cols-2',
    cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    gap: 'gap-4 md:gap-6',
  },

  // Flex Utilities
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-start justify-start',
    end: 'flex items-end justify-end',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center',
  },

  // Button Styles
  buttonBase:
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed rounded-md',
  buttonSizes: {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  },
  buttonVariants: {
    primary:
      'bg-interactive-primary text-text-inverse border border-interactive-primaryActive shadow-sm hover:bg-interactive-primaryHover hover:shadow-md hover:scale-[1.02] active:bg-interactive-primaryActive active:scale-100 disabled:bg-interactive-disabled disabled:text-text-tertiary disabled:border-interactive-disabled disabled:shadow-none disabled:hover:scale-100',
    secondary:
      'bg-bg-tertiary text-text-primary border border-border-default shadow-sm hover:bg-bg-elevated hover:border-border-hover hover:shadow-md hover:scale-[1.02] active:bg-border-default active:scale-100 disabled:bg-bg-secondary disabled:border-border-default disabled:shadow-none disabled:hover:scale-100 dark:bg-bg-elevated dark:hover:bg-bg-tertiary dark:border-border-hover',
    outline:
      'border border-border-default text-text-primary shadow-sm hover:bg-bg-secondary hover:border-border-hover hover:shadow-md hover:scale-[1.02] active:bg-bg-tertiary active:scale-100 disabled:border-border-default disabled:shadow-none disabled:hover:scale-100 dark:border-border-hover dark:hover:bg-bg-elevated',
    ghost:
      'text-text-primary hover:bg-bg-secondary hover:scale-[1.02] active:bg-bg-tertiary active:scale-100 disabled:hover:scale-100 dark:hover:bg-bg-elevated',
    danger:
      'bg-feedback-error text-text-inverse border border-red-800 shadow-sm hover:bg-red-700 hover:border-red-900 hover:shadow-md hover:scale-[1.02] active:bg-red-800 active:scale-100 disabled:bg-red-300 disabled:border-red-400 disabled:shadow-none disabled:hover:scale-100 dark:hover:bg-red-600 dark:border-red-700',
    success:
      'bg-feedback-success text-text-inverse border border-green-800 shadow-sm hover:bg-green-700 hover:border-green-900 hover:shadow-md hover:scale-[1.02] active:bg-green-800 active:scale-100 disabled:bg-green-300 disabled:border-green-400 disabled:shadow-none disabled:hover:scale-100 dark:hover:bg-green-600 dark:border-green-700',
  },

  // Card Styles
  cardBase:
    'rounded-lg border border-border-default bg-bg-elevated shadow-sm dark:border-border-hover',
  cardHover: 'hover:shadow-md transition-shadow',

  // Input Styles
  inputBase:
    'w-full px-3 py-2 text-base border border-border-default rounded-md bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent dark:border-border-hover dark:bg-bg-secondary',
  inputError: 'border-feedback-error focus:ring-feedback-error',
  inputSuccess: 'border-feedback-success focus:ring-feedback-success',

  // Container
  container: 'mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl',
  section: 'py-6 md:py-8 lg:py-12',
};

// Helper function to combine design tokens
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Preset combinations for common patterns
export const componentPresets = {
  card: {
    default: cn(designTokens.cardBase, designTokens.cardHover),
    interactive: cn(
      designTokens.cardBase,
      'cursor-pointer hover:shadow-lg transition-all hover:border-primary-300'
    ),
    elevated: cn(designTokens.cardBase, designTokens.shadows.lg),
  },
  button: {
    primary: cn(
      designTokens.buttonBase,
      designTokens.buttonVariants.primary,
      designTokens.buttonSizes.md
    ),
    secondary: cn(
      designTokens.buttonBase,
      designTokens.buttonVariants.secondary,
      designTokens.buttonSizes.md
    ),
    outline: cn(
      designTokens.buttonBase,
      designTokens.buttonVariants.outline,
      designTokens.buttonSizes.md
    ),
    small: cn(
      designTokens.buttonBase,
      designTokens.buttonVariants.primary,
      designTokens.buttonSizes.sm
    ),
    large: cn(
      designTokens.buttonBase,
      designTokens.buttonVariants.primary,
      designTokens.buttonSizes.lg
    ),
  },
  input: {
    default: designTokens.inputBase,
    error: cn(designTokens.inputBase, designTokens.inputError),
    success: cn(designTokens.inputBase, designTokens.inputSuccess),
  },
  section: {
    default: cn(designTokens.container, designTokens.section),
  },
  grid: {
    twoCol: designTokens.grid.cols2,
    threeCol: designTokens.grid.cols3,
    fourCol: designTokens.grid.cols4,
  },
};
