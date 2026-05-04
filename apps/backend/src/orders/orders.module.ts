import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { OrdersListener } from './orders.listener';
import { StripeModule } from '../stripe/stripe.module';
import { UsersModule } from '../users/users.module';
import { PointsListener } from '../common/listeners/points.listener';

@Module({
  imports: [StripeModule, UsersModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, OrdersListener, PointsListener],
  exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
