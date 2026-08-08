import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { LogisticsService } from './logistics.service';

const RECONCILE_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

@Injectable()
export class LogisticsScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LogisticsScheduler.name);
  private interval: ReturnType<typeof setInterval> | null = null;

  constructor(private logisticsService: LogisticsService) {}

  onModuleInit() {
    this.interval = setInterval(async () => {
      try {
        const { variantDriftCount, productDriftCount } =
          await this.logisticsService.reconcileStock();
        if (variantDriftCount === 0 && productDriftCount === 0) {
          this.logger.log('Stock reconciliation: no drift found');
        }
      } catch (err) {
        this.logger.error('Scheduled stock reconciliation failed', err);
      }
    }, RECONCILE_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.interval) clearInterval(this.interval);
  }
}
