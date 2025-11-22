import { ChatPage } from '../components/ChatPage';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { RecoveryAction } from '@myapp/frontend/hooks';
import { useEffect } from 'react';

export function App() {
  const handleRecovery = (action: RecoveryAction) => {
    console.log('[Chatbot MFE] Recovery action triggered:', action);
    // Execute recovery action
    void action.action();
  };

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('[Chatbot MFE] Error caught:', { error, errorInfo });
    // Can send to error logging service here
  };

  return (
    <ErrorBoundary
      enableRecovery={true}
      onRecovery={handleRecovery}
      onError={handleError}
      context="ChatbotMFE"
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <ChatPage />
    </ErrorBoundary>
  );
}

export default App;
