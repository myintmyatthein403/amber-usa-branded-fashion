import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CouponsRepository } from './coupons.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CouponsController],
  providers: [CouponsService, CouponsRepository],
  exports: [CouponsService, CouponsRepository],
})
export class CouponsModule {}
