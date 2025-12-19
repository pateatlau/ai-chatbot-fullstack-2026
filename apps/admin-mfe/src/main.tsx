// Import bootstrap dynamically to ensure Module Federation runtime is initialized first
import('./bootstrap').catch((error) => {
  console.error('Failed to load bootstrap:', error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #fee; border: 2px solid red; font-family: monospace;">
        <h1 style="color: red;">Failed to Initialize Admin MFE</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        <pre style="background: white; padding: 10px; border: 1px solid #ccc; overflow: auto;">${error.stack}</pre>
        <button onclick="location.reload()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
          Reload
        </button>
      </div>
    `;
  }
});
