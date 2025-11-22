import { Suspense, lazy } from 'react';
import { MfeErrorBoundary } from '@myapp/frontend/ui-components';

// Lazy load the chatbot MFE
const ChatbotMfeModule = lazy(() => import('chatbotMfe/Module'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Loading chatbot...</p>
      </div>
    </div>
  );
}

export function ChatbotMfe() {
  return (
    <MfeErrorBoundary mfeName="chatbot-mfe">
      <Suspense fallback={<LoadingFallback />}>
        <ChatbotMfeModule />
      </Suspense>
    </MfeErrorBoundary>
  );
}
