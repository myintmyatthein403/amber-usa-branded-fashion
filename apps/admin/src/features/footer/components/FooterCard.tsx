import React from 'react';
import { Trash2, Edit2, Power, Mail, Phone } from 'lucide-react';
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
  return (
    <div className={cn(
      "group relative bg-card border transition-all duration-500 overflow-hidden",
      section.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/50"
    )}>
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
              <button onClick={() => onDelete(section.id)} className="p-2 bg-muted text-destructive hover:bg-destructive hover:text-white transition-colors"><Trash2 size={14}/></button>
           </div>
        </div>
      </div>
    </div>
  );
};
