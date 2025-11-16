import { useState, useEffect, useCallback, useRef } from 'react';

export interface StreamingMessage {
  content: string;
  isComplete: boolean;
  error: string | null;
}

export interface UseStreamingMessageOptions {
  onComplete?: (fullMessage: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to handle Server-Sent Events streaming from the chatbot service
 * Manages connection lifecycle, message accumulation, and error handling
 */
export function useStreamingMessage(options: UseStreamingMessageOptions = {}) {
  const [message, setMessage] = useState<StreamingMessage>({
    content: '',
    isComplete: false,
    error: null,
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedContentRef = useRef<string>('');

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    accumulatedContentRef.current = '';
  }, []);

  // Start streaming from fetch Response
  const startStreaming = useCallback(
    async (response: Response) => {
      cleanup(); // Close any existing connection

      abortControllerRef.current = new AbortController();
      setIsStreaming(true);
      setMessage({
        content: '',
        isComplete: false,
        error: null,
      });
      accumulatedContentRef.current = '';

      try {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode the chunk and add to buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process complete SSE messages (lines ending with \n\n)
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || ''; // Keep incomplete message in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6); // Remove 'data: ' prefix
              try {
                const data = JSON.parse(jsonStr);

                if (data.type === 'delta') {
                  // Accumulate content from delta events
                  accumulatedContentRef.current += data.content;
                  setMessage((prev) => ({
                    ...prev,
                    content: accumulatedContentRef.current,
                  }));
                } else if (data.type === 'complete') {
                  // Stream complete
                  setMessage((prev) => ({
                    ...prev,
                    isComplete: true,
                  }));
                  setIsStreaming(false);
                  options.onComplete?.(accumulatedContentRef.current);
                  cleanup();
                  return;
                } else if (data.type === 'error') {
                  // Server-side error
                  const error = new Error(
                    data.error || 'Streaming error occurred'
                  );
                  setMessage((prev) => ({
                    ...prev,
                    error: error.message,
                    isComplete: true,
                  }));
                  setIsStreaming(false);
                  options.onError?.(error);
                  cleanup();
                  return;
                }
              } catch (parseError) {
                console.error(
                  'Error parsing SSE message:',
                  parseError,
                  jsonStr
                );
              }
            }
          }
        }

        // If we get here, stream ended without complete event
        setMessage((prev) => ({
          ...prev,
          isComplete: true,
        }));
        setIsStreaming(false);
        options.onComplete?.(accumulatedContentRef.current);
        cleanup();
      } catch (error) {
        console.error('Streaming error:', error);
        const streamError =
          error instanceof Error ? error : new Error('Streaming failed');
        setMessage((prev) => ({
          ...prev,
          error: streamError.message,
          isComplete: true,
        }));
        setIsStreaming(false);
        options.onError?.(streamError);
        cleanup();
      }
    },
    [cleanup, options]
  );

  // Stop streaming manually
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      setMessage((prev) => ({
        ...prev,
        isComplete: true,
      }));
      setIsStreaming(false);
      cleanup();
    }
  }, [cleanup]);

  // Reset message state
  const resetMessage = useCallback(() => {
    setMessage({
      content: '',
      isComplete: false,
      error: null,
    });
    accumulatedContentRef.current = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    message,
    isStreaming,
    startStreaming,
    stopStreaming,
    resetMessage,
  };
}
