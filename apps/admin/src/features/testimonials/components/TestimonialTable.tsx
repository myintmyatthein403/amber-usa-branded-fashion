import React from 'react';
import { Trash2, Edit2, Star, Check, Power, User, MapPin } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Testimonial } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TestimonialTableProps {
  testimonials: Testimonial[] | null;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: string) => void;
  onToggleActive: (testimonial: Testimonial) => void;
}

export const TestimonialTable: React.FC<TestimonialTableProps> = ({ 
  testimonials, 
  onEdit, 
  onDelete, 
  onToggleActive 
}) => {
  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No voices discovered.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {testimonials.map((testimonial) => (
        <div key={testimonial.id} className={cn(
          "group relative bg-card border transition-all duration-500 overflow-hidden flex flex-col",
          testimonial.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/50"
        )}>
          <div className="p-6 flex-1 space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className={i < testimonial.rating ? "text-primary fill-primary" : "text-muted-foreground/20"} />
                ))}
              </div>
              {testimonial.isActive && (
                <div className="bg-primary/10 text-primary p-1.5 rounded-full">
                  <Check size={12} />
                </div>
              )}
            </div>
            
            <p className="text-sm text-foreground leading-relaxed italic line-clamp-4">
              "{testimonial.text}"
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
               <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <User size={16} />
               </div>
               <div>
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider">{testimonial.author}</div>
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                     {testimonial.role && <span>{testimonial.role}</span>}
                     {testimonial.role && testimonial.location && <span className="opacity-30">|</span>}
                     {testimonial.location && <span className="flex items-center gap-1"><MapPin size={8}/> {testimonial.location}</span>}
                  </div>
               </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
             <button 
               onClick={() => onToggleActive(testimonial)}
               className={cn(
                 "flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors",
                 testimonial.isActive ? "text-primary hover:text-primary/70" : "text-muted-foreground hover:text-foreground"
               )}
             >
                <Power size={12} />
                {testimonial.isActive ? 'Live' : 'Draft'}
             </button>
             <div className="flex items-center gap-1">
                <button onClick={() => onEdit(testimonial)} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => onDelete(testimonial.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};
