import { Module } from '@nestjs/common';
import { VariantsService } from './variants.service';
import { VariantsController } from './variants.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { VariantsRepository } from './variants.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [VariantsController],
  providers: [VariantsService, VariantsRepository],
  exports: [VariantsService, VariantsRepository],
})
export class VariantsModule {}
