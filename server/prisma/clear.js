const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing mock data...');
  const delLogs = await prisma.detectionLog.deleteMany({});
  const delAtt = await prisma.attendanceRecord.deleteMany({});
  const delStu = await prisma.student.deleteMany({});

  console.log(`Deleted: ${delLogs.count} detection logs, ${delAtt.count} attendance records, ${delStu.count} mock students.`);
  console.log('Remaining students:', await prisma.student.count());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
