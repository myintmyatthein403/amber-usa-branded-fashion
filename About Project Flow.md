# About Project Flow

This document provides a high-level overview of the **Amber Brand Fashion** architecture, data flow, and development workflows.

---

## 🏗 Architecture Overview

The project is structured as a **monorepo** using NPM Workspaces, ensuring shared logic and consistent type safety across the entire stack.

### Workspace Structure
- **`apps/backend`**: A NestJS-based REST API. It serves as the single source of truth for data and business logic.
- **`apps/frontend`**: A Next.js storefront for customers. Focused on SEO, performance, and a premium shopping experience.
- **`apps/admin`**: A React/Vite dashboard for staff. Used to manage inventory, orders, products, and site content.
- **`packages/shared`**: A shared library containing Zod schemas, TypeScript interfaces, and common utilities used by both frontend and backend.

---

## 🔄 Data & Communication Flow

### 1. Schema-First Development
We use **Zod** schemas in `packages/shared` to define our data models.
- **Backend**: Uses these schemas to validate incoming request bodies (DTOs) and ensure database consistency.
- **Frontend/Admin**: Uses the same schemas for form validation and to type-check API responses.

### 2. Backend Logic (NestJS + Prisma)
The backend is modularized by domain (e.g., `ProductsModule`, `OrdersModule`, `LogisticsModule`).
- **Prisma**: Acts as the ORM to interact with the PostgreSQL database.
- **Events**: Uses `@nestjs/event-emitter` for cross-module communication (e.g., updating inventory after an order is completed).

### 3. Frontend Storefront (Next.js)
- **Data Fetching**: Primarily server-side fetching for SEO-sensitive pages (Products, Collections).
- **Authentication**: Customer auth for wishlist management and order history.

### 4. Admin Dashboard (Vite)
- **State Management**: Uses modern React patterns to handle complex CRUD operations.
- **Permissions**: Implements role-based access control (RBAC) to restrict features based on staff roles.

---

## 📦 Logistics & Inventory Flow

Amber Brand Fashion manages stock across multiple locations:
1.  **Warehouses**: Stock is tracked in separate warehouses (e.g., USA vs. Myanmar).
2.  **Cargo Shipments**: Manages the "In-Transit" state of products being shipped from the USA to Myanmar.
3.  **Product Visibility**: Products can be scoped to specific markets (USA Only, Myanmar Only, or Both).

---

## 💳 Payment Flow

The system supports a hybrid payment model:
- **Online (Stripe)**: Automated payment processing and order status updates via webhooks.
- **Manual (Transfer/QR)**: Customers upload payment proofs (images), which are then reviewed by admins in the dashboard.

---

## 🛠 Development Workflow

### Quick Start
1.  **Environment**: Copy `.env.example` in `apps/backend` to `.env`.
2.  **Database**: Run `npm run db:up` to start the PostgreSQL container.
3.  **Setup**: Run `npm install` and `npm run prisma:generate`.
4.  **Launch**: Run `npm run dev` to start all applications concurrently.

### Key Commands
- `npm run db:migrate`: Apply database schema changes.
- `npm run db:studio`: Open Prisma Studio to view/edit database records.
- `npm test`: Run unit tests for shared logic.
- `npm run test:backend`: Run backend unit and E2E tests.
