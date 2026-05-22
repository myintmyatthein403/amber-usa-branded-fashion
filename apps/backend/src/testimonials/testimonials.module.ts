import { Module } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TestimonialsRepository } from './testimonials.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TestimonialsController],
  providers: [TestimonialsService, TestimonialsRepository],
})
export class TestimonialsModule {}
