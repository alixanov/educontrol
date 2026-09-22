import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('grade') grade?: string,
    @Query('status') status?: string,
  ) {
    return this.studentsService.findAll({ search, department, grade, status });
  }

  // Public/Internal endpoint for Python CV / Face recognition service to sync embeddings
  @Get('descriptors')
  async getFaceDescriptors() {
    return this.studentsService.getFaceDescriptors();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body()
    body: {
      studentCode: string;
      firstName: string;
      lastName: string;
      email: string;
      department: string;
      grade: string;
      photoUrl?: string;
      faceDescriptor?: string;
      status?: string;
    },
  ) {
    return this.studentsService.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      studentCode?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      department?: string;
      grade?: string;
      photoUrl?: string;
      faceDescriptor?: string;
      status?: string;
    },
  ) {
    return this.studentsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
