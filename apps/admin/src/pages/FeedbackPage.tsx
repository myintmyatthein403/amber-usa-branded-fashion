import React, { useState } from 'react';
import { MessageSquarePlus, Check, Eye } from 'lucide-react';
import { useFetch } from '../hooks/useCrud';
import { apiService, formatApiErrorMessage } from '../services/api.service';
import { API_ROUTES } from '../config/constants';

interface FeedbackEntry {
  id: string;
  message: string;
  email: string | null;
  page: string | null;
  status: 'NEW' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
}

const STATUS_STYLES: Record<FeedbackEntry['status'], string> = {
  NEW: 'bg-amber-100 text-amber-800',
  REVIEWED: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
};

export const FeedbackPage: React.FC = () => {
  const { data: feedback, loading, refresh } = useFetch<FeedbackEntry>(API_ROUTES.FEEDBACK.BASE);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: FeedbackEntry['status']) => {
    setActioningId(id);
    try {
      await apiService(API_ROUTES.FEEDBACK.STATUS(id), { method: 'PATCH', body: { status } });
      refresh();
    } catch (error) {
      alert(formatApiErrorMessage(error, 'Failed to update feedback'));
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 text-primary">
          <MessageSquarePlus size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Beta Feedback</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Bug reports and feedback submitted by users</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Loading feedback...</div>
      ) : feedback.length === 0 ? (
        <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic border border-dashed border-border">No feedback submitted yet.</div>
      ) : (
        <div className="space-y-4">
          {feedback.map((f) => (
            <div key={f.id} className="border border-border p-6 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {f.user?.name || f.user?.email || f.email || 'Anonymous'}
                    {f.page && <span className="ml-2 normal-case font-normal text-muted-foreground/60">on {f.page}</span>}
                  </p>
                  <p className="text-sm font-medium whitespace-pre-wrap">{f.message}</p>
                  <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">
                    {new Date(f.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-sm shrink-0 ${STATUS_STYLES[f.status]}`}>
                  {f.status}
                </span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                {f.status !== 'REVIEWED' && (
                  <button
                    disabled={actioningId === f.id}
                    onClick={() => handleStatusChange(f.id, 'REVIEWED')}
                    className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-blue-100 hover:text-blue-700 transition-colors text-[9px] font-bold uppercase tracking-widest disabled:opacity-50"
                  >
                    <Eye size={12} />
                    Mark Reviewed
                  </button>
                )}
                {f.status !== 'RESOLVED' && (
                  <button
                    disabled={actioningId === f.id}
                    onClick={() => handleStatusChange(f.id, 'RESOLVED')}
                    className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-green-100 hover:text-green-700 transition-colors text-[9px] font-bold uppercase tracking-widest disabled:opacity-50"
                  >
                    <Check size={12} />
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
