const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const delLogs = await prisma.detectionLog.deleteMany({});
  const delAtt = await prisma.attendanceRecord.deleteMany({});
  console.log(`Cleaned accidental logs: ${delLogs.count} detection logs, ${delAtt.count} attendance records.`);

  const students = await prisma.student.findMany();
  console.log('Registered students in DB:', students.map(s => `${s.firstName} ${s.lastName} (${s.studentCode})`));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
