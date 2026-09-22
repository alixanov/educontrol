import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Ingestion endpoint used by Python OpenCV service and Camera UI
  @Post('detect')
  async recordDetection(
    @Body()
    body: {
      studentId?: string;
      studentCode?: string;
      cameraId: string;
      confidence: number;
      boundingBox?: number[];
      snapshotUrl?: string;
      actionType?: 'ARRIVAL' | 'DEPARTURE' | 'AUTO';
      lateCutoff?: string;
    },
  ) {
    return this.attendanceService.processDetection(body);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('studentId') studentId?: string,
    @Query('department') department?: string,
    @Query('grade') grade?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.attendanceService.findAll({
      date,
      startDate,
      endDate,
      studentId,
      department,
      grade,
      status,
      search,
    });
  }

  @Get('recent-detections')
  @UseGuards(AuthGuard)
  async getRecentDetections(@Query('limit') limit?: string) {
    return this.attendanceService.getRecentDetections(limit ? parseInt(limit, 10) : 20);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async manualUpdate(
    @Param('id') id: string,
    @Body()
    body: {
      status?: string;
      checkInTime?: string;
      checkOutTime?: string;
      notes?: string;
    },
  ) {
    return this.attendanceService.manualUpdate(id, body);
  }

  @Post('mark-absent')
  @UseGuards(AuthGuard)
  async markAbsent(@Body() body: { date?: string }) {
    return this.attendanceService.markAbsentStudents(body?.date);
  }
}
