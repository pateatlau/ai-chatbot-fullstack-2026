import { lazy, Suspense } from 'react';

// Lazy load the Admin MFE
const AdminMfeModule = lazy(() => import('adminMfe/Module'));

export function AdminMfe() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2 text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      }
    >
      <AdminMfeModule />
    </Suspense>
  );
}
