import React from 'react';
import { Package } from 'lucide-react';

interface InventoryTurnover {
  warehouse: string;
  totalOrders: number;
  totalRevenue: number;
  totalItemsSold: number;
  averageOrderValue: number;
  turnoverRate: number;
}

interface DashboardInventoryTurnoverProps {
  inventory: InventoryTurnover[];
  loading: boolean;
}

export const DashboardInventoryTurnover: React.FC<DashboardInventoryTurnoverProps> = ({ inventory, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Package size={16} className="text-primary" />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Inventory Turnover</h3>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : inventory.length > 0 ? (
        <div className="space-y-4">
          {inventory.map((item, index) => (
            <div key={item.warehouse} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{item.warehouse}</h4>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary">
                    {item.turnoverRate.toFixed(1)} items/day
                  </p>
                  <p className="text-[9px] text-muted-foreground">turnover rate</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-muted/50 p-2 rounded text-center">
                  <p className="font-bold">{item.totalOrders}</p>
                  <p className="text-[8px] text-muted-foreground">orders</p>
                </div>
                <div className="bg-muted/50 p-2 rounded text-center">
                  <p className="font-bold">{formatCurrency(item.averageOrderValue)}</p>
                  <p className="text-[8px] text-muted-foreground">avg order</p>
                </div>
                <div className="bg-muted/50 p-2 rounded text-center">
                  <p className="font-bold">{item.totalItemsSold}</p>
                  <p className="text-[8px] text-muted-foreground">items sold</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-muted-foreground">Total Revenue:</span>
                  <span className="text-sm font-bold text-primary">{formatCurrency(item.totalRevenue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Package size={24} className="mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No inventory data available</p>
        </div>
      )}
    </div>
  );
};