import React, { Suspense, lazy } from 'react';

// Lazy load the chatbot MFE
const ChatbotMfeModule = lazy(() =>
  import('chatbotMfe/Module').catch((error) => {
    console.error('Failed to load Chatbot MFE:', error);
    return {
      default: () => (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chatbot Unavailable
            </h2>
            <p className="text-gray-600 mb-4">
              The chatbot service is currently unavailable. Please try again
              later.
            </p>
            <p className="text-sm text-gray-500">
              Make sure the chatbot-mfe is running on port 5175
            </p>
          </div>
        </div>
      ),
    };
  })
);

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
    <Suspense fallback={<LoadingFallback />}>
      <ChatbotMfeModule />
    </Suspense>
  );
}
