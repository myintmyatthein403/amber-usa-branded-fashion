import { Injectable, BadRequestException } from '@nestjs/common';
import { PriceTiersRepository } from './price-tiers.repository';

@Injectable()
export class PriceTiersService {
  constructor(private readonly priceTiersRepository: PriceTiersRepository) {}

  async list(productId?: string, variantId?: string) {
    if (!productId && !variantId) {
      throw new BadRequestException('productId or variantId is required');
    }
    return this.priceTiersRepository.findForTarget({ productId, variantId });
  }

  async create(data: {
    productId?: string;
    variantId?: string;
    minQuantity: number;
    price: number;
    currencyCode?: string;
  }) {
    if (!data.productId === !data.variantId) {
      throw new BadRequestException('Exactly one of productId or variantId is required');
    }
    if (data.minQuantity < 1) {
      throw new BadRequestException('minQuantity must be at least 1');
    }
    return this.priceTiersRepository.create(data);
  }

  async remove(id: string) {
    return this.priceTiersRepository.delete(id);
  }

  async getApplicablePrice(
    target: { productId?: string; variantId?: string },
    quantity: number,
    currencyCode: string,
  ): Promise<number | null> {
    const tier = await this.priceTiersRepository.findApplicableTier(target, quantity, currencyCode);
    return tier ? Number(tier.price) : null;
  }

  // Batched version for checkout: one query for every line item's tiers
  // instead of one findFirst per item. Returns results in the same order
  // as `items`; each item's best match is the highest minQuantity that
  // doesn't exceed its quantity, in its (already-resolved) currency.
  async getApplicablePricesForOrder(
    items: Array<{
      productId?: string;
      variantId?: string;
      quantity: number;
      currencyCode: string;
    }>,
  ): Promise<Array<number | null>> {
    const variantIds = items.filter((i) => i.variantId).map((i) => i.variantId!);
    const productIds = items
      .filter((i) => !i.variantId && i.productId)
      .map((i) => i.productId!);
    const tiers = await this.priceTiersRepository.findManyForTargets(
      variantIds,
      productIds,
    );

    return items.map((item) => {
      const best = tiers
        .filter((t) =>
          item.variantId ? t.variantId === item.variantId : t.productId === item.productId,
        )
        .filter((t) => t.currencyCode === item.currencyCode && t.minQuantity <= item.quantity)
        .sort((a, b) => b.minQuantity - a.minQuantity)[0];
      return best ? Number(best.price) : null;
    });
  }
}
