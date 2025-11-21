import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { init } from '@module-federation/runtime';
import App from './app/app';

// Initialize Module Federation runtime for standalone mode
init({
  name: 'adminMfe',
  remotes: [],
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
