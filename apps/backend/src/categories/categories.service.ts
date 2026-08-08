import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { Category, Prisma } from '@prisma/client';
import { sanitizeData } from '../common/utils/data-sanitizer';
import { CreateCategoryDto, UpdateCategoryDto, CategoryReorderDto } from './dto/category.dto';
import { getCategoryDescendantIds } from '@amber/shared';
import { MemoryCacheService } from '../common/cache/memory-cache.service';
import slugify from 'slugify';

const CACHE_PREFIX = 'categories:';
const CACHE_TTL_MS = 60_000;

export interface PaginatedResult {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class CategoriesService {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private cache: MemoryCacheService,
  ) {}

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    // Always ensure we have a valid slug - generate from name if not provided
    const slug = data.slug ? this.sanitizeSlug(data.slug) : this.generateSlug(data.name);
    
    // Validate that we have a slug (this should always be true, but just in case)
    if (!slug) {
      throw new BadRequestException('Could not generate a valid slug from the category name');
    }
    
    const createData: Prisma.CategoryCreateInput = {
      name: data.name,
      slug: slug,
      description: data.description,
      image: data.image,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
      hasExpiry: data.hasExpiry !== undefined ? data.hasExpiry : false,
      displayOrder: data.displayOrder !== undefined ? data.displayOrder : 0,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      ...(data.parentId && { parent: { connect: { id: data.parentId } } })
    };
    
    // Prevent circular references
    if (data.parentId) {
      await this.validateParentChildRelationship(null, data.parentId);
    }
    
    const created = await this.categoriesRepository.create(createData);
    this.cache.invalidatePrefix(CACHE_PREFIX);
    return created;
  }

  async getAllCategories(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult> {
    return this.cache.getOrSet(
      `${CACHE_PREFIX}list:${page}:${limit}`,
      CACHE_TTL_MS,
      async () => {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
          this.categoriesRepository.findMany(skip, limit),
          this.categoriesRepository.count(),
        ]);

        return {
          data,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
    );
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const updateData: Prisma.CategoryUpdateInput = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.hasExpiry !== undefined && { hasExpiry: data.hasExpiry }),
      ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
    };
    
    // Handle slug - either use provided slug, sanitize it, or generate from name
    // Always ensure we have a slug for the database
    if (data.slug !== undefined) {
      updateData.slug = this.sanitizeSlug(data.slug);
    } else if (data.name !== undefined) {
      // Only generate slug from name if we're actually updating the name
      updateData.slug = this.generateSlug(data.name);
    }
    // Note: If neither slug nor name is provided, we keep the existing slug
    
    // Handle parent relationship separately
    if (data.parentId !== undefined) {
      if (data.parentId) {
        updateData.parent = { connect: { id: data.parentId } };
      } else {
        updateData.parent = { disconnect: true };
      }
    }
    
    // Prevent circular references
    if (data.parentId) {
      await this.validateParentChildRelationship(id, data.parentId);
    }
    
    const updated = await this.categoriesRepository.update(id, updateData);
    this.cache.invalidatePrefix(CACHE_PREFIX);
    return updated;
  }

  // Deleting a category cascades to its subcategories at the DB level and
  // silently nulls categoryId on any products under it — force=false (the
  // default) blocks that blast radius unless the admin explicitly confirms.
  async deleteCategory(id: string, force = false): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (!force) {
      const [subcategoryCount, productCount] = await Promise.all([
        this.categoriesRepository.countSubcategories(id),
        this.categoriesRepository.countProducts(id),
      ]);
      if (subcategoryCount > 0 || productCount > 0) {
        throw new BadRequestException({
          message:
            `This category has ${subcategoryCount} subcategor${subcategoryCount === 1 ? 'y' : 'ies'} and ${productCount} product(s). ` +
            `Deleting it will also delete the subcategories and un-categorize the products. Confirm to proceed.`,
          subcategoryCount,
          productCount,
        });
      }
    }

    const deleted = await this.categoriesRepository.delete(id);
    this.cache.invalidatePrefix(CACHE_PREFIX);
    return deleted;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.categoriesRepository.findBySlug(slug);
  }

  async getCategoryWithChildren(parentId: string): Promise<Category[]> {
    return this.categoriesRepository.findWithChildren(parentId);
  }

  async reorderCategories(items: CategoryReorderDto): Promise<Category[]> {
    const all = await this.categoriesRepository.findAll();
    const idSet = new Set(all.map((c) => c.id));

    for (const item of items) {
      if (!idSet.has(item.id)) {
        throw new NotFoundException(`Category with ID ${item.id} not found`);
      }
      if (item.parentId && !idSet.has(item.parentId)) {
        throw new BadRequestException(`Parent category ${item.parentId} not found`);
      }
    }

    const merged = all.map((c) => {
      const update = items.find((i) => i.id === c.id);
      return {
        id: c.id,
        name: c.name,
        parentId: update ? update.parentId : c.parentId,
        displayOrder: update ? update.displayOrder : c.displayOrder,
      };
    });

    for (const item of items) {
      if (item.parentId) {
        const descendants = getCategoryDescendantIds(merged, item.id);
        if (descendants.includes(item.parentId)) {
          throw new BadRequestException(
            'Cannot move a category under its own descendant',
          );
        }
        await this.validateParentChildRelationship(item.id, item.parentId);
      }
    }

    const reordered = await this.categoriesRepository.reorderMany(items);
    this.cache.invalidatePrefix(CACHE_PREFIX);
    return reordered;
  }

  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
      trim: true
    });
  }

  private sanitizeSlug(slug: string): string {
    const sanitized = slugify(slug, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
      trim: true
    });
    
    // Validate that the slug matches our schema requirements
    if (!/^[a-z0-9-_]+$/.test(sanitized)) {
      throw new BadRequestException('Slug must be alphanumeric with hyphens and underscores only');
    }
    
    return sanitized;
  }

  private async validateParentChildRelationship(
    categoryId: string | null,
    parentId: string
  ): Promise<void> {
    // Prevent a category from being its own parent
    if (categoryId === parentId) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    // Check if the parent would create a circular reference
    let currentParentId: string | undefined = parentId;
    while (currentParentId) {
      const parentCategory = await this.categoriesRepository.findById(currentParentId);
      if (!parentCategory) {
        break;
      }
      if (parentCategory.id === categoryId) {
        throw new BadRequestException('Circular reference detected: a category cannot be a child of its own descendant');
      }
      currentParentId = parentCategory.parentId || undefined;
    }
  }
}
