import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ConversionRate {
  totalVisitors: number;
  totalOrders: number;
  conversionRate: number;
}

interface DashboardConversionRateProps {
  conversionRate: ConversionRate | null;
  loading: boolean;
}

export const DashboardConversionRate: React.FC<DashboardConversionRateProps> = ({ conversionRate, loading }) => {
  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-primary" />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Conversion Rate</h3>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      ) : conversionRate ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {formatPercentage(conversionRate.conversionRate)}
            </div>
            <p className="text-[9px] text-muted-foreground">Overall conversion rate</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-3 rounded text-center">
              <p className="text-lg font-bold">{formatNumber(conversionRate.totalVisitors)}</p>
              <p className="text-[8px] text-muted-foreground">Total Visitors</p>
            </div>
            <div className="bg-muted/50 p-3 rounded text-center">
              <p className="text-lg font-bold">{formatNumber(conversionRate.totalOrders)}</p>
              <p className="text-[8px] text-muted-foreground">Total Orders</p>
            </div>
          </div>
          
          <div className="pt-3 border-t border-border">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Performance:</span>
              <span className={`font-bold ${
                conversionRate.conversionRate > 2 ? 'text-green-600' : 
                conversionRate.conversionRate > 1 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {conversionRate.conversionRate > 2 ? 'Excellent' : 
                 conversionRate.conversionRate > 1 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <TrendingUp size={24} className="mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No conversion data available</p>
        </div>
      )}
    </div>
  );
};