import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  findMine(@Req() req: { user: { userId: string } }) {
    return this.wishlistService.findByUser(req.user.userId);
  }

  @Post()
  add(
    @Req() req: { user: { userId: string } },
    @Body() body: { productId: string; variantId?: string },
  ) {
    return this.wishlistService.add(
      req.user.userId,
      body.productId,
      body.variantId,
    );
  }

  @Delete(':id')
  remove(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.wishlistService.remove(req.user.userId, id);
  }
}
