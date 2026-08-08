"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { motion } from "motion/react";
import { Mail, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${getApiUrl()}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      setSubmitted(true);
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
          {submitted ? (
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-serif">Check Your Email</h1>
              <p className="text-sm text-[#1A1A1A]/60">
                If an account exists for <span className="font-bold">{email}</span>, we&apos;ve sent
                instructions to reset your password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#D4AF37] hover:text-[#1A1A1A] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-serif">Reset Password</h1>
                <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-4 pl-12 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm"
                      placeholder="name@example.com"
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
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-4">
                <Link
                  href="/login"
                  className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37] border-b border-[#D4AF37]"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}
