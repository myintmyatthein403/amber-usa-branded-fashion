import { Injectable, NotFoundException } from '@nestjs/common';
import { MissionRepository } from './mission.repository';
import { sanitizeData } from '../common/utils/data-sanitizer';

@Injectable()
export class MissionService {
  constructor(private readonly missionRepository: MissionRepository) {}

  async create(data: any) {
    const sanitizedData = sanitizeData(data);
    if (sanitizedData.isActive) {
      await this.missionRepository.deactivateAll();
    }
    return this.missionRepository.create(sanitizedData);
  }

  async findAll() {
    return this.missionRepository.findAll();
  }

  async findActive() {
    return this.missionRepository.findActive();
  }

  async update(id: string, data: any) {
    const mission = await this.missionRepository.findById(id);
    if (!mission)
      throw new NotFoundException(`Mission section with ID ${id} not found`);

    const sanitizedData = sanitizeData(data);
    if (sanitizedData.isActive) {
      await this.missionRepository.deactivateOthers(id);
    }
    return this.missionRepository.update(id, sanitizedData);
  }

  async remove(id: string) {
    const mission = await this.missionRepository.findById(id);
    if (!mission)
      throw new NotFoundException(`Mission section with ID ${id} not found`);

    return this.missionRepository.delete(id);
  }
}
