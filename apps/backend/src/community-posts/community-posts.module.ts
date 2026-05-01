import { Module } from '@nestjs/common';
import { CommunityPostsService } from './community-posts.service';
import { CommunityPostsController } from './community-posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommunityPostsRepository } from './community-posts.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CommunityPostsController],
  providers: [CommunityPostsService, CommunityPostsRepository],
  exports: [CommunityPostsService, CommunityPostsRepository],
})
export class CommunityPostsModule {}
