import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { init } from '@module-federation/runtime';
import App from './app/app';
import { startMocks } from './mocks/config';
import './styles.css';

// Initialize Module Federation runtime for standalone mode
init({
  name: 'profileMfe',
  remotes: [],
});

// Start MSW mocks if enabled
startMocks().then(() => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
