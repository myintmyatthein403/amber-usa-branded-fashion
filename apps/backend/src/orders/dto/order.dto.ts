import { z } from 'zod';
import { OrderSchema, OrderItemSchema } from '@amber/shared';

export const CreateOrderDto = OrderSchema;
export type CreateOrderDto = z.infer<typeof CreateOrderDto>;

export const CreateOrderItemDto = OrderItemSchema;
export type CreateOrderItemDto = z.infer<typeof CreateOrderItemDto>;

export const OrderStatusDto = z.object({
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'DELIVERING',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED',
  ]),
});

export type OrderStatusDto = z.infer<typeof OrderStatusDto>;

export const PaymentStatusDto = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
});

export type PaymentStatusDto = z.infer<typeof PaymentStatusDto>;

export const BulkOrderStatusDto = z.object({
  ids: z.array(z.string().uuid()),
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'DELIVERING',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED',
  ]),
});

export type BulkOrderStatusDto = z.infer<typeof BulkOrderStatusDto>;

export const BulkPaymentStatusDto = z.object({
  ids: z.array(z.string().uuid()),
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
});

export type BulkPaymentStatusDto = z.infer<typeof BulkPaymentStatusDto>;

export const TrackingUpdateDto = z.object({
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  warehouseId: z.string().uuid().optional(),
});

export type TrackingUpdateDto = z.infer<typeof TrackingUpdateDto>;

export const OrderQueryDto = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type OrderQueryDto = z.infer<typeof OrderQueryDto>;
