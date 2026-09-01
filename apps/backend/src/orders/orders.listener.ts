import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  OrderPaidEvent,
  OrderPaymentFailedEvent,
  OrderStatusChangedEvent,
  OrderRefundedEvent,
} from '../common/events/domain.events';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersListener {
  private readonly logger = new Logger(OrdersListener.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

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

      // Update order status to PROCESSING (per checkout flow plan)
      const oldStatus = order.status;
      await this.ordersRepository.updateStatus(event.orderId, 'PROCESSING');

      // Emit status changed event for email notifications
      this.eventEmitter.emit(
        'order.status_changed',
        new OrderStatusChangedEvent(event.orderId, oldStatus, 'PROCESSING'),
      );

      // Update Stripe info if needed
      await this.ordersRepository.updateStripeInfo(
        event.orderId,
        event.paymentIntentId,
      );

      this.logger.log(
        `Order ${event.orderId} successfully marked as PAID and status set to PROCESSING`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process order.paid for ${event.orderId}: ${error.message}`,
      );
      // Rethrow so StripeService's `await emitAsync(...)` rejects and the
      // failure reaches the webhook controller unwrapped — NestJS returns a
      // 5xx and Stripe retries the delivery, instead of us swallowing the
      // error behind an already-sent 200 with only a log line as evidence.
      throw error;
    }
  }

  @OnEvent('order.payment_failed')
  async handleOrderPaymentFailedEvent(event: OrderPaymentFailedEvent) {
    this.logger.warn(
      `Processing failed payment for order: ${event.orderId}. Error: ${event.error || 'Unknown'}`,
    );

    try {
      await this.ordersService.updatePaymentStatus(event.orderId, 'FAILED');
      this.logger.log(
        `Order ${event.orderId} marked as FAILED and inventory restocked.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process order.payment_failed for ${event.orderId}: ${error.message}`,
      );
      // See handleOrderPaidEvent's comment — rethrow so the webhook path
      // surfaces the failure instead of silently swallowing it.
      throw error;
    }
  }

  @OnEvent('order.refunded')
  async handleOrderRefundedEvent(event: OrderRefundedEvent) {
    if (!event.isFullRefund) {
      this.logger.log(
        `Partial refund for order ${event.orderId} — leaving stock/status untouched.`,
      );
      return;
    }

    try {
      await this.ordersService.markRefunded(event.orderId);
      this.logger.log(
        `Order ${event.orderId} marked REFUNDED and inventory restocked (full refund).`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process order.refunded for ${event.orderId}: ${error.message}`,
      );
    }
  }
}
