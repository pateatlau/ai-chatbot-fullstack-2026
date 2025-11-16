import { lazy, Suspense } from 'react';

const ProfileMfeModule = lazy(() => import('profileMfe/Module'));

export function ProfileMfe() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        </div>
      }
    >
      <ProfileMfeModule />
    </Suspense>
  );
}
