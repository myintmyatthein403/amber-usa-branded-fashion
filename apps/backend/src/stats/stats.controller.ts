import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getDashboardStats() {
    const [stats, chartData] = await Promise.all([
      this.statsService.getDashboardStats(),
      this.statsService.getChartData(30),
    ]);

    return {
      ...stats,
      recentSales: await this.statsService.getRecentSales(5),
      chartData,
    };
  }
}