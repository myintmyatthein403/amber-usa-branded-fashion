import { Module } from '@nestjs/common';
import { CurrenciesController, ExchangeRatesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';
import { CurrenciesRepository } from './currencies.repository';
import { ExchangeRatesRepository } from './exchange-rates.repository';
import { ExchangeRateHelper } from './exchange-rate.helper';
import { ExchangeRateRefreshService } from './exchange-rate-refresh.service';
@Module({
  controllers: [CurrenciesController, ExchangeRatesController],
  providers: [
    CurrenciesService,
    CurrenciesRepository,
    ExchangeRatesRepository,
    ExchangeRateHelper,
    ExchangeRateRefreshService,
  ],
  exports: [CurrenciesService, ExchangeRateHelper, ExchangeRateRefreshService],
})
export class CurrenciesModule {}