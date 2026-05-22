import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalRevenueResult,
      totalOrders,
      totalCustomers,
      pendingOrders,
      lastMonthRevenueResult,
      lastMonthOrders,
      lastMonthCustomers,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'PAID' },
      }),
      this.prisma.order.count({
        where: { paymentStatus: 'PAID' },
      }),
      this.prisma.user.count(),
      this.prisma.order.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          paymentStatus: 'PAID',
          date: { gte: lastMonth, lt: thisMonth },
        },
      }),
      this.prisma.order.count({
        where: {
          paymentStatus: 'PAID',
          date: { gte: lastMonth, lt: thisMonth },
        },
      }),
      this.prisma.user.count({
        where: { joinedAt: { gte: lastMonth, lt: thisMonth } },
      }),
    ]);

    const totalRevenue =
      totalRevenueResult._sum.totalAmount || new Prisma.Decimal(0);
    const lastMonthRevenue =
      lastMonthRevenueResult._sum.totalAmount || new Prisma.Decimal(0);

    const revenueChange =
      Number(lastMonthRevenue) > 0
        ? ((Number(totalRevenue) - Number(lastMonthRevenue)) /
            Number(lastMonthRevenue)) *
          100
        : 0;

    return {
      stats: {
        totalRevenue: Number(totalRevenue),
        totalOrders,
        totalCustomers,
        pendingOrders,
        revenueChange: Math.round(revenueChange * 10) / 10,
        ordersChange:
          lastMonthOrders > 0
            ? Math.round(
                ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 * 10,
              ) / 10
            : 0,
        customersChange:
          lastMonthCustomers > 0
            ? Math.round(
                ((totalCustomers - lastMonthCustomers) / lastMonthCustomers) *
                  100 *
                  10,
              ) / 10
            : 0,
      },
    };
  }

  async getRecentSales(limit = 5) {
    const orders = await this.prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      orderBy: { date: 'desc' },
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    });

    return orders.map((order) => ({
      id: order.id,
      customerName:
        (order as any).firstName && (order as any).lastName
          ? `${(order as any).firstName} ${(order as any).lastName}`
          : order.user?.name || 'Guest',
      email: (order as any).email || order.user?.email || '',
      amount: Number(order.totalAmount),
      currency: order.currency,
      date: order.date.toISOString(),
    }));
  }

  async getChartData(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.groupBy({
      by: ['date'],
      _sum: { totalAmount: true },
      _count: true,
      where: {
        paymentStatus: 'PAID',
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    return orders.map((day) => ({
      date: day.date.toISOString().split('T')[0],
      revenue: Number(day._sum.totalAmount || 0),
      orders: day._count,
    }));
  }

  async getPopularDeliveryCities(limit = 10) {
    const orders = await this.prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: {
        shippingAddress: true,
        totalAmount: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Get a larger sample for better statistics
    });

    // Parse addresses and count by city
    const cityCounts: Record<string, { count: number; revenue: number }> = {};

    orders.forEach((order) => {
      const address = order.shippingAddress;
      const parts = address.split(',').map((s) => s.trim());
      const city = parts[2] || 'Unknown';

      if (!cityCounts[city]) {
        cityCounts[city] = { count: 0, revenue: 0 };
      }

      cityCounts[city].count++;
      cityCounts[city].revenue += Number(order.totalAmount);
    });

    // Sort by count and return top cities
    return Object.entries(cityCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, limit)
      .map(([city, data]) => ({
        city,
        orderCount: data.count,
        revenue: data.revenue,
        averageOrderValue: data.revenue / data.count,
      }));
  }

  async getInventoryTurnover(warehouseId?: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get orders in the specified period
    const orders = await this.prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: startDate },
        ...(warehouseId && { warehouseId }),
      },
      include: {
        items: true,
        warehouse: warehouseId ? undefined : true,
      },
    });

    // Calculate inventory turnover by warehouse
    const warehouseStats: Record<
      string,
      {
        totalOrders: number;
        totalRevenue: number;
        totalItemsSold: number;
        averageOrderValue: number;
      }
    > = {};

    orders.forEach((order) => {
      const warehouseName = warehouseId
        ? 'Selected Warehouse'
        : order.warehouse?.name || 'Unknown';

      if (!warehouseStats[warehouseName]) {
        warehouseStats[warehouseName] = {
          totalOrders: 0,
          totalRevenue: 0,
          totalItemsSold: 0,
          averageOrderValue: 0,
        };
      }

      warehouseStats[warehouseName].totalOrders++;
      warehouseStats[warehouseName].totalRevenue += Number(order.totalAmount);
      warehouseStats[warehouseName].totalItemsSold += order.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
    });

    // Calculate averages
    Object.keys(warehouseStats).forEach((warehouse) => {
      const stats = warehouseStats[warehouse];
      stats.averageOrderValue = stats.totalRevenue / stats.totalOrders;
    });

    return Object.entries(warehouseStats).map(([warehouse, stats]) => ({
      warehouse,
      ...stats,
      turnoverRate: stats.totalItemsSold / days, // Items sold per day
    }));
  }

  async getConversionRate(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // For now, use a simplified approach since we don't have an analytics table
    // In a real implementation, you would track page views separately
    const totalOrders = await this.prisma.order.count({
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'PAID',
      },
    });

    // Estimate visitors based on orders (assuming each order represents at least one visitor)
    // This is a simplified approach for demonstration
    const estimatedVisitors = Math.max(totalOrders * 3, 100); // Assume 3 visitors per order on average
    const conversionRate =
      estimatedVisitors > 0 ? (totalOrders / estimatedVisitors) * 100 : 0;

    return {
      totalVisitors: estimatedVisitors,
      totalOrders,
      conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
    };
  }
}
