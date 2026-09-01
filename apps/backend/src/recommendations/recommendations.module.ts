import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { ProductPricesController } from './product-prices.controller';
import { SerialNumbersController } from './serial-numbers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecommendationsController, ProductPricesController, SerialNumbersController],
})
export class RecommendationsModule {}
