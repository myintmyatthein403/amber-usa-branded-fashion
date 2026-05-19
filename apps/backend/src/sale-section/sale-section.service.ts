import { Injectable, NotFoundException } from '@nestjs/common';
import { SaleSectionRepository } from './sale-section.repository';

@Injectable()
export class SaleSectionService {
  constructor(private repository: SaleSectionRepository) {}

  async create(data: any) {
    return this.repository.create(data);
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { badge: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {};
    
    const [items, total] = await Promise.all([
      this.repository.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.repository.count(where)
    ]);

    return {
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async findActive() {
    return this.repository.findActive();
  }

  async findOne(id: string) {
    const section = await this.repository.findById(id);
    if (!section) throw new NotFoundException(`Sale section ${id} not found`);
    return section;
  }

  async update(id: string, data: any) {
    return this.repository.update(id, data);
  }

  async remove(id: string) {
    return this.repository.delete(id);
  }
}