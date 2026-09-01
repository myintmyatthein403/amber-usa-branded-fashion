import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ReturnsService } from './returns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateReturnRequestSchema,
  type CreateReturnRequestInput,
  UpdateReturnStatusSchema,
  type UpdateReturnStatusInput,
  ReceiveReturnItemsSchema,
  type ReceiveReturnItemsInput,
} from '@amber/shared';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

@ApiTags('Returns')
@Controller('returns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Request a return for a completed order' })
  createReturnRequest(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(CreateReturnRequestSchema))
    data: CreateReturnRequestInput,
  ) {
    return this.returnsService.createReturnRequest(
      data.orderId,
      req.user!,
      data.reason,
      data.comments,
      data.items,
    );
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user return requests' })
  getMyReturnRequests(@Req() req: AuthenticatedRequest) {
    return this.returnsService.getMyReturnRequests(req.user!.userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({ summary: 'List all return requests (Admin only)' })
  getAllReturnRequests(@Query('status') status?: string) {
    return this.returnsService.getAllReturnRequests(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get return request details' })
  @ApiParam({ name: 'id', description: 'Return request ID' })
  getReturnRequest(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.returnsService.getReturnRequest(id, req.user!);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({ summary: 'Approve or reject a return request' })
  @ApiParam({ name: 'id', description: 'Return request ID' })
  updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateReturnStatusSchema)) data: UpdateReturnStatusInput,
  ) {
    return this.returnsService.updateStatus(
      id,
      data.status,
      req.user!.userId,
      data.rejectionReason,
    );
  }

  @Post(':id/receive')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({ summary: 'Record physical receipt of returned items' })
  @ApiParam({ name: 'id', description: 'Return request ID' })
  receiveItems(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ReceiveReturnItemsSchema)) data: ReceiveReturnItemsInput,
  ) {
    return this.returnsService.receiveItems(id, data.items, req.user!.userId);
  }
}
