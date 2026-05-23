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
    const url = config.get<string>('DATABASE_URL') || process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    const pool = new Pool({
      connectionString: url,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    const adapter = new PrismaPg(pool);
    super({
      datasources: {
        db: {
          url,
        },
      },
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    let connected = false;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Successfully connected to database');
        connected = true;
        break;
      } catch (error) {
        this.logger.error(
          `Database connection attempt ${attempt}/${this.maxRetries} failed. ` +
            `Error: ${error.message}`,
        );
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    if (!connected) {
      this.logger.warn(
        'Application starting without an active database connection. ' +
          'Database operations will fail until a connection is established.',
      );
    }
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
