import { Injectable, NotFoundException } from '@nestjs/common';
import { GiftCardSectionRepository } from './gift-card-section.repository';

@Injectable()
export class GiftCardSectionService {
  constructor(private repository: GiftCardSectionRepository) {}

  async create(data: any) {
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findActive() {
    return this.repository.findActive();
  }

  async findOne(id: string) {
    const section = await this.repository.findById(id);
    if (!section)
      throw new NotFoundException(`Gift card section ${id} not found`);
    return section;
  }

  async update(id: string, data: any) {
    return this.repository.update(id, data);
  }

  async remove(id: string) {
    return this.repository.delete(id);
  }
}
