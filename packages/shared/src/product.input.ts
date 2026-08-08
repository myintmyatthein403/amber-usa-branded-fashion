import { z } from 'zod';
import {
  ProductBaseSchema,
  VariantBaseSchema,
  isPreOrderShippingDateValid,
  PRE_ORDER_SHIPPING_DATE_REQUIRED_ISSUE,
  isPreOrderShippingDateAbsent,
  PRE_ORDER_SHIPPING_DATE_FORBIDDEN_ISSUE,
} from './product.base';

export const PreOrderValidation = z
  .object({
    isPreOrder: z.boolean(),
    preOrderShippingDate: z.string().optional(),
  })
  .refine(isPreOrderShippingDateValid, PRE_ORDER_SHIPPING_DATE_REQUIRED_ISSUE)
  .refine(isPreOrderShippingDateAbsent, PRE_ORDER_SHIPPING_DATE_FORBIDDEN_ISSUE);

const PreOrderFields = z.object({
  isPreOrder: z.boolean(),
  preOrderShippingDate: z.string().optional(),
});

export const VariantInputSchema = VariantBaseSchema.merge(PreOrderFields.partial());

export const ProductInputSchema = ProductBaseSchema.merge(PreOrderFields.partial()).extend({
  variants: z.array(VariantInputSchema).default([]),
  category: z.object({
    id: z.string(),
    name: z.string(),
  }).optional().nullable(),
  brand: z.object({
    id: z.string(),
    name: z.string(),
    logo: z.string().optional().nullable(),
  }).optional().nullable(),
});

export const ProductCreateInputSchema = ProductInputSchema.omit({ id: true });
export const ProductUpdateInputSchema = ProductInputSchema.partial();

export type VariantInput = z.infer<typeof VariantInputSchema>;
export type ProductInput = z.infer<typeof ProductInputSchema>;
export type ProductCreateInput = z.infer<typeof ProductCreateInputSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateInputSchema>;