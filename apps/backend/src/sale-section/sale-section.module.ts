import { Module } from '@nestjs/common';
import { SaleSectionService } from './sale-section.service';
import { SaleSectionController } from './sale-section.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SaleSectionController],
  providers: [SaleSectionService],
})
export class SaleSectionModule {}
