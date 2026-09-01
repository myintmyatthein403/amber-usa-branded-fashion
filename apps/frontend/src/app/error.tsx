"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
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
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-md">
        <h1 className="text-4xl font-serif text-[#1A1A1A]">Something Went Wrong</h1>
        <p className="text-[#1A1A1A]/40 uppercase tracking-[0.3em] text-[10px] font-bold leading-relaxed">
          We&apos;ve been notified and are looking into it. Please try again.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-4 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-3 border border-[#1A1A1A]/10 px-8 py-4 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-zinc-50 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
