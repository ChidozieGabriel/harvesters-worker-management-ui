export async function enableMocking() {
  if (typeof window === 'undefined') {
    return; // No mocking for Node.js environments (e.g., SSR or tests using Node)
  }

  const { worker } = await import('./browser');

  // `worker.start()` returns a Promise that resolves once the Service Worker is ready
  return worker.start({
    onUnhandledRequest: 'warn',
  });
}