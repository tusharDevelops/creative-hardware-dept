import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { mobile: '9876543210' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Admin User'
    },
    create: {
      mobile: '9876543210',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Admin User'
    }
  });

  console.log('Admin user created/updated:', user);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
