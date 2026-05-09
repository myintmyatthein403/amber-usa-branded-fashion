# Refactoring Plan: Project "MiniMax 2.5"

This plan transitions the `@packages/shared` schemas from "General Data Containers" to "Strict Business Rule Enforcers." It addresses logical flaws, removes redundancies, and ensures the codebase adheres to a 200-line-per-file limit.

## Module Overview

| Module Name | Responsibility | Specific Edge Cases to Address |
| :--- | :--- | :--- |
| `primitives.ts` | Centralized Zod primitives for Slugs, Prices, and Dates. | **Slug:** Regex check `/^[a-z0-9-]+$/`. **Price:** `z.coerce.number().min(0)`. **Date:** `z.string().datetime()`. |
| `variant.schema.ts` | Single source of truth for Variant properties. | Ensures `sku` is trimmed and unique; handles `barcode` as nullable; links `isPreOrder` to `shippingDate`. |
| `product.base.ts` | Shared core product properties (name, status, descriptions). | Enforces that `status` is never empty and defaults to `DRAFT`. |
| `product.input.ts` | Validation for **Create/Update** operations. | Uses `categoryId` (ID-only). Ensures `preOrderShippingDate` exists if `isPreOrder` is true. |
| `product.view.ts` | Definition for **API Responses** (includes relations). | Handles optional nested `category` and `brand` objects for frontend consumption. |
| `product.filters.ts` | Query parameter validation for search/filtering. | Uses `z.coerce.number()` for `page` and `limit` to handle URL string inputs automatically. |

---

## Step-by-Step Execution Instructions

Execute these steps sequentially. Do not move to the next step until the `@packages/shared` build passes (`npm run build`).

### Step 1: Establish Primitives
Create `packages/shared/src/primitives.ts`.
1. Move price logic here: `export const PriceSchema = z.coerce.number().min(0)`.
2. Move slug logic: `export const SlugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format')`.
3. Move date logic: `export const IsoDateSchema = z.string().datetime('Invalid ISO date')`.

### Step 2: Extract & Consolidate Variants
Create `packages/shared/src/variant.schema.ts`.
1. Consolidate the versions from `product.schema.ts` and `logistics.schema.ts` into a single `VariantSchema`.
2. **Edge Case Fix:** Add a `.refine()` check: If `isPreOrder` is true, `preOrderShippingDate` cannot be null.

### Step 3: Decouple Product Input from Product View
Modify `packages/shared/src/product.schema.ts` (or split into multiple files if lines exceed 200).
1. Rename `ProductSchema` to `ProductBaseSchema`.
2. Create `CreateProductSchema` which extends the base but **only** includes `categoryId`, `brandId`, and `saleId` as UUID strings (remove the nested objects).
3. Create `ProductViewSchema` which includes the nested objects for the frontend.

### Step 4: Refactor Logistics Alignment
Modify `packages/shared/src/logistics.schema.ts`.
1. Delete the local `VariantSchema`.
2. Import the consolidated `VariantSchema` from the new `variant.schema.ts`.
3. Update `InventorySchema` to strictly use `uuid()` for both `variantId` and `warehouseId`.

### Step 5: Clean Up & Export
1. Update `packages/shared/src/index.ts` to export all new modular files.
2. Remove any `any` or `unknown` types in `api.schema.ts` that were masking structural issues.
3. Run `npm run build` in the shared package to verify integrity.

---

## Logic Separation (Framework vs. Business)

| Logic Type | Old Location (Framework/Mixed) | New Location (Business Logic) |
| :--- | :--- | :--- |
| **Type Coercion** | Handled manually in Controllers. | Handled in `primitives.ts` via Zod Coerce. |
| **Slug Formatting** | Logic duplicated in Frontend and Admin. | Centralized in `SlugSchema`. |
| **Pre-order Validation** | Checked in Backend Service layer. | Enforced in `product.input.ts` schema refinement. |
| **Stock Calculation** | Mixed between UI state and API. | Clearly separated: `ViewSchema` shows computed stock, `InputSchema` does not allow direct stock injection. |
