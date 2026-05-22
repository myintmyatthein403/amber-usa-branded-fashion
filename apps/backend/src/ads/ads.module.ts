import { Module } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdsRepository } from './ads.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AdsController],
  providers: [AdsService, AdsRepository],
  exports: [AdsService, AdsRepository],
})
export class AdsModule {}
