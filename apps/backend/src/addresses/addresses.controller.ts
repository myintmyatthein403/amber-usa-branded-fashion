import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AddressSchema, type AddressInput } from '@amber/shared';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  findMine(@Req() req: { user: { userId: string } }) {
    return this.addressesService.findByUser(req.user.userId);
  }

  @Post()
  create(
    @Req() req: { user: { userId: string } },
    @Body(new ZodValidationPipe(AddressSchema)) body: AddressInput,
  ) {
    return this.addressesService.create(req.user.userId, body);
  }

  @Patch(':id')
  update(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AddressSchema.partial())) body: Partial<AddressInput>,
  ) {
    return this.addressesService.update(req.user.userId, id, body);
  }

  @Delete(':id')
  remove(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.addressesService.remove(req.user.userId, id);
  }
}
