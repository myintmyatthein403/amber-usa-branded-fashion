import React from 'react';
import * as Sentry from '@sentry/react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

// No React error boundary existed anywhere in the admin app before this —
// an uncaught render error previously meant a blank white screen with no
// recovery path and no record of what happened.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 p-6 text-center">
          <div className="w-16 h-16 bg-destructive/10 flex items-center justify-center rounded-full">
            <AlertTriangle size={28} className="text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold">Something Went Wrong</h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              We&apos;ve been notified and are looking into it. Try reloading the page.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-foreground text-primary-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors"
          >
            <RotateCcw size={14} />
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
