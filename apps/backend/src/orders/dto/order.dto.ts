import { z } from 'zod';
import {
  CreateOrderSchema,
  OrderItemSchema,
  OrderStatusSchema,
  PaymentStatusSchema,
} from '@amber/shared';

export const CreateOrderDto = CreateOrderSchema;
export type CreateOrderDto = z.infer<typeof CreateOrderDto>;

export const CreateOrderItemDto = OrderItemSchema;
export type CreateOrderItemDto = z.infer<typeof CreateOrderItemDto>;

export const OrderStatusDto = z.object({
  status: OrderStatusSchema,
});

export type OrderStatusDto = z.infer<typeof OrderStatusDto>;

export const PaymentStatusDto = z.object({
  status: PaymentStatusSchema,
});

export type PaymentStatusDto = z.infer<typeof PaymentStatusDto>;

export const BulkOrderStatusDto = z.object({
  ids: z.array(z.string().uuid()),
  status: OrderStatusSchema,
});

export type BulkOrderStatusDto = z.infer<typeof BulkOrderStatusDto>;

export const BulkPaymentStatusDto = z.object({
  ids: z.array(z.string().uuid()),
  status: PaymentStatusSchema,
});

export type BulkPaymentStatusDto = z.infer<typeof BulkPaymentStatusDto>;

export const TrackingUpdateDto = z.object({
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  warehouseId: z.string().uuid().optional(),
});

export type TrackingUpdateDto = z.infer<typeof TrackingUpdateDto>;

export const RejectManualPaymentDto = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

export type RejectManualPaymentDto = z.infer<typeof RejectManualPaymentDto>;

export const OrderQueryDto = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  search: z.string().optional(),
  awaitingPaymentReview: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type OrderQueryDto = z.infer<typeof OrderQueryDto>;
