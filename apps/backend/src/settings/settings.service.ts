import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import DOMPurify from 'isomorphic-dompurify';
import { sanitizeData } from '../common/utils/data-sanitizer';
import { ExchangeRateHelper } from '../currencies/exchange-rate.helper';

@Injectable()
export class SettingsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly exchangeRateHelper: ExchangeRateHelper,
  ) {}

  async onApplicationBootstrap() {
    try {
      const settings = await this.settingsRepository.findById('global');

      if (!settings) {
        await this.settingsRepository.create({
          id: 'global',
          stripePublishableKey: null,
          stripeSecretKey: null,
          stripeWebhookSecret: null,
        });
        this.logger.log('Created global settings');
      }
    } catch (error) {
      this.logger.error(
        `Failed to initialize global settings: ${error.message}`,
        error.stack,
      );
    }
  }

  async getSettings() {
    const settings = await this.settingsRepository.findGlobal();
    const meta = await this.exchangeRateHelper.getUsdMmkMeta();
    return {
      ...settings,
      usdToMmkRate: meta.rate,
      rateSource: meta.rateSource,
      rateUpdatedAt: meta.lastFetchedAt ?? new Date().toISOString(),
      isManualOverride: meta.isManualOverride,
    };
  }

  async updateSettings(data: {
    privacyPolicy?: string;
    termsConditions?: string;
    stripePublishableKey?: string;
    stripeSecretKey?: string;
    stripeWebhookSecret?: string;
  }) {
    const sanitizedData = sanitizeData(data) as {
      privacyPolicy?: string;
      termsConditions?: string;
      stripePublishableKey?: string | null;
      stripeSecretKey?: string | null;
      stripeWebhookSecret?: string | null;
    };
    const updateData = { ...sanitizedData };

    // Sanitize HTML content
    if (updateData.privacyPolicy) {
      updateData.privacyPolicy = DOMPurify.sanitize(updateData.privacyPolicy);
    }
    if (updateData.termsConditions) {
      updateData.termsConditions = DOMPurify.sanitize(
        updateData.termsConditions,
      );
    }

    // Note: sanitizeData already converts '' to null.
    // In Settings, we might actually WANT to allow nulling these out,
    // or we might want to preserve them if they are null.
    // The previous logic deleted them if they were '', which is what sanitizeData does by default (to null).

    // If they are null in updateData after sanitizeData, it means they were '' in input.
    // We should probably remove them from updateData to NOT overwrite existing secrets with null
    // IF the user just left them empty in the form.
    if (updateData.stripeSecretKey === null) delete updateData.stripeSecretKey;
    if (updateData.stripeWebhookSecret === null)
      delete updateData.stripeWebhookSecret;
    if (updateData.stripePublishableKey === null)
      delete updateData.stripePublishableKey;

    await this.settingsRepository.update('global', updateData);
    return this.getSettings();
  }
}
