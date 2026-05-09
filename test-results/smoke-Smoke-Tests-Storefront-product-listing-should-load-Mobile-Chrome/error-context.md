# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Smoke Tests >> Storefront >> product listing should load
- Location: e2e/smoke.spec.ts:16:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Products')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=Products')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - img [ref=e7]
    - heading "Amber Admin" [level=1] [ref=e10]
    - paragraph [ref=e11]: Sign in to manage your Myanmar Heritage store
  - generic [ref=e12]:
    - generic [ref=e13]:
      - generic [ref=e14]:
        - text: Email Address
        - generic [ref=e15]:
          - img [ref=e16]
          - textbox "admin@amber.com" [ref=e19]
      - generic [ref=e20]:
        - text: Password
        - generic [ref=e21]:
          - img [ref=e22]
          - textbox "••••••••" [ref=e25]
    - button "Sign In" [ref=e26]
  - paragraph [ref=e27]: Protected by Amber Brand Fashion Security. 2026.
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
> 18 |       await expect(page.locator('text=Products')).toBeVisible({ timeout: 10000 });
     |                                                   ^ Error: expect(locator).toBeVisible() failed
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
  37 |       expect(response.status()).toBe(200);
  38 |     });
  39 |   });
  40 | });
```