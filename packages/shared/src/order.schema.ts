import { z } from 'zod';

export const OrderStatusSchema = z.enum(['PENDING', 'PROCESSING', 'DELIVERING', 'COMPLETED', 'CANCELLED', 'REFUNDED']);
export const PaymentStatusSchema = z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'REJECTED']);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid('Invalid variant ID').optional(),
  name: z.string().min(1, 'Item name is required'),
  price: z.number().min(0, 'Price must be positive'),
  isUsd: z.boolean().default(true),
  currencyCode: z.enum(['USD', 'MMK', 'THB']).optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  image: z.string().optional().default(''),
  size: z.string().optional(),
  isPreOrder: z.boolean().default(false),
  expectedShippingDate: z.string().optional(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const CreateOrderShippingSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  township: z.string().optional(),
  zipCode: z.string().optional(),
  deliveryMethodId: z.string().optional(),
  deliveryFee: z.number().min(0).default(0),
});

export const OrderSchema = z.object({
  id: z.string().uuid().optional(),
  orderNumber: z.string().optional(),
  status: OrderStatusSchema.default('PENDING'),
  paymentStatus: PaymentStatusSchema.default('PENDING'),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  currency: z.string().default('USD'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paymentReference: z.string().optional(),
  paymentProofUrl: z.string().optional().nullable(),
  paymentProofUploadedAt: z.string().optional().nullable(),
  manualPaymentReviewedAt: z.string().optional().nullable(),
  manualPaymentReviewedBy: z.string().optional().nullable(),
  manualPaymentRejectionReason: z.string().optional().nullable(),
  lockedExchangeRate: z.number().optional().nullable(),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  township: z.string().optional(),
  zipCode: z.string().optional(),
  deliveryMethodId: z.string().optional(),
  deliveryFee: z.number().optional(),
  market: z.enum(['US', 'MM']).optional(),
  shippingCountry: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  warehouseId: z.string().uuid().optional().nullable(),
  warehouse: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    location: z.string().optional(),
  }).optional(),
  userId: z.string().uuid().optional().nullable(),
  user: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  items: z.array(OrderItemSchema).min(1, 'Order must have at least one item'),
});

export const CreateOrderSchema = OrderSchema.omit({
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  paymentProofUrl: true,
  paymentProofUploadedAt: true,
  manualPaymentReviewedAt: true,
  manualPaymentReviewedBy: true,
  manualPaymentRejectionReason: true,
  lockedExchangeRate: true,
}).extend({
  customerName: z.string().min(1).optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().min(1).optional(),
  street: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().optional(),
  township: z.string().optional(),
  zipCode: z.string().optional(),
  deliveryMethodId: z.string().optional(),
  deliveryFee: z.number().min(0).optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;

export interface OrderWithRelations extends Order {
  id: string;
  orderNumber?: string;
  date?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
