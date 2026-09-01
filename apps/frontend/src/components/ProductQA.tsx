"use client";

import { useEffect, useState } from "react";
import { MessageCircleQuestion, ShieldCheck, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getApiUrl } from "@/lib/api";

interface QAAnswer {
  id: string;
  body: string;
  isOfficial: boolean;
  createdAt: string;
}

interface QAQuestion {
  id: string;
  userName?: string | null;
  body: string;
  createdAt: string;
  answers: QAAnswer[];
}

export default function ProductQA({ productId }: { productId: string }) {
  const { isAuthenticated, token } = useAuthStore();
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fetchQuestions = () => {
    setLoading(true);
    fetch(`${getApiUrl()}/questions/product/${productId}`)
      .then((res) => res.json())
      .then((result) => setQuestions(result?.data ?? result ?? []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSubmit = async () => {
    if (!newQuestion.trim() || !token) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${getApiUrl()}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, body: newQuestion.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error((json as { message?: string })?.message || "Failed to submit question");
      }
      setNewQuestion("");
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit question");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 border-t border-[#1A1A1A]/5">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="flex items-center gap-3 mb-12">
          <MessageCircleQuestion className="w-6 h-6 text-[#D4AF37]" />
          <h2 className="text-3xl font-serif text-[#1A1A1A]">Questions &amp; Answers</h2>
        </div>

        <div className="mb-16 space-y-3">
          {!isAuthenticated ? (
            <p className="text-sm text-[#1A1A1A]/50 italic">Sign in to ask a question about this product.</p>
          ) : submitted ? (
            <p className="text-sm text-[#1A1A1A]/60">
              Thanks — your question has been submitted and will appear once approved.
            </p>
          ) : (
            <>
              <textarea
                rows={3}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask about sizing, materials, authenticity..."
                className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm resize-none"
              />
              {submitError && <p className="text-xs text-red-500 font-medium italic">{submitError}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting || !newQuestion.trim()}
                className="px-8 py-3 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Ask a Question
              </button>
            </>
          )}
        </div>

        {loading ? null : questions.length === 0 ? (
          <p className="text-sm text-[#1A1A1A]/40 italic text-center">No questions yet — be the first to ask.</p>
        ) : (
          <div className="space-y-10">
            {questions.map((q) => (
              <div key={q.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 shrink-0">Q:</span>
                  <p className="text-sm font-medium text-[#1A1A1A]">{q.body}</p>
                </div>
                {q.answers.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 pl-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] shrink-0">A:</span>
                    <div className="space-y-1">
                      <p className="text-sm text-[#1A1A1A]/70">{a.body}</p>
                      {a.isOfficial && (
                        <div className="flex items-center gap-1 text-green-600">
                          <ShieldCheck className="w-3 h-3" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">Official Store Answer</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
