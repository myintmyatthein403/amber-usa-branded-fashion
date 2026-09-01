import { Injectable, NotFoundException } from '@nestjs/common';
import { Sale, Prisma } from '@prisma/client';
import { SalesRepository } from './sales.repository';
import { sanitizeData } from '../common/utils/data-sanitizer';

type SaleInput = Prisma.SaleCreateInput;
type SaleUpdateInput = Prisma.SaleUpdateInput;

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  async createSale(data: SaleInput): Promise<Sale> {
    const sanitizedData = sanitizeData(data);
    const productIds = (sanitizedData as Record<string, unknown>).productIds as
      | string[]
      | undefined;
    const saleData = sanitizeData(data);

    const sale = await this.salesRepository.create(saleData);

    if (productIds && productIds.length > 0) {
      await this.syncProducts(sale.id, productIds);
    }

    return sale;
  }

  async getAllSales(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    return this.salesRepository.findAll(options);
  }

  async getActiveSales(): Promise<Sale[]> {
    return this.salesRepository.findActive();
  }

  async getSaleById(id: string): Promise<Sale> {
    const sale = await this.salesRepository.findById(id);
    if (!sale) throw new NotFoundException(`Sale with ID ${id} not found`);
    return sale;
  }

  async updateSale(id: string, data: SaleUpdateInput): Promise<Sale> {
    const saleToUpdate = await this.salesRepository.findById(id);
    if (!saleToUpdate)
      throw new NotFoundException(`Sale with ID ${id} not found`);

    const sanitizedData = sanitizeData(data);
    const productIds = (sanitizedData as Record<string, unknown>).productIds as
      | string[]
      | undefined;
    const saleData = sanitizeData(data);

    const sale = await this.salesRepository.update(id, saleData);

    if (productIds !== undefined) {
      await this.syncProducts(id, productIds);
    } else {
      // discountType/discountValue/dates/isActive may have just changed —
      // re-evaluate pricing for products already in this sale so an edit
      // takes effect immediately instead of waiting for the next sweep.
      await this.reconcileSaleProductPricing(sale);
    }

    return sale;
  }

  // Applies or reverts pricing for every product currently associated with
  // this sale based on whether the sale's window is active right now —
  // shared by updateSale (immediate effect) and the scheduler (periodic
  // sweep for window boundaries crossed between admin edits).
  async reconcileSaleProductPricing(sale: Sale): Promise<void> {
    const fresh = await this.salesRepository.findById(sale.id);
    if (!fresh) return;
    const products = (fresh as Sale & { products?: { id: string }[] }).products ?? [];
    const windowActive = this.salesRepository.isSaleWindowActive(fresh);
    for (const product of products) {
      if (windowActive) {
        await this.salesRepository.applySalePricing(product.id, fresh);
      } else {
        await this.salesRepository.revertSalePricing(product.id);
      }
    }
  }

  async deleteSale(id: string): Promise<Sale> {
    const sale = await this.salesRepository.findById(id);
    if (!sale) throw new NotFoundException(`Sale with ID ${id} not found`);

    await this.salesRepository.resetProductsInSale(id);

    return this.salesRepository.delete(id);
  }

  async syncProducts(saleId: string, productIds: string[]) {
    await this.salesRepository.resetProductsInSale(saleId);

    if (productIds.length > 0) {
      const sale = await this.salesRepository.findById(saleId);
      await this.salesRepository.updateProductsSaleAssociation(
        productIds,
        saleId,
        true,
        sale ?? undefined,
      );
    }
  }

  async addProductToSale(saleId: string, productId: string) {
    const sale = await this.salesRepository.findById(saleId);
    return this.salesRepository.updateProductSale(productId, saleId, true, sale ?? undefined);
  }

  async removeProductFromSale(productId: string) {
    return this.salesRepository.updateProductSale(productId, null, false);
  }
}
