import { useState, useCallback, useMemo } from 'react';
import {
  buildCategoryTree,
  flattenCategoryTree,
  canReparent,
  getCategoryDescendantIds,
  type CategoryTreeNode,
  type CategoryReorderFlatItem,
} from '@amber/shared';
import type { Category } from '../schema';

export type DropIntent = 'root' | 'nest' | 'reorder';

interface DragState {
  activeId: string | null;
  overId: string | null;
  dropIntent: DropIntent | null;
}

type FlatCategory = Omit<Category, 'parentId' | 'displayOrder'> & {
  parentId: string | null;
  displayOrder: number;
};

function recalculateDisplayOrders(categories: FlatCategory[]): FlatCategory[] {
  const byParent = new Map<string | null, FlatCategory[]>();
  for (const cat of categories) {
    const key = cat.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(cat);
  }

  return categories.map((cat) => {
    const siblings = byParent.get(cat.parentId ?? null) ?? [];
    siblings.sort((a, b) => a.displayOrder - b.displayOrder);
    const index = siblings.findIndex((s) => s.id === cat.id);
    return { ...cat, displayOrder: index >= 0 ? index : 0 };
  });
}

function applyMoveToFlat(
  categories: FlatCategory[],
  activeId: string,
  overId: string,
  intent: DropIntent,
): FlatCategory[] {
  const updated = categories.map((c) => ({ ...c }));
  const active = updated.find((c) => c.id === activeId);
  const over = updated.find((c) => c.id === overId);
  if (!active) return categories;

  if (intent === 'root') {
    active.parentId = null;
    const roots = updated.filter((c) => c.parentId === null && c.id !== activeId);
    active.displayOrder = roots.length;
    return recalculateDisplayOrders(updated);
  }

  if (intent === 'nest') {
    active.parentId = overId;
    const siblings = updated.filter((c) => c.parentId === overId && c.id !== activeId);
    active.displayOrder = siblings.length;
    return recalculateDisplayOrders(updated);
  }

  if (!over) return categories;

  const targetParentId = over.parentId ?? null;
  active.parentId = targetParentId;

  const siblings = updated
    .filter((c) => (c.parentId ?? null) === targetParentId && c.id !== activeId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const insertIndex = siblings.findIndex((s) => s.id === overId);
  siblings.splice(insertIndex >= 0 ? insertIndex : siblings.length, 0, active);
  siblings.forEach((s, i) => {
    s.displayOrder = i;
  });

  return recalculateDisplayOrders(updated);
}

export function useCategoryTreeDnD(
  categories: Category[],
  onReorder: (payload: CategoryReorderFlatItem[]) => Promise<void>,
) {
  const [dragState, setDragState] = useState<DragState>({
    activeId: null,
    overId: null,
    dropIntent: null,
  });
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticTree, setOptimisticTree] = useState<CategoryTreeNode[] | null>(null);

  const flatCategories = useMemo<FlatCategory[]>(
    () =>
      categories.map((c) => ({
        ...c,
        parentId: c.parentId ?? null,
        displayOrder: c.displayOrder ?? 0,
      })),
    [categories],
  );

  const baseTree = useMemo(() => buildCategoryTree(flatCategories), [flatCategories]);
  const tree = optimisticTree ?? baseTree;

  const resetOptimistic = useCallback(() => setOptimisticTree(null), []);

  const setDragOver = useCallback((overId: string | null, intent: DropIntent | null) => {
    setDragState((prev) => ({ ...prev, overId, dropIntent: intent }));
  }, []);

  const setActiveDrag = useCallback((activeId: string | null) => {
    setDragState({ activeId, overId: null, dropIntent: null });
  }, []);

  const handleDragEnd = useCallback(
    async (activeId: string, overId: string | null, intent: DropIntent | null) => {
      setDragState({ activeId: null, overId: null, dropIntent: null });
      if (!overId || !intent) return;

      if (intent === 'nest' && !canReparent(categories, activeId, overId)) {
        setError('Cannot move a category under itself or its descendants');
        return;
      }

      const nextFlat = applyMoveToFlat(flatCategories, activeId, overId, intent);
      const nextTree = buildCategoryTree(nextFlat);
      const payload = flattenCategoryTree(nextTree);

      setOptimisticTree(nextTree);
      setReordering(true);
      setError(null);
      try {
        await onReorder(payload);
        setOptimisticTree(null);
      } catch (err) {
        setOptimisticTree(null);
        setError(err instanceof Error ? err.message : 'Failed to reorder categories');
      } finally {
        setReordering(false);
      }
    },
    [categories, flatCategories, onReorder],
  );

  const isInvalidNestTarget = useCallback(
    (draggedId: string | null, targetId: string) => {
      if (!draggedId) return false;
      if (draggedId === targetId) return true;
      return getCategoryDescendantIds(categories, draggedId).includes(targetId);
    },
    [categories],
  );

  return {
    tree,
    dragState,
    reordering,
    error,
    setError,
    setActiveDrag,
    setDragOver,
    handleDragEnd,
    resetOptimistic,
    isInvalidNestTarget,
  };
}
