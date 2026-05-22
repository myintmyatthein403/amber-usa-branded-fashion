import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  AttributesRepository,
  AttributeListQuery,
} from './attributes.repository';
import {
  CreateAttributeDto,
  UpdateAttributeDto,
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
  AttributeReorderPayload,
  AttributeValueReorderPayload,
} from './dto/attribute.dto';

@Injectable()
export class AttributesService {
  constructor(private attributesRepo: AttributesRepository) {}

  async findAll(query?: AttributeListQuery) {
    return this.attributesRepo.findAll(query);
  }

  async findFilterable() {
    return this.attributesRepo.findFilterable();
  }

  async findById(id: string) {
    const attribute = await this.attributesRepo.findById(id);
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }
    return attribute;
  }

  async create(data: CreateAttributeDto) {
    try {
      return await this.attributesRepo.create(data);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, data: UpdateAttributeDto) {
    await this.findById(id);
    try {
      return await this.attributesRepo.update(id, data);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async delete(id: string) {
    await this.findById(id);
    const usage = await this.attributesRepo.countAttributeUsage(id);
    if (usage > 0) {
      throw new BadRequestException(
        `Cannot delete attribute: ${usage} variant(s) still use it. Reassign variants first.`,
      );
    }
    return this.attributesRepo.delete(id);
  }

  async addValue(
    attributeId: string,
    data: CreateAttributeValueDto & { hexColor?: string | null },
  ) {
    await this.findById(attributeId);
    try {
      return await this.attributesRepo.addValue(attributeId, data);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateValue(id: string, data: UpdateAttributeValueDto) {
    const value = await this.attributesRepo.findValueById(id);
    if (!value) {
      throw new NotFoundException(`Attribute value with ID ${id} not found`);
    }
    try {
      return await this.attributesRepo.updateValue(id, data);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async deleteValue(id: string) {
    const usage = await this.attributesRepo.countValueUsage(id);
    if (usage > 0) {
      throw new BadRequestException(
        `Cannot delete value: ${usage} variant(s) still use it.`,
      );
    }
    return this.attributesRepo.deleteValue(id);
  }

  async reorderAttributes(items: AttributeReorderPayload) {
    return this.attributesRepo.reorderAttributes(items);
  }

  async reorderValues(attributeId: string, items: AttributeValueReorderPayload) {
    await this.findById(attributeId);
    const updated = await this.attributesRepo.reorderValues(attributeId, items);
    if (!updated) {
      throw new NotFoundException(`Attribute with ID ${attributeId} not found`);
    }
    return updated;
  }

  async validateSelections(
    selections?: Record<string, string> | null,
  ): Promise<Record<string, string> | undefined> {
    try {
      return await this.attributesRepo.validateAttributeSelections(selections);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid attribute selections',
      );
    }
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(
        'An attribute or value with this name or slug already exists.',
      );
    }
    throw error;
  }
}
