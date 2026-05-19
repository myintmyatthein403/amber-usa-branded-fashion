import React from 'react';
import { useDashboard } from '../features/dashboard/useDashboard';
import { DashboardStats } from '../features/dashboard/DashboardStats';
import { DashboardOverview } from '../features/dashboard/DashboardOverview';
import { DashboardRecentSales } from '../features/dashboard/DashboardRecentSales';
import { DashboardPopularCities } from '../features/dashboard/DashboardPopularCities';
import { DashboardInventoryTurnover } from '../features/dashboard/DashboardInventoryTurnover';
import { DashboardConversionRate } from '../features/dashboard/DashboardConversionRate';

export const Dashboard: React.FC = () => {
  const { 
    stats, 
    recentSales, 
    pendingOrdersCount, 
    chartData, 
    popularCities, 
    inventoryTurnover, 
    conversionRate, 
    loading 
  } = useDashboard();

  return (
    <>
      <DashboardStats stats={stats} pendingOrdersCount={pendingOrdersCount} />

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <DashboardOverview chartData={chartData} />
        <DashboardRecentSales recentSales={recentSales} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <DashboardPopularCities cities={popularCities} loading={loading} />
        <DashboardInventoryTurnover inventory={inventoryTurnover} loading={loading} />
        <DashboardConversionRate conversionRate={conversionRate} loading={loading} />
      </div>
    </>
  );
};