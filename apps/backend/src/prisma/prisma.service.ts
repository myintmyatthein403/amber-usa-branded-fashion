import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
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
    await this.$connect();
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
