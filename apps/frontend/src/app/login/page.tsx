"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "motion/react";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const setLoggingOut = useAuthStore((state) => state.setLoggingOut);
  const { data: session, status } = useSession();

  // Reset isLoggingOut flag when session is officially gone
  useEffect(() => {
    if (status === "unauthenticated" && isLoggingOut) {
      setLoggingOut(false);
    }
  }, [status, isLoggingOut, setLoggingOut]);

  // Sync Google Session with App Backend
  useEffect(() => {
    const syncGoogleSession = async () => {
      // If we are currently logging out, don't try to sync
      if (isLoggingOut) return;

      if (status === "authenticated" && (session as any)?.idToken) {
        setGoogleLoading(true);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: (session as any).idToken }),
          });

          const data = await response.json();
          if (response.ok) {
            setAuth(data.user, data.access_token);
            router.push("/profile");
          } else {
            setError(data.message || "Google authentication failed");
          }
        } catch (err) {
          setError("Failed to sync with backend");
        } finally {
          setGoogleLoading(false);
        }
      }
    };

    if (status === "authenticated") {
      syncGoogleSession();
    }
  }, [status, session, setAuth, router]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await signIn("google", { redirect: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isLogin) {
        setAuth(data.user, data.access_token);
        router.push("/profile");
      } else {
        setIsLogin(true);
        setError("Account created successfully. Please login.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
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
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif">{isLogin ? "Welcome Back" : "Join Amber"}</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold">
              {isLogin ? "Enter your credentials to access your profile" : "Create an account for exclusive membership perks"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-4 pl-12 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-4 pl-12 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium italic">{error}</p>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-5 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-all flex items-center justify-center space-x-3 group disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>{isLogin ? "Sign In" : "Register Now"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="relative py-4 flex items-center">
                <div className="flex-grow border-t border-[#1A1A1A]/5"></div>
                <span className="flex-shrink mx-4 text-[8px] font-bold uppercase tracking-widest text-[#1A1A1A]/20">Or Continue With</span>
                <div className="flex-grow border-t border-[#1A1A1A]/5"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="w-full py-5 bg-white border border-[#1A1A1A]/10 text-[#1A1A1A] text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#FDFDFD] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Google</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-4">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37] border-b border-[#D4AF37]"
            >
              {isLogin ? "Don't have an account? Join Now" : "Already a member? Sign In"}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
