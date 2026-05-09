import { Module } from '@nestjs/common';
import { DeliveryMethodsService } from './delivery-methods.service';
import { DeliveryMethodsRepository } from './delivery-methods.repository';
import { DeliveryMethodsController } from './delivery-methods.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryMethodsController],
  providers: [DeliveryMethodsService, DeliveryMethodsRepository],
  exports: [DeliveryMethodsService],
})
export class DeliveryMethodsModule {}