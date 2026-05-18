import React, { useState } from 'react';
import { Trash2, Edit2, Check, Power, Timer, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SaleSectionWithUrl } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SaleSectionTableProps {
  sections: SaleSectionWithUrl[] | null;
  onEdit: (section: SaleSectionWithUrl) => void;
  onDelete: (id: string) => void;
  onToggleActive: (section: SaleSectionWithUrl) => void;
}

export const SaleSectionTable: React.FC<SaleSectionTableProps> = ({ 
  sections, 
  onEdit, 
  onDelete, 
  onToggleActive 
}) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!sections || sections.length === 0) {
    return (
      <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No promotional sections discovered.</div>
    );
  }

  const handleDeleteClick = (id: string) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {sections.map((section) => (
        <div key={section.id} className={cn(
          "group relative bg-card border transition-all duration-700 overflow-hidden flex flex-col",
          section.isActive ? "border-primary shadow-2xl shadow-primary/5" : "border-border grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
        )}>
          <div className="aspect-[21/9] overflow-hidden bg-muted relative">
            <img src={section.imageMain || section.imageUrl || ''} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-8 right-6">
               <span className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mb-2 block">{section.badge}</span>
               <h3 className="text-2xl font-serif text-white">{section.title} <span className="italic opacity-80">{section.titleItalic}</span></h3>
            </div>

            {/* Confirmation Overlay */}
            {confirmDelete === section.id && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-20">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <p className="text-white text-xs font-bold text-center px-4">Delete this sale section?</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleDeleteClick(section.id)}
                    className="px-4 py-2 bg-destructive text-white text-[10px] font-bold uppercase tracking-wider hover:bg-destructive/80 transition-colors"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="absolute top-4 right-4 flex gap-2">
               <button onClick={() => onEdit(section)} className="p-2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300"><Edit2 size={14} /></button>
               <button onClick={() => handleDeleteClick(section.id)} className={cn("p-2 backdrop-blur-md border transition-all duration-300", confirmDelete === section.id ? "bg-destructive border-destructive text-white" : "bg-white/10 border-white/20 text-white hover:bg-destructive hover:border-destructive")}><Trash2 size={14} /></button>
            </div>
          </div>

          <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">"{section.description}"</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary text-primary"><Timer size={14}/></div>
                  <div className="space-y-0.5">
                     <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground block">Event Horizon</span>
                     <span className="text-[10px] font-mono font-bold text-foreground">{new Date(section.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
               </div>

               <button 
                 onClick={() => onToggleActive(section)}
                 className={cn(
                   "flex items-center gap-2 px-4 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all duration-500",
                   section.isActive ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
                 )}
               >
                 <Power size={10} />
                 {section.isActive ? 'Section Live' : 'Go Live'}
               </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
