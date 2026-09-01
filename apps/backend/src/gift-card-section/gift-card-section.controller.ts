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
import { GiftCardSectionService } from './gift-card-section.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { GiftCardSectionSchema, type CreateGiftCardSectionInput } from '@amber/shared';

@Controller('gift-card-section')
export class GiftCardSectionController {
  constructor(
    private readonly giftCardSectionService: GiftCardSectionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  create(@Body(new ZodValidationPipe(GiftCardSectionSchema)) data: CreateGiftCardSectionInput) {
    return this.giftCardSectionService.create(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  findAll() {
    return this.giftCardSectionService.findAll();
  }

  @Get('active')
  findActive() {
    return this.giftCardSectionService.findActive();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(GiftCardSectionSchema.partial())) data: Partial<CreateGiftCardSectionInput>,
  ) {
    return this.giftCardSectionService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  remove(@Param('id') id: string) {
    return this.giftCardSectionService.remove(id);
  }
}
