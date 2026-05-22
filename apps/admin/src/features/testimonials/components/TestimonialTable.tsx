import React from 'react';
import { Edit2, Trash2, Star, Power } from 'lucide-react';
import { Testimonial } from '../schema';

interface TestimonialTableProps {
  testimonials: Testimonial[];
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
      <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic border border-border bg-background">
        No voices discovered.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border border-border bg-background">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Author</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Testimonial</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Rating</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Status</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {testimonials.map((testimonial) => (
            <tr key={testimonial.id} className="group hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest">{testimonial.author}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {[testimonial.role, testimonial.location].filter(Boolean).join(' • ') || 'Customer'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-xs text-muted-foreground line-clamp-1 italic max-w-md">"{testimonial.text}"</p>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className={i < testimonial.rating ? "fill-primary text-primary" : "text-muted"} />
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${testimonial.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                  {testimonial.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onToggleActive(testimonial)}
                    className={`p-2 transition-colors ${testimonial.isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    title={testimonial.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Power size={14} />
                  </button>
                  <button
                    onClick={() => onEdit(testimonial)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(testimonial.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
