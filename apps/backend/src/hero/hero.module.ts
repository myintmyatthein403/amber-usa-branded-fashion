import { Module } from '@nestjs/common';
import { HeroService } from './hero.service';
import { HeroController } from './hero.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HeroRepository } from './hero.repository';

@Module({
  imports: [PrismaModule],
  controllers: [HeroController],
  providers: [HeroService, HeroRepository],
})
export class HeroModule {}
