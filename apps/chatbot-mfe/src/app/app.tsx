import { ChatPage } from '../components/ChatPage';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useEffect } from 'react';

export function App() {
  return (
    <ErrorBoundary>
      <ChatPage />
    </ErrorBoundary>
  );
}

export default App;
