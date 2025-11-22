import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { init } from '@module-federation/runtime';
import App from './app/app';
import { StandaloneWrapper } from './app/standalone-wrapper';
import './styles.css';

// Initialize Module Federation runtime for standalone mode
init({
  name: 'authMfe',
  remotes: [],
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <StandaloneWrapper>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StandaloneWrapper>
  </StrictMode>
);
