const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML =
    '<div style="padding: 20px; color: red;"><h1>Error: Root element not found</h1></div>';
} else {
  // Load imports dynamically
  (async () => {
    try {
      const reactModule = await import('react');
      const reactDomModule = await import('react-dom/client');
      const mocksModule = await import('./mocks/config');
      const appModule = await import('./app/app');

      const { StrictMode } = reactModule;
      const ReactDOM = reactDomModule;
      const { startMocks } = mocksModule;
      const App = appModule.default;

      await startMocks();

      const root = ReactDOM.createRoot(rootElement);

      root.render(
        reactModule.createElement(
          StrictMode,
          null,
          reactModule.createElement(App, null)
        )
      );
    } catch (error) {
      rootElement.innerHTML = `
        <div style="padding: 20px; background: #fee; border: 2px solid red; font-family: monospace;">
          <h1 style="color: red;">Failed to Load Application</h1>
          <p><strong>Error:</strong> ${error.message}</p>
          <pre style="background: white; padding: 10px; border: 1px solid #ccc; overflow: auto;">${error.stack}</pre>
          <button onclick="location.reload()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
            Reload
          </button>
        </div>
      `;
    }
  })();
}
