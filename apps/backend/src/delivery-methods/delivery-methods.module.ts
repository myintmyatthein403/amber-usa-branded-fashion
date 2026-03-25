import { Module } from '@nestjs/common';
import { DeliveryMethodsService } from './delivery-methods.service';
import { DeliveryMethodsController } from './delivery-methods.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryMethodsController],
  providers: [DeliveryMethodsService],
  exports: [DeliveryMethodsService],
})
export class DeliveryMethodsModule {}
