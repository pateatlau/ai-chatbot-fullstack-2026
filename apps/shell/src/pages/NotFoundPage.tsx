import { Link } from 'react-router-dom';
import { Button } from '@myapp/frontend/ui-components';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-9xl mb-4">🔍</div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/dashboard">
            <Button fullWidth>Go to Dashboard</Button>
          </Link>
          <Link to="/">
            <Button fullWidth variant="outline">
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            If you believe this is an error, please contact support at{' '}
            <a
              href="mailto:support@aichatbot.com"
              className="text-primary-600 hover:text-primary-700"
            >
              support@aichatbot.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
