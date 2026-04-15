import React from 'react';
import { Trash2, Edit2, Check, Power } from 'lucide-react';
import { MissionSection } from '../schema';
import { cn } from '../../../lib/utils';

interface MissionCardProps {
  mission: MissionSection;
  onEdit: (mission: MissionSection) => void;
  onDelete: (id: string) => void;
  onToggleActive: (mission: MissionSection) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({ 
  mission, 
  onEdit, 
  onDelete, 
  onToggleActive 
}) => {
  return (
    <div className={cn(
      "group relative bg-card border transition-all duration-500 overflow-hidden",
      mission.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/50"
    )}>
      <div className="aspect-[16/9] bg-muted relative overflow-hidden">
        <img src={mission.imageMain} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
        {mission.isActive && (
          <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg">
            <Check size={16} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
           <button onClick={() => onEdit(mission)} className="p-3 bg-white text-black hover:bg-primary hover:text-white transition-colors"><Edit2 size={18}/></button>
           <button onClick={() => onDelete(mission.id)} className="p-3 bg-white text-destructive hover:bg-destructive hover:text-white transition-colors"><Trash2 size={18}/></button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{mission.badge}</div>
          <h3 className="text-xl font-serif text-foreground truncate">{mission.title} {mission.titleItalic}</h3>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
           <button 
            onClick={() => onToggleActive(mission)}
            className={cn(
              "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
              mission.isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
           >
             <Power size={14} />
             {mission.isActive ? 'Active' : 'Set Active'}
           </button>
           <span className="text-[9px] font-mono text-muted-foreground/40">{mission.id.split('-')[0]}</span>
        </div>
      </div>
    </div>
  );
};
