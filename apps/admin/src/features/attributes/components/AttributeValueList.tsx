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
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Edit2 } from 'lucide-react';
import type { AttributeWithValues } from '@amber/shared';

interface AttributeValueListProps {
  attribute: AttributeWithValues;
  onAddValue: (data: { value: string; hexColor?: string }) => void;
  onEditValue: (
    valueId: string,
    data: { value: string; hexColor?: string },
  ) => void;
  onRemoveValue: (valueId: string, label: string) => void;
  onReorder: (items: { id: string; position: number }[]) => void;
  onOpenMedia?: () => void;
  imageValueDraft?: string;
}

function SortableValueChip({
  val,
  attrType,
  onEdit,
  onRemove,
}: {
  val: AttributeWithValues['values'][number] & { id: string };
  attrType: string;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: val.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-2 bg-secondary border border-border group/chip hover:border-primary/30 transition-all duration-300"
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground/40 hover:text-primary transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      {attrType === 'color' && val.hexColor && (
        <div
          className="w-4 h-4 border border-border shrink-0 shadow-sm"
          style={{ backgroundColor: val.hexColor }}
        />
      )}
      {attrType === 'image' && val.value.startsWith('http') && (
        <img src={val.value} alt="" className="w-8 h-8 object-cover border border-border group-hover/chip:scale-110 transition-transform" />
      )}
      <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">{val.value}</span>
      
      <div className="flex items-center gap-1 ml-2 opacity-0 group-hover/chip:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onEdit}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Edit2 size={12} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

export const AttributeValueList: React.FC<AttributeValueListProps> = ({
  attribute,
  onAddValue,
  onEditValue,
  onRemoveValue,
  onReorder,
  onOpenMedia,
  imageValueDraft,
}) => {
  const [newValue, setNewValue] = useState('');
  const [newHex, setNewHex] = useState('#000000');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editHex, setEditHex] = useState('#000000');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = attribute.values.findIndex((v) => v.id === active.id);
    const newIndex = attribute.values.findIndex((v) => v.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(attribute.values, oldIndex, newIndex);
    onReorder(reordered.map((v, i) => ({ id: v.id, position: i })));
  };

  const handleAdd = () => {
    const trimmed = newValue.trim();
    if (!trimmed && attribute.type !== 'image') return;
    if (attribute.type === 'image' && imageValueDraft) {
      onAddValue({ value: imageValueDraft });
      setNewValue('');
      return;
    }
    onAddValue({
      value: trimmed,
      hexColor: attribute.type === 'color' ? newHex : undefined,
    });
    setNewValue('');
  };

  const startEdit = (
    val: AttributeWithValues['values'][number] & { id: string },
  ) => {
    setEditingId(val.id);
    setEditLabel(val.value);
    setEditHex(val.hexColor || '#000000');
  };

  const saveEdit = () => {
    if (!editingId || !editLabel.trim()) return;
    onEditValue(editingId, {
      value: editLabel.trim(),
      hexColor: attribute.type === 'color' ? editHex : undefined,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={attribute.values.filter((v) => v.id).map((v) => v.id!)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-2">
            {attribute.values
              .filter((v): v is AttributeWithValues['values'][number] & { id: string } =>
                Boolean(v.id),
              )
              .map((val) =>
              editingId === val.id ? (
                <div
                  key={val.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-primary"
                >
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-24 bg-transparent text-xs focus:outline-none"
                  />
                  {attribute.type === 'color' && (
                    <input
                      type="color"
                      value={editHex}
                      onChange={(e) => setEditHex(e.target.value)}
                      className="w-8 h-6 border-0 p-0"
                    />
                  )}
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="text-[10px] font-bold uppercase text-primary"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-[10px] uppercase text-muted-foreground"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <SortableValueChip
                  key={val.id}
                  val={val}
                  attrType={attribute.type}
                  onEdit={() => startEdit(val)}
                  onRemove={() => onRemoveValue(val.id, val.value)}
                />
              ),
            )}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap items-center gap-2">
        {attribute.type === 'image' ? (
          <button
            type="button"
            onClick={onOpenMedia}
            className="px-4 py-2 border border-border text-xs font-bold uppercase hover:border-primary"
          >
            Pick image value
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Add new value…"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 min-w-[160px] bg-secondary/50 border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
            {attribute.type === 'color' && (
              <input
                type="color"
                value={newHex}
                onChange={(e) => setNewHex(e.target.value)}
                className="w-10 h-9 border border-border"
              />
            )}
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newValue.trim()}
              className="px-4 py-2 bg-foreground text-primary-foreground text-xs font-bold uppercase hover:bg-primary disabled:opacity-50"
            >
              Add
            </button>
          </>
        )}
      </div>
    </div>
  );
};
