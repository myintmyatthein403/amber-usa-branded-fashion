import React, { useState } from 'react';
import { Trash2, Edit2, Power, Mail, Phone, AlertTriangle } from 'lucide-react';
import { FooterSection } from '../schema';
import { cn } from '../../../lib/utils';

interface FooterCardProps {
  section: FooterSection;
  onEdit: (section: FooterSection) => void;
  onDelete: (id: string) => void;
  onToggleActive: (section: FooterSection) => void;
}

export const FooterCard: React.FC<FooterCardProps> = ({ 
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
      
      {/* Confirmation Overlay */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-20">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <p className="text-white text-xs font-bold text-center px-4">Delete this footer section?</p>
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

      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{section.companySubtitle}</div>
          <h3 className="text-xl font-serif text-foreground truncate">{section.companyName}</h3>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2 italic">
          "{section.companyDescription}"
        </p>

        <div className="space-y-2 pt-4 border-t border-border">
           <div className="flex items-center gap-3 text-muted-foreground">
              <Mail size={12} />
              <span className="text-[10px]">{section.contactEmail}</span>
           </div>
           <div className="flex items-center gap-3 text-muted-foreground">
              <Phone size={12} />
              <span className="text-[10px]">{section.contactPhone}</span>
           </div>
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
           <div className="flex gap-2">
              <button onClick={() => onEdit(section)} className="p-2 bg-muted text-foreground hover:bg-primary hover:text-white transition-colors"><Edit2 size={14}/></button>
              <button onClick={handleDelete} className={cn("p-2 transition-colors", showConfirm ? "bg-destructive text-white" : "bg-muted text-destructive hover:bg-destructive hover:text-white")}><Trash2 size={14}/></button>
           </div>
        </div>
      </div>
    </div>
  );
};