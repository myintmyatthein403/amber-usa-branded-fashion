import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch()
  updateSettings(
    @Body()
    data: {
      privacyPolicy?: string;
      termsConditions?: string;
      stripePublishableKey?: string;
      stripeSecretKey?: string;
      stripeWebhookSecret?: string;
    },
  ) {
    return this.settingsService.updateSettings(data);
  }
}
