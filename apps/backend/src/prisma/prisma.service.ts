import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private readonly maxRetries = process.env.NODE_ENV === 'production' ? 2 : 5;
  private readonly retryDelay = 2000;

  constructor(config: ConfigService) {
    const url = config.get<string>('DATABASE_URL');
    if (!url) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Successfully connected to database');
        return;
      } catch (error) {
        this.logger.warn(
          `Database connection attempt ${attempt}/${this.maxRetries} failed: ${error.message}`,
        );
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        }
      }
    }
    throw new Error('Failed to connect to database after multiple attempts');
  }

  sanitizeData<T>(data: T): T {
    if (data === null || data === undefined) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item)) as any;
    }

    if (typeof data === 'object') {
      const sanitized = { ...data };
      for (const key in sanitized) {
        if ((sanitized as any)[key] === '') {
          (sanitized as any)[key] = null;
        } else if (typeof (sanitized as any)[key] === 'object') {
          (sanitized as any)[key] = this.sanitizeData((sanitized as any)[key]);
        }
      }
      return sanitized;
    }

    return data;
  }
}
