import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Ensure global settings exist
    const settings = await this.prisma.settings.findUnique({
      where: { id: 'global' },
    });

    if (!settings) {
      await this.prisma.settings.create({
        data: { 
          id: 'global',
          stripePublishableKey: null,
          stripeSecretKey: null,
          stripeWebhookSecret: null,
          usdToMmkRate: 3500.00,
        },
      });
    }
  }

  async getSettings() {
    return this.prisma.settings.findUnique({
      where: { id: 'global' },
    });
  }

  async updateSettings(data: { 
    privacyPolicy?: string; 
    termsConditions?: string; 
    usdToMmkRate?: number;
    stripePublishableKey?: string;
    stripeSecretKey?: string;
    stripeWebhookSecret?: string;
  }) {
    return this.prisma.settings.update({
      where: { id: 'global' },
      data,
    });
  }
}
