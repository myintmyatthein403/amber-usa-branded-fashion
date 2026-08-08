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
import { MemoryCacheService } from '../common/cache/memory-cache.service';

const CACHE_PREFIX = 'attributes:';
const CACHE_TTL_MS = 60_000;

@Injectable()
export class AttributesService {
  constructor(
    private attributesRepo: AttributesRepository,
    private cache: MemoryCacheService,
  ) {}

  async findAll(query?: AttributeListQuery) {
    return this.attributesRepo.findAll(query);
  }

  async findFilterable() {
    return this.cache.getOrSet(`${CACHE_PREFIX}filterable`, CACHE_TTL_MS, () =>
      this.attributesRepo.findFilterable(),
    );
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
      const created = await this.attributesRepo.create(data);
      this.cache.invalidatePrefix(CACHE_PREFIX);
      return created;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, data: UpdateAttributeDto) {
    await this.findById(id);
    try {
      const updated = await this.attributesRepo.update(id, data);
      this.cache.invalidatePrefix(CACHE_PREFIX);
      return updated;
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
    const deleted = await this.attributesRepo.delete(id);
    this.cache.invalidatePrefix(CACHE_PREFIX);
    return deleted;
  }

  async addValue(
    attributeId: string,
    data: CreateAttributeValueDto & { hexColor?: string | null },
  ) {
    await this.findById(attributeId);
    try {
      const created = await this.attributesRepo.addValue(attributeId, data);
      this.cache.invalidatePrefix(CACHE_PREFIX);
      return created;
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
      const updated = await this.attributesRepo.updateValue(id, data);
      this.cache.invalidatePrefix(CACHE_PREFIX);
      return updated;
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
    const deleted = await this.attributesRepo.deleteValue(id);
    this.cache.invalidatePrefix(CACHE_PREFIX);
    return deleted;
  }

  async reorderAttributes(items: AttributeReorderPayload) {
    const result = await this.attributesRepo.reorderAttributes(items);
    this.cache.invalidatePrefix(CACHE_PREFIX);
    return result;
  }

  async reorderValues(attributeId: string, items: AttributeValueReorderPayload) {
    await this.findById(attributeId);
    const updated = await this.attributesRepo.reorderValues(attributeId, items);
    if (!updated) {
      throw new NotFoundException(`Attribute with ID ${attributeId} not found`);
    }
    this.cache.invalidatePrefix(CACHE_PREFIX);
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
