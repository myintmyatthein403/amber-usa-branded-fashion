import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LucideIcon } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  action?: () => void;
}

interface DashboardStatsProps {
  stats: Stat[];
  pendingOrdersCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, pendingOrdersCount }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-700">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          onClick={stat.action}
          className={cn(
            "rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300",
            stat.action ? "cursor-pointer hover:border-primary/50 hover:shadow-md" : ""
          )}
        >
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">{stat.label}</p>
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </div>
          <div className="pt-1">
            <h2 className="text-2xl font-bold tracking-tighter text-foreground">{stat.value}</h2>
            <p className="text-xs text-muted-foreground">
              {stat.label === 'New Orders' ? (
                 <span className={cn("font-medium", pendingOrdersCount > 0 ? "text-amber-500" : "text-muted-foreground")}>{stat.change}</span>
              ) : (
                 <span className="text-emerald-500 font-medium">{stat.change}</span>
              )} {stat.label !== 'New Orders' && 'from last month'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
