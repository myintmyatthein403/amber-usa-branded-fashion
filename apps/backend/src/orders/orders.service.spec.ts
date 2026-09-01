import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { PrismaService } from '../prisma/prisma.service';
import { ExchangeRateHelper } from '../currencies/exchange-rate.helper';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CouponsService } from '../coupons/coupons.service';
import { PriceTiersService } from '../price-tiers/price-tiers.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: jest.Mocked<Pick<OrdersRepository,
    'findById' | 'updateStatus' | 'restock' | 'restockWithTransaction' | 'updatePaymentStatus' | 'bulkUpdateStatus'
  >>;
  let prisma: { $transaction: jest.Mock };

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
      restock: jest.fn(),
      restockWithTransaction: jest.fn(),
      updatePaymentStatus: jest.fn(),
      bulkUpdateStatus: jest.fn(),
    } as any;

    prisma = { $transaction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: repository },
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: ExchangeRateHelper, useValue: { getRateForOrder: jest.fn() } },
        { provide: CloudinaryService, useValue: { uploadFile: jest.fn() } },
        { provide: CouponsService, useValue: { validateAndCompute: jest.fn(), redeemCoupon: jest.fn() } },
        { provide: PriceTiersService, useValue: { getApplicablePrice: jest.fn().mockResolvedValue(null) } },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('updateOrderStatus (cancellation restock)', () => {
    it('restocks when cancelling an order that is not already cancelled', async () => {
      repository.findById.mockResolvedValue({ id: 'o1', status: 'PROCESSING' } as any);
      repository.updateStatus.mockResolvedValue({ id: 'o1', status: 'CANCELLED' } as any);

      await service.updateOrderStatus('o1', 'CANCELLED');

      expect(repository.restock).toHaveBeenCalledWith('o1');
    });

    it('does not restock when the order is already cancelled', async () => {
      repository.findById.mockResolvedValue({ id: 'o1', status: 'CANCELLED' } as any);
      repository.updateStatus.mockResolvedValue({ id: 'o1', status: 'CANCELLED' } as any);

      await service.updateOrderStatus('o1', 'CANCELLED');

      expect(repository.restock).not.toHaveBeenCalled();
    });

    it('does not restock for a non-cancellation status change', async () => {
      repository.findById.mockResolvedValue({ id: 'o1', status: 'PROCESSING' } as any);
      repository.updateStatus.mockResolvedValue({ id: 'o1', status: 'DELIVERING' } as any);

      await service.updateOrderStatus('o1', 'DELIVERING');

      expect(repository.restock).not.toHaveBeenCalled();
    });
  });

  describe('updatePaymentStatus (payment-failure restock)', () => {
    it('marks the order FAILED and restocks inside one transaction', async () => {
      const tx = { order: { update: jest.fn().mockResolvedValue({}) } };
      prisma.$transaction.mockImplementation((cb: any) => cb(tx));
      repository.findById
        .mockResolvedValueOnce({ id: 'o1', paymentStatus: 'PENDING' } as any) // initial lookup
        .mockResolvedValueOnce({ id: 'o1', paymentStatus: 'FAILED' } as any); // final return

      await service.updatePaymentStatus('o1', 'FAILED');

      expect(tx.order.update).toHaveBeenCalledWith({
        where: { id: 'o1' },
        data: { paymentStatus: 'FAILED' },
      });
      expect(repository.restockWithTransaction).toHaveBeenCalledWith(tx, 'o1');
    });

    it('does not restock when the order is already FAILED', async () => {
      repository.findById.mockResolvedValue({ id: 'o1', paymentStatus: 'FAILED' } as any);

      await service.updatePaymentStatus('o1', 'FAILED');

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(repository.restockWithTransaction).not.toHaveBeenCalled();
      expect(repository.updatePaymentStatus).toHaveBeenCalledWith('o1', 'FAILED');
    });

    it('reverts the payment status and throws if the transaction fails', async () => {
      prisma.$transaction.mockRejectedValue(new Error('db error'));
      repository.findById.mockResolvedValue({ id: 'o1', paymentStatus: 'PENDING' } as any);

      await expect(service.updatePaymentStatus('o1', 'FAILED')).rejects.toThrow(
        'Failed to process payment failure: stock rollback failed',
      );

      expect(repository.updatePaymentStatus).toHaveBeenCalledWith('o1', 'PENDING');
    });

    it('does a plain status update for non-FAILED transitions', async () => {
      repository.findById.mockResolvedValue({ id: 'o1', paymentStatus: 'PENDING' } as any);

      await service.updatePaymentStatus('o1', 'PAID');

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(repository.updatePaymentStatus).toHaveBeenCalledWith('o1', 'PAID');
    });
  });

  describe('bulkUpdateStatus', () => {
    it('delegates to the repository (which owns the restock-on-cancel logic)', async () => {
      await service.bulkUpdateStatus(['o1', 'o2'], 'CANCELLED');

      expect(repository.bulkUpdateStatus).toHaveBeenCalledWith(['o1', 'o2'], 'CANCELLED');
    });
  });
});
