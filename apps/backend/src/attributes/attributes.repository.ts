import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';

export interface AttributeListQuery {
  search?: string;
  type?: string;
  isFilterable?: boolean;
}

@Injectable()
export class AttributesRepository {
  constructor(private prisma: PrismaService) {}

  slugifyName(name: string): string {
    return slugify(name, { lower: true, strict: true });
  }

  private buildWhere(query?: AttributeListQuery): Prisma.AttributeWhereInput {
    if (!query) return {};
    const where: Prisma.AttributeWhereInput = {};
    if (query.type) where.type = query.type;
    if (query.isFilterable === true) where.isFilterable = true;
    if (query.isFilterable === false) where.isFilterable = false;
    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
        {
          values: {
            some: { value: { contains: term, mode: 'insensitive' } },
          },
        },
      ];
    }
    return where;
  }

  async findAll(query?: AttributeListQuery) {
    const rows = await this.prisma.attribute.findMany({
      where: this.buildWhere(query),
      orderBy: { position: 'asc' },
      include: {
        values: { orderBy: { position: 'asc' } },
      },
    });
    return this.attachUsageCounts(rows);
  }

  async findFilterable() {
    return this.prisma.attribute.findMany({
      where: { isFilterable: true },
      orderBy: { position: 'asc' },
      include: {
        values: { orderBy: { position: 'asc' } },
      },
    });
  }

  async findById(id: string) {
    const row = await this.prisma.attribute.findUnique({
      where: { id },
      include: {
        values: { orderBy: { position: 'asc' } },
      },
    });
    if (!row) return null;
    const [withCount] = await this.attachUsageCounts([row]);
    return withCount;
  }

  async findBySlug(slug: string) {
    return this.prisma.attribute.findUnique({
      where: { slug },
      include: {
        values: { orderBy: { position: 'asc' } },
      },
    });
  }

  async countAttributeUsage(attributeId: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*)::int AS count FROM "Variant"
      WHERE "attributeSelections" IS NOT NULL
      AND "attributeSelections" ? ${attributeId}
    `;
    return rows[0]?.count ?? 0;
  }

  async countValueUsage(valueId: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*)::int AS count FROM "Variant"
      WHERE "attributeSelections" IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM jsonb_each_text("attributeSelections") AS kv
        WHERE kv.value = ${valueId}
      )
    `;
    return rows[0]?.count ?? 0;
  }

  private async attachUsageCounts<T extends { id: string }>(
    attributes: T[],
  ): Promise<(T & { usageCount: number })[]> {
    const counts = await Promise.all(
      attributes.map((a) => this.countAttributeUsage(a.id)),
    );
    return attributes.map((a, i) => ({ ...a, usageCount: counts[i] }));
  }

  async create(data: {
    name: string;
    slug?: string;
    type?: string;
    isRequired?: boolean;
    isFilterable?: boolean;
    position?: number;
  }) {
    const slug = data.slug || this.slugifyName(data.name);
    return this.prisma.attribute.create({
      data: {
        name: data.name,
        slug,
        type: data.type || 'text',
        isRequired: data.isRequired ?? false,
        isFilterable: data.isFilterable ?? false,
        position: data.position ?? 0,
      },
      include: { values: { orderBy: { position: 'asc' } } },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      type: string;
      isRequired: boolean;
      isFilterable: boolean;
      position: number;
    }>,
  ) {
    return this.prisma.attribute.update({
      where: { id },
      data,
      include: { values: { orderBy: { position: 'asc' } } },
    });
  }

  async delete(id: string) {
    return this.prisma.attribute.delete({ where: { id } });
  }

  async reorderAttributes(items: { id: string; position: number }[]) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.attribute.update({
          where: { id: item.id },
          data: { position: item.position },
        }),
      ),
    );
    return this.findAll();
  }

  async addValue(
    attributeId: string,
    data: {
      value: string;
      slug?: string;
      position?: number;
      hexColor?: string | null;
    },
  ) {
    const slug = data.slug || this.slugifyName(data.value);
    const maxPos = await this.prisma.attributeValue.aggregate({
      where: { attributeId },
      _max: { position: true },
    });
    return this.prisma.attributeValue.create({
      data: {
        attributeId,
        value: data.value,
        slug,
        position: data.position ?? (maxPos._max.position ?? -1) + 1,
        hexColor: data.hexColor,
      },
    });
  }

  async updateValue(
    id: string,
    data: Partial<{
      value: string;
      slug: string;
      position: number;
      hexColor: string | null;
    }>,
  ) {
    return this.prisma.attributeValue.update({
      where: { id },
      data,
    });
  }

  async findValueById(id: string) {
    return this.prisma.attributeValue.findUnique({ where: { id } });
  }

  async deleteValue(id: string) {
    return this.prisma.attributeValue.delete({ where: { id } });
  }

  async reorderValues(
    attributeId: string,
    items: { id: string; position: number }[],
  ) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.attributeValue.update({
          where: { id: item.id, attributeId },
          data: { position: item.position },
        }),
      ),
    );
    return this.findById(attributeId);
  }

  async validateAttributeSelections(
    selections?: Record<string, string> | null,
  ): Promise<Record<string, string> | undefined> {
    if (!selections || Object.keys(selections).length === 0) {
      return undefined;
    }
    const sanitized: Record<string, string> = {};
    for (const [attributeId, valueId] of Object.entries(selections)) {
      if (!valueId) continue;
      const value = await this.prisma.attributeValue.findFirst({
        where: { id: valueId, attributeId },
      });
      if (!value) {
        throw new Error(
          `Invalid attribute selection: value ${valueId} does not belong to attribute ${attributeId}`,
        );
      }
      sanitized[attributeId] = valueId;
    }
    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  }
}
