import { Module } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LogisticsRepository } from './logistics.repository';
import { LogisticsListener } from './logistics.listener';
import { LogisticsScheduler } from './logistics.scheduler';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LogisticsController],
  providers: [
    LogisticsService,
    LogisticsRepository,
    LogisticsListener,
    LogisticsScheduler,
  ],
  exports: [LogisticsService, LogisticsRepository],
})
export class LogisticsModule {}
