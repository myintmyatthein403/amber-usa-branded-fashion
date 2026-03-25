import { Module } from '@nestjs/common';
import { FooterSectionService } from './footer-section.service';
import { FooterSectionController } from './footer-section.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FooterSectionController],
  providers: [FooterSectionService],
})
export class FooterSectionModule {}
