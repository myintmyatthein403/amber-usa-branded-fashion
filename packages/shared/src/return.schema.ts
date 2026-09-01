import { z } from 'zod';

export const ReturnStatusSchema = z.enum([
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'RECEIVED',
  'COMPLETED',
]);

export type ReturnStatus = z.infer<typeof ReturnStatusSchema>;

export const ReturnItemConditionSchema = z.enum(['RESELLABLE', 'DAMAGED']);

export type ReturnItemCondition = z.infer<typeof ReturnItemConditionSchema>;

export const CreateReturnRequestSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().min(1, 'Reason is required'),
  comments: z.string().optional(),
  items: z
    .array(
      z.object({
        orderItemId: z.string().uuid(),
        quantity: z.number().int().positive('Quantity must be greater than zero'),
      }),
    )
    .min(1, 'At least one item is required'),
});

export type CreateReturnRequestInput = z.infer<typeof CreateReturnRequestSchema>;

export const UpdateReturnStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

export type UpdateReturnStatusInput = z.infer<typeof UpdateReturnStatusSchema>;

export const ReceiveReturnItemsSchema = z.object({
  items: z
    .array(
      z.object({
        returnItemId: z.string().uuid(),
        condition: ReturnItemConditionSchema,
      }),
    )
    .min(1, 'At least one item is required'),
});

export type ReceiveReturnItemsInput = z.infer<typeof ReceiveReturnItemsSchema>;
