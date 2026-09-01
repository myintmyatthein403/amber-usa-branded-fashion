"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Only fires when the root layout itself throws — everything below the
// root layout is caught by error.tsx instead. Next.js requires this file
// to render its own <html>/<body> since it replaces the root layout.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#FDFDFD", color: "#1A1A1A" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
            fontFamily: "sans-serif",
          }}
        >
          <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>Something Went Wrong</h1>
          <p style={{ opacity: 0.5, marginBottom: "24px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.2em" }}>
            We&apos;ve been notified and are looking into it.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#1A1A1A",
              color: "white",
              padding: "16px 32px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: "10px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </main>
      </body>
    </html>
  );
}
