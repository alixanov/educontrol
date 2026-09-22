import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    search?: string;
    department?: string;
    grade?: string;
    status?: string;
  }) {
    const { search, department, grade, status } = params || {};
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (department) {
      where.department = department;
    }
    if (grade) {
      where.grade = grade;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { studentCode: { contains: search } },
        { email: { contains: search } },
      ];
    }

    return this.prisma.student.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { attendances: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async create(data: {
    studentCode: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    grade: string;
    photoUrl?: string;
    faceDescriptor?: string;
    status?: string;
  }) {
    const existingCode = await this.prisma.student.findUnique({
      where: { studentCode: data.studentCode },
    });
    if (existingCode) {
      throw new ConflictException(`Student code ${data.studentCode} is already in use`);
    }

    const existingEmail = await this.prisma.student.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new ConflictException(`Student email ${data.email} is already registered`);
    }

    return this.prisma.student.create({
      data: {
        ...data,
        status: data.status || 'ACTIVE',
      },
    });
  }

  async update(id: string, data: Partial<{
    studentCode: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    grade: string;
    photoUrl?: string;
    faceDescriptor?: string;
    status?: string;
  }>) {
    await this.findOne(id);

    if (data.studentCode) {
      const existing = await this.prisma.student.findFirst({
        where: { studentCode: data.studentCode, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Student code ${data.studentCode} is already in use`);
      }
    }

    if (data.email) {
      const existing = await this.prisma.student.findFirst({
        where: { email: data.email, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Student email ${data.email} is already in use`);
      }
    }

    return this.prisma.student.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.student.delete({
      where: { id },
    });
  }

  async getFaceDescriptors() {
    return this.prisma.student.findMany({
      where: {
        status: 'ACTIVE',
        faceDescriptor: { not: null },
      },
      select: {
        id: true,
        studentCode: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        faceDescriptor: true,
      },
    });
  }
}
