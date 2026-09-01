import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdersRepository } from './orders.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CouponsRepository } from '../coupons/coupons.repository';

// A minimal transaction-client stub whose methods are jest.fn()s the tests
// configure per-case. $transaction just invokes the callback with this
// stub, close enough to Prisma's real behavior to exercise the
// guarded-updateMany branches without a real database.
function makeTx() {
  return {
    order: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    inventory: {
      updateMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    variant: { updateMany: jest.fn(), update: jest.fn() },
    product: { updateMany: jest.fn(), update: jest.fn() },
  };
}

describe('OrdersRepository', () => {
  let repository: OrdersRepository;
  let prisma: { $transaction: jest.Mock; __tx: ReturnType<typeof makeTx> };

  beforeEach(async () => {
    const tx = makeTx();
    prisma = {
      $transaction: jest.fn((cb: any) => cb(tx)),
      __tx: tx,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersRepository,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: CouponsRepository, useValue: { redeem: jest.fn() } },
      ],
    }).compile();

    repository = module.get<OrdersRepository>(OrdersRepository);
  });

  describe('restock (doRestock double-restock guard)', () => {
    it('claims the restock atomically and increments inventory when the claim succeeds', async () => {
      const tx = prisma.__tx;
      tx.order.findUnique.mockResolvedValue({
        id: 'order-1',
        warehouseId: 'wh-1',
        restocked: false,
        items: [
          { variantId: 'v-1', productId: 'p-1', quantity: 2, isPreOrder: false, isDigital: false },
        ],
      });
      tx.order.updateMany.mockResolvedValue({ count: 1 });

      await repository.restock('order-1');

      expect(tx.order.updateMany).toHaveBeenCalledWith({
        where: { id: 'order-1', restocked: false },
        data: { restocked: true },
      });
      expect(tx.inventory.update).toHaveBeenCalledWith({
        where: { variantId_warehouseId: { variantId: 'v-1', warehouseId: 'wh-1' } },
        data: { quantity: { increment: 2 } },
      });
      expect(tx.variant.update).toHaveBeenCalledWith({
        where: { id: 'v-1' },
        data: { stock: { increment: 2 } },
      });
    });

    it('does not touch inventory when the restock claim loses the race', async () => {
      const tx = prisma.__tx;
      tx.order.findUnique.mockResolvedValue({
        id: 'order-1',
        warehouseId: 'wh-1',
        restocked: false,
        items: [
          { variantId: 'v-1', productId: 'p-1', quantity: 2, isPreOrder: false, isDigital: false },
        ],
      });
      // Another concurrent caller (e.g. a payment-failure webhook racing an
      // admin cancel) already flipped restocked -> true first.
      tx.order.updateMany.mockResolvedValue({ count: 0 });

      await repository.restock('order-1');

      expect(tx.inventory.update).not.toHaveBeenCalled();
      expect(tx.variant.update).not.toHaveBeenCalled();
    });

    it('does nothing if the order does not exist', async () => {
      const tx = prisma.__tx;
      tx.order.findUnique.mockResolvedValue(null);

      await repository.restock('missing-order');

      expect(tx.order.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('bulkUpdateStatus', () => {
    it('restocks orders being cancelled that are not already cancelled', async () => {
      const tx = prisma.__tx;
      tx.order.findUnique
        .mockResolvedValueOnce({ status: 'PROCESSING' }) // bulkUpdateStatus's own lookup
        .mockResolvedValueOnce({
          id: 'id-1',
          warehouseId: 'wh-1',
          restocked: false,
          items: [],
        }); // doRestock's internal lookup
      tx.order.updateMany.mockResolvedValue({ count: 1 });

      await repository.bulkUpdateStatus(['id-1'], 'CANCELLED');

      expect(tx.order.updateMany).toHaveBeenCalledWith({
        where: { id: 'id-1', restocked: false },
        data: { restocked: true },
      });
      expect(tx.order.update).toHaveBeenCalledWith({
        where: { id: 'id-1' },
        data: { status: 'CANCELLED' },
      });
    });

    it('skips restock for an order that is already cancelled', async () => {
      const tx = prisma.__tx;
      tx.order.findUnique.mockResolvedValueOnce({ status: 'CANCELLED' });

      await repository.bulkUpdateStatus(['id-2'], 'CANCELLED');

      expect(tx.order.updateMany).not.toHaveBeenCalled();
      expect(tx.order.update).toHaveBeenCalledWith({
        where: { id: 'id-2' },
        data: { status: 'CANCELLED' },
      });
    });

    it('does not check restock status for a non-cancellation bulk update', async () => {
      const tx = prisma.__tx;

      await repository.bulkUpdateStatus(['id-3'], 'PROCESSING');

      expect(tx.order.findUnique).not.toHaveBeenCalled();
      expect(tx.order.updateMany).not.toHaveBeenCalled();
      expect(tx.order.update).toHaveBeenCalledWith({
        where: { id: 'id-3' },
        data: { status: 'PROCESSING' },
      });
    });
  });

  describe('create (guarded stock decrements)', () => {
    const baseItem = {
      variantId: 'v-1',
      productId: 'p-1',
      quantity: 5,
      name: 'Test Item',
      isPreOrder: false,
    };

    it('throws when the per-warehouse inventory guard finds insufficient stock', async () => {
      const tx = prisma.__tx;
      tx.inventory.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        repository.create({} as any, 'wh-1', [baseItem], 100),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(tx.variant.updateMany).not.toHaveBeenCalled();
    });

    it('throws when the cached Variant.stock guard finds insufficient total stock', async () => {
      const tx = prisma.__tx;
      tx.inventory.updateMany.mockResolvedValue({ count: 1 });
      tx.variant.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        repository.create({} as any, 'wh-1', [baseItem], 100),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(tx.order.create).not.toHaveBeenCalled();
    });

    it('proceeds to create the order once both stock guards pass', async () => {
      const tx = prisma.__tx;
      tx.inventory.updateMany.mockResolvedValue({ count: 1 });
      tx.variant.updateMany.mockResolvedValue({ count: 1 });
      tx.order.create.mockResolvedValue({ id: 'order-new' });

      const result = await repository.create(
        { currency: 'USD', shippingAddress: 'addr', paymentMethod: 'stripe' } as any,
        'wh-1',
        [baseItem],
        100,
      );

      expect(result).toEqual({ id: 'order-new' });
      expect(tx.order.create).toHaveBeenCalledTimes(1);
    });
  });
});
