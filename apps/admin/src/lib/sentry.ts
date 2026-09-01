import * as Sentry from '@sentry/react';

// Safe with dsn unset (no-op) — only takes effect once VITE_SENTRY_DSN is
// configured for a real deployment. Vite only exposes VITE_-prefixed vars
// to client code, same reasoning as NEXT_PUBLIC_ on the frontend app.
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'development',
    tracesSampleRate: 0.1,
  });
}
