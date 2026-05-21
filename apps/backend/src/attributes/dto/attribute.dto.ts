import { z } from 'zod';
import {
  AttributeBaseSchema,
  AttributeValueBaseSchema,
  AttributeReorderSchema,
  AttributeValueReorderSchema,
  AttributeTypeSchema,
} from '@amber/shared';

export const CreateAttributeDto = AttributeBaseSchema;
export const UpdateAttributeDto = AttributeBaseSchema.partial();
export const CreateAttributeValueDto = AttributeValueBaseSchema;
export const UpdateAttributeValueDto = AttributeValueBaseSchema.partial();
export const AttributeReorderDto = AttributeReorderSchema;
export const AttributeValueReorderDto = AttributeValueReorderSchema;

export type CreateAttributeDto = z.infer<typeof CreateAttributeDto>;
export type UpdateAttributeDto = z.infer<typeof UpdateAttributeDto>;
export type CreateAttributeValueDto = z.infer<typeof CreateAttributeValueDto>;
export type UpdateAttributeValueDto = z.infer<typeof UpdateAttributeValueDto>;
export type AttributeReorderPayload = z.infer<typeof AttributeReorderDto>;
export type AttributeValueReorderPayload = z.infer<typeof AttributeValueReorderDto>;

export { AttributeTypeSchema };
