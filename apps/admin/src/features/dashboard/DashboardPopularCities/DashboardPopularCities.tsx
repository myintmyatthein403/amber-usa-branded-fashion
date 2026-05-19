import React from 'react';
import { MapPin } from 'lucide-react';

interface PopularCity {
  city: string;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
}

interface DashboardPopularCitiesProps {
  cities: PopularCity[];
  loading: boolean;
}

export const DashboardPopularCities: React.FC<DashboardPopularCitiesProps> = ({ cities, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-primary" />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Popular Delivery Cities</h3>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : cities.length > 0 ? (
        <div className="space-y-3">
          {cities.map((city, index) => (
            <div key={city.city} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{city.city}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {city.orderCount} orders • {formatCurrency(city.averageOrderValue)} avg
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{formatCurrency(city.revenue)}</p>
                <p className="text-[9px] text-muted-foreground">total revenue</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MapPin size={24} className="mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No delivery data available</p>
        </div>
      )}
    </div>
  );
};