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
import { GiftCardsService } from './gift-cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { GiftCardSchema } from '@amber/shared';
import type { z } from 'zod';

type CreateGiftCardInput = z.infer<typeof GiftCardSchema>;

@Controller('gift-cards')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) {}

  @Post()
  create(@Body(new ZodValidationPipe(GiftCardSchema)) data: CreateGiftCardInput) {
    return this.giftCardsService.create(data);
  }

  @Get()
  findAll() {
    return this.giftCardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.giftCardsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(GiftCardSchema.partial())) data: Partial<CreateGiftCardInput>,
  ) {
    return this.giftCardsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.giftCardsService.remove(id);
  }
}
