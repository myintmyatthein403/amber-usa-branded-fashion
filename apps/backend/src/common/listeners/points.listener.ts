import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderPaidEvent } from '../events/domain.events';
import { UsersRepository } from '../../users/users.repository';
import { OrdersRepository } from '../../orders/orders.repository';

@Injectable()
export class PointsListener {
  private readonly logger = new Logger(PointsListener.name);

  constructor(
    private usersRepository: UsersRepository,
    private ordersRepository: OrdersRepository,
  ) {}

  @OnEvent('order.paid')
  async handleOrderPaid(event: OrderPaidEvent) {
    this.logger.log(`Processing points for order ${event.orderId}`);

    try {
      const order = await this.ordersRepository.findById(event.orderId);
      if (!order || !order.userId) {
        this.logger.warn(
          `Order ${event.orderId} not found or has no userId, skipping points award.`,
        );
        return;
      }

      // 1 point for every 10 USD (adjust as needed)
      const pointsToAward = Math.floor(event.amount / 10);

      if (pointsToAward > 0) {
        await this.usersRepository.update(order.userId, {
          points: { increment: pointsToAward },
        });
        this.logger.log(
          `Awarded ${pointsToAward} points to user ${order.userId} for order ${event.orderId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to update points for order ${event.orderId}: ${error.message}`,
      );
    }
  }
}
