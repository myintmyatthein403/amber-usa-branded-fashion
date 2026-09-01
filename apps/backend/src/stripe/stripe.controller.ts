import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import type { Request } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreatePaymentIntentSchema, type CreatePaymentIntentInput } from '@amber/shared';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body(new ZodValidationPipe(CreatePaymentIntentSchema)) data: CreatePaymentIntentInput,
  ) {
    return this.stripeService.createPaymentIntent(data.orderId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    if (!request.rawBody) {
      throw new BadRequestException(
        'Missing raw body for webhook verification',
      );
    }
    return this.stripeService.handleWebhook(request.rawBody, signature);
  }
}
