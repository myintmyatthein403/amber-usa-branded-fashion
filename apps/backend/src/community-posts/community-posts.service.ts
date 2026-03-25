import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommunityPostsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.communityPost.create({ data });
  }

  async findAll() {
    return this.prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.communityPost.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.communityPost.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.communityPost.delete({
      where: { id },
    });
  }
}
