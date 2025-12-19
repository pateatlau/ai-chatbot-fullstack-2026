/**
 * Standalone Wrapper for Chatbot MFE
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
    <ThemeProvider defaultTheme="light" storageKey="chatbot-mfe-theme">
      {children}
    </ThemeProvider>
  );
};
