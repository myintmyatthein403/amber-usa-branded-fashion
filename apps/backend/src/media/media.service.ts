import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      const result = await this.cloudinary.uploadFile(file);

      try {
        return await this.prisma.media.create({
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            fileName: file.originalname,
            format: result.format,
            size: result.bytes,
            width: result.width,
            height: result.height,
          },
        });
      } catch (dbError) {
        // Cleanup Cloudinary if DB fails (Finding 3)
        await this.cloudinary.deleteFile(result.public_id);
        throw dbError;
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Failed to upload media: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    try {
      await this.cloudinary.deleteFile(media.publicId);
      return this.prisma.media.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete from Cloudinary: ${error.message}`,
      );
    }
  }
}
