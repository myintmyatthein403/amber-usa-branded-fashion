"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquarePlus, X, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getApiUrl } from "@/lib/api";

// The app had no mechanism at all for a beta user to report a bug or leave
// feedback before this — this is the minimum viable version: a floating
// button on every page, not a polished third-party widget.
export default function FeedbackWidget() {
  const { user, token } = useAuthStore();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openWidget = () => {
    setEmail(user?.email || "");
    setSubmitted(false);
    setError(null);
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${getApiUrl()}/feedback`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || undefined,
          page: pathname,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string })?.message || "Failed to submit feedback");
      }
      setMessage("");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={openWidget}
        className="fixed bottom-6 right-6 z-[150] flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-4 text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-[#D4AF37] transition-all"
        aria-label="Report an issue or give feedback"
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white p-8 shadow-2xl space-y-5"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>

              {submitted ? (
                <div className="text-center space-y-4 py-6">
                  <CheckCircle2 className="w-10 h-10 text-[#D4AF37] mx-auto" />
                  <h3 className="text-xl font-serif">Thank You</h3>
                  <p className="text-sm text-[#1A1A1A]/60">
                    Your feedback helps us improve the beta. We appreciate you taking the time.
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-2 px-6 py-3 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-serif">Report an Issue or Share Feedback</h3>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What happened? What could be better?"
                    className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm resize-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email (optional, in case we follow up)"
                    className="w-full p-3 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm"
                  />
                  {error && <p className="text-xs text-red-500 font-medium italic">{error}</p>}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !message.trim()}
                    className="w-full py-4 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Feedback
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
