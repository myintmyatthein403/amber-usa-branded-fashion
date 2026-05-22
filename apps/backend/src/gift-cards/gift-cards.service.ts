import { Injectable, NotFoundException } from '@nestjs/common';
import { GiftCard } from '@prisma/client';
import { GiftCardsRepository } from './gift-cards.repository';
import { sanitizeData } from '../common/utils/data-sanitizer';

@Injectable()
export class GiftCardsService {
  constructor(private readonly giftCardsRepository: GiftCardsRepository) {}

  async create(data: any): Promise<GiftCard> {
    const sanitizedData = sanitizeData(data);
    return this.giftCardsRepository.create(sanitizedData);
  }

  async findAll(): Promise<GiftCard[]> {
    return this.giftCardsRepository.findAll();
  }

  async findOne(id: string): Promise<GiftCard> {
    const giftCard = await this.giftCardsRepository.findById(id);
    if (!giftCard) {
      throw new NotFoundException(`Gift card with ID ${id} not found`);
    }
    return giftCard;
  }

  async update(id: string, data: any): Promise<GiftCard> {
    await this.findOne(id);
    const sanitizedData = sanitizeData(data);
    return this.giftCardsRepository.update(id, sanitizedData);
  }

  async remove(id: string): Promise<GiftCard> {
    await this.findOne(id);
    return this.giftCardsRepository.delete(id);
  }
}
