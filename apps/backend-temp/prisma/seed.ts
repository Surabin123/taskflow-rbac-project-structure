import { PrismaClient, TaskStatus, Priority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const leadPassword = await bcrypt.hash('lead123', 10);
  const empPassword = await bcrypt.hash('emp123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskflow.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@taskflow.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@taskflow.com' },
    update: {},
    create: {
      name: 'John Developer',
      email: 'employee@taskflow.com',
      password: empPassword,
      role: 'EMPLOYEE',
    },
  });

  // Seed initial tasks if none exist
  const existingTasks = await prisma.task.count();
  if (existingTasks === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: 'Implement Security & Cookie Middleware',
          description: 'Migrate local storage tokens to HttpOnly secure cookies.',
          status: TaskStatus.DONE,
          priority: Priority.HIGH,
          assignedToId: employee.id,
          assignedById: admin.id,
        },
        {
          title: 'Design Admin Management Dashboard UI',
          description: 'Build interactive KPI analytics and user administration matrix.',
          status: TaskStatus.IN_PROGRESS,
          priority: Priority.HIGH,
          assignedToId: employee.id,
          assignedById: admin.id,
        },
        {
          title: 'Audit Navigation History Guards',
          description: 'Prevent back button redirect fidgeting and session loops.',
          status: TaskStatus.TODO,
          priority: Priority.MEDIUM,
          assignedToId: employee.id,
          assignedById: admin.id,
        },
      ],
    });
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
