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
    @Body()
    body: {
      label?: string;
      country: string;
      street: string;
      city: string;
      state?: string;
      township?: string;
      zipCode?: string;
      phone?: string;
      isDefault?: boolean;
    },
  ) {
    return this.addressesService.create(req.user.userId, body);
  }

  @Patch(':id')
  update(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.addressesService.update(req.user.userId, id, body);
  }

  @Delete(':id')
  remove(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.addressesService.remove(req.user.userId, id);
  }
}
