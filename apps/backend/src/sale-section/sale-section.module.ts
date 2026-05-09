import { Module } from '@nestjs/common';
import { SaleSectionService } from './sale-section.service';
import { SaleSectionRepository } from './sale-section.repository';
import { SaleSectionController } from './sale-section.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SaleSectionController],
  providers: [SaleSectionService, SaleSectionRepository],
})
export class SaleSectionModule {}
