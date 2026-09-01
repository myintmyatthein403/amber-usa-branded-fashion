import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../auth/email.service';
import type { CreateFeedbackInput } from '@amber/shared';
import type { FeedbackStatus } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(userId: string | undefined, userAgent: string | undefined, data: CreateFeedbackInput) {
    const feedback = await this.prisma.feedback.create({
      data: {
        userId,
        email: data.email,
        message: data.message,
        page: data.page,
        userAgent,
      },
    });

    // Best-effort — a notification failure must never fail the feedback
    // submission itself (the row is already saved either way).
    this.emailService
      .sendFeedbackNotification({ message: data.message, email: data.email, page: data.page })
      .catch(() => undefined);

    return feedback;
  }

  async findAll(status?: FeedbackStatus) {
    return this.prisma.feedback.findMany({
      where: status ? { status } : undefined,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: FeedbackStatus) {
    const existing = await this.prisma.feedback.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Feedback not found');
    return this.prisma.feedback.update({ where: { id }, data: { status } });
  }
}
