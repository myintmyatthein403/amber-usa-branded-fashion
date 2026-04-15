import React from 'react';

interface RecentSale {
  id: number;
  customerName: string;
  email: string;
  amount: string;
  initials: string;
}

interface DashboardRecentSalesProps {
  recentSales: RecentSale[];
}

export const DashboardRecentSales: React.FC<DashboardRecentSalesProps> = ({ recentSales }) => {
  return (
    <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors duration-300">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Sales</h3>
      <div className="space-y-6">
        {recentSales.map((sale) => (
          <div key={sale.id} className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-semibold text-xs text-secondary-foreground">
              {sale.initials}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none text-foreground">{sale.customerName}</p>
              <p className="text-xs text-muted-foreground">{sale.email}</p>
            </div>
            <div className="font-medium text-sm text-foreground">{sale.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
