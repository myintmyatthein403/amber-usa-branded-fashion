# Amber Brand Fashion - Project Context

## Project Overview
Amber Brand Fashion is a modern, high-end e-commerce and logistics platform tailored for a Myanmar-based brand dealing in USA premium brands. It features a robust monorepo architecture designed to handle retail sales, complex logistics (USA-to-Myanmar cargo tracking), and dynamic content management.

### Key Technologies
- **Monorepo:** Managed via npm workspaces.
- **Backend:** NestJS (Node.js framework) with Prisma ORM.
- **Frontend Storefront:** Next.js (App Router) using Tailwind CSS and Framer Motion.
- **Admin Management Portal:** Vite + React + TypeScript with Zustand for state management.
- **Shared Package:** `@amber/shared` containing Zod schemas and TypeScript types used across all applications.
- **Database:** PostgreSQL.
- **Integrations:** Stripe (Payments), Cloudinary (Media), and OAuth (Google/GitHub).

---

## Directory Structure
- `apps/backend/`: NestJS server with modules for auth, orders, products, logistics, etc.
- `apps/admin/`: React-based administration portal with Role-Based Access Control (RBAC).
- `apps/frontend/`: Next.js storefront for customers.
- `packages/shared/`: Common validation schemas and type definitions.
- `docker-compose.yml`: Local infrastructure (PostgreSQL).

---

## Building and Running

### Prerequisites
- Node.js (v18+)
- Docker (for database)

### Global Commands (from root)
- **Install dependencies:** `npm install`
- **Build all packages:** `npm run build` (runs build in all workspaces)
- **Development Mode:** `npm run dev` (starts all services concurrently)
- **Setup Database:** `npm run db:up`

### App-Specific Commands
#### Backend (`apps/backend`)
- **Generate Prisma Client:** `npm run prisma:generate`
- **Database Migration:** `npm run prisma:migrate`
- **Seed Data:** `npm run prisma:seed`
- **Swagger Docs:** Available at `http://localhost:3001/docs` in dev mode.

#### Shared Package (`packages/shared`)
- **Build Types:** `npm run build` (Required after schema changes)

---

## Development Conventions

### 1. Data Validation & Types
- **Always** define data structures in `packages/shared` using Zod.
- Use these schemas on the backend for validation (via `ValidationPipe`) and on the frontend/admin for form handling and type safety.

### 2. Backend Architecture
- Follow the standard NestJS module-service-controller pattern.
- Use Prisma for all database interactions.
- Global prefix is `/api`.

### 3. Admin Permissions (RBAC)
- Permissions are defined as strings (e.g., `products:read`, `orders:manage`).
- The `AdminLayout` and `App.tsx` in the admin app enforce tab visibility and access based on these strings.

### 4. Media Management
- Images are handled via the `MediaModule` which integrates with Cloudinary.
- Always use the `apiService` for uploads to ensure metadata is tracked in the database.

### 5. Logistics Workflow
- The system distinguishes between `Warehouse` (USA vs. Myanmar) and tracks `CargoShipment` status.
- Inventory is tracked per `Variant` at specific `Warehouse` locations.

---

## TODOs / Future Enhancements
- [ ] Implement automated testing (Jest) across all apps.
- [ ] Finalize Stripe webhook handlers for all order edge cases.
- [ ] Enhance SEO metadata dynamic generation for product pages.
