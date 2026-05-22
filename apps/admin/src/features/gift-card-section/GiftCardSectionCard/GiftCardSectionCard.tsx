import React, { useState } from 'react';
import { Gift, Check, Edit2, Trash2, Power, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GiftCardSection } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GiftCardSectionCardProps {
  section: GiftCardSection;
  onEdit: (section: GiftCardSection) => void;
  onDelete: (id: string) => void;
  onToggleActive: (section: GiftCardSection) => void;
}

export const GiftCardSectionCard: React.FC<GiftCardSectionCardProps> = ({
  section,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    if (showConfirm) {
      onDelete(section.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className={cn(
      "group relative bg-card border transition-all duration-500 overflow-hidden",
      section.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/50"
    )}>
      <div className="aspect-[16/9] bg-[#1A1A1A] relative overflow-hidden flex items-center justify-center p-6">
         {/* Mini Preview of the card */}
         <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#F5F0E1] rounded-lg p-4 flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-start">
              <span className="font-serif text-[10px] tracking-tighter uppercase text-[#1A1A1A]">{section.cardTitle}</span>
              <Gift className="w-4 h-4 text-[#1A1A1A]/20" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[6px] uppercase tracking-widest font-bold opacity-40 text-[#1A1A1A]">{section.cardType}</span>
              <p className="text-lg font-serif text-[#1A1A1A]">{section.cardAmount}</p>
            </div>
         </div>

        {section.isActive && (
          <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg">
            <Check size={16} />
          </div>
        )}

        {/* Confirmation Overlay */}
        {showConfirm && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-20">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <p className="text-white text-xs font-bold text-center px-4">Delete this gift card banner?</p>
            <div className="flex gap-3">
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-destructive text-white text-[10px] font-bold uppercase tracking-wider hover:bg-destructive/80 transition-colors"
              >
                Confirm
              </button>
              <button 
                onClick={handleCancel}
                className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
           <button onClick={() => onEdit(section)} className="p-3 bg-white text-black hover:bg-primary hover:text-white transition-colors"><Edit2 size={18}/></button>
           <button onClick={handleDelete} className={cn("p-3 transition-colors", showConfirm ? "bg-destructive text-white" : "bg-white text-destructive hover:bg-destructive hover:text-white")}><Trash2 size={18}/></button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{section.badge}</div>
          <h3 className="text-xl font-serif text-foreground truncate">{section.title}</h3>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
           <button 
            onClick={() => onToggleActive(section)}
            className={cn(
              "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
              section.isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
           >
             <Power size={14} />
             {section.isActive ? 'Active' : 'Set Active'}
           </button>
           <span className="text-[9px] font-mono text-muted-foreground/40">{section.id.split('-')[0]}</span>
        </div>
      </div>
    </div>
  );
};