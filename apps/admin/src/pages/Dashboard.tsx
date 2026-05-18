import React from 'react';
import { useDashboard } from '../features/dashboard/useDashboard';
import { DashboardStats } from '../features/dashboard/DashboardStats';
import { DashboardOverview } from '../features/dashboard/DashboardOverview';
import { DashboardRecentSales } from '../features/dashboard/DashboardRecentSales';

export const Dashboard: React.FC = () => {
  const { stats, recentSales, pendingOrdersCount, chartData } = useDashboard();

  return (
    <>
      <DashboardStats stats={stats} pendingOrdersCount={pendingOrdersCount} />

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <DashboardOverview chartData={chartData} />
        <DashboardRecentSales recentSales={recentSales} />
      </div>
    </>
  );
};