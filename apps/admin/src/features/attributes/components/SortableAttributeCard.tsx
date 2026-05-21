import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Trash2, GripVertical, Filter, Palette, Image, Type } from 'lucide-react';
import type { AttributeWithValues } from '@amber/shared';
import { AttributeValueList } from './AttributeValueList';

interface SortableAttributeCardProps {
  attribute: AttributeWithValues;
  onEdit: (attr: AttributeWithValues) => void;
  onDelete: (attr: AttributeWithValues) => void;
  onAddValue: (attributeId: string, data: { value: string; hexColor?: string }) => void;
  onEditValue: (
    valueId: string,
    data: { value: string; hexColor?: string },
  ) => void;
  onRemoveValue: (attributeId: string, valueId: string, label: string) => void;
  onReorderValues: (
    attributeId: string,
    items: { id: string; position: number }[],
  ) => void;
  onOpenMedia: (attributeId: string) => void;
  imageValueDraft?: string;
  mediaAttributeId: string | null;
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'color':
      return <Palette size={14} />;
    case 'image':
      return <Image size={14} />;
    default:
      return <Type size={14} />;
  }
}

export const SortableAttributeCard: React.FC<SortableAttributeCardProps> = ({
  attribute,
  onEdit,
  onDelete,
  onAddValue,
  onEditValue,
  onRemoveValue,
  onReorderValues,
  onOpenMedia,
  imageValueDraft,
  mediaAttributeId,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: attribute.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const usageCount = attribute.usageCount ?? 0;

  return (
    <div ref={setNodeRef} style={style} className="bg-card border border-border">
      <div className="p-6 border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            className="cursor-grab text-muted-foreground hover:text-foreground shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={18} />
          </button>
          <div className="p-2 bg-secondary text-muted-foreground shrink-0">
            {getTypeIcon(attribute.type)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{attribute.name}</h3>
              {attribute.isRequired && (
                <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-[9px] font-bold uppercase">
                  Required
                </span>
              )}
              {attribute.isFilterable && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase flex items-center gap-1">
                  <Filter size={10} /> Filterable
                </span>
              )}
              <span className="px-2 py-0.5 bg-secondary border border-border text-[9px] font-bold uppercase text-muted-foreground">
                {usageCount} {usageCount === 1 ? 'variant' : 'variants'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{attribute.slug}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(attribute)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(attribute)}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="p-6">
        <AttributeValueList
          attribute={attribute}
          onAddValue={(data) => onAddValue(attribute.id, data)}
          onEditValue={onEditValue}
          onRemoveValue={(valueId, label) =>
            onRemoveValue(attribute.id, valueId, label)
          }
          onReorder={(items) => onReorderValues(attribute.id, items)}
          onOpenMedia={
            attribute.type === 'image' ? () => onOpenMedia(attribute.id) : undefined
          }
          imageValueDraft={
            mediaAttributeId === attribute.id ? imageValueDraft : undefined
          }
        />
      </div>
    </div>
  );
};
