import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { init } from '@module-federation/runtime';
import { ApolloProvider, apolloClient } from '@myapp/frontend/apollo-client';
import App from './app/app';
import './styles.css';

// Initialize Module Federation runtime for standalone mode
init({
  name: 'chatbotMfe',
  remotes: [],
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </StrictMode>
);
