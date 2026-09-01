import React, { useState } from 'react';
import { MessageCircleQuestion, Check, X as XIcon, Send, Trash2 } from 'lucide-react';
import { useFetch } from '../hooks/useCrud';
import { apiService, formatApiErrorMessage } from '../services/api.service';
import { API_ROUTES } from '../config/constants';

interface QuestionAnswer {
  id: string;
  body: string;
  answeredBy?: string | null;
  isOfficial: boolean;
  createdAt: string;
}

interface ProductQuestion {
  id: string;
  productId: string;
  userName?: string | null;
  body: string;
  isApproved: boolean;
  createdAt: string;
  answers: QuestionAnswer[];
  product?: { id: string; name: string };
}

export const QuestionsPage: React.FC = () => {
  const { data: questions, loading, refresh } = useFetch<ProductQuestion>(API_ROUTES.QUESTIONS.BASE);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [submittingAnswer, setSubmittingAnswer] = useState<string | null>(null);

  const handleToggleApproval = async (id: string) => {
    setActioningId(id);
    try {
      await apiService(API_ROUTES.QUESTIONS.TOGGLE_APPROVAL(id), { method: 'PATCH' });
      refresh();
    } catch (error) {
      alert(formatApiErrorMessage(error, 'Failed to update question'));
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this question?')) return;
    setActioningId(id);
    try {
      await apiService(API_ROUTES.QUESTIONS.BY_ID(id), { method: 'DELETE' });
      refresh();
    } catch (error) {
      alert(formatApiErrorMessage(error, 'Failed to delete question'));
    } finally {
      setActioningId(null);
    }
  };

  const handleAnswer = async (id: string) => {
    const body = answerDrafts[id]?.trim();
    if (!body) return;
    setSubmittingAnswer(id);
    try {
      await apiService(API_ROUTES.QUESTIONS.ANSWERS(id), { method: 'POST', body: { body } });
      setAnswerDrafts((prev) => ({ ...prev, [id]: '' }));
      refresh();
    } catch (error) {
      alert(formatApiErrorMessage(error, 'Failed to submit answer'));
    } finally {
      setSubmittingAnswer(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 text-primary">
          <MessageCircleQuestion size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Product Q&amp;A</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Moderate and answer pre-purchase questions</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic border border-dashed border-border">No questions yet.</div>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="border border-border p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {q.product?.name || 'Unknown product'} — {q.userName || 'Customer'}
                  </p>
                  <p className="text-sm font-medium">{q.body}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-sm ${q.isApproved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {q.isApproved ? 'Approved' : 'Pending'}
                  </span>
                  <button
                    disabled={actioningId === q.id}
                    onClick={() => handleToggleApproval(q.id)}
                    className="p-2 bg-secondary hover:bg-green-100 hover:text-green-700 transition-colors disabled:opacity-50"
                    title={q.isApproved ? 'Unapprove' : 'Approve'}
                  >
                    {q.isApproved ? <XIcon size={14} /> : <Check size={14} />}
                  </button>
                  <button
                    disabled={actioningId === q.id}
                    onClick={() => handleDelete(q.id)}
                    className="p-2 bg-secondary hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {q.answers.length > 0 && (
                <div className="pl-6 border-l-2 border-primary/20 space-y-3">
                  {q.answers.map((a) => (
                    <div key={a.id} className="text-sm">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-primary mr-2">
                        {a.isOfficial ? 'Store Answer' : a.answeredBy || 'Reply'}
                      </span>
                      {a.body}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={answerDrafts[q.id] || ''}
                  onChange={(e) => setAnswerDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Write an official store answer..."
                  className="flex-1 h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
                />
                <button
                  onClick={() => handleAnswer(q.id)}
                  disabled={submittingAnswer === q.id || !answerDrafts[q.id]?.trim()}
                  className="px-4 bg-foreground text-primary-foreground text-[9px] font-bold uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={14} />
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
