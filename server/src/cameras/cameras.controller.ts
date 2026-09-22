import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CamerasService } from './cameras.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/cameras')
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}

  @Get()
  async findAll() {
    return this.camerasService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.camerasService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body()
    body: {
      name: string;
      location: string;
      type: string;
      streamUrl?: string;
      status?: string;
      resolution?: string;
    },
  ) {
    return this.camerasService.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      location?: string;
      type?: string;
      streamUrl?: string;
      status?: string;
      resolution?: string;
    },
  ) {
    return this.camerasService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    return this.camerasService.remove(id);
  }
}
