import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LogisticsService } from './logistics.service';

@Injectable()
export class LogisticsScheduler {
  private readonly logger = new Logger(LogisticsScheduler.name);

  constructor(private logisticsService: LogisticsService) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async reconcileStock() {
    try {
      const { variantDriftCount, productDriftCount } =
        await this.logisticsService.reconcileStock();
      if (variantDriftCount === 0 && productDriftCount === 0) {
        this.logger.log('Stock reconciliation: no drift found');
      }
    } catch (err) {
      this.logger.error('Scheduled stock reconciliation failed', err);
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async checkReorderAlerts() {
    try {
      const { count } = await this.logisticsService.checkReorderAlerts();
      if (count === 0) {
        this.logger.log('Reorder sweep: nothing at or below threshold');
      }
    } catch (err) {
      this.logger.error('Scheduled reorder alert sweep failed', err);
    }
  }
}
