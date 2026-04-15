import React from 'react';

export const DashboardOverview: React.FC = () => {
  return (
    <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors duration-300">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Overview</h3>
      <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/20">
         [ Chart Placeholder ]
      </div>
    </div>
  );
};
