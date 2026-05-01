import { Injectable, NotFoundException } from '@nestjs/common';
import { Sale, Prisma } from '@prisma/client';
import { SalesRepository } from './sales.repository';
import { sanitizeData } from '../common/utils/data-sanitizer';

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  async createSale(data: any): Promise<Sale> {
    const sanitizedData = sanitizeData(data);
    const { productIds, ...saleData } = sanitizedData;
    
    const sale = await this.salesRepository.create(saleData as Prisma.SaleCreateInput);

    if (productIds && productIds.length > 0) {
      await this.syncProducts(sale.id, productIds);
    }

    return sale;
  }

  async getAllSales(): Promise<Sale[]> {
    return this.salesRepository.findAll();
  }

  async getActiveSales(): Promise<Sale[]> {
    return this.salesRepository.findActive();
  }

  async getSaleById(id: string): Promise<Sale> {
    const sale = await this.salesRepository.findById(id);
    if (!sale) throw new NotFoundException(`Sale with ID ${id} not found`);
    return sale;
  }

  async updateSale(id: string, data: any): Promise<Sale> {
    const saleToUpdate = await this.salesRepository.findById(id);
    if (!saleToUpdate) throw new NotFoundException(`Sale with ID ${id} not found`);

    const sanitizedData = sanitizeData(data);
    const { productIds, ...saleData } = sanitizedData;
    
    const sale = await this.salesRepository.update(id, saleData as Prisma.SaleUpdateInput);

    if (productIds !== undefined) {
      await this.syncProducts(id, productIds);
    }

    return sale;
  }

  async deleteSale(id: string): Promise<Sale> {
    const sale = await this.salesRepository.findById(id);
    if (!sale) throw new NotFoundException(`Sale with ID ${id} not found`);

    // Before deleting, reset product onSale status
    await this.salesRepository.resetProductsInSale(id);
    
    return this.salesRepository.delete(id);
  }

  async syncProducts(saleId: string, productIds: string[]) {
    // 1. Remove sale association from all products currently in this sale
    await this.salesRepository.resetProductsInSale(saleId);

    // 2. Add sale association to new products
    if (productIds.length > 0) {
      await this.salesRepository.updateProductsSaleAssociation(productIds, saleId, true);
    }
  }

  async addProductToSale(saleId: string, productId: string) {
    return this.salesRepository.updateProductSale(productId, saleId, true);
  }

  async removeProductFromSale(productId: string) {
    return this.salesRepository.updateProductSale(productId, null, false);
  }
}
