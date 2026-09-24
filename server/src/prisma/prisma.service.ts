import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    await this.ensureTablesAndAdmin();
  }

  async ensureTablesAndAdmin() {
    try {
      // 1. Ensure all SQLite tables exist
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Admin" (
          "id" TEXT PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "passwordHash" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Student" (
          "id" TEXT PRIMARY KEY,
          "studentCode" TEXT NOT NULL UNIQUE,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "email" TEXT NOT NULL UNIQUE,
          "department" TEXT NOT NULL,
          "grade" TEXT NOT NULL,
          "photoUrl" TEXT,
          "faceDescriptor" TEXT,
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Camera" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "location" TEXT NOT NULL,
          "type" TEXT NOT NULL DEFAULT 'ENTRANCE',
          "streamUrl" TEXT,
          "status" TEXT NOT NULL DEFAULT 'ONLINE',
          "resolution" TEXT NOT NULL DEFAULT '1080p',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AttendanceRecord" (
          "id" TEXT PRIMARY KEY,
          "studentId" TEXT NOT NULL,
          "date" TEXT NOT NULL,
          "checkInTime" DATETIME,
          "checkOutTime" DATETIME,
          "status" TEXT NOT NULL DEFAULT 'PRESENT',
          "confidence" REAL,
          "cameraInId" TEXT,
          "cameraOutId" TEXT,
          "snapshotUrl" TEXT,
          "notes" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE
        );
      `);

      await this.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "AttendanceRecord_studentId_date_key" ON "AttendanceRecord"("studentId", "date");
      `);

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "DetectionLog" (
          "id" TEXT PRIMARY KEY,
          "studentId" TEXT,
          "studentName" TEXT,
          "cameraId" TEXT NOT NULL,
          "cameraName" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "confidence" REAL NOT NULL,
          "boundingBox" TEXT,
          "snapshotUrl" TEXT,
          "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Ensure default admin exists with password 1111 and admin123
      const salt = await bcrypt.genSalt(10);
      const hash1111 = await bcrypt.hash('1111', salt);

      const existingAdmin = await this.admin.findUnique({
        where: { email: 'admin@educontrol.com' },
      });

      if (!existingAdmin) {
        await this.admin.create({
          data: {
            email: 'admin@educontrol.com',
            passwordHash: hash1111,
            name: 'System Administrator',
            role: 'SUPER_ADMIN',
          },
        });
        this.logger.log('Standart administrator yaratildi: admin@educontrol.com (Parol: 1111)');
      } else {
        await this.admin.update({
          where: { email: 'admin@educontrol.com' },
          data: { passwordHash: hash1111 },
        });
      }

      // 3. Ensure teachers exist
      const studentCount = await this.student.count();
      if (studentCount === 0) {
        const teachers = [
          {
            studentCode: 'PROF-2026-001',
            firstName: 'Shukurullo',
            lastName: 'Alixonov',
            email: 'shukurullo.alixonov@educontrol.uz',
            department: 'Axborot texnologiyalari kafedrasi',
            grade: 'Dotsent',
            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            status: 'ACTIVE',
          },
          {
            studentCode: 'PROF-2026-002',
            firstName: 'Kamoliddin',
            lastName: 'Kamalov',
            email: 'kamoliddin.kamalov@educontrol.uz',
            department: 'Dasturiy injiniring kafedrasi',
            grade: 'Katta o‘qituvchi',
            photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
            status: 'ACTIVE',
          },
          {
            studentCode: 'PROF-2026-003',
            firstName: 'Azizbek',
            lastName: 'Rahimov',
            email: 'azizbek.rahimov@educontrol.uz',
            department: 'Kiberxavfsizlik kafedrasi',
            grade: 'Kafedra mudiri',
            photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
            status: 'ACTIVE',
          },
          {
            studentCode: 'PROF-2026-004',
            firstName: 'Nodira',
            lastName: 'Karimova',
            email: 'nodira.karimova@educontrol.uz',
            department: 'Oliy matematika kafedrasi',
            grade: 'Professor',
            photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
            status: 'ACTIVE',
          },
          {
            studentCode: 'PROF-2026-005',
            firstName: 'Dilshod',
            lastName: 'Ergashev',
            email: 'dilshod.ergashev@educontrol.uz',
            department: 'Axborot texnologiyalari kafedrasi',
            grade: 'Assistent',
            photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
            status: 'ACTIVE',
          },
          {
            studentCode: 'PROF-2026-006',
            firstName: 'Zilola',
            lastName: 'Yusupova',
            email: 'zilola.yusupova@educontrol.uz',
            department: 'Chet tillari kafedrasi',
            grade: 'Katta o‘qituvchi',
            photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
            status: 'ACTIVE',
          },
        ];
        for (const t of teachers) {
          await this.student.create({ data: t });
        }
        this.logger.log('Standart o‘qituvchilar shtati avtomatik yuklandi.');
      }

      // 4. Ensure cameras exist
      const camCount = await this.camera.count();
      if (camCount === 0) {
        const cameras = [
          {
            name: 'Bosh bino - Kirish turniketi #1',
            location: '1-bino - Markaziy kirish vestibyuli',
            type: 'ENTRANCE',
            streamUrl: 'rtsp://192.168.1.101:554/stream1',
            status: 'ONLINE',
            resolution: '1080p @ 30fps',
          },
          {
            name: 'Janubiy korpus - Chiqish turniketi #2',
            location: 'Janubiy bino - Chiqish eshigi',
            type: 'EXIT',
            streamUrl: 'rtsp://192.168.1.102:554/stream1',
            status: 'ONLINE',
            resolution: '1080p @ 30fps',
          },
          {
            name: 'Axborot resurs markazi kirishi #3',
            location: 'Kutubxona atriumi, 1-qavat',
            type: 'ENTRANCE',
            streamUrl: 'rtsp://192.168.1.103:554/stream1',
            status: 'ONLINE',
            resolution: '1080p @ 30fps',
          },
        ];
        for (const c of cameras) {
          await this.camera.create({ data: c });
        }
        this.logger.log('Standart kameralar avtomatik yuklandi.');
      }
    } catch (err: any) {
      this.logger.error('ensureTablesAndAdmin xatosi: ' + (err?.message || err));
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
