import { Module } from '@nestjs/common';
import { GiftCardSectionService } from './gift-card-section.service';
import { GiftCardSectionRepository } from './gift-card-section.repository';
import { GiftCardSectionController } from './gift-card-section.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GiftCardSectionController],
  providers: [GiftCardSectionService, GiftCardSectionRepository],
})
export class GiftCardSectionModule {}
