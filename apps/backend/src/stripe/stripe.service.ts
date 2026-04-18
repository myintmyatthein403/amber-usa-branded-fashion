import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
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

  private async getStripeInstance(): Promise<Stripe> {
    if (this.stripe) return this.stripe;

    // Try to get secret key from DB (Finding 3)
    const settings = await this.prisma.settings.findUnique({
      where: { id: 'global' },
      select: { stripeSecretKey: true }
    });

    const secretKey = settings?.stripeSecretKey || this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!secretKey) {
      throw new BadRequestException('Stripe secret key is not configured');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia' as any, // Use a standard stable version
    });
    return this.stripe;
  }

  async createPaymentIntent(amount: number, currency: string, orderId?: string) {
    const stripe = await this.getStripeInstance();
    
    let verifiedAmount = amount;
    
    // Recalculate amount from DB if orderId is provided (Finding 2)
    if (orderId) {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });
      
      if (!order) {
        throw new NotFoundException(`Order ${orderId} not found`);
      }

      // Re-sum items
      const itemsTotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
      
      // We need to account for delivery fee if it's not in items
      // totalAmount in DB is already calculated correctly by OrdersService.createOrder
      verifiedAmount = Number(order.totalAmount);
      
      this.logger.log(`Creating payment intent for order ${orderId}. Verified amount: ${verifiedAmount}`);
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(verifiedAmount * 100), // convert to cents
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

  async verifyPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { 
        id: true, 
        paymentStatus: true, 
        stripePaymentIntentId: true 
      }
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
      const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
      
      if (intent.status === 'succeeded') {
        // Manually update if webhook was missed/delayed
        await this.prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'PAID' }
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
      select: { stripeWebhookSecret: true }
    });

    const webhookSecret = settings?.stripeWebhookSecret || this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
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
