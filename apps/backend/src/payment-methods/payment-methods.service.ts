import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethodsRepository } from './payment-methods.repository';

@Injectable()
export class PaymentMethodsService {
  constructor(private repository: PaymentMethodsRepository) {}

  async findAll() {
    return this.repository.findAll();
  }

  async findActive() {
    return this.repository.findActive();
  }

  async findOne(id: string) {
    const method = await this.repository.findById(id);
    if (!method) throw new NotFoundException(`Payment method ${id} not found`);
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