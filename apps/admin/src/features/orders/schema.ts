import { z } from 'zod';

export const OrderStatusSchema = z.enum(['PENDING', 'PROCESSING', 'DELIVERING', 'COMPLETED', 'CANCELLED', 'REFUNDED']);
export const PaymentStatusSchema = z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const OrderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string(),
  size: z.string().optional(),
  isUsd: z.boolean(),
});

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  date: z.string(),
  status: OrderStatusSchema,
  paymentStatus: PaymentStatusSchema,
  totalAmount: z.number(),
  currency: z.string(),
  paymentMethod: z.string(),
  shippingAddress: z.string(),
  userId: z.string().optional(),
  user: z.object({
    name: z.string(),
    email: z.string(),
  }).optional(),
  items: z.array(OrderItemSchema),
  createdAt: z.string(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
