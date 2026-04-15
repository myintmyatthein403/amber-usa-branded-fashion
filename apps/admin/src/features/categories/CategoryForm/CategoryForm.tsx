import React from 'react';
import { Loader2 } from 'lucide-react';

interface CategoryFormProps {
  formData: { name: string };
  setFormData: (data: { name: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  editingCategory: any;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitting,
  editingCategory
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 py-4">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Category Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-base font-medium placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          placeholder="e.g. Traditional Wear"
        />
      </div>
      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-4 transition-colors duration-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors duration-300 disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {editingCategory ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
};
