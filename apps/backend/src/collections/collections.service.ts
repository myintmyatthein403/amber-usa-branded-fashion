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
    const sanitizedData = sanitizeData(data as unknown as Record<string, unknown>);
    const productIds = (sanitizedData.productIds || []) as string[];
    const { productIds: _p, name, slug, ...rest } = sanitizedData;

    const createData: Prisma.CollectionCreateInput = {
      name: name as string,
      slug: slug as string,
      ...(rest as Record<string, unknown>),
      products: productIds.length > 0
        ? {
            connect: productIds.map((id: string) => ({ id })),
          }
        : undefined,
    };

    return this.collectionsRepository.create(createData as any);
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

    const sanitizedData = sanitizeData(data as unknown as Record<string, unknown>);
    const productIds = sanitizedData.productIds as string[] | undefined;
    const { productIds: _p, ...rest } = sanitizedData;

    const updateData: Prisma.CollectionUpdateInput = { ...(rest as Record<string, unknown>) };

    if (productIds !== undefined && productIds !== null) {
      updateData.products = {
        set: productIds.map((pid: string) => ({ id: pid })),
      };
    }

    return this.collectionsRepository.update(id, updateData as any);
  }

  async remove(id: string) {
    const collection = await this.collectionsRepository.findById(id);
    if (!collection)
      throw new NotFoundException(`Collection with ID ${id} not found`);

    return this.collectionsRepository.delete(id);
  }
}
