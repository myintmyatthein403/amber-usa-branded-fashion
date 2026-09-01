// Server-side (Node runtime) Sentry init. Safe with dsn unset (no-op) —
// only takes effect once SENTRY_DSN is configured for a real deployment.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.1,
});
