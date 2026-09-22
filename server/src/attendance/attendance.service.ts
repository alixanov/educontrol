import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  private lastDetectionTime = new Map<string, number>();

  constructor(private prisma: PrismaService) {}

  private getTodayDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isLate(date: Date, customCutoff?: string): boolean {
    const lateThreshold = customCutoff || process.env.LATE_THRESHOLD_TIME || '08:30';
    const [hours, minutes] = lateThreshold.split(':').map(Number);
    const thresholdDate = new Date(date);
    thresholdDate.setHours(hours, minutes, 0, 0);
    return date.getTime() > thresholdDate.getTime();
  }

  async processDetection(payload: {
    studentId?: string;
    studentCode?: string;
    cameraId: string;
    confidence: number;
    boundingBox?: number[]; // [x, y, w, h]
    snapshotUrl?: string;
    actionType?: 'ARRIVAL' | 'DEPARTURE' | 'AUTO';
    lateCutoff?: string;
  }) {
    // 1. Resolve student
    let student = null;
    if (payload.studentId) {
      student = await this.prisma.student.findUnique({ where: { id: payload.studentId } });
    } else if (payload.studentCode) {
      student = await this.prisma.student.findUnique({ where: { studentCode: payload.studentCode } });
    }

    // 2. Resolve camera
    const camera = await this.prisma.camera.findUnique({ where: { id: payload.cameraId } });
    const cameraName = camera ? camera.name : 'Surveillance Cam';
    const cameraType = camera ? camera.type : 'ENTRANCE';

    const now = new Date();
    const today = this.getTodayDateString();

    if (!student) {
      // Log unrecognized / unknown face
      const unknownLog = await this.prisma.detectionLog.create({
        data: {
          studentId: null,
          studentName: 'Unknown Person',
          cameraId: payload.cameraId,
          cameraName,
          type: 'UNKNOWN',
          confidence: payload.confidence || 0,
          boundingBox: payload.boundingBox ? JSON.stringify(payload.boundingBox) : null,
          snapshotUrl: payload.snapshotUrl || null,
          timestamp: now,
        },
      });
      return { status: 'UNKNOWN', log: unknownLog };
    }

    // Debounce detections for the same student, camera, and action type (8s debounce)
    const debounceKey = `${student.id}_${payload.cameraId}_${payload.actionType || 'AUTO'}`;
    const lastSeen = this.lastDetectionTime.get(debounceKey) || 0;
    if (Date.now() - lastSeen < 8000) {
      return { status: 'DEBOUNCED', message: 'Detected recently, skipped duplicate record' };
    }
    this.lastDetectionTime.set(debounceKey, Date.now());

    // 3. Find or create today's attendance record
    let record = await this.prisma.attendanceRecord.findUnique({
      where: {
        studentId_date: {
          studentId: student.id,
          date: today,
        },
      },
    });

    const isExitCamera = cameraType === 'EXIT' || payload.actionType === 'DEPARTURE';

    let detectionAction = 'ARRIVAL';

    if (!record) {
      if (isExitCamera) {
        // First detection of the day is a Departure
        record = await this.prisma.attendanceRecord.create({
          data: {
            studentId: student.id,
            date: today,
            checkInTime: null,
            checkOutTime: now,
            status: 'PRESENT',
            confidence: payload.confidence,
            cameraOutId: payload.cameraId,
            snapshotUrl: payload.snapshotUrl || null,
          },
        });
        detectionAction = 'DEPARTURE';
      } else {
        // First detection of the day is an Arrival
        const late = this.isLate(now, payload.lateCutoff);
        record = await this.prisma.attendanceRecord.create({
          data: {
            studentId: student.id,
            date: today,
            checkInTime: now,
            checkOutTime: null,
            status: late ? 'LATE' : 'PRESENT',
            confidence: payload.confidence,
            cameraInId: payload.cameraId,
            snapshotUrl: payload.snapshotUrl || null,
          },
        });
        detectionAction = 'ARRIVAL';
      }
    } else {
      // Existing record
      if (isExitCamera) {
        // Exit camera or DEPARTURE action -> record Departure time
        record = await this.prisma.attendanceRecord.update({
          where: { id: record.id },
          data: {
            checkOutTime: now,
            cameraOutId: payload.cameraId,
          },
        });
        detectionAction = 'DEPARTURE';
      } else {
        if (!record.checkInTime) {
          record = await this.prisma.attendanceRecord.update({
            where: { id: record.id },
            data: {
              checkInTime: now,
              cameraInId: payload.cameraId,
            },
          });
          detectionAction = 'ARRIVAL';
        } else {
          // Repeated entrance or pass-by
          detectionAction = 'PASS_BY';
        }
      }
    }

    // 4. Record audit detection log
    const log = await this.prisma.detectionLog.create({
      data: {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        cameraId: payload.cameraId,
        cameraName,
        type: detectionAction,
        confidence: payload.confidence || 0.95,
        boundingBox: payload.boundingBox ? JSON.stringify(payload.boundingBox) : null,
        snapshotUrl: payload.snapshotUrl || null,
        timestamp: now,
      },
    });

    return {
      status: 'SUCCESS',
      action: detectionAction,
      student: {
        id: student.id,
        studentCode: student.studentCode,
        name: `${student.firstName} ${student.lastName}`,
        department: student.department,
        photoUrl: student.photoUrl,
      },
      record,
      log,
    };
  }

  async findAll(params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    studentId?: string;
    department?: string;
    grade?: string;
    status?: string;
    search?: string;
  }) {
    const { date, startDate, endDate, studentId, department, grade, status, search } = params || {};
    const where: any = {};

    if (date) {
      where.date = date;
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    if (department || grade || search) {
      where.student = {};
      if (department) where.student.department = department;
      if (grade) where.student.grade = grade;
      if (search) {
        where.student.OR = [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { studentCode: { contains: search } },
        ];
      }
    }

    return this.prisma.attendanceRecord.findMany({
      where,
      include: {
        student: true,
      },
      orderBy: [
        { date: 'desc' },
        { checkInTime: 'desc' },
      ],
    });
  }

  async getRecentDetections(limit = 20) {
    const logs = await this.prisma.detectionLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    const studentIds = Array.from(
      new Set(logs.map((l) => l.studentId).filter(Boolean)),
    ) as string[];

    if (studentIds.length > 0) {
      const students = await this.prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, photoUrl: true },
      });
      const photoMap = new Map(students.map((s) => [s.id, s.photoUrl]));
      return logs.map((l) => ({
        ...l,
        snapshotUrl: l.snapshotUrl || (l.studentId ? photoMap.get(l.studentId) : null) || null,
        photoUrl: l.studentId ? photoMap.get(l.studentId) : null,
      }));
    }

    return logs;
  }

  async manualUpdate(id: string, data: {
    status?: string;
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
  }) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.checkInTime) updateData.checkInTime = new Date(data.checkInTime);
    if (data.checkOutTime) updateData.checkOutTime = new Date(data.checkOutTime);
    if (data.notes !== undefined) updateData.notes = data.notes;

    return this.prisma.attendanceRecord.update({
      where: { id },
      data: updateData,
      include: { student: true },
    });
  }

  async markAbsentStudents(dateStr?: string) {
    const date = dateStr || this.getTodayDateString();
    const activeStudents = await this.prisma.student.findMany({
      where: { status: 'ACTIVE' },
    });

    const recorded = await this.prisma.attendanceRecord.findMany({
      where: { date },
      select: { studentId: true },
    });
    const recordedSet = new Set(recorded.map((r) => r.studentId));

    const absentStudents = activeStudents.filter((s) => !recordedSet.has(s.id));
    const created = [];

    for (const student of absentStudents) {
      const rec = await this.prisma.attendanceRecord.create({
        data: {
          studentId: student.id,
          date,
          status: 'ABSENT',
        },
      });
      created.push(rec);
    }

    return { createdCount: created.length };
  }
}
