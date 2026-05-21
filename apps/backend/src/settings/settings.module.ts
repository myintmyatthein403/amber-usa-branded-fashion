import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsRepository } from './settings.repository';
import { CurrenciesModule } from '../currencies/currencies.module';

@Module({
  imports: [PrismaModule, CurrenciesModule],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsRepository],
  exports: [SettingsService, SettingsRepository],
})
export class SettingsModule {}
