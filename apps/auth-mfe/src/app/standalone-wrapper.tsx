/**
 * Standalone Wrapper for Auth MFE
 * Provides ThemeProvider when running in standalone mode
 */

import React from 'react';
import { ThemeProvider } from '@myapp/frontend/ui-components';

interface StandaloneWrapperProps {
  children: React.ReactNode;
}

export const StandaloneWrapper: React.FC<StandaloneWrapperProps> = ({
  children,
}) => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="auth-mfe-theme">
      {children}
    </ThemeProvider>
  );
};
