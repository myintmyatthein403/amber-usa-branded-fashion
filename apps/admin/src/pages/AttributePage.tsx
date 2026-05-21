import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import type { AttributeFormData, AttributeWithValues } from '@amber/shared';
import { Modal } from '../components/admin/Modal';
import { MediaSelector } from '../components/admin/MediaSelector';
import { useAttributes } from '../features/attributes/useAttributes';
import { AttributeSearchBar } from '../features/attributes/components/AttributeSearchBar';
import { SortableAttributeCard } from '../features/attributes/components/SortableAttributeCard';

export const AttributePage: React.FC = () => {
  const {
    attributes,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    filterableFilter,
    setFilterableFilter,
    hasActiveSearch,
    submitting,
    submitError,
    setSubmitError,
    deleteConfirmOpen,
    deletingTarget,
    deleteError,
    addAttribute,
    editAttribute,
    removeAttribute,
    addAttributeValue,
    editAttributeValue,
    removeAttributeValue,
    reorderAttributes,
    reorderValues,
    confirmDelete,
    cancelDelete,
  } = useAttributes();

  const [attributeModalOpen, setAttributeModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<AttributeWithValues | null>(null);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [mediaAttributeId, setMediaAttributeId] = useState<string | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | undefined>();

  const [formData, setFormData] = useState<AttributeFormData>({
    name: '',
    slug: '',
    type: 'text',
    isRequired: false,
    isFilterable: false,
    position: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const resetForm = () => {
    setEditingAttribute(null);
    setFormData({
      name: '',
      slug: '',
      type: 'text',
      isRequired: false,
      isFilterable: false,
      position: 0,
    });
    setSubmitError(null);
  };

  const handleSaveAttribute = async () => {
    try {
      if (editingAttribute) {
        await editAttribute(editingAttribute.id, formData);
      } else {
        await addAttribute(formData);
      }
      setAttributeModalOpen(false);
      resetForm();
    } catch {
      /* submitError set in hook */
    }
  };

  const openEditAttribute = (attr: AttributeWithValues) => {
    setEditingAttribute(attr);
    setFormData({
      name: attr.name,
      slug: attr.slug,
      type: attr.type as AttributeFormData['type'],
      isRequired: attr.isRequired,
      isFilterable: attr.isFilterable,
      position: attr.position ?? 0,
    });
    setAttributeModalOpen(true);
  };

  const handleAttributeDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = attributes.findIndex((a) => a.id === active.id);
    const newIndex = attributes.findIndex((a) => a.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(attributes, oldIndex, newIndex);
    await reorderAttributes(
      reordered.map((a, i) => ({ id: a.id, position: i })),
    );
  };

  const handleMediaSelect = async (url: string) => {
    if (mediaAttributeId) {
      setPendingImageUrl(url);
      await addAttributeValue(mediaAttributeId, { value: url });
      setPendingImageUrl(undefined);
      setMediaAttributeId(null);
    }
    setMediaSelectorOpen(false);
  };

  const emptyMessage = hasActiveSearch
    ? 'No attributes match your search.'
    : 'No attributes defined. Add attributes to define product options like Size, Color, Material, etc.';

  const deletingUsageCount =
    deletingTarget?.kind === 'attribute'
      ? deletingTarget.attribute.usageCount ?? 0
      : 0;
  const canDeleteAttribute = deletingUsageCount === 0;

  if (loading && attributes.length === 0) {
    return (
      <div className="py-40 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-primary" size={40} />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Loading Attributes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">
            Product Configuration
          </span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">
            Attribute Management
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setAttributeModalOpen(true);
          }}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> Add Attribute
        </button>
      </div>

      <AttributeSearchBar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        filterableFilter={filterableFilter}
        onFilterableFilterChange={setFilterableFilter}
      />

      {attributes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground/50 italic">{emptyMessage}</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleAttributeDragEnd}
        >
          <SortableContext
            items={attributes.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-6">
              {attributes.map((attr) => (
                <SortableAttributeCard
                  key={attr.id}
                  attribute={attr}
                  onEdit={openEditAttribute}
                  onDelete={removeAttribute}
                  onAddValue={(_, data) => addAttributeValue(attr.id, data)}
                  onEditValue={editAttributeValue}
                  onRemoveValue={removeAttributeValue}
                  onReorderValues={reorderValues}
                  onOpenMedia={(id) => {
                    setMediaAttributeId(id);
                    setMediaSelectorOpen(true);
                  }}
                  imageValueDraft={pendingImageUrl}
                  mediaAttributeId={mediaAttributeId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Modal
        isOpen={attributeModalOpen}
        onClose={() => setAttributeModalOpen(false)}
        title={editingAttribute ? 'Edit Attribute' : 'Add Attribute'}
        size="md"
      >
        {submitError && (
          <p className="mb-4 text-sm text-destructive">{submitError}</p>
        )}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              Attribute Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug:
                    formData.slug ||
                    e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
              }
              placeholder="e.g. Size, Color"
              className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                })
              }
              className="w-full h-10 border-b border-input bg-transparent px-0 text-sm font-mono focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as AttributeFormData['type'],
                })
              }
              className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
            >
              <option value="text">Text</option>
              <option value="color">Color</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRequired}
                onChange={(e) =>
                  setFormData({ ...formData, isRequired: e.target.checked })
                }
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm">Required</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFilterable}
                onChange={(e) =>
                  setFormData({ ...formData, isFilterable: e.target.checked })
                }
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm">Filterable</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setAttributeModalOpen(false)}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground border border-border hover:border-foreground transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAttribute}
              disabled={!formData.name || submitting}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] bg-foreground text-primary-foreground hover:bg-primary transition-all disabled:opacity-50"
            >
              {editingAttribute ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteConfirmOpen}
        onClose={cancelDelete}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-2">
              {deletingTarget?.kind === 'attribute' ? (
                <>
                  <p className="text-lg font-serif text-foreground">
                    Delete {deletingTarget.attribute.name}?
                  </p>
                  {deletingUsageCount > 0 ? (
                    <p className="text-sm text-destructive">
                      {deletingUsageCount} variant(s) use this attribute. Reassign them
                      first.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This will remove all values for this attribute.
                    </p>
                  )}
                </>
              ) : deletingTarget?.kind === 'value' ? (
                <>
                  <p className="text-lg font-serif text-foreground">
                    Delete value &quot;{deletingTarget.label}&quot;?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Variants using this value must be updated first.
                  </p>
                </>
              ) : null}
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={cancelDelete}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground border border-border hover:border-foreground transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={
                deletingTarget?.kind === 'attribute' && !canDeleteAttribute
              }
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <MediaSelector
        isOpen={mediaSelectorOpen}
        onClose={() => {
          setMediaSelectorOpen(false);
          setMediaAttributeId(null);
        }}
        onSelect={handleMediaSelect}
        selectedUrls={[]}
      />
    </div>
  );
};
