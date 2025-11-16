import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn', 'info'],
});

async function test() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('Testing Prisma connection...');

  try {
    // Try connecting explicitly
    await prisma.$connect();
    console.log('Successfully connected!');

    // Test raw query first
    const result =
      await prisma.$queryRaw`SELECT current_database(), current_user`;
    console.log('Raw query result:', result);

    const users = await prisma.user.findMany();
    console.log('Success! Found', users.length, 'users');
    console.log(users);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
