import { describe, it, expect } from 'vitest';
import { ProductSchema, VariantSchema, ProductFiltersSchema } from './product.schema';

describe('Product Schema', () => {
  describe('ProductSchema', () => {
    it('should validate a valid product', () => {
      const product = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        slug: 'test-product',
        status: 'DRAFT',
        price: '99.99',
        variants: [],
      };

      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(true);
    });

    it('should reject product without name', () => {
      const product = {
        slug: 'test-product',
        price: '99.99',
      };

      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('name'))).toBe(true);
      }
    });

    it('should reject product without price', () => {
      const product = {
        name: 'Test Product',
        slug: 'test-product',
      };

      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('price'))).toBe(true);
      }
    });

    it('should accept empty string as price', () => {
      const product = {
        name: 'Test Product',
        slug: 'test-product',
        price: '',
      };

      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it('should default status to DRAFT', () => {
      const product = {
        name: 'Test Product',
        slug: 'test-product',
        price: '99.99',
      };

      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('DRAFT');
      }
    });

    it('should validate status enum values', () => {
      const product = {
        name: 'Test Product',
        slug: 'test-product',
        price: '99.99',
        status: 'INVALID_STATUS',
      };

      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it('should accept valid status values', () => {
      const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

      for (const status of validStatuses) {
        const product = {
          name: 'Test Product',
          slug: 'test-product',
          price: '99.99',
          status,
        };

        const result = ProductSchema.safeParse(product);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('PreOrder Validation', () => {
    it('should allow isPreOrder with preOrderShippingDate', () => {
      const product = {
        name: 'PreOrder Product',
        slug: 'preorder-product',
        price: '99.99',
        isPreOrder: true,
        preOrderShippingDate: '2026-12-25',
      };

      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(true);
    });

    it('should reject isPreOrder without preOrderShippingDate', () => {
      const product = {
        name: 'PreOrder Product',
        slug: 'preorder-product',
        price: '99.99',
        isPreOrder: true,
      };

      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('preOrderShippingDate'))).toBe(true);
      }
    });

    it('should reject preOrderShippingDate without isPreOrder', () => {
      const product = {
        name: 'PreOrder Product',
        slug: 'preorder-product',
        price: '99.99',
        isPreOrder: false,
        preOrderShippingDate: '2026-12-25',
      };

      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('preOrderShippingDate'))).toBe(true);
      }
    });

    it('should allow non-preOrder product without preOrderShippingDate', () => {
      const product = {
        name: 'Regular Product',
        slug: 'regular-product',
        price: '99.99',
        isPreOrder: false,
      };

      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(true);
    });
  });

  describe('VariantSchema', () => {
    it('should validate a valid variant', () => {
      const variant = {
        sku: 'SKU-001',
        size: 'M',
        color: 'Red',
        stock: 10,
      };

      const result = VariantSchema.safeParse(variant);
      expect(result.success).toBe(true);
    });

    it('should reject variant without sku', () => {
      const variant = {
        size: 'M',
        color: 'Red',
        stock: 10,
      };

      const result = VariantSchema.safeParse(variant);
      expect(result.success).toBe(false);
    });

    it('should reject negative stock', () => {
      const variant = {
        sku: 'SKU-001',
        size: 'M',
        color: 'Red',
        stock: -1,
      };

      const result = VariantSchema.safeParse(variant);
      expect(result.success).toBe(false);
    });

    it('should validate preOrder on variant', () => {
      const variant = {
        sku: 'SKU-001',
        size: 'M',
        color: 'Red',
        stock: 10,
        isPreOrder: true,
        preOrderShippingDate: '2026-12-25',
      };

      const result = VariantSchema.safeParse(variant);
      expect(result.success).toBe(true);
    });

    it('should reject variant preOrder without shipping date', () => {
      const variant = {
        sku: 'SKU-001',
        size: 'M',
        color: 'Red',
        stock: 10,
        isPreOrder: true,
      };

      const result = VariantSchema.safeParse(variant);
      expect(result.success).toBe(false);
    });

    it('should default stock to 0', () => {
      const variant = {
        sku: 'SKU-001',
        size: 'M',
        color: 'Red',
      };

      const result = VariantSchema.safeParse(variant);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stock).toBe(0);
      }
    });

    it('should default lowStockThreshold to 5', () => {
      const variant = {
        sku: 'SKU-001',
        size: 'M',
        color: 'Red',
      };

      const result = VariantSchema.safeParse(variant);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lowStockThreshold).toBe(5);
      }
    });
  });

  describe('ProductFiltersSchema', () => {
    it('should validate valid filters', () => {
      const filters = {
        isFeatured: true,
        categoryId: '123',
        page: 1,
        limit: 10,
      };

      const result = ProductFiltersSchema.safeParse(filters);
      expect(result.success).toBe(true);
    });

    it('should allow empty filters', () => {
      const filters = {};

      const result = ProductFiltersSchema.safeParse(filters);
      expect(result.success).toBe(true);
    });

    it('should validate search parameter', () => {
      const filters = {
        search: 'test query',
      };

      const result = ProductFiltersSchema.safeParse(filters);
      expect(result.success).toBe(true);
    });

    it('should validate numeric pagination params', () => {
      const filters = {
        page: 5,
        limit: 25,
      };

      const result = ProductFiltersSchema.safeParse(filters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
        expect(result.data.limit).toBe(25);
      }
    });
  });
});