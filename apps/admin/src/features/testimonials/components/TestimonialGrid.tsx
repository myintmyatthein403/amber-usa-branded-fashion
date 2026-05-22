import React from 'react';
import { Star, Edit2, Trash2, Power } from 'lucide-react';
import { Testimonial } from '../schema';
import { motion } from 'framer-motion';

interface TestimonialGridProps {
  testimonials: Testimonial[];
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: string) => void;
  onToggleActive: (testimonial: Testimonial) => void;
}

export const TestimonialGrid: React.FC<TestimonialGridProps> = ({
  testimonials,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-background border border-border p-6 flex flex-col group relative"
        >
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < testimonial.rating ? "fill-primary text-primary" : "text-muted"}
              />
            ))}
          </div>

          <p className="text-sm italic leading-relaxed text-foreground mb-6 flex-1">
            "{testimonial.text}"
          </p>

          <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                {testimonial.author}
              </h4>
              <p className="text-[9px] text-muted-foreground uppercase mt-0.5">
                {[testimonial.role, testimonial.location].filter(Boolean).join(' • ')}
              </p>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
          </div>

          {!testimonial.isActive && (
            <div className="absolute top-4 right-4 bg-muted px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border border-border">
              Inactive
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};
