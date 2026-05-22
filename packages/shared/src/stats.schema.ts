import { z } from 'zod';

export const DashboardStatsSchema = z.object({
  totalRevenue: z.number(),
  totalOrders: z.number(),
  totalCustomers: z.number(),
  pendingOrders: z.number(),
  revenueChange: z.number(),
  ordersChange: z.number(),
  customersChange: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const RecentSaleSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  email: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
});

export type RecentSale = z.infer<typeof RecentSaleSchema>;

export const RevenueChartDataSchema = z.object({
  date: z.string(),
  revenue: z.number(),
  orders: z.number(),
});

export type RevenueChartData = z.infer<typeof RevenueChartDataSchema>;

export const DashboardStatsResponseSchema = z.object({
  stats: DashboardStatsSchema,
  recentSales: z.array(RecentSaleSchema),
  chartData: z.array(RevenueChartDataSchema),
});

export type DashboardStatsResponse = z.infer<typeof DashboardStatsResponseSchema>;