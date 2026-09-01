import { Module } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { ReturnsRepository } from './returns.repository';
import { ReturnsController } from './returns.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LogisticsModule } from '../logistics/logistics.module';

@Module({
  imports: [PrismaModule, AuthModule, LogisticsModule],
  controllers: [ReturnsController],
  providers: [ReturnsService, ReturnsRepository],
  exports: [ReturnsService],
})
export class ReturnsModule {}
