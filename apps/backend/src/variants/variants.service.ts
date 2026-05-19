import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { VariantsRepository } from './variants.repository';
import { Variant } from '@prisma/client';
import { sanitizeData } from '../common/utils/data-sanitizer';
import {
  CreateVariantDto,
  UpdateVariantDto,
  VariantStockUpdateDto,
} from './dto/variant.dto';

@Injectable()
export class VariantsService {
  constructor(private variantsRepository: VariantsRepository) {}

  async createVariant(data: CreateVariantDto): Promise<Variant> {
    const sanitizedData = sanitizeData(data);
    return this.variantsRepository.create(sanitizedData);
  }

  async getAllVariants(productId?: string): Promise<Variant[]> {
    return this.variantsRepository.findAll(productId);
  }

  async updateVariant(id: string, data: UpdateVariantDto): Promise<Variant> {
    const sanitizedData = sanitizeData(data);
    const { stock, ...rest } = sanitizedData;

    const variant = await this.variantsRepository.findById(id);
    if (!variant) throw new NotFoundException('Variant not found');

    if (stock !== undefined) {
      if (variant.inventory.length > 1) {
        throw new BadRequestException(
          'Cannot update stock directly for variants with multiple warehouse inventories. Use Logistics Management instead.',
        );
      }

      if (variant.inventory.length === 1) {
        return this.variantsRepository.updateWithInventory(
          id,
          rest,
          variant.inventory[0].id,
          stock,
        );
      } else {
        throw new BadRequestException(
          'No inventory record found for this variant. Please add stock via Logistics Management.',
        );
      }
    }

    return this.variantsRepository.update(id, sanitizedData);
  }

  async updateVariantStock(
    id: string,
    data: VariantStockUpdateDto,
  ): Promise<Variant> {
    const variant = await this.variantsRepository.findById(id);
    if (!variant) throw new NotFoundException('Variant not found');

    if (variant.inventory.length > 1) {
      throw new BadRequestException(
        'Cannot update stock directly for variants with multiple warehouse inventories. Use Logistics Management instead.',
      );
    }

    if (variant.inventory.length === 1) {
      return this.variantsRepository.updateWithInventory(
        id,
        {},
        variant.inventory[0].id,
        data.stock,
      );
    } else {
      throw new BadRequestException(
        'No inventory record found for this variant. Please add stock via Logistics Management.',
      );
    }
  }

  async deleteVariant(id: string): Promise<Variant> {
    return this.variantsRepository.delete(id);
  }
}
