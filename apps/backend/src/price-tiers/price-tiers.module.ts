import { Module } from '@nestjs/common';
import { PriceTiersService } from './price-tiers.service';
import { PriceTiersController } from './price-tiers.controller';
import { PriceTiersRepository } from './price-tiers.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PriceTiersController],
  providers: [PriceTiersService, PriceTiersRepository],
  exports: [PriceTiersService],
})
export class PriceTiersModule {}
