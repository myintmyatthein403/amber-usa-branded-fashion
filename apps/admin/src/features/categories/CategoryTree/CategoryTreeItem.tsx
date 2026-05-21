import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Tag,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { CategoryTreeNode } from '@amber/shared';
import type { Category } from '../schema';
import type { DropIntent } from './useCategoryTreeDnD';

const INDENT_PX = 24;

interface CategoryTreeItemProps {
  node: CategoryTreeNode;
  category: Category;
  depth: number;
  expanded: boolean;
  onToggleExpand: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleActive: (category: Category) => void;
  dragActiveId: string | null;
  dragOverId: string | null;
  dropIntent: DropIntent | null;
  isInvalidNestTarget: boolean;
  children?: React.ReactNode;
}

export const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  node,
  category,
  depth,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  dragActiveId,
  dragOverId,
  dropIntent,
  isInvalidNestTarget,
  children,
}) => {
  const hasChildren = node.children.length > 0;
  const productCount = category._count?.products ?? 0;
  const isDraggingAnother = Boolean(dragActiveId && dragActiveId !== node.id);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const { setNodeRef: setNestRef, isOver: isNestOver } = useDroppable({
    id: `nest-${node.id}`,
    data: { type: 'nest', categoryId: node.id },
  });

  const isReorderOver = dragOverId === node.id && dropIntent === 'reorder';
  const isNestDropOver =
    (dragOverId === `nest-${node.id}` && dropIntent === 'nest') || isNestOver;
  const showInvalidNest = isNestDropOver && isInvalidNestTarget;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: depth * INDENT_PX,
  };

  return (
    <div ref={setSortableRef} style={style} className={cn(isDragging && 'opacity-40')}>
      <div
        className={cn(
          'group flex items-stretch gap-2 border border-transparent rounded-sm transition-colors',
          isReorderOver && 'border-primary/40 bg-primary/5',
          showInvalidNest && 'border-destructive/40 bg-destructive/5',
          isNestDropOver && !showInvalidNest && 'border-primary bg-primary/10',
        )}
      >
        <button
          type="button"
          className="self-center p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder among siblings"
        >
          <GripVertical size={16} />
        </button>

        <button
          type="button"
          onClick={() => hasChildren && onToggleExpand(node.id)}
          className={cn(
            'self-center p-0.5 text-muted-foreground shrink-0',
            !hasChildren && 'invisible',
          )}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div
          ref={setNestRef}
          className={cn(
            'relative flex flex-1 items-center gap-3 min-w-0 min-h-[52px] py-2 pr-2',
            isDraggingAnother && 'cursor-copy',
          )}
        >
          {isDraggingAnother && (
            <span
              className={cn(
                'absolute inset-0 flex items-center justify-center text-[9px] font-bold uppercase tracking-widest pointer-events-none z-10 rounded-sm',
                showInvalidNest
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/5 text-primary/80',
              )}
            >
              {showInvalidNest ? 'Cannot nest here' : 'Drop to nest inside'}
            </span>
          )}
          <div className="w-8 h-8 bg-secondary border border-border flex items-center justify-center shrink-0">
            <Tag size={14} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-serif text-foreground block truncate">{node.name}</span>
            <span className="text-[10px] font-mono text-muted-foreground/60 truncate block">
              {node.slug}
            </span>
          </div>
          {productCount > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 shrink-0">
              {productCount} products
            </span>
          )}
          <button
            type="button"
            onClick={() => onToggleActive(category)}
            className={cn(
              'text-[10px] font-bold uppercase tracking-widest shrink-0 px-2 py-0.5 border transition-colors relative z-20',
              category.isActive !== false
                ? 'border-green-500/30 text-green-600'
                : 'border-border text-muted-foreground',
            )}
          >
            {category.isActive !== false ? 'Active' : 'Inactive'}
          </button>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center pr-2">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="p-2 text-muted-foreground hover:text-foreground"
            aria-label="Edit category"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(node.id)}
            className="p-2 text-muted-foreground hover:text-destructive"
            aria-label="Delete category"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {expanded && children}
    </div>
  );
};
