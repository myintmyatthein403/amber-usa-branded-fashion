import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test.describe('Storefront', () => {
    test('homepage should load without errors', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/Amber/i);
    });

    test('navigation should work', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Shop');
      await expect(page).toHaveURL(/shop/);
    });

    test('product listing should load', async ({ page }) => {
      await page.goto('/shop');
      await expect(page.locator('text=Products')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Admin Portal', () => {
    test('admin login page should load', async ({ page }) => {
      await page.goto('/admin/login');
      await expect(page.locator('text=Login')).toBeVisible();
    });

    test('admin should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/admin');
      await expect(page).toHaveURL(/admin\/login/);
    });
  });

  test.describe('API Health', () => {
    test('backend should be healthy', async ({ request }) => {
      const response = await request.get('http://localhost:3001/api');
      expect(response.status()).toBe(200);
    });
  });
});