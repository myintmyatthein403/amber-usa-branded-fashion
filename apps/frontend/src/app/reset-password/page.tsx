"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { motion } from "motion/react";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { getApiUrl } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />

      <div className="pt-48 pb-24 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-12 border border-[#1A1A1A]/5 shadow-sm space-y-10"
        >
          {!token ? (
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-serif">Invalid Link</h1>
              <p className="text-sm text-[#1A1A1A]/60">
                This password reset link is missing or malformed.
              </p>
              <Link
                href="/forgot-password"
                className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37] border-b border-[#D4AF37]"
              >
                Request a new link
              </Link>
            </div>
          ) : success ? (
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-serif">Password Reset</h1>
              <p className="text-sm text-[#1A1A1A]/60">
                Your password has been updated successfully. Redirecting to sign in...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-serif">New Password</h1>
                <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold">
                  Choose a new password for your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-4 pl-12 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-4 pl-12 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 font-medium italic">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-all flex items-center justify-center space-x-3 group disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
