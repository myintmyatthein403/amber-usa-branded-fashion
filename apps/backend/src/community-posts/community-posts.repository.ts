import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommunityPost, Prisma } from '@prisma/client';

@Injectable()
export class CommunityPostsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CommunityPostCreateInput): Promise<CommunityPost> {
    return this.prisma.communityPost.create({ data });
  }

  async findAll(): Promise<CommunityPost[]> {
    return this.prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(): Promise<CommunityPost[]> {
    return this.prisma.communityPost.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<CommunityPost | null> {
    return this.prisma.communityPost.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.CommunityPostUpdateInput,
  ): Promise<CommunityPost> {
    return this.prisma.communityPost.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<CommunityPost> {
    return this.prisma.communityPost.delete({
      where: { id },
    });
  }
}
