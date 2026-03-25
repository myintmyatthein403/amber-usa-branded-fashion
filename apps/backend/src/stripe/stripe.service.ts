import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private getStripeInstance(): Stripe {
    if (this.stripe) return this.stripe;

    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new BadRequestException('STRIPE_SECRET_KEY is not configured in environment variables');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia' as any, // Use a standard stable version
    });
    return this.stripe;
  }

  async createPaymentIntent(amount: number, currency: string, orderId?: string) {
    const stripe = this.getStripeInstance();
    
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: currency.toLowerCase(),
      metadata: { orderId: orderId || '' },
      automatic_payment_methods: { enabled: true },
    });

    if (orderId) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { stripePaymentIntentId: intent.id },
      });
    }

    return {
      clientSecret: intent.client_secret,
    };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const stripe = this.getStripeInstance();
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not configured in environment variables');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSucceeded(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        this.logger.warn(`Payment failed for intent ${failedIntent.id}`);
        await this.handlePaymentFailed(failedIntent);
        break;
      // Add more event types as needed
    }

    return { received: true };
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) return;

    try {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });
    } catch (error) {
      this.logger.error(`Failed to update order ${orderId} status to FAILED: ${error.message}`);
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) {
      this.logger.warn(`Payment intent ${paymentIntent.id} succeeded but no orderId found in metadata`);
      return;
    }

    try {
      this.logger.log(`Processing successful payment for order ${orderId}...`);
      const order = await this.prisma.order.findUnique({ where: { id: orderId } });
      
      if (!order) {
        this.logger.error(`Payment succeeded for order ${orderId} but order not found in database`);
        return;
      }

      // Update paymentStatus to PAID but keep fulfillment status as is (likely PENDING)
      await this.prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: 'PAID',
          stripePaymentIntentId: paymentIntent.id,
          paymentMethod: order.paymentMethod || 'Stripe',
        },
      });

      this.logger.log(`Order ${orderId} status updated: PROCESSING, Payment: PAID`);
    } catch (error) {
      this.logger.error(`Failed to update order ${orderId} after successful payment: ${error.message}`);
    }
  }
}
