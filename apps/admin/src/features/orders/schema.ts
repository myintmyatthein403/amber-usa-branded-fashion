import { z } from 'zod';
import { OrderStatusSchema, PaymentStatusSchema, OrderItemSchema, OrderSchema, OrderWithRelations, Meta } from '@amber/shared';

export { OrderStatusSchema, PaymentStatusSchema };
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export { OrderItemSchema };
export type OrderItem = z.infer<typeof OrderItemSchema>;

export { OrderSchema };
export type Order = z.infer<typeof OrderSchema>;

export type { OrderWithRelations, Meta };