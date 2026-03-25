import { Module } from '@nestjs/common';
import { GiftCardSectionService } from './gift-card-section.service';
import { GiftCardSectionController } from './gift-card-section.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GiftCardSectionController],
  providers: [GiftCardSectionService],
})
export class GiftCardSectionModule {}
