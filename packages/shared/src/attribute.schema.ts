import { z } from 'zod';

export const AttributeTypeSchema = z.enum(['text', 'color', 'image']);

export const AttributeValueBaseSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  slug: z.string().optional(),
  position: z.number().int().min(0).optional(),
  hexColor: z.string().optional().nullable(),
});

export const AttributeValueSchema = AttributeValueBaseSchema.extend({
  id: z.string().uuid().optional(),
  attributeId: z.string().uuid().optional(),
});

export const AttributeBaseSchema = z.object({
  name: z.string().min(1, 'Attribute name is required'),
  slug: z.string().optional(),
  type: AttributeTypeSchema.default('text'),
  isRequired: z.boolean().default(false),
  isFilterable: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
});

export const AttributeSchema = AttributeBaseSchema.extend({
  id: z.string().uuid().optional(),
  values: z.array(AttributeValueSchema).optional(),
});

export const AttributeReorderItemSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int().min(0),
});

export const AttributeReorderSchema = z
  .array(AttributeReorderItemSchema)
  .min(1, 'At least one attribute is required');

export const AttributeValueReorderItemSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int().min(0),
});

export const AttributeValueReorderSchema = z
  .array(AttributeValueReorderItemSchema)
  .min(1, 'At least one value is required');

export type AttributeType = z.infer<typeof AttributeTypeSchema>;
export type AttributeValue = z.infer<typeof AttributeValueSchema>;
export type Attribute = z.infer<typeof AttributeSchema>;
export type AttributeFormData = z.infer<typeof AttributeBaseSchema>;
export type AttributeValueFormData = z.infer<typeof AttributeValueBaseSchema>;
export type AttributeReorderPayload = z.infer<typeof AttributeReorderSchema>;
export type AttributeValueReorderPayload = z.infer<
  typeof AttributeValueReorderSchema
>;

export type AttributeWithValues = Attribute & {
  id: string;
  position: number;
  values: Array<
    AttributeValue & {
      id: string;
      attributeId: string;
      slug: string;
      position: number;
    }
  >;
  usageCount?: number;
};
