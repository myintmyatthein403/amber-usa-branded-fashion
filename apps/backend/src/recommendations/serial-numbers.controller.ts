import { Controller, Get, Post, Body, Param, Query, Delete, UseGuards, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateSerialNumbersSchema, type CreateSerialNumbersInput } from '@amber/shared';

@Controller('serial-numbers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class SerialNumbersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@Query('variantId') variantId: string) {
    return this.prisma.serialNumber.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Bulk receiving: paste a batch of serials/IMEIs for a variant at once
  // (e.g. from a supplier packing list) rather than one-at-a-time entry.
  @Post()
  async create(@Body(new ZodValidationPipe(CreateSerialNumbersSchema)) data: CreateSerialNumbersInput) {
    try {
      await this.prisma.serialNumber.createMany({
        data: data.serialNumbers.map((serialNumber) => ({
          variantId: data.variantId,
          serialNumber,
        })),
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new BadRequestException('One or more serial numbers already exist');
      }
      throw err;
    }
    return this.prisma.serialNumber.findMany({ where: { variantId: data.variantId } });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.serialNumber.delete({ where: { id } });
  }
}
