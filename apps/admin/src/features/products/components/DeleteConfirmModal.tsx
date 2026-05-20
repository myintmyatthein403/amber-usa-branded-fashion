import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../../../components/admin/Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Product" size="sm">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-serif text-foreground">Delete this product?</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone. All associated inventory variants will be removed.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground border border-border hover:border-foreground transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-300"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};