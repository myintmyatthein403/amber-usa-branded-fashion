import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Loader2, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { CategoryTreeNode, CategoryReorderFlatItem } from '@amber/shared';
import type { Category } from '../schema';
import { CategoryTreeItem } from './CategoryTreeItem';
import { useCategoryTreeDnD, type DropIntent } from './useCategoryTreeDnD';
import { categoryTreeCollisionDetection } from './categoryTreeCollision';

const EXPANDED_STORAGE_KEY = 'categoryTreeExpandedIds';

interface CategoryTreeProps {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleActive: (category: Category) => void;
  onReorder: (payload: CategoryReorderFlatItem[]) => Promise<void>;
}

function RootDropZone({
  isOver,
  isInvalid,
}: {
  isOver: boolean;
  isInvalid: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: 'root-drop' });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'mb-4 py-3 px-4 border border-dashed text-center text-[10px] font-bold uppercase tracking-widest transition-colors',
        isOver && !isInvalid && 'border-primary bg-primary/5 text-primary',
        isOver && isInvalid && 'border-destructive/40 bg-destructive/5 text-destructive',
        !isOver && 'border-border text-muted-foreground/60',
      )}
    >
      Drop here to make top-level category
    </div>
  );
}

function TreeLevel({
  nodes,
  categoriesById,
  depth,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  dragActiveId,
  dragOverId,
  dropIntent,
  isInvalidNestTarget,
}: {
  nodes: CategoryTreeNode[];
  categoriesById: Map<string, Category>;
  depth: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleActive: (category: Category) => void;
  dragActiveId: string | null;
  dragOverId: string | null;
  dropIntent: DropIntent | null;
  isInvalidNestTarget: (targetId: string) => boolean;
}) {
  const ids = nodes.map((n) => n.id);

  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <div className="space-y-0.5">
        {nodes.map((node) => {
          const expanded = expandedIds.has(node.id);
          const category = categoriesById.get(node.id);
          if (!category) return null;
          return (
            <CategoryTreeItem
              key={node.id}
              node={node}
              category={category}
              depth={depth}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              dragActiveId={dragActiveId}
              dragOverId={dragOverId}
              dropIntent={dropIntent}
              isInvalidNestTarget={isInvalidNestTarget(node.id)}
            >
              {expanded && node.children.length > 0 && (
                <TreeLevel
                  nodes={node.children}
                  categoriesById={categoriesById}
                  depth={depth + 1}
                  expandedIds={expandedIds}
                  onToggleExpand={onToggleExpand}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleActive={onToggleActive}
                  dragActiveId={dragActiveId}
                  dragOverId={dragOverId}
                  dropIntent={dropIntent}
                  isInvalidNestTarget={isInvalidNestTarget}
                />
              )}
            </CategoryTreeItem>
          );
        })}
      </div>
    </SortableContext>
  );
}

function resolveDropIntent(overId: string): { targetId: string; intent: DropIntent } | null {
  if (overId === 'root-drop') return { targetId: 'root-drop', intent: 'root' };
  if (overId.startsWith('nest-')) {
    return { targetId: overId.replace('nest-', ''), intent: 'nest' };
  }
  return { targetId: overId, intent: 'reorder' };
}

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
  onReorder,
}) => {
  const {
    tree,
    dragState,
    reordering,
    error,
    setActiveDrag,
    setDragOver,
    handleDragEnd,
    isInvalidNestTarget,
  } = useCategoryTreeDnD(categories, onReorder);

  const dragStateRef = useRef(dragState);
  dragStateRef.current = dragState;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(EXPANDED_STORAGE_KEY);
      if (saved) return new Set(JSON.parse(saved) as string[]);
    } catch {
      /* ignore */
    }
    return new Set(categories.map((c) => c.id));
  });

  useEffect(() => {
    localStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify([...expandedIds]));
  }, [expandedIds]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(categories.map((c) => c.id)));
  }, [categories]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const onDragStart = (event: DragStartEvent) => {
    setActiveDrag(String(event.active.id));
  };

  const onDragOver = (event: DragOverEvent) => {
    const overId = event.over ? String(event.over.id) : null;
    if (!overId) {
      setDragOver(null, null);
      return;
    }
    const resolved = resolveDropIntent(overId);
    if (resolved) {
      setDragOver(overId, resolved.intent);
      if (resolved.intent === 'nest') {
        setExpandedIds((prev) => new Set([...prev, resolved.targetId]));
      }
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const state = dragStateRef.current;

    let intent: DropIntent | null = state.dropIntent;
    let targetId: string | null = null;

    if (intent === 'nest' && state.overId?.startsWith('nest-')) {
      targetId = state.overId.replace('nest-', '');
    } else if (intent === 'root' && state.overId === 'root-drop') {
      targetId = 'root-drop';
    } else if (event.over) {
      const resolved = resolveDropIntent(String(event.over.id));
      if (resolved) {
        intent = resolved.intent;
        targetId = resolved.intent === 'root' ? 'root-drop' : resolved.targetId;
      }
    }

    setActiveDrag(null);

    if (!targetId || !intent) return;
    await handleDragEnd(activeId, targetId, intent);
  };

  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const activeNode = dragState.activeId
    ? categoriesById.get(dragState.activeId)
    : null;

  const rootDropOver =
    dragState.overId === 'root-drop' && dragState.dropIntent === 'root';

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="animate-spin" size={24} />
        <span className="text-xs font-medium uppercase tracking-widest italic">
          Syncing taxonomy...
        </span>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">
        No categories defined. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Drag grip to reorder siblings · Drop on row body to nest as child · Root zone for
          top-level
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-border hover:border-primary transition-colors"
          >
            <ChevronsDownUp size={14} /> Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-border hover:border-primary transition-colors"
          >
            <ChevronsUpDown size={14} /> Collapse all
          </button>
        </div>
      </div>

      {error && (
        <div className="py-3 px-4 border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          {error}
        </div>
      )}

      {reordering && (
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> Saving order...
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={categoryTreeCollisionDetection}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <RootDropZone isOver={rootDropOver} isInvalid={false} />

        <div className="border border-border bg-card p-4">
          <TreeLevel
            nodes={tree}
            categoriesById={categoriesById}
            depth={0}
            expandedIds={expandedIds}
            onToggleExpand={toggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            dragActiveId={dragState.activeId}
            dragOverId={dragState.overId}
            dropIntent={dragState.dropIntent}
            isInvalidNestTarget={(targetId) =>
              isInvalidNestTarget(dragState.activeId, targetId)
            }
          />
        </div>

        <DragOverlay>
          {activeNode ? (
            <div className="flex items-center gap-2 bg-card border border-primary shadow-lg px-4 py-2">
              <span className="text-sm font-serif">{activeNode.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
