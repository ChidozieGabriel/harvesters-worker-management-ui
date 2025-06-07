import { StartOptions } from 'msw/browser';

export async function enableMocking() {
  if (typeof window === 'undefined') {
    return; // No mocking for Node.js environments (e.g., SSR or tests using Node)
  }

  const { worker } = await import('./browser');

  const options: StartOptions = {
    onUnhandledRequest: 'warn'
  };

  if (!!import.meta.env.VITE_SERVICE_WORKER_URL) {
    options.serviceWorker = {
      url: import.meta.env.VITE_SERVICE_WORKER_URL
    };
  }

  // `worker.start()` returns a Promise that resolves once the Service Worker is ready
  return worker.start(options);
}
