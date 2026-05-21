import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { ExchangeRateRefreshService } from './exchange-rate-refresh.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('currencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CurrenciesController {
  constructor(private currenciesService: CurrenciesService) {}

  @Get()
  async findAll() {
    return this.currenciesService.findAllCurrencies();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.currenciesService.findCurrencyById(id);
  }

  @Post()
  @Roles('SUPERADMIN', 'ADMIN')
  async create(@Body() data: {
    code: string;
    name: string;
    symbol: string;
    isBase?: boolean;
    isActive?: boolean;
    decimalPlaces?: number;
    position?: string;
  }) {
    return this.currenciesService.createCurrency(data);
  }

  @Patch(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  async update(@Param('id') id: string, @Body() data: Partial<{
    code: string;
    name: string;
    symbol: string;
    isBase: boolean;
    isActive: boolean;
    decimalPlaces: number;
    position: string;
  }>) {
    return this.currenciesService.updateCurrency(id, data);
  }

  @Delete(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  async delete(@Param('id') id: string) {
    return this.currenciesService.deleteCurrency(id);
  }

  @Post('set-base')
  @Roles('SUPERADMIN', 'ADMIN')
  async setBase(@Body() data: { currencyId: string }) {
    return this.currenciesService.setBaseCurrency(data.currencyId);
  }
}

@Controller('exchange-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExchangeRatesController {
  constructor(
    private currenciesService: CurrenciesService,
    private refreshService: ExchangeRateRefreshService,
  ) {}

  @Post('refresh')
  @Roles('SUPERADMIN', 'ADMIN')
  async refreshRates() {
    return this.refreshService.refreshUsdMmkFromApi();
  }

  @Get()
  async findAll() {
    return this.currenciesService.findAllExchangeRates();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.currenciesService.findExchangeRateById(id);
  }

  @Post()
  @Roles('SUPERADMIN', 'ADMIN')
  async create(@Body() data: {
    fromCurrencyId: string;
    toCurrencyId: string;
    rate: number;
    effectiveDate?: string;
  }) {
    return this.currenciesService.createExchangeRate(data);
  }

  @Patch(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  async update(@Param('id') id: string, @Body() data: { rate: number }) {
    return this.currenciesService.updateExchangeRate(id, data.rate);
  }

  @Delete(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  async delete(@Param('id') id: string) {
    return this.currenciesService.deleteExchangeRate(id);
  }
}