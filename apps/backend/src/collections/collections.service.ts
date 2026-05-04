import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CollectionsRepository } from './collections.repository';
import { sanitizeData } from '../common/utils/data-sanitizer';
import { Collection } from '@amber/shared';

interface CollectionInput extends Omit<Collection, 'id'> {
  productIds?: string[];
}

@Injectable()
export class CollectionsService {
  constructor(private readonly collectionsRepository: CollectionsRepository) {}

  async create(data: CollectionInput) {
    const sanitizedData = sanitizeData(data);
    const { productIds, ...rest } = sanitizedData;

    const createData: Prisma.CollectionCreateInput = {
      ...rest,
      products: productIds
        ? {
            connect: productIds.map((id: string) => ({ id })),
          }
        : undefined,
    };

    return this.collectionsRepository.create(createData);
  }

  async findAll() {
    return this.collectionsRepository.findAll();
  }

  async findOne(id: string) {
    const collection = await this.collectionsRepository.findById(id);
    if (!collection)
      throw new NotFoundException(`Collection with ID ${id} not found`);
    return collection;
  }

  async findBySlug(slug: string) {
    const collection = await this.collectionsRepository.findBySlug(slug);
    if (!collection)
      throw new NotFoundException(`Collection with slug ${slug} not found`);
    return collection;
  }

  async update(id: string, data: CollectionInput) {
    const collection = await this.collectionsRepository.findById(id);
    if (!collection)
      throw new NotFoundException(`Collection with ID ${id} not found`);

    const sanitizedData = sanitizeData(data);
    const { productIds, ...rest } = sanitizedData;

    const updateData: Prisma.CollectionUpdateInput = { ...rest };

    if (productIds !== undefined) {
      updateData.products = {
        set: productIds.map((pid: string) => ({ id: pid })),
      };
    }

    return this.collectionsRepository.update(id, updateData);
  }

  async remove(id: string) {
    const collection = await this.collectionsRepository.findById(id);
    if (!collection)
      throw new NotFoundException(`Collection with ID ${id} not found`);

    return this.collectionsRepository.delete(id);
  }
}
