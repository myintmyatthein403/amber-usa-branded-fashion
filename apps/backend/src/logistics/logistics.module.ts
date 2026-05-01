import { Module } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LogisticsRepository } from './logistics.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LogisticsController],
  providers: [LogisticsService, LogisticsRepository],
  exports: [LogisticsService, LogisticsRepository],
})
export class LogisticsModule {}

