import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CamerasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.camera.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const camera = await this.prisma.camera.findUnique({ where: { id } });
    if (!camera) throw new NotFoundException(`Camera ${id} not found`);
    return camera;
  }

  async create(data: {
    name: string;
    location: string;
    type: string;
    streamUrl?: string;
    status?: string;
    resolution?: string;
  }) {
    return this.prisma.camera.create({
      data: {
        name: data.name,
        location: data.location,
        type: data.type || 'ENTRANCE',
        streamUrl: data.streamUrl || '',
        status: data.status || 'ONLINE',
        resolution: data.resolution || '1080p',
      },
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    location: string;
    type: string;
    streamUrl: string;
    status: string;
    resolution: string;
  }>) {
    await this.findOne(id);
    return this.prisma.camera.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.camera.delete({
      where: { id },
    });
  }
}
