import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SalesRepository } from './sales.repository';
import { SalesScheduler } from './sales.scheduler';

@Module({
  imports: [PrismaModule],
  controllers: [SalesController],
  providers: [SalesService, SalesRepository, SalesScheduler],
  exports: [SalesService, SalesRepository],
})
export class SalesModule {}
