// Environment variable to control MSW
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Function to start mocks conditionally
export async function startMocks() {
  if (USE_MOCKS && typeof window !== 'undefined') {
    const { initializeMocks } = await import('@myapp/frontend/mocks');
    await initializeMocks();
    console.log('🎭 MSW mocking enabled for Profile MFE');
  }
}
