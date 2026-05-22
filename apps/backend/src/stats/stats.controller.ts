import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Stats')
@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard statistics' })
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

  @Get('popular-cities')
  @ApiOperation({ summary: 'Get popular delivery cities' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPopularDeliveryCities(@Query('limit') limit = 10) {
    return this.statsService.getPopularDeliveryCities(Number(limit));
  }

  @Get('inventory-turnover')
  @ApiOperation({ summary: 'Get inventory turnover analytics' })
  @ApiQuery({ name: 'warehouseId', required: false, type: String })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getInventoryTurnover(
    @Query('warehouseId') warehouseId?: string,
    @Query('days') days = 30,
  ) {
    return this.statsService.getInventoryTurnover(warehouseId, Number(days));
  }

  @Get('conversion-rate')
  @ApiOperation({ summary: 'Get conversion rate analytics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getConversionRate(@Query('days') days = 30) {
    return this.statsService.getConversionRate(Number(days));
  }
}
