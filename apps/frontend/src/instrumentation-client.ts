// Browser-side Sentry init (Next.js's client instrumentation entry point).
// Uses NEXT_PUBLIC_SENTRY_DSN since only NEXT_PUBLIC_-prefixed env vars are
// exposed to client bundles. Safe/no-op with it unset.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.1,
});
