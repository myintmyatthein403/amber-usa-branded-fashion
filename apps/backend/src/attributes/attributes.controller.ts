import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UsePipes,
  Query,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateAttributeDto,
  UpdateAttributeDto,
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
  AttributeReorderDto,
  AttributeValueReorderDto,
  AttributeTypeSchema,
  type AttributeReorderPayload,
  type AttributeValueReorderPayload,
} from './dto/attribute.dto';

interface AttributeListQuery {
  search?: string;
  type?: string;
  isFilterable?: string;
}

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get('public')
  findFilterable() {
    return this.attributesService.findFilterable();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  findAll(@Query() query: AttributeListQuery) {
    const isFilterable =
      query.isFilterable === 'true'
        ? true
        : query.isFilterable === 'false'
          ? false
          : undefined;
    const typeParsed = query.type
      ? AttributeTypeSchema.safeParse(query.type)
      : null;
    return this.attributesService.findAll({
      search:
        typeof query.search === 'string' && query.search.trim()
          ? query.search.trim()
          : undefined,
      type: typeParsed?.success ? typeParsed.data : undefined,
      isFilterable,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch('reorder')
  reorder(
    @Body(new ZodValidationPipe(AttributeReorderDto))
    reorderDto: AttributeReorderPayload,
  ) {
    return this.attributesService.reorderAttributes(reorderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch('values/:valueId')
  updateValue(
    @Param('valueId') valueId: string,
    @Body(new ZodValidationPipe(UpdateAttributeValueDto))
    updateDto: UpdateAttributeValueDto,
  ) {
    return this.attributesService.updateValue(valueId, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete('values/:valueId')
  deleteValue(@Param('valueId') valueId: string) {
    return this.attributesService.deleteValue(valueId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  findById(@Param('id') id: string) {
    return this.attributesService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateAttributeDto))
    createDto: CreateAttributeDto,
  ) {
    return this.attributesService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id/values/reorder')
  reorderValues(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AttributeValueReorderDto))
    reorderDto: AttributeValueReorderPayload,
  ) {
    return this.attributesService.reorderValues(id, reorderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post(':id/values')
  addValue(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateAttributeValueDto))
    createDto: CreateAttributeValueDto,
  ) {
    return this.attributesService.addValue(id, createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateAttributeDto))
    updateDto: UpdateAttributeDto,
  ) {
    return this.attributesService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributesService.delete(id);
  }
}
