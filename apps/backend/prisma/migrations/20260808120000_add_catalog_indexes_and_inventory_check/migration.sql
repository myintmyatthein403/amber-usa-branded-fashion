-- Catalog audit hardening: indexes on every FK/filter/sort column that is
-- actually used in WHERE/ORDER BY across products, orders, and logistics
-- queries, plus a DB-level backstop against negative inventory.
-- Purely additive: no column/type changes, safe on existing data.

-- Order
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_warehouseId_idx" ON "Order"("warehouseId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- OrderItem
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- Product
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");
CREATE INDEX "Product_saleId_idx" ON "Product"("saleId");
CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "Product_visibility_idx" ON "Product"("visibility");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- Review
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- Category
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- Variant
CREATE INDEX "Variant_productId_idx" ON "Variant"("productId");

-- Inventory (variantId/productId already covered by the compound unique
-- indexes; warehouseId alone is not)
CREATE INDEX "Inventory_warehouseId_idx" ON "Inventory"("warehouseId");

-- CargoItem
CREATE INDEX "CargoItem_shipmentId_idx" ON "CargoItem"("shipmentId");
CREATE INDEX "CargoItem_variantId_idx" ON "CargoItem"("variantId");
CREATE INDEX "CargoItem_productId_idx" ON "CargoItem"("productId");

-- StockMovement
CREATE INDEX "StockMovement_variantId_idx" ON "StockMovement"("variantId");
CREATE INDEX "StockMovement_productId_idx" ON "StockMovement"("productId");
CREATE INDEX "StockMovement_fromWarehouseId_idx" ON "StockMovement"("fromWarehouseId");
CREATE INDEX "StockMovement_toWarehouseId_idx" ON "StockMovement"("toWarehouseId");
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- SavedAddress
CREATE INDEX "SavedAddress_userId_idx" ON "SavedAddress"("userId");

-- WishlistItem
CREATE INDEX "WishlistItem_productId_idx" ON "WishlistItem"("productId");

-- Backstop against negative stock slipping through application-level guards
-- (belt-and-suspenders alongside the guarded updateMany pattern used in
-- orders.repository.ts and logistics.repository.ts).
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_quantity_non_negative" CHECK ("quantity" >= 0);
