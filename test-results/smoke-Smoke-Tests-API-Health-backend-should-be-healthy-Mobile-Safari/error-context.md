# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Smoke Tests >> API Health >> backend should be healthy
- Location: e2e/smoke.spec.ts:35:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Smoke Tests', () => {
  4  |   test.describe('Storefront', () => {
  5  |     test('homepage should load without errors', async ({ page }) => {
  6  |       await page.goto('/');
  7  |       await expect(page).toHaveTitle(/Amber/i);
  8  |     });
  9  | 
  10 |     test('navigation should work', async ({ page }) => {
  11 |       await page.goto('/');
  12 |       await page.click('text=Shop');
  13 |       await expect(page).toHaveURL(/shop/);
  14 |     });
  15 | 
  16 |     test('product listing should load', async ({ page }) => {
  17 |       await page.goto('/shop');
  18 |       await expect(page.locator('text=Products')).toBeVisible({ timeout: 10000 });
  19 |     });
  20 |   });
  21 | 
  22 |   test.describe('Admin Portal', () => {
  23 |     test('admin login page should load', async ({ page }) => {
  24 |       await page.goto('/admin/login');
  25 |       await expect(page.locator('text=Login')).toBeVisible();
  26 |     });
  27 | 
  28 |     test('admin should redirect to login when not authenticated', async ({ page }) => {
  29 |       await page.goto('/admin');
  30 |       await expect(page).toHaveURL(/admin\/login/);
  31 |     });
  32 |   });
  33 | 
  34 |   test.describe('API Health', () => {
  35 |     test('backend should be healthy', async ({ request }) => {
  36 |       const response = await request.get('http://localhost:3001/api');
> 37 |       expect(response.status()).toBe(200);
     |                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  38 |     });
  39 |   });
  40 | });
```