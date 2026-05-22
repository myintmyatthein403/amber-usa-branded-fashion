import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ProductsService } from './products.service';

@Injectable()
export class ProductsScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProductsScheduler.name);
  private interval: ReturnType<typeof setInterval> | null = null;

  constructor(private productsService: ProductsService) {}

  onModuleInit() {
    this.interval = setInterval(async () => {
      try {
        const count = await this.productsService.publishScheduled();
        if (count > 0) {
          this.logger.log(`Published ${count} scheduled product(s)`);
        }
      } catch (err) {
        this.logger.error('Scheduled publish failed', err);
      }
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.interval) clearInterval(this.interval);
  }
}
