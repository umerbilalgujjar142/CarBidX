const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    // Create test users
    const users = [];

    for (let i = 1; i <= 3; i++) {
      const user = await prisma.user.upsert({
        where: { id: i },
        update: {},
        create: {
          id: i,
          username: `user${i}`,
          email: `user${i}@example.com`,
        },
      });
      users.push(user);
    }
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
