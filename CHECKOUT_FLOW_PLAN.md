# Checkout Flow Plan: Amber Brand Fashion

This document outlines the end-to-end architecture and logical flow for the checkout system across the Frontend (Storefront), Backend (NestJS), and Admin Management Portal.

## 1. Frontend Section (Storefront)

The frontend checkout experience is a multi-step process focused on conversion and clear communication of shipping timelines (especially for USA-to-Myanmar logistics).

### User Journey
- **Step 1: Information**: Guest or Authenticated user provides shipping details (Full Name, Phone, Address, City).
- **Step 2: Shipping Method**: Selection of delivery options (Standard, Express, or Warehouse Pickup).
- **Step 3: Payment Method**: Selection of payment provider (Stripe or Manual/Bank Transfer).
- **Step 4: Final Review & Payment**: 
    - Final summary of totals (USD/MMK), taxes, and estimated delivery dates.
    - Embedded Stripe Elements for secure card processing or Manual payment instructions.

### Key Logic & State
- **Cart Sync**: Real-time validation with backend stock before allowing checkout.
- **Zustand Store**: Temporary persistence of checkout session data.
- **Stripe Integration**: 
    - Confirm payment client-side using the `PaymentIntent` client secret.
- **Success Handling**: Redirection to `/checkout/success` with automated payment verification.

---

## 2. Backend Section (NestJS & Prisma)

The backend acts as the source of truth for inventory, pricing, and payment security.

### Core Processing Flow
- **Order Initiation**:
    - Atomic stock deduction via Prisma transactions.
    - Price verification and total calculation.
- **Payment Handling**:
    - `PaymentIntent` management via `StripeService`.
- **Event-Driven Lifecycle**:
    - `order.paid`: Transitions order to `PROCESSING` and confirms inventory lock.
    - `order.payment_failed`: Automatically triggers `restock` logic.
- **Inventory Maintenance**:
    - `cleanupStaleOrders`: Automatic task to release stock from abandoned "Pending" orders (>1 hour).

---

## 3. Admin Section (Management Portal)

The Admin Portal provides the operational tools to fulfill and manage orders post-purchase.

### Order Management Workflow
- **Dashboard Tracking**: Real-time updates and unified order filtering.
- **Fulfillment**:
    - Status transitions (Processing → Delivering → Completed).
    - Assignment of carriers and tracking numbers.
- **Exception Handling**:
    - One-click Refunds: Integration with Stripe Refund API.
    - Automated Restocking: Triggered upon cancellation or refund.
