import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// SMTP-based email sending (nodemailer) — provider-agnostic, so it works
// with any SMTP relay (SES, SendGrid, Resend, Mailgun, or a plain Gmail app
// password for early beta). Falls back to logging the content when SMTP
// isn't configured (SMTP_HOST unset), which is the correct behavior for
// local dev but must never be relied on in a real deployment — see the
// warning logged below when that happens.
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress: string;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<string>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    this.fromAddress =
      this.configService.get<string>('SMTP_FROM') || 'no-reply@amberbrandfashion.com';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port ? Number(port) : 587,
        secure: Number(port) === 465,
        auth: { user, pass },
      });
    } else {
      this.logger.warn(
        'SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — transactional emails will be logged instead of sent. This is only acceptable in local development.',
      );
    }
  }

  private async send(to: string, subject: string, html: string, text: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`[email not sent — SMTP not configured] To: ${to} | Subject: ${subject}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.fromAddress, to, subject, html, text });
    } catch (err) {
      // A failed send must not silently vanish — this is exactly the kind
      // of failure Sentry (see common/sentry) needs to catch in production.
      this.logger.error(`Failed to send email to ${to}: ${err.message}`, err);
      throw err;
    }
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    await this.send(
      email,
      'Reset your Amber Brand Fashion password',
      `<p>We received a request to reset your password.</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
      `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
    );
  }

  // Optional: notifies a team inbox when new beta feedback comes in, if
  // FEEDBACK_NOTIFY_EMAIL is configured. The admin Feedback page is the
  // primary way to see submissions either way — this is just a faster
  // heads-up during an active beta.
  async sendFeedbackNotification(details: {
    message: string;
    email?: string;
    page?: string;
  }): Promise<void> {
    const notifyEmail = this.configService.get<string>('FEEDBACK_NOTIFY_EMAIL');
    if (!notifyEmail) return;

    await this.send(
      notifyEmail,
      'New beta feedback received',
      `<p><strong>From:</strong> ${details.email || 'anonymous'}</p><p><strong>Page:</strong> ${details.page || 'unknown'}</p><p>${details.message}</p>`,
      `From: ${details.email || 'anonymous'}\nPage: ${details.page || 'unknown'}\n\n${details.message}`,
    );
  }
}
