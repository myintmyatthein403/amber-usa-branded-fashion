import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }

  @Get('live')
  liveness() {
    return { status: 'alive' };
  }

  @Get('ready')
  async readiness() {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch {
      return { status: 'not ready' };
    }
  }
}