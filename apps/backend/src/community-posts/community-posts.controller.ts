import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CommunityPostsService } from './community-posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CommunityPostSchema } from '@amber/shared';
import type { z } from 'zod';

type CreateCommunityPostInput = z.infer<typeof CommunityPostSchema>;

@Controller('community-posts')
export class CommunityPostsController {
  constructor(private readonly communityPostsService: CommunityPostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  create(@Body(new ZodValidationPipe(CommunityPostSchema)) data: CreateCommunityPostInput) {
    return this.communityPostsService.create(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  findAll() {
    return this.communityPostsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.communityPostsService.findActive();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CommunityPostSchema.partial())) data: Partial<CreateCommunityPostInput>,
  ) {
    return this.communityPostsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  remove(@Param('id') id: string) {
    return this.communityPostsService.remove(id);
  }
}
