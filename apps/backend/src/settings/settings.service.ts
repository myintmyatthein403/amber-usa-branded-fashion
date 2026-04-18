import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import DOMPurify from 'isomorphic-dompurify';

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
      select: {
        id: true,
        privacyPolicy: true,
        termsConditions: true,
        usdToMmkRate: true,
        stripePublishableKey: true,
        // stripeSecretKey: false,
        // stripeWebhookSecret: false,
        updatedAt: true,
      }
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
    const updateData: any = { ...data };

    // Sanitize HTML content (Finding 2)
    if (updateData.privacyPolicy) {
      updateData.privacyPolicy = DOMPurify.sanitize(updateData.privacyPolicy);
    }
    if (updateData.termsConditions) {
      updateData.termsConditions = DOMPurify.sanitize(updateData.termsConditions);
    }

    // Don't overwrite secrets if they are empty strings (Finding 3)
    // The admin UI sends '' for fields it doesn't have values for.
    if (updateData.stripeSecretKey === '') delete updateData.stripeSecretKey;
    if (updateData.stripeWebhookSecret === '') delete updateData.stripeWebhookSecret;
    if (updateData.stripePublishableKey === '') delete updateData.stripePublishableKey;

    await this.prisma.settings.update({
      where: { id: 'global' },
      data: updateData,
    });
    return this.getSettings();
  }
}
