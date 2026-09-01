import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LogisticsRepository } from './logistics.repository';
import { PrismaService } from '../prisma/prisma.service';

// See orders.repository.spec.ts for the same pattern: a jest.fn()-based tx
// stub that $transaction hands to the callback, close enough to Prisma's
// real transaction semantics to exercise the guarded-updateMany races
// without a real database.
function makeTx() {
  return {
    inventory: {
      updateMany: jest.fn(),
      upsert: jest.fn(),
      aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 0 } }),
      findUnique: jest.fn(),
    },
    variant: { update: jest.fn() },
    product: { update: jest.fn() },
    cargoShipment: { update: jest.fn() },
    stockMovement: { create: jest.fn() },
  };
}

describe('LogisticsRepository', () => {
  let repository: LogisticsRepository;
  let prisma: { $transaction: jest.Mock; __tx: ReturnType<typeof makeTx> };

  beforeEach(async () => {
    const tx = makeTx();
    prisma = {
      $transaction: jest.fn((cb: any) => cb(tx)),
      __tx: tx,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LogisticsRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<LogisticsRepository>(LogisticsRepository);
  });

  describe('transferInventory', () => {
    it('throws and never credits the destination when origin stock is insufficient', async () => {
      const tx = prisma.__tx;
      tx.inventory.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        repository.transferInventory({ variantId: 'v-1' }, 'wh-a', 'wh-b', 10),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(tx.inventory.upsert).not.toHaveBeenCalled();
    });

    it('decrements origin and credits destination atomically when stock is sufficient', async () => {
      const tx = prisma.__tx;
      tx.inventory.updateMany.mockResolvedValue({ count: 1 });

      await repository.transferInventory({ variantId: 'v-1' }, 'wh-a', 'wh-b', 10);

      expect(tx.inventory.updateMany).toHaveBeenCalledWith({
        where: { variantId: 'v-1', warehouseId: 'wh-a', quantity: { gte: 10 } },
        data: { quantity: { decrement: 10 } },
      });
      expect(tx.inventory.upsert).toHaveBeenCalledWith({
        where: { variantId_warehouseId: { variantId: 'v-1', warehouseId: 'wh-b' } },
        update: { quantity: { increment: 10 } },
        create: { variantId: 'v-1', warehouseId: 'wh-b', quantity: 10 },
      });
      expect(tx.variant.update).toHaveBeenCalled(); // recomputeAndSyncStock
    });
  });

  describe('bulkTransferInventory', () => {
    it('stops processing once an item mid-batch has insufficient stock', async () => {
      const tx = prisma.__tx;
      tx.inventory.updateMany
        .mockResolvedValueOnce({ count: 1 }) // item 1 succeeds
        .mockResolvedValueOnce({ count: 0 }); // item 2 fails

      await expect(
        repository.bulkTransferInventory(
          [
            { variantId: 'v-1', quantity: 5 },
            { variantId: 'v-2', quantity: 5 },
          ],
          'wh-a',
          'wh-b',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      // Item 1's StockMovement was logged before item 2 threw. Real Prisma
      // rolls the entire transaction back on this rejection (that's the
      // actual atomicity guarantee) — this just confirms item 2 never got
      // far enough to log its own movement, i.e. processing genuinely
      // stopped rather than silently continuing past the failure.
      expect(tx.stockMovement.create).toHaveBeenCalledTimes(1);
    });

    it('logs one StockMovement per item when every item succeeds', async () => {
      const tx = prisma.__tx;
      tx.inventory.updateMany.mockResolvedValue({ count: 1 });

      await repository.bulkTransferInventory(
        [
          { variantId: 'v-1', quantity: 5 },
          { variantId: 'v-2', quantity: 3 },
        ],
        'wh-a',
        'wh-b',
      );

      expect(tx.stockMovement.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateCargoWithInventory', () => {
    it('throws on insufficient origin stock and never updates the shipment', async () => {
      const tx = prisma.__tx;
      tx.inventory.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        repository.updateCargoWithInventory(
          'cargo-1',
          { status: 'DEPARTED' } as any,
          [{ variantId: 'v-1', warehouseId: 'wh-a', quantity: -5 }],
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(tx.cargoShipment.update).not.toHaveBeenCalled();
    });

    it('credits the destination warehouse and updates the shipment for a positive delta', async () => {
      const tx = prisma.__tx;
      tx.cargoShipment.update.mockResolvedValue({ id: 'cargo-1' });

      await repository.updateCargoWithInventory(
        'cargo-1',
        { status: 'ARRIVED_MYANMAR' } as any,
        [{ variantId: 'v-1', warehouseId: 'wh-b', quantity: 5 }],
      );

      expect(tx.inventory.upsert).toHaveBeenCalledWith({
        where: { variantId_warehouseId: { variantId: 'v-1', warehouseId: 'wh-b' } },
        update: { quantity: { increment: 5 } },
        create: { variantId: 'v-1', warehouseId: 'wh-b', quantity: 5 },
      });
      expect(tx.cargoShipment.update).toHaveBeenCalled();
    });

    it('rolls back (throws) the whole update when a mid-batch item is insufficient', async () => {
      const tx = prisma.__tx;
      tx.inventory.updateMany
        .mockResolvedValueOnce({ count: 1 }) // first item's origin deduction succeeds
        .mockResolvedValueOnce({ count: 0 }); // second item's origin deduction fails

      await expect(
        repository.updateCargoWithInventory(
          'cargo-1',
          { status: 'DEPARTED' } as any,
          [
            { variantId: 'v-1', warehouseId: 'wh-a', quantity: -5 },
            { variantId: 'v-2', warehouseId: 'wh-a', quantity: -5 },
          ],
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(tx.cargoShipment.update).not.toHaveBeenCalled();
    });
  });
});
