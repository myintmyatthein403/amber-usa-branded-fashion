// Sentry must be initialized before any other module is imported (hence
// this being main.ts's first import) so it can instrument everything else.
// Safe to leave SENTRY_DSN unset — Sentry.init() with no dsn is a no-op,
// so this has zero effect in local dev unless a beta/production DSN is
// actually configured.
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.1,
});
