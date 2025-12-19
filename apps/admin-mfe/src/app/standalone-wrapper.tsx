/**
 * Standalone Wrapper for Admin MFE
 * Provides ThemeProvider when running in standalone mode
 */

import React from 'react';
import { ThemeProvider } from '@ai-chatbot/ui-components';

interface StandaloneWrapperProps {
  children: React.ReactNode;
}

export const StandaloneWrapper: React.FC<StandaloneWrapperProps> = ({
  children,
}) => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="admin-mfe-theme">
      {children}
    </ThemeProvider>
  );
};
