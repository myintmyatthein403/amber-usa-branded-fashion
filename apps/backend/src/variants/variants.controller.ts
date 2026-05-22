import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Patch,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { VariantsService } from './variants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateVariantDto, UpdateVariantDto } from './dto/variant.dto';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get()
  findAll(@Query('productId') productId?: string) {
    return this.variantsService.getAllVariants(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateVariantDto))
    createVariantDto: CreateVariantDto,
  ) {
    return this.variantsService.createVariant(createVariantDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id/stock')
  updateStock(
    @Param('id') id: string,
    @Body() body: { stock: number },
  ) {
    return this.variantsService.updateVariantStock(id, { stock: body.stock });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateVariantDto.partial()))
    updateVariantDto: UpdateVariantDto,
  ) {
    return this.variantsService.updateVariant(id, updateVariantDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variantsService.deleteVariant(id);
  }
}
