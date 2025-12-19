import { Outlet } from 'react-router-dom';
import { cn } from '@myapp/frontend/ui-components';

export function MainLayout() {
  return (
    <div
      className={cn(
        'min-h-screen bg-[var(--bg-secondary)]',
        'transition-colors duration-200'
      )}
      style={{ position: 'relative' }}
    >
      <main
        className={cn(
          'container mx-auto px-4 sm:px-6 lg:px-8',
          'py-6 md:py-8',
          'max-w-7xl',
          'transition-all duration-200'
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
