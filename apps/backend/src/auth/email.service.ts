import { Injectable, Logger } from '@nestjs/common';

// No SMTP/transactional-email provider is configured in this environment
// (docker-compose only runs Postgres, and no email credentials are present
// in .env.example). This is the single integration point for wiring one in
// later (nodemailer, Resend, SendGrid, etc.) — everything upstream of this
// (token generation, hashing, expiry, one-time-use enforcement in
// AuthService) is fully real and functional already.
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    this.logger.warn(
      `Password reset requested for ${email}. No email provider configured — reset link: ${resetUrl}`,
    );
  }
}
