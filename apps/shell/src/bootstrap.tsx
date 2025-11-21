import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/app';
import { startMocks } from './mocks/config';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML =
    '<div style="padding: 20px; color: red;"><h1>Error: Root element not found</h1></div>';
} else {
  (async () => {
    try {
      // Start MSW mocks if needed
      await startMocks();

      const root = createRoot(rootElement);

      root.render(
        <StrictMode>
          <App />
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
