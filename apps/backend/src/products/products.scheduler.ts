import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductsService } from './products.service';

@Injectable()
export class ProductsScheduler {
  private readonly logger = new Logger(ProductsScheduler.name);

  constructor(private productsService: ProductsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduled() {
    try {
      const count = await this.productsService.publishScheduled();
      if (count > 0) {
        this.logger.log(`Published ${count} scheduled product(s)`);
      }
    } catch (err) {
      this.logger.error('Scheduled publish failed', err);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async autoArchiveExpired() {
    try {
      const count = await this.productsService.autoArchiveExpired();
      if (count > 0) {
        this.logger.log(`Auto-archived ${count} expired product(s)`);
      }
    } catch (err) {
      this.logger.error('Scheduled auto-archive failed', err);
    }
  }
}
