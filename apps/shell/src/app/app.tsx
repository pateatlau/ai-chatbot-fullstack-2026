import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from '../providers/QueryProvider';
import { useToastStore } from '@myapp/frontend/stores';
import { Toast } from '@myapp/frontend/ui-components';
import { router } from '../routes';

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
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </QueryProvider>
  );
}

export default App;
