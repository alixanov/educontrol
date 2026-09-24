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
    } catch (err: any) {
      this.logger.error('ensureTablesAndAdmin xatosi: ' + (err?.message || err));
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
