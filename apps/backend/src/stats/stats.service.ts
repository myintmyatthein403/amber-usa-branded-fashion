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

    const totalRevenue = totalRevenueResult._sum.totalAmount || new Prisma.Decimal(0);
    const lastMonthRevenue = lastMonthRevenueResult._sum.totalAmount || new Prisma.Decimal(0);

    const revenueChange = Number(lastMonthRevenue) > 0
      ? ((Number(totalRevenue) - Number(lastMonthRevenue)) / Number(lastMonthRevenue)) * 100
      : 0;

    return {
      stats: {
        totalRevenue: Number(totalRevenue),
        totalOrders,
        totalCustomers,
        pendingOrders,
        revenueChange: Math.round(revenueChange * 10) / 10,
        ordersChange: lastMonthOrders > 0
          ? Math.round(((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 * 10) / 10
          : 0,
        customersChange: lastMonthCustomers > 0
          ? Math.round(((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 * 10) / 10
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
      customerName: (order as any).firstName && (order as any).lastName
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
}