import { Module } from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { GiftCardsController } from './gift-cards.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GiftCardsRepository } from './gift-cards.repository';

@Module({
  imports: [PrismaModule],
  controllers: [GiftCardsController],
  providers: [GiftCardsService, GiftCardsRepository],
  exports: [GiftCardsService],
})
export class GiftCardsModule {}
