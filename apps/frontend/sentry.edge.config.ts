// Edge runtime (middleware/proxy) Sentry init. Safe with dsn unset (no-op).
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.1,
});
