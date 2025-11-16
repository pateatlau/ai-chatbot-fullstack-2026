import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Create test users
  const password = await bcrypt.hash('Password123!', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const moderatorUser = await prisma.user.create({
    data: {
      email: 'moderator@example.com',
      password,
      name: 'Moderator User',
      role: 'MODERATOR',
      isActive: true,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password,
      name: 'Regular User',
      role: 'USER',
      isActive: true,
    },
  });

  console.log('Created users:');
  console.log(`- Admin: ${adminUser.email} (Password123!)`);
  console.log(`- Moderator: ${moderatorUser.email} (Password123!)`);
  console.log(`- User: ${regularUser.email} (Password123!)`);

  console.log('\nDatabase seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
