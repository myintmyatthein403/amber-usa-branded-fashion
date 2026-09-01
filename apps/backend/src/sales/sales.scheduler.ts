import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SalesService } from './sales.service';
import { SalesRepository } from './sales.repository';

// Sweeps time-boxed sales (has a startDate or endDate) and applies/reverts
// product pricing as each sale's window opens or closes — this is what
// turns Sale.startDate/endDate from a read-only "active sales" filter into
// an actual flash-sale engine. Open-ended sales (no dates) don't need
// sweeping since their pricing is applied immediately on product
// association and never expires on its own.
@Injectable()
export class SalesScheduler {
  private readonly logger = new Logger(SalesScheduler.name);

  constructor(
    private salesService: SalesService,
    private salesRepository: SalesRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sweepSaleWindows() {
    try {
      const sales = await this.salesRepository.findTimeBoxed();
      for (const sale of sales) {
        await this.salesService.reconcileSaleProductPricing(sale);
      }
    } catch (err) {
      this.logger.error('Scheduled sale-window sweep failed', err);
    }
  }
}
