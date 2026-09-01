import React, { useState } from 'react';
import { RotateCcw, Check, X as XIcon, PackageCheck, Loader2 } from 'lucide-react';
import { useFetch } from '../hooks/useCrud';
import { apiService, formatApiErrorMessage } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { Modal } from '../components/admin/Modal';

interface ReturnItem {
  id: string;
  quantity: number;
  condition: 'RESELLABLE' | 'DAMAGED' | null;
  receivedAt: string | null;
  orderItem: { id: string; name: string; size?: string | null };
}

interface ReturnRequest {
  id: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RECEIVED' | 'COMPLETED';
  reason: string;
  comments: string | null;
  createdAt: string;
  order: { id: string; orderNumber: string };
  user: { id: string; name: string | null; email: string } | null;
  items: ReturnItem[];
}

const STATUS_STYLES: Record<ReturnRequest['status'], string> = {
  REQUESTED: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  RECEIVED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export const ReturnsPage: React.FC = () => {
  const { data: returns, loading, refresh } = useFetch<ReturnRequest>(API_ROUTES.RETURNS.BASE);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [receiveModalReturn, setReceiveModalReturn] = useState<ReturnRequest | null>(null);
  const [receiveConditions, setReceiveConditions] = useState<Record<string, 'RESELLABLE' | 'DAMAGED'>>({});
  const [receiveSubmitting, setReceiveSubmitting] = useState(false);
  const [receiveError, setReceiveError] = useState<string | null>(null);

  const handleDecision = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (status === 'REJECTED' && !window.confirm('Reject this return request?')) return;
    setActioningId(id);
    try {
      await apiService(API_ROUTES.RETURNS.STATUS(id), {
        method: 'PATCH',
        body: { status },
      });
      refresh();
    } catch (error) {
      alert(formatApiErrorMessage(error, 'Failed to update return request'));
    } finally {
      setActioningId(null);
    }
  };

  const openReceiveModal = (ret: ReturnRequest) => {
    const defaults: Record<string, 'RESELLABLE' | 'DAMAGED'> = {};
    ret.items.filter((i) => !i.receivedAt).forEach((i) => { defaults[i.id] = 'RESELLABLE'; });
    setReceiveConditions(defaults);
    setReceiveError(null);
    setReceiveModalReturn(ret);
  };

  const handleReceiveSubmit = async () => {
    if (!receiveModalReturn) return;
    setReceiveSubmitting(true);
    setReceiveError(null);
    try {
      await apiService(API_ROUTES.RETURNS.RECEIVE(receiveModalReturn.id), {
        method: 'POST',
        body: {
          items: Object.entries(receiveConditions).map(([returnItemId, condition]) => ({
            returnItemId,
            condition,
          })),
        },
      });
      setReceiveModalReturn(null);
      refresh();
    } catch (error) {
      setReceiveError(formatApiErrorMessage(error, 'Failed to record receipt'));
    } finally {
      setReceiveSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 text-primary">
          <RotateCcw size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Returns & RMAs</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Approve, receive, and reconcile customer returns</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Loading return requests...</div>
      ) : returns.length === 0 ? (
        <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic border border-dashed border-border">No return requests yet.</div>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-4">Order</th>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Reason</th>
                <th className="text-left px-6 py-4">Items</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {returns.map((ret) => (
                <tr key={ret.id}>
                  <td className="px-6 py-4 font-mono text-xs">{ret.order.orderNumber}</td>
                  <td className="px-6 py-4 text-xs">{ret.user?.name || ret.user?.email || '—'}</td>
                  <td className="px-6 py-4 text-xs max-w-xs truncate" title={ret.reason}>{ret.reason}</td>
                  <td className="px-6 py-4 text-xs">
                    {ret.items.map((i) => `${i.orderItem.name} ×${i.quantity}`).join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-sm ${STATUS_STYLES[ret.status]}`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {ret.status === 'REQUESTED' && (
                        <>
                          <button
                            disabled={actioningId === ret.id}
                            onClick={() => handleDecision(ret.id, 'APPROVED')}
                            className="p-2 bg-secondary hover:bg-green-100 hover:text-green-700 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            {actioningId === ret.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          </button>
                          <button
                            disabled={actioningId === ret.id}
                            onClick={() => handleDecision(ret.id, 'REJECTED')}
                            className="p-2 bg-secondary hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XIcon size={14} />
                          </button>
                        </>
                      )}
                      {(ret.status === 'APPROVED' || ret.status === 'RECEIVED') && (
                        <button
                          onClick={() => openReceiveModal(ret)}
                          className="flex items-center gap-2 px-3 py-2 bg-foreground text-primary-foreground text-[9px] font-bold uppercase tracking-widest hover:bg-primary transition-colors"
                        >
                          <PackageCheck size={14} />
                          Receive Items
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!receiveModalReturn}
        onClose={() => setReceiveModalReturn(null)}
        title="Receive Returned Items"
        size="md"
      >
        {receiveModalReturn && (
          <div className="space-y-6">
            <p className="text-xs text-muted-foreground">
              Order <span className="font-mono">{receiveModalReturn.order.orderNumber}</span> — mark each item's
              condition as it's physically inspected. Resellable items are credited back to inventory; damaged items
              are logged but not restocked.
            </p>

            <div className="space-y-4">
              {receiveModalReturn.items.filter((i) => !i.receivedAt).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 p-4 border border-border">
                  <div>
                    <div className="text-sm font-bold">{item.orderItem.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Qty {item.quantity}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReceiveConditions((prev) => ({ ...prev, [item.id]: 'RESELLABLE' }))}
                      className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest border transition-colors ${receiveConditions[item.id] === 'RESELLABLE' ? 'bg-green-600 text-white border-green-600' : 'border-border text-muted-foreground hover:border-foreground'}`}
                    >
                      Resellable
                    </button>
                    <button
                      onClick={() => setReceiveConditions((prev) => ({ ...prev, [item.id]: 'DAMAGED' }))}
                      className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest border transition-colors ${receiveConditions[item.id] === 'DAMAGED' ? 'bg-destructive text-white border-destructive' : 'border-border text-muted-foreground hover:border-foreground'}`}
                    >
                      Damaged
                    </button>
                  </div>
                </div>
              ))}
              {receiveModalReturn.items.every((i) => i.receivedAt) && (
                <p className="text-xs text-muted-foreground italic">All items in this return have already been received.</p>
              )}
            </div>

            {receiveError && <p className="text-xs text-red-500 font-medium">{receiveError}</p>}

            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <button
                onClick={() => setReceiveModalReturn(null)}
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleReceiveSubmit}
                disabled={receiveSubmitting || receiveModalReturn.items.every((i) => i.receivedAt)}
                className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {receiveSubmitting && <Loader2 size={16} className="animate-spin" />}
                Confirm Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
