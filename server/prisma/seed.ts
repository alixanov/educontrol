import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to generate normalized mock face descriptor (128-d vector)
function generateMockEmbedding(seedNum: number): string {
  const vector: number[] = [];
  for (let i = 0; i < 128; i++) {
    // Deterministic pseudo-random values around -0.1 to +0.1
    const val = Math.sin(seedNum * 997 + i * 37) * 0.15;
    vector.push(parseFloat(val.toFixed(4)));
  }
  return JSON.stringify(vector);
}

function getFormattedDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function main() {
  console.log('--- Seeding EduControl Database ---');

  // 1. Seed Admin
  const adminSalt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('admin123', adminSalt);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@educontrol.com' },
    update: { passwordHash: adminHash },
    create: {
      email: 'admin@educontrol.com',
      passwordHash: adminHash,
      name: 'System Administrator',
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`Admin account ensured: ${admin.email} (password: admin123)`);

  // 2. Seed Cameras
  const camerasData = [
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

  const cameras = [];
  for (const c of camerasData) {
    let cam = await prisma.camera.findFirst({ where: { name: c.name } });
    if (!cam) {
      cam = await prisma.camera.create({ data: c });
    }
    cameras.push(cam);
  }
  console.log(`Cameras seeded: ${cameras.length}`);

  // 3. Seed Teachers and Academic Staff
  const studentsData = [
    {
      studentCode: 'PROF-2026-001',
      firstName: 'Shukurullo',
      lastName: 'Alixonov',
      email: 'shukurullo.alixonov@educontrol.uz',
      department: 'Axborot texnologiyalari kafedrasi',
      grade: 'Dotsent',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
    {
      studentCode: 'PROF-2026-002',
      firstName: 'Kamoliddin',
      lastName: 'Kamalov',
      email: 'kamoliddin.kamalov@educontrol.uz',
      department: 'Dasturiy injiniring kafedrasi',
      grade: 'Katta o‘qituvchi',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    },
    {
      studentCode: 'PROF-2026-003',
      firstName: 'Azizbek',
      lastName: 'Rahimov',
      email: 'azizbek.rahimov@educontrol.uz',
      department: 'Kiberxavfsizlik kafedrasi',
      grade: 'Kafedra mudiri',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    },
    {
      studentCode: 'PROF-2026-004',
      firstName: 'Nodira',
      lastName: 'Karimova',
      email: 'nodira.karimova@educontrol.uz',
      department: 'Oliy matematika kafedrasi',
      grade: 'Professor',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    },
    {
      studentCode: 'PROF-2026-005',
      firstName: 'Dilshod',
      lastName: 'Ergashev',
      email: 'dilshod.ergashev@educontrol.uz',
      department: 'Axborot texnologiyalari kafedrasi',
      grade: 'Assistent',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    },
    {
      studentCode: 'PROF-2026-006',
      firstName: 'Zilola',
      lastName: 'Yusupova',
      email: 'zilola.yusupova@educontrol.uz',
      department: 'Chet tillari kafedrasi',
      grade: 'Katta o‘qituvchi',
      photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    },
  ];

  const students = [];
  for (let i = 0; i < studentsData.length; i++) {
    const s = studentsData[i];
    let student = await prisma.student.findUnique({ where: { studentCode: s.studentCode } });
    if (!student) {
      student = await prisma.student.create({
        data: {
          ...s,
          faceDescriptor: generateMockEmbedding(i + 1),
          status: 'ACTIVE',
        },
      });
    }
    students.push(student);
  }
  console.log(`Students seeded: ${students.length}`);

  // 4. Seed Attendance Records for Today and Past 3 Days
  const todayStr = getFormattedDate(0);
  const mainEntranceCam = cameras[0];
  const exitCam = cameras[1];

  for (let dayOffset = 3; dayOffset >= 0; dayOffset--) {
    const dateStr = getFormattedDate(dayOffset);
    const isToday = dayOffset === 0;

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      // Pseudo-random attendance status for demo
      // Alex (0), Sophia (1), Marcus (2), Elena (3), David (4), Amara (5) arrive on time
      // Liam (6), Zara (7) arrive late
      // Noah (8), Chloe (9) absent on some days
      if (i === 8 && dayOffset % 2 === 1) continue; // Absent
      if (i === 9 && dayOffset === 0) continue; // Absent today

      const isLate = i === 6 || i === 7;
      const arrivalHour = isLate ? 9 : 8;
      const arrivalMinute = 10 + (i * 4) % 45;

      const checkIn = new Date(`${dateStr}T${String(arrivalHour).padStart(2, '0')}:${String(arrivalMinute).padStart(2, '0')}:00Z`);

      // Departures are recorded for earlier days or late in the afternoon
      let checkOut: Date | null = null;
      if (!isToday || i < 4) {
        checkOut = new Date(`${dateStr}T16:${String(20 + (i * 7) % 35).padStart(2, '0')}:00Z`);
      }

      await prisma.attendanceRecord.upsert({
        where: {
          studentId_date: {
            studentId: student.id,
            date: dateStr,
          },
        },
        update: {},
        create: {
          studentId: student.id,
          date: dateStr,
          checkInTime: checkIn,
          checkOutTime: checkOut,
          status: isLate ? 'LATE' : 'PRESENT',
          confidence: 0.94 + ((i * 3) % 5) / 100,
          cameraInId: mainEntranceCam?.id,
          cameraOutId: checkOut ? exitCam?.id : null,
        },
      });
    }
  }
  console.log('Attendance records seeded successfully');

  // 5. Seed Real-time Detection Logs for Today
  const recentLogsData = [
    {
      studentId: students[0].id,
      studentName: `${students[0].firstName} ${students[0].lastName}`,
      cameraId: mainEntranceCam.id,
      cameraName: mainEntranceCam.name,
      type: 'ARRIVAL',
      confidence: 0.98,
      boundingBox: JSON.stringify([140, 95, 110, 130]),
    },
    {
      studentId: students[1].id,
      studentName: `${students[1].firstName} ${students[1].lastName}`,
      cameraId: mainEntranceCam.id,
      cameraName: mainEntranceCam.name,
      type: 'ARRIVAL',
      confidence: 0.96,
      boundingBox: JSON.stringify([220, 110, 115, 135]),
    },
    {
      studentId: students[2].id,
      studentName: `${students[2].firstName} ${students[2].lastName}`,
      cameraId: cameras[2].id,
      cameraName: cameras[2].name,
      type: 'PASS_BY',
      confidence: 0.95,
      boundingBox: JSON.stringify([180, 85, 105, 125]),
    },
    {
      studentId: students[3].id,
      studentName: `${students[3].firstName} ${students[3].lastName}`,
      cameraId: mainEntranceCam.id,
      cameraName: mainEntranceCam.name,
      type: 'ARRIVAL',
      confidence: 0.97,
      boundingBox: JSON.stringify([160, 100, 112, 130]),
    },
    {
      studentId: students[6].id,
      studentName: `${students[6].firstName} ${students[6].lastName}`,
      cameraId: mainEntranceCam.id,
      cameraName: mainEntranceCam.name,
      type: 'ARRIVAL',
      confidence: 0.93,
      boundingBox: JSON.stringify([190, 115, 108, 128]),
    },
  ];

  for (const log of recentLogsData) {
    await prisma.detectionLog.create({
      data: log,
    });
  }
  console.log('Detection logs seeded.');
  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
