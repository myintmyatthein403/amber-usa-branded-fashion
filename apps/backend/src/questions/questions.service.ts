import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionsRepository } from './questions.repository';
import type { CreateQuestionInput, CreateAnswerInput } from '@amber/shared';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async createQuestion(userId: string, userName: string, data: CreateQuestionInput) {
    return this.questionsRepository.create({
      productId: data.productId,
      userId,
      userName,
      body: data.body,
    });
  }

  async getApprovedByProduct(productId: string) {
    return this.questionsRepository.findApprovedByProduct(productId);
  }

  async getAll() {
    return this.questionsRepository.findAll();
  }

  async toggleApproval(id: string) {
    const question = await this.questionsRepository.findById(id);
    if (!question) throw new NotFoundException(`Question with ID ${id} not found`);
    return this.questionsRepository.update(id, { isApproved: !question.isApproved });
  }

  async deleteQuestion(id: string) {
    const question = await this.questionsRepository.findById(id);
    if (!question) throw new NotFoundException(`Question with ID ${id} not found`);
    return this.questionsRepository.delete(id);
  }

  async addAnswer(
    questionId: string,
    data: CreateAnswerInput,
    options: { answeredBy?: string; isOfficial: boolean },
  ) {
    const question = await this.questionsRepository.findById(questionId);
    if (!question) throw new NotFoundException(`Question with ID ${questionId} not found`);
    return this.questionsRepository.addAnswer(questionId, {
      body: data.body,
      answeredBy: options.answeredBy,
      isOfficial: options.isOfficial,
    });
  }
}
