import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Conditionally enable mocking in development
async function prepare() {
  if (true) {
    const { enableMocking } = await import('./mocks');
      // return Promise.resolve();
    return enableMocking();
  }
  return Promise.resolve();
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});