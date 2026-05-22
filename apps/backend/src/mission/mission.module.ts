import { Module } from '@nestjs/common';
import { MissionService } from './mission.service';
import { MissionController } from './mission.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MissionRepository } from './mission.repository';

@Module({
  imports: [PrismaModule],
  controllers: [MissionController],
  providers: [MissionService, MissionRepository],
  exports: [MissionService, MissionRepository],
})
export class MissionModule {}
