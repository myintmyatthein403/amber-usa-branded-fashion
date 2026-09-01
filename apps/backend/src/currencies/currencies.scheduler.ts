import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExchangeRateRefreshService } from './exchange-rate-refresh.service';

// Previously manual-trigger-only (POST /exchange-rates/refresh) — this adds
// the scheduled side so USD/MMK doesn't silently drift stale between admin
// visits. Respects isManualOverride (see ExchangeRateRefreshService).
@Injectable()
export class CurrenciesScheduler {
  private readonly logger = new Logger(CurrenciesScheduler.name);

  constructor(private exchangeRateRefreshService: ExchangeRateRefreshService) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async refreshRates() {
    try {
      const { rate, source } = await this.exchangeRateRefreshService.refreshUsdMmkFromApi();
      this.logger.log(`USD/MMK rate refreshed: ${rate} (source: ${source})`);
    } catch (err) {
      this.logger.error('Scheduled exchange rate refresh failed', err);
    }
  }
}
