import React from 'react';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useAdminUIStore } from '../store/useAdminUIStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Dashboard: React.FC = () => {
  const { pendingOrdersCount, setActiveTab } = useAdminUIStore();

  const stats = [
    { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: DollarSign, color: 'text-primary' },
    { label: 'New Orders', value: pendingOrdersCount.toString(), change: 'Awaiting Fulfillment', icon: AlertCircle, color: pendingOrdersCount > 0 ? 'text-amber-500' : 'text-muted-foreground', action: () => setActiveTab('orders') },
    { label: 'Total Sales', value: '+2350', change: '+180.1%', icon: ShoppingBag, color: 'text-primary' },
    { label: 'Active Users', value: '+12,234', change: '+19%', icon: Users, color: 'text-primary' },
  ];

  return (
    <>
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

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Overview</h3>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/20">
             [ Chart Placeholder ]
          </div>
        </div>
        <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Sales</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-semibold text-xs text-secondary-foreground">
                  JD
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">Customer {i}</p>
                  <p className="text-xs text-muted-foreground">customer{i}@example.com</p>
                </div>
                <div className="font-medium text-sm text-foreground">+$1,999.00</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
