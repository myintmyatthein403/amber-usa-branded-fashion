# Project Stabilization Plan: Resolving Smoke Test Failures

The current smoke test failures across all environments (Storefront, Admin, and API) indicate a **systemic backend infrastructure failure**. The root cause is likely the `ECONNREFUSED` error encountered earlier, where the NestJS backend fails to connect to the PostgreSQL database during initialization.

---

## Phase 1: Database & Infrastructure Verification
- **Container Health:** Verify that the `amber_postgres` container is not just "Running" but "Healthy." The current `docker-compose.yml` lacks a health check, which can lead to the backend starting before the DB is ready to accept connections.
- **Connectivity:** Ensure the `DATABASE_URL` in `apps/backend/.env` correctly targets `localhost:5432` and that no other process is conflicting with this port.

## Phase 2: Backend Connection Resilience
- **Implement Retry Logic:** Modify the `PrismaService` to implement a "Wait-and-Retry" strategy. Instead of failing immediately on start, it should attempt to connect multiple times with a backoff delay.
- **Decouple Initialization:** Move the "Global Settings" check in `SettingsService` from `onModuleInit` to `onApplicationBootstrap`. This ensures the database connection is fully established by `PrismaService` before other services attempt to query it.
- **Graceful Startup:** Ensure that failure to connect to the database does not result in an unhandled exception that terminates the Node.js process.

## Phase 3: Service Health Restoration
- **API Health Endpoint:** Verify the backend's health check endpoint (likely checked by the "backend should be healthy" test). It should return a `200 OK` only after a successful database heartbeat check.
- **Dependency Order:** Manually ensure the sequence: `Database Start` -> `Database Ready` -> `Backend Start` -> `Migration Check`.

## Phase 4: Frontend & Admin Portal Verification
- **Data Dependency:** Once the API is healthy, verify that the Storefront can fetch the `active` hero and product data without timing out.
- **Navigation Recovery:** Ensure the navigation tests pass by confirming that the dynamic category/menu items are correctly returned by the stabilized backend.

## Phase 5: Verification & Regression
- **Re-run Smoke Tests:** Execute the Playwright test suite to confirm all 14+ failures turn green across Chromium, Firefox, and Webkit.
- **Log Monitoring:** Monitor `dev.log` during the startup sequence to ensure no "PrismaClientKnownRequestError" messages appear.

---

*Last Updated: May 9, 2026*
