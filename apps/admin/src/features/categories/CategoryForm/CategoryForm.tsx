import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  formatCategoryOptionLabel,
  getSelectableParentCategories,
  type CategoryNode,
} from '@amber/shared';
import type { CategoryFormState } from '../useCategories';

interface CategoryFormProps {
  formData: CategoryFormState;
  setFormData: (data: CategoryFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  editingCategory: { id: string } | null;
  availableCategories: CategoryNode[];
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitting,
  editingCategory,
  availableCategories,
}) => {
  const parentOptions = getSelectableParentCategories(
    availableCategories,
    editingCategory?.id,
  );

  const handleInputChange = <K extends keyof CategoryFormState>(
    field: K,
    value: CategoryFormState[K],
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8 py-4">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
          Category Name
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-base font-medium placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          placeholder="e.g. Traditional Wear"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
          Slug
        </label>
        <input
          type="text"
          value={formData.slug ?? ''}
          onChange={(e) => handleInputChange('slug', e.target.value)}
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-base font-medium placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          placeholder="e.g. traditional-wear (leave blank to auto-generate)"
        />
        <p className="text-[10px] text-muted-foreground/80">
          Leave blank to automatically generate from category name
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
          Description
        </label>
        <textarea
          value={formData.description ?? ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full h-24 border-b border-input bg-transparent px-0 py-2 text-base font-medium placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none"
          placeholder="Category description"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
          Image URL
        </label>
        <input
          type="url"
          value={formData.image ?? ''}
          onChange={(e) => handleInputChange('image', e.target.value)}
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-base font-medium placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
            Display Order
          </label>
          <input
            type="number"
            value={formData.displayOrder}
            onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value, 10) || 0)}
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-base font-medium placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
            min={0}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
            Parent Category
          </label>
          <select
            value={formData.parentId ?? ''}
            onChange={(e) =>
              handleInputChange('parentId', e.target.value || undefined)
            }
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-base font-medium focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          >
            <option value="">No Parent (Top Level)</option>
            {parentOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {formatCategoryOptionLabel(availableCategories, cat)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="isActive" className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
            Active
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="isFeatured" className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
            Featured
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
          SEO Metadata
        </h4>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
            Meta Title
          </label>
          <input
            type="text"
            value={formData.metaTitle ?? ''}
            onChange={(e) => handleInputChange('metaTitle', e.target.value)}
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-base font-medium placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
            placeholder="SEO meta title"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
            Meta Description
          </label>
          <textarea
            value={formData.metaDescription ?? ''}
            onChange={(e) => handleInputChange('metaDescription', e.target.value)}
            className="w-full h-16 border-b border-input bg-transparent px-0 py-2 text-base font-medium placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none"
            placeholder="SEO meta description"
          />
        </div>
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
