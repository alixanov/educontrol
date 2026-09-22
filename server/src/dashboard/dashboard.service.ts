import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private getTodayDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getMetrics(dateStr?: string) {
    const today = dateStr || this.getTodayDateString();

    const [
      totalStudents,
      activeStudents,
      activeCameras,
      todayRecords,
      recentDetections,
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.student.count({ where: { status: 'ACTIVE' } }),
      this.prisma.camera.count({ where: { status: 'ONLINE' } }),
      this.prisma.attendanceRecord.findMany({
        where: { date: today },
        include: {
          student: true,
        },
      }),
      this.prisma.detectionLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 8,
      }),
    ]);

    const presentCount = todayRecords.filter((r) => r.status === 'PRESENT').length;
    const lateCount = todayRecords.filter((r) => r.status === 'LATE').length;
    const explicitlyAbsent = todayRecords.filter((r) => r.status === 'ABSENT').length;
    
    // Total present includes both on-time and late
    const totalPresentToday = presentCount + lateCount;
    // Absent includes unrecorded active students plus explicitly marked absent
    const recordedIds = new Set(todayRecords.map((r) => r.studentId));
    const unrecordedCount = Math.max(0, activeStudents - recordedIds.size);
    const absentCount = explicitlyAbsent + unrecordedCount;

    const attendanceRate =
      activeStudents > 0
        ? Math.round((totalPresentToday / activeStudents) * 100)
        : 0;

    // Hourly arrivals distribution (from 07:00 to 18:00)
    const hourlyData: { hour: string; count: number }[] = [];
    for (let h = 7; h <= 18; h++) {
      const hourStr = `${String(h).padStart(2, '0')}:00`;
      hourlyData.push({ hour: hourStr, count: 0 });
    }

    todayRecords.forEach((rec) => {
      if (rec.checkInTime) {
        const d = new Date(rec.checkInTime);
        const hour = d.getHours();
        const found = hourlyData.find(
          (item) => item.hour === `${String(hour).padStart(2, '0')}:00`,
        );
        if (found) {
          found.count += 1;
        }
      }
    });

    // Department breakdown
    const departmentStats: Record<string, { total: number; present: number }> = {};
    const allStudents = await this.prisma.student.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, department: true },
    });

    allStudents.forEach((s) => {
      if (!departmentStats[s.department]) {
        departmentStats[s.department] = { total: 0, present: 0 };
      }
      departmentStats[s.department].total += 1;
      if (recordedIds.has(s.id)) {
        const rec = todayRecords.find((r) => r.studentId === s.id);
        if (rec && (rec.status === 'PRESENT' || rec.status === 'LATE')) {
          departmentStats[s.department].present += 1;
        }
      }
    });

    const departmentList = Object.keys(departmentStats).map((dept) => ({
      department: dept,
      total: departmentStats[dept].total,
      present: departmentStats[dept].present,
      rate:
        departmentStats[dept].total > 0
          ? Math.round(
              (departmentStats[dept].present / departmentStats[dept].total) * 100,
            )
          : 0,
    }));

    // Detailed teacher discipline breakdown
    const allStudentsFull = await this.prisma.student.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        studentCode: true,
        firstName: true,
        lastName: true,
        department: true,
        grade: true,
        photoUrl: true,
      },
    });

    const onTimeTeachers = todayRecords
      .filter((r) => r.status === 'PRESENT' && r.checkInTime)
      .map((r) => ({
        id: r.student.id,
        studentCode: r.student.studentCode,
        firstName: r.student.firstName,
        lastName: r.student.lastName,
        department: r.student.department,
        grade: r.student.grade,
        photoUrl: r.student.photoUrl,
        checkInTime: r.checkInTime,
        checkOutTime: r.checkOutTime,
        status: 'PRESENT',
      }));

    const lateTeachers = todayRecords
      .filter((r) => r.status === 'LATE' && r.checkInTime)
      .map((r) => {
        const d = new Date(r.checkInTime!);
        const h = d.getHours();
        const m = d.getMinutes();
        const lateMins = Math.max(1, (h - 8) * 60 + (m - 30));
        return {
          id: r.student.id,
          studentCode: r.student.studentCode,
          firstName: r.student.firstName,
          lastName: r.student.lastName,
          department: r.student.department,
          grade: r.student.grade,
          photoUrl: r.student.photoUrl,
          checkInTime: r.checkInTime,
          checkOutTime: r.checkOutTime,
          status: 'LATE',
          lateMinutes: lateMins,
        };
      });

    const absentTeachers = allStudentsFull
      .filter((s) => !recordedIds.has(s.id) || todayRecords.some((r) => r.studentId === s.id && r.status === 'ABSENT'))
      .map((s) => ({
        id: s.id,
        studentCode: s.studentCode,
        firstName: s.firstName,
        lastName: s.lastName,
        department: s.department,
        grade: s.grade,
        photoUrl: s.photoUrl,
        status: 'ABSENT',
      }));

    const studentIdsForDetections = Array.from(
      new Set(recentDetections.map((l) => l.studentId).filter(Boolean)),
    ) as string[];
    let formattedRecentDetections = recentDetections as any[];
    if (studentIdsForDetections.length > 0) {
      const photoMap = new Map(allStudentsFull.map((s) => [s.id, s.photoUrl]));
      formattedRecentDetections = recentDetections.map((l) => ({
        ...l,
        snapshotUrl: l.snapshotUrl || (l.studentId ? photoMap.get(l.studentId) : null) || null,
        photoUrl: l.studentId ? photoMap.get(l.studentId) : null,
      }));
    }

    return {
      today,
      totalStudents,
      activeStudents,
      activeCameras,
      presentToday: totalPresentToday,
      onTimeToday: presentCount,
      lateToday: lateCount,
      absentToday: absentCount,
      attendanceRate,
      hourlyData,
      departmentList,
      recentDetections: formattedRecentDetections,
      todayRecords: todayRecords.slice(0, 15),
      onTimeTeachers,
      lateTeachers,
      absentTeachers,
    };
  }
}
