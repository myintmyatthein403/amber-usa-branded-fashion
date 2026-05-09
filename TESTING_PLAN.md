# Amber Brand Fashion: Comprehensive Testing Plan

This document outlines the testing strategy to ensure the reliability, security, and performance of the Amber Brand Fashion platform across all workspaces.

---

## 1. Testing Strategy Overview

We adopt a "Pyramid" approach, prioritizing fast unit tests while ensuring critical paths are covered by robust E2E tests.

| Level | Tooling | Focus |
| :--- | :--- | :--- |
| **Unit** | Vitest / Jest | Logic in `@amber/shared`, Backend Services, Frontend Hooks. |
| **Integration** | Supertest | Backend API Endpoints + Prisma Database interactions. |
| **E2E** | Playwright | Full User Journeys (Storefront & Admin Management). |
| **Visual** | Storybook / Percy | UI Components, "Awwward level" animations, and cross-browser consistency. |

---

## 2. Feature-Specific Test Cases

### 🔐 Authentication & Security
- **OAuth Flow:** Verify successful login via Google/GitHub and proper user record creation in PostgreSQL.
- **RBAC (Role-Based Access Control):** 
  - Ensure users with `products:read` cannot perform `products:delete`.
  - Validate that the `RolesGuard` correctly caches JWT payloads to optimize performance.
- **Session Management:** Test token expiration and refresh logic.

### 📦 Product & Inventory Management
- **Schema Validation:** Unit test Zod refinements in `@amber/shared` (e.g., `preOrderShippingDate` requirements).
- **Variant Logic:** Ensure SKU uniqueness and proper weight calculation for shipping.
- **Stock Tracking:** 
  - Verify atomic stock deductions during the checkout process.
  - Test the "Low Stock Threshold" alert system for Admin notifications.

### 🚚 Logistics (USA-to-Myanmar)
- **Warehouse Management:** Verify inventory is tracked correctly per specific location (USA vs. Myanmar).
- **Cargo Shipment Workflow:**
  - Test state transitions: `PREPARING` -> `DEPARTED` -> `ARRIVED_MYANMAR`.
  - **Critical Test:** Verify that inventory is automatically deducted from the USA warehouse and added to the Myanmar warehouse upon shipment completion.
- **Tracking:** Ensure tracking numbers are correctly linked to external carrier APIs.

### 💳 Checkout & Payments
- **Stripe Integration:**
  - Mock successful and failed payment intents.
  - **Webhook Testing:** Verify that the backend correctly updates `PaymentStatus` to `PAID` upon receiving the `payment_intent.succeeded` event.
- **Dual Currency:** Test the conversion accuracy between USD and MMK using the global `usdToMmkRate`.
- **Atomic Transactions:** Ensure that if a database write fails after payment, the stock is not erroneously deducted.

### 🎨 UI/UX & Animations
- **Inertia Scrolling:** Manually verify Lenis scroll performance on high-refresh-rate displays.
- **Animation Orchestration:** Use Playwright to ensure `AnimatePresence` layout transitions complete without visual glitching.
- **Responsive Design:** Validate that the "Acheik Pattern" background and complex hero compositions scale gracefully from 320px to 4K.

---

## 3. Execution Environment

### 🛠️ Local Development
- Run `npm run test` from the root to execute all workspace unit tests.
- Use `npm run db:test:up` to spin up a dedicated Docker container for integration tests.

### 🏗️ CI/CD Pipeline (GitHub Actions)
1. **Linting:** Check coding standards across all workspaces.
2. **Build:** Verify shared package types and app builds.
3. **Unit Tests:** Execute the full test suite.
4. **E2E Smoke Tests:** Run critical path tests (Login, Add to Cart, Admin Login) in a headless browser.

---

## 4. Manual Testing Checklist

| Area | Feature | Expected Result |
| :--- | :--- | :--- |
| **Admin** | Media Upload | Image appears in gallery and is optimized via Cloudinary. |
| **Frontend** | Quick Buy | Drawer opens with correct variant data and no layout shift. |
| **Logistics** | Cargo Manifest | Bulk SKU input correctly maps to existing variants. |
| **Mobile** | Navigation | Hamburger menu handles nested categories with fluid transitions. |

---

*Authored: May 9, 2026*
