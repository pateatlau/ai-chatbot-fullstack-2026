// Component exports
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

export { FormField } from './components/FormField';
export type { FormFieldProps } from './components/FormField';

export { Card } from './components/Card';
export type { CardProps } from './components/Card';

export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';

export { Toast } from './components/Toast';
export type { ToastProps, ToastType } from './components/Toast';

export { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
export type {
  ErrorBoundaryProps,
  ErrorBoundaryVariant,
} from './components/ErrorBoundary/ErrorBoundary';

export { MfeErrorBoundary } from './components/ErrorBoundary/MfeErrorBoundary';
export type { MfeErrorBoundaryProps } from './components/ErrorBoundary/MfeErrorBoundary';

export { ErrorLogDashboard } from './components/ErrorLogDashboard/ErrorLogDashboard';

export { ErrorSuggestions } from './components/ErrorSuggestions/ErrorSuggestions';
export type { ErrorSuggestionsProps } from './components/ErrorSuggestions/ErrorSuggestions';

export {
  OfflineFallback,
  LoadingFallback,
  NotAvailableFallback,
  AccessDeniedFallback,
  ErrorOccurredFallback,
  SessionExpiredFallback,
  NetworkErrorFallback,
} from './components/FallbackPages/FallbackPages';

// Design System Exports
export { designTokens, componentPresets, cn } from './lib/design-tokens';

export { colorMap, iconColors, gradients } from './lib/color-system';

export {
  spacingSystem,
  breakpoints,
  layouts,
  responsive,
} from './lib/spacing-layout';

export {
  animations,
  interactionStates,
  statePatterns,
} from './lib/animations-states';

// Theme System Exports
export { ThemeProvider, useTheme } from './lib/ThemeProvider';
export type { ThemeMode, ThemeColors } from './lib/theme-config';
export { themes, lightTheme, darkTheme } from './lib/theme-config';
export { ThemeToggle } from './lib/ThemeToggle';
export { Navigation } from './lib/Navigation';
export type { NavLink } from './lib/Navigation';

// Import global theme styles
import './lib/theme.css';
