import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  badge?: string;
  description?: string;
  icon?: LucideIcon;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    dataTour?: string;
  };
  secondaryAction?: {
    icon: LucideIcon;
    onClick: () => void;
    title?: string;
  };
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  badge,
  description,
  icon: Icon,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-2">
        {(badge || Icon) && (
          <div className="flex items-center gap-3 text-primary">
            {Icon && <Icon size={20} />}
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                {badge}
              </span>
            )}
          </div>
        )}
        <h1 className="text-4xl font-serif text-foreground tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground italic max-w-lg">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
            data-tour={primaryAction.dataTour}
          >
            {primaryAction.icon ? <primaryAction.icon size={16} /> : <Plus size={16} />}
            {primaryAction.label}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="p-4 border border-border hover:border-primary text-muted-foreground hover:text-primary transition-all duration-300 bg-background shadow-sm"
            title={secondaryAction.title}
          >
            <secondaryAction.icon size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
