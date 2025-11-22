import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { init } from '@module-federation/runtime';
import { apolloClient } from '@myapp/frontend/apollo-client';
import App from './app/app';
import { startMocks } from './mocks/config';
import './styles.css';

// Initialize Module Federation runtime
const mfRuntime = init({
  name: 'shell',
  remotes: [
    {
      name: 'authMfe',
      entry: 'http://localhost:5174/remoteEntry.js',
    },
    {
      name: 'chatbotMfe',
      entry: 'http://localhost:5175/remoteEntry.js',
    },
    {
      name: 'adminMfe',
      entry: 'http://localhost:5176/remoteEntry.js',
    },
    {
      name: 'profileMfe',
      entry: 'http://localhost:5177/remoteEntry.js',
    },
  ],
  shared: {
    react: {
      version: '19.0.0',
      scope: 'default',
      lib: () => import('react'),
      shareConfig: {
        singleton: true,
        requiredVersion: '^19.0.0',
      },
    },
    'react-dom': {
      version: '19.0.0',
      scope: 'default',
      lib: () => import('react-dom'),
      shareConfig: {
        singleton: true,
        requiredVersion: '^19.0.0',
      },
    },
    'react-router-dom': {
      scope: 'default',
      lib: () => import('react-router-dom'),
      shareConfig: {
        singleton: true,
      },
    },
  },
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML =
    '<div style="padding: 20px; color: red;"><h1>Error: Root element not found</h1></div>';
} else {
  (async () => {
    try {
      // Wait for Module Federation runtime to be fully initialized
      await mfRuntime;

      // Start MSW mocks if needed
      await startMocks();

      const root = createRoot(rootElement);

      root.render(
        <StrictMode>
          <ApolloProvider client={apolloClient}>
            <App />
          </ApolloProvider>
        </StrictMode>
      );
    } catch (error) {
      const err = error as Error;
      rootElement.innerHTML = `
        <div style="padding: 20px; background: #fee; border: 2px solid red; font-family: monospace;">
          <h1 style="color: red;">Failed to Load Application</h1>
          <p><strong>Error:</strong> ${err.message}</p>
          <pre style="background: white; padding: 10px; border: 1px solid #ccc; overflow: auto;">${err.stack}</pre>
          <button onclick="location.reload()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
            Reload
          </button>
        </div>
      `;
    }
  })();
}
