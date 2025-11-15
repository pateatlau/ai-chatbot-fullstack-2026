import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { startMocks } from './mocks/config';

// Start mocks before rendering the app
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
