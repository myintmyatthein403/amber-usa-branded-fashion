import { describe, it, expect } from 'vitest';
import {
  Permission,
  PermissionGroup,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  PermissionLabels,
} from './permission.schema';

describe('Permission Schema', () => {
  describe('Permission Enum', () => {
    it('should have correct string values', () => {
      expect(Permission.PRODUCTS_READ).toBe('products:read');
      expect(Permission.PRODUCTS_WRITE).toBe('products:write');
      expect(Permission.ORDERS_MANAGE).toBe('orders:manage');
      expect(Permission.SETTINGS_MANAGE).toBe('settings:manage');
    });

    it('should have all required permissions', () => {
      expect(Permission.PRODUCTS_READ).toBeDefined();
      expect(Permission.PRODUCTS_WRITE).toBeDefined();
      expect(Permission.CATEGORIES_MANAGE).toBeDefined();
      expect(Permission.BRANDS_MANAGE).toBeDefined();
      expect(Permission.ORDERS_MANAGE).toBeDefined();
      expect(Permission.USERS_MANAGE).toBeDefined();
      expect(Permission.ROLES_MANAGE).toBeDefined();
    });
  });

  describe('PermissionGroup', () => {
    it('should group products permissions', () => {
      expect(PermissionGroup.PRODUCTS).toContain(Permission.PRODUCTS_READ);
      expect(PermissionGroup.PRODUCTS).toContain(Permission.PRODUCTS_WRITE);
    });

    it('should group orders permissions', () => {
      expect(PermissionGroup.ORDERS).toContain(Permission.ORDERS_MANAGE);
    });

    it('should group marketing permissions', () => {
      expect(PermissionGroup.MARKETING).toContain(Permission.MARKETING_MANAGE);
      expect(PermissionGroup.MARKETING).toContain(Permission.GIFT_CARDS_MANAGE);
      expect(PermissionGroup.MARKETING).toContain(Permission.ADS_MANAGE);
      expect(PermissionGroup.MARKETING).toContain(Permission.SALES_MANAGE);
      expect(PermissionGroup.MARKETING).toContain(Permission.COUPONS_MANAGE);
    });

    it('should group users permissions', () => {
      expect(PermissionGroup.USERS).toContain(Permission.USERS_MANAGE);
      expect(PermissionGroup.USERS).toContain(Permission.ROLES_MANAGE);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has the required permission', () => {
      const userPermissions = [Permission.PRODUCTS_READ, Permission.ORDERS_MANAGE];
      expect(hasPermission(userPermissions, Permission.PRODUCTS_READ)).toBe(true);
    });

    it('should return false when user does not have the required permission', () => {
      const userPermissions = [Permission.PRODUCTS_READ];
      expect(hasPermission(userPermissions, Permission.ORDERS_MANAGE)).toBe(false);
    });

    it('should handle string permissions', () => {
      const userPermissions = ['products:read', 'orders:manage'];
      expect(hasPermission(userPermissions, Permission.PRODUCTS_READ)).toBe(true);
    });

    it('should handle mixed string and enum permissions', () => {
      const userPermissions = ['products:read', Permission.ORDERS_MANAGE];
      expect(hasPermission(userPermissions, Permission.PRODUCTS_READ)).toBe(true);
      expect(hasPermission(userPermissions, Permission.ORDERS_MANAGE)).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has any of the required permissions', () => {
      const userPermissions = [Permission.PRODUCTS_READ];
      const required = [Permission.PRODUCTS_READ, Permission.ORDERS_MANAGE];
      expect(hasAnyPermission(userPermissions, required)).toBe(true);
    });

    it('should return false when user has none of the required permissions', () => {
      const userPermissions = [Permission.PRODUCTS_READ];
      const required = [Permission.ORDERS_MANAGE, Permission.SETTINGS_MANAGE];
      expect(hasAnyPermission(userPermissions, required)).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all required permissions', () => {
      const userPermissions = [Permission.PRODUCTS_READ, Permission.PRODUCTS_WRITE];
      const required = [Permission.PRODUCTS_READ, Permission.PRODUCTS_WRITE];
      expect(hasAllPermissions(userPermissions, required)).toBe(true);
    });

    it('should return false when user is missing any required permission', () => {
      const userPermissions = [Permission.PRODUCTS_READ];
      const required = [Permission.PRODUCTS_READ, Permission.PRODUCTS_WRITE];
      expect(hasAllPermissions(userPermissions, required)).toBe(false);
    });
  });

  describe('PermissionLabels', () => {
    it('should have labels for all permissions', () => {
      expect(PermissionLabels[Permission.PRODUCTS_READ]).toBe('View Products');
      expect(PermissionLabels[Permission.PRODUCTS_WRITE]).toBe('Manage Products & Variants');
      expect(PermissionLabels[Permission.ORDERS_MANAGE]).toBe('Manage Orders & Fulfillment');
      expect(PermissionLabels[Permission.SETTINGS_MANAGE]).toBe('Manage Settings');
    });

    it('should have correct number of labels', () => {
      const permissionCount = Object.keys(Permission).length;
      const labelCount = Object.keys(PermissionLabels).length;
      expect(labelCount).toBe(permissionCount);
    });
  });
});