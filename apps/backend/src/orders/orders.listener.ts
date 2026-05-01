import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderPaidEvent } from '../common/events/domain.events';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersListener {
  private readonly logger = new Logger(OrdersListener.name);

  constructor(private readonly ordersRepository: OrdersRepository) {}

  @OnEvent('order.paid')
  async handleOrderPaidEvent(event: OrderPaidEvent) {
    this.logger.log(`Processing paid order: ${event.orderId}`);

    try {
      const order = await this.ordersRepository.findById(event.orderId);
      if (!order) {
        this.logger.error(`Order ${event.orderId} not found after payment`);
        return;
      }

      await this.ordersRepository.updatePaymentStatus(event.orderId, 'PAID');
      
      // Update Stripe info if needed
      await this.ordersRepository.updateStripeInfo(event.orderId, event.paymentIntentId);

      this.logger.log(`Order ${event.orderId} successfully marked as PAID`);
    } catch (error) {
      this.logger.error(`Failed to process order.paid for ${event.orderId}: ${error.message}`);
    }
  }
}
