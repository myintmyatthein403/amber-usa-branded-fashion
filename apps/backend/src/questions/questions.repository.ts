import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Question, Answer } from '@prisma/client';

@Injectable()
export class QuestionsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: { productId: string; userId?: string; userName?: string; body: string }): Promise<Question> {
    return this.prisma.question.create({
      data: {
        product: { connect: { id: data.productId } },
        user: data.userId ? { connect: { id: data.userId } } : undefined,
        userName: data.userName,
        body: data.body,
        isApproved: false,
      },
    });
  }

  async findApprovedByProduct(productId: string) {
    return this.prisma.question.findMany({
      where: { productId, isApproved: true },
      include: { answers: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.question.findMany({
      include: {
        answers: { orderBy: { createdAt: 'asc' } },
        product: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Question | null> {
    return this.prisma.question.findUnique({ where: { id } });
  }

  async update(id: string, data: { isApproved?: boolean }): Promise<Question> {
    return this.prisma.question.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Question> {
    return this.prisma.question.delete({ where: { id } });
  }

  async addAnswer(questionId: string, data: { body: string; answeredBy?: string; isOfficial: boolean }): Promise<Answer> {
    return this.prisma.answer.create({
      data: {
        question: { connect: { id: questionId } },
        body: data.body,
        answeredBy: data.answeredBy,
        isOfficial: data.isOfficial,
      },
    });
  }
}
