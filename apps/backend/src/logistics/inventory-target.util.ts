import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface InventoryTarget {
  variantId?: string | null;
  productId?: string | null;
}

export function assertValidTarget(target: InventoryTarget): void {
  const hasVariant = !!target.variantId;
  const hasProduct = !!target.productId;
  if (hasVariant === hasProduct) {
    throw new BadRequestException(
      'Exactly one of variantId or productId must be provided.',
    );
  }
}

// Prisma generates distinct compound-unique input shapes for
// variantId_warehouseId vs productId_warehouseId — there is no way to
// address "either" generically, so this picks the right one per target.
export function inventoryUniqueWhere(target: InventoryTarget, warehouseId: string) {
  return target.variantId
    ? { variantId_warehouseId: { variantId: target.variantId, warehouseId } }
    : { productId_warehouseId: { productId: target.productId as string, warehouseId } };
}

export function inventoryFilterWhere(target: InventoryTarget) {
  return target.variantId
    ? { variantId: target.variantId }
    : { productId: target.productId };
}

// The one place both the logistics module and the products module need to
// agree: recompute the cached total from Inventory rows and write it back to
// Variant.stock or Product.stock. Previously implemented independently in
// both modules (logistics.repository.ts's syncCachedStock and
// products.repository.ts's syncVariantInventory/syncProductInventory) —
// consolidated here so a future change to this invariant only needs to
// happen once.
export async function recomputeAndSyncStock(
  tx: Prisma.TransactionClient,
  target: InventoryTarget,
): Promise<number> {
  const totalStock = await tx.inventory.aggregate({
    where: inventoryFilterWhere(target),
    _sum: { quantity: true },
  });
  const total = totalStock._sum.quantity ?? 0;

  if (target.variantId) {
    await tx.variant.update({ where: { id: target.variantId }, data: { stock: total } });
  } else {
    await tx.product.update({
      where: { id: target.productId as string },
      data: { stock: total },
    });
  }

  return total;
}
