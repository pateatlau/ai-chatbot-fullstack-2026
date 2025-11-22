import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from '../providers/QueryProvider';
import { useToastStore } from '@myapp/frontend/stores';
import { Toast, ErrorBoundary } from '@myapp/frontend/ui-components';
import { router } from '../routes';
import { useShellEventCoordination } from '../hooks/useEventDrivenStores';
import { EventBusDevTools } from '../components/EventBusDevTools';

function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export function App() {
  // Initialize shell-level event coordination
  useShellEventCoordination();

  // Only show DevTools in development
  const isDevelopment = import.meta.env.MODE === 'development';

  return (
    <ErrorBoundary variant="full" context="shell-root">
      <QueryProvider>
        <RouterProvider router={router} />
        <ToastContainer />
        {isDevelopment && <EventBusDevTools />}
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
