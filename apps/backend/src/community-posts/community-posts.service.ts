import { Injectable, NotFoundException } from '@nestjs/common';
import { CommunityPostsRepository } from './community-posts.repository';
import { sanitizeData } from '../common/utils/data-sanitizer';

@Injectable()
export class CommunityPostsService {
  constructor(private readonly communityPostsRepository: CommunityPostsRepository) {}

  async create(data: any) {
    const sanitizedData = sanitizeData(data);
    return this.communityPostsRepository.create(sanitizedData);
  }

  async findAll() {
    return this.communityPostsRepository.findAll();
  }

  async findActive() {
    return this.communityPostsRepository.findActive();
  }

  async update(id: string, data: any) {
    const post = await this.communityPostsRepository.findById(id);
    if (!post) throw new NotFoundException(`Community post with ID ${id} not found`);

    const sanitizedData = sanitizeData(data);
    return this.communityPostsRepository.update(id, sanitizedData);
  }

  async remove(id: string) {
    const post = await this.communityPostsRepository.findById(id);
    if (!post) throw new NotFoundException(`Community post with ID ${id} not found`);

    return this.communityPostsRepository.delete(id);
  }
}
