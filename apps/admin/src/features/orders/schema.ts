import { z } from 'zod';

export const OrderStatusSchema = z.enum(['PENDING', 'PROCESSING', 'DELIVERING', 'COMPLETED', 'CANCELLED', 'REFUNDED']);
export const PaymentStatusSchema = z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid('Invalid variant ID').optional(),
  name: z.string().min(1, 'Item name is required'),
  price: z.number().min(0, 'Price must be positive'),
  isUsd: z.boolean().default(true),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  image: z.string().min(1, 'Image is required'),
  size: z.string().optional(),
  isPreOrder: z.boolean().default(false),
  expectedShippingDate: z.string().optional(),
});

export const OrderSchema = z.object({
  id: z.string().uuid().optional(),
  orderNumber: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'DELIVERING', 'COMPLETED', 'CANCELLED', 'REFUNDED']).default('PENDING'),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).default('PENDING'),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  currency: z.string().default('USD'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
  userId: z.string().uuid().optional().nullable(),
  items: z.array(OrderItemSchema).min(1, 'Order must have at least one item'),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;

export interface OrderWithRelations extends Order {
  orderNumber?: string;
  date?: string;
  user?: {
    name: string;
    email: string;
  };
  createdAt?: string;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}