import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import {
  OrderPaidEvent,
  OrderPaymentFailedEvent,
  OrderRefundedEvent,
} from '../common/events/domain.events';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  private async getStripeInstance(): Promise<Stripe> {
    if (this.stripe) return this.stripe;

    // Try to get secret key from DB (Finding 3)
    const settings = await this.prisma.settings.findUnique({
      where: { id: 'global' },
      select: { stripeSecretKey: true },
    });

    const secretKey =
      settings?.stripeSecretKey ||
      this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      throw new BadRequestException('Stripe secret key is not configured');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia' as any, // Use a standard stable version
    });
    return this.stripe;
  }

  // orderId is mandatory: the amount and currency are always re-derived from
  // the DB order here, never trusted from the caller — a raw amount/currency
  // fallback previously let an unauthenticated caller mint a PaymentIntent
  // for an arbitrary amount against the store's live Stripe account.
  async createPaymentIntent(orderId: string) {
    const stripe = await this.getStripeInstance();

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const verifiedAmount = Number(order.totalAmount);

    this.logger.log(
      `Creating payment intent for order ${orderId}. Verified amount: ${verifiedAmount}`,
    );

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(verifiedAmount * 100), // convert to cents
      currency: order.currency.toLowerCase(),
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { stripePaymentIntentId: intent.id },
    });

    return {
      clientSecret: intent.client_secret,
    };
  }

  async verifyPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        paymentStatus: true,
        stripePaymentIntentId: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // If already marked as PAID in our DB (via webhook), return success
    if (order.paymentStatus === 'PAID') {
      return { success: true, status: 'PAID' };
    }

    // If we have an intent ID, check directly with Stripe as a fallback
    if (order.stripePaymentIntentId) {
      const stripe = await this.getStripeInstance();
      const intent = await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId,
      );

      if (intent.status === 'succeeded') {
        // Manually update if webhook was missed/delayed
        await this.prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'PAID' },
        });
        return { success: true, status: 'PAID' };
      }
    }

    return { success: false, status: order.paymentStatus };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const stripe = await this.getStripeInstance();

    // Try to get webhook secret from DB (Finding 3)
    const settings = await this.prisma.settings.findUnique({
      where: { id: 'global' },
      select: { stripeWebhookSecret: true },
    });

    const webhookSecret =
      settings?.stripeWebhookSecret ||
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Idempotency: Stripe redelivers webhooks (its own retries, or the same
    // event replayed after a timeout on our end), and this had no dedup
    // beyond a few handlers' own incidental guards. Skip an event that
    // already completed successfully — the record is only written *after*
    // processing succeeds (below), so a delivery that fails partway through
    // is deliberately left unrecorded and will be reprocessed on retry
    // rather than silently skipped as "already handled".
    const existing = await this.prisma.webhookEvent.findUnique({
      where: { eventId: event.id },
    });
    if (existing) {
      this.logger.log(`Webhook event ${event.id} already processed — skipping`);
      return { received: true };
    }

    // Handle the event. handlePaymentSucceeded/handlePaymentFailed await
    // emitAsync and let listener failures propagate, instead of the emitter
    // firing-and-forgetting into a try/catch that swallows the error behind
    // an already-sent 200 — a thrown error here reaches the controller
    // unwrapped, so NestJS returns a 5xx and Stripe's own retry kicks in.
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await this.handlePaymentSucceeded(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        this.logger.warn(`Payment failed for intent ${failedIntent.id}`);
        await this.handlePaymentFailed(failedIntent);
        break;
      // Add more event types as needed
    }

    try {
      await this.prisma.webhookEvent.create({
        data: { provider: 'stripe', eventId: event.id, eventType: event.type },
      });
    } catch (err) {
      // A concurrent duplicate delivery raced us and recorded it first —
      // both did the same successful work, so this is harmless.
      if (err.code !== 'P2002') throw err;
    }

    return { received: true };
  }

  async createRefund(
    orderId: string,
    amount?: number,
    reason?:
      | 'requested_by_customer'
      | 'fraudulent'
      | 'duplicate'
      | 'expired_uncaptured_charge',
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        stripePaymentIntentId: true,
        totalAmount: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.paymentStatus !== 'PAID') {
      throw new BadRequestException(
        'Can only refund orders with PAID payment status',
      );
    }

    if (!order.stripePaymentIntentId) {
      throw new BadRequestException(
        'No Stripe payment intent found for this order',
      );
    }

    const stripe = await this.getStripeInstance();

    // Calculate refund amount
    const refundAmount = amount
      ? Math.round(amount * 100)
      : Math.round(Number(order.totalAmount) * 100);

    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      amount: refundAmount,
      // Note: Stripe's reason type is more restrictive, so we'll omit it for now
      // reason: reason || 'requested_by_customer' as any,
    });

    // Update order payment status to REFUNDED
    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'REFUNDED' },
    });

    // A full refund implies the goods are being returned to inventory and
    // the order itself should read as REFUNDED, not just its payment status.
    // A partial refund (price adjustment, goodwill credit) doesn't imply a
    // return, so we leave stock/order.status untouched for those.
    const isFullRefund =
      refundAmount >= Math.round(Number(order.totalAmount) * 100);
    this.eventEmitter.emit(
      'order.refunded',
      new OrderRefundedEvent(orderId, isFullRefund),
    );

    return {
      id: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      reason: refund.reason,
    };
  }

  async getRefunds(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { stripePaymentIntentId: true },
    });

    if (!order || !order.stripePaymentIntentId) {
      throw new NotFoundException(
        'No Stripe payment intent found for this order',
      );
    }

    const stripe = await this.getStripeInstance();
    const refunds = await stripe.refunds.list({
      payment_intent: order.stripePaymentIntentId,
    });

    return refunds.data.map((refund) => ({
      id: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      reason: refund.reason,
      created: refund.created,
    }));
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) return;

    this.logger.warn(`Payment failed for order ${orderId}. Emitting failure event.`);
    await this.eventEmitter.emitAsync(
      'order.payment_failed',
      new OrderPaymentFailedEvent(
        orderId,
        paymentIntent.last_payment_error?.message,
      ),
    );
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) {
      this.logger.warn(
        `Payment intent ${paymentIntent.id} succeeded but no orderId found in metadata`,
      );
      return;
    }

    this.logger.log(`Emitting OrderPaidEvent for order ${orderId}...`);
    await this.eventEmitter.emitAsync(
      'order.paid',
      new OrderPaidEvent(
        orderId,
        paymentIntent.id,
        paymentIntent.amount / 100,
        paymentIntent.currency,
      ),
    );
  }
}
