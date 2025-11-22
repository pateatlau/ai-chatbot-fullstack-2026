import { useMe } from '@myapp/frontend/apollo-client';

/**
 * Test component to verify Apollo Client is working
 * This component can be temporarily added to the App to verify setup
 */
export function GraphQLTest() {
  const { data, loading, error } = useMe();

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <p>Loading user data from GraphQL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800">Error: {error.message}</p>
        <p className="text-sm text-red-600 mt-2">
          Note: This is expected if you're not logged in. Try logging in first.
        </p>
      </div>
    );
  }

  const user = data?.me;

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">Not authenticated. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <h3 className="font-semibold text-green-900 mb-3">
        GraphQL Integration Working ✓
      </h3>
      <div className="space-y-2 text-sm text-green-800">
        <p>
          <strong>User:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
        <p>
          <strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}
        </p>
      </div>
    </div>
  );
}

export default GraphQLTest;
