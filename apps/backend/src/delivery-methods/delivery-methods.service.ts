import { Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryMethodsRepository } from './delivery-methods.repository';

@Injectable()
export class DeliveryMethodsService {
  constructor(private repository: DeliveryMethodsRepository) {}

  async findAll() {
    return this.repository.findAll();
  }

  async findActive() {
    return this.repository.findActive();
  }

  async findOne(id: string) {
    const method = await this.repository.findById(id);
    if (!method) throw new NotFoundException(`Delivery method ${id} not found`);
    return method;
  }

  async create(data: any) {
    return this.repository.create(data);
  }

  async update(id: string, data: any) {
    return this.repository.update(id, data);
  }

  async remove(id: string) {
    return this.repository.delete(id);
  }
}
