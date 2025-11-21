/**
 * Design System Spacing & Layout System
 * Consistent spacing and layout patterns across the application
 */

export const spacingSystem = {
  // Padding scales
  padding: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-12',
  },

  // Gap scales for flex/grid
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
    '2xl': 'gap-8',
  },

  // Margin scales
  margin: {
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-3',
    lg: 'm-4',
    xl: 'm-6',
    '2xl': 'm-8',
  },

  // Common padding combinations
  sections: {
    xs: 'px-2 py-2',
    sm: 'px-3 py-3',
    md: 'px-4 py-4',
    lg: 'px-6 py-6',
    xl: 'px-8 py-8',
    section: 'py-8 md:py-12 lg:py-16',
  },
};

// Responsive breakpoints following Tailwind
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Layout patterns
export const layouts = {
  container: 'mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl',
  containerSmall: 'mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl',
  containerLarge: 'mx-auto px-4 sm:px-6 lg:px-8 max-w-full',

  // Grid layouts
  gridResponsive: {
    '2Col': 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
    '3Col': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
    '4Col': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6',
  },

  // Stack patterns
  vStack: 'flex flex-col gap-3',
  vStackLarge: 'flex flex-col gap-6',
  hStack: 'flex items-center gap-3',
  hStackLarge: 'flex items-center gap-6',

  // Centered patterns
  centerContent: 'flex items-center justify-center',
  centerBetween: 'flex items-center justify-between',
};

// Common responsive classes
export const responsive = {
  hideOnMobile: 'hidden md:block',
  hideOnDesktop: 'md:hidden',
  mobileFirst: 'block md:flex',
  fullOnMobile: 'w-full md:w-auto',
  stackOnMobile: 'flex flex-col md:flex-row',
};
