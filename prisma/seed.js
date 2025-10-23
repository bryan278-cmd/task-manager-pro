import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  try {
    // First, delete all existing tasks to ensure a clean slate
    await prisma.task.deleteMany({});
    console.log('Cleared existing tasks');

    // Get all existing users
    const users = await prisma.user.findMany();
    
    if (users.length === 0) {
      // If no users exist, create sample users with different experience levels
      const sampleUsers = [
        { email: 'junior@example.com', name: 'Junior Developer', experienceLevel: 'junior' },
        { email: 'mid@example.com', name: 'Mid-level Developer', experienceLevel: 'mid' },
        { email: 'senior@example.com', name: 'Senior Developer', experienceLevel: 'senior' }
      ];
      
      for (const userData of sampleUsers) {
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            password: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345', // placeholder bcrypt hash
            name: userData.name,
            experienceLevel: userData.experienceLevel
          }
        });
        users.push(user);
      }
      console.log('Created sample users for each experience level');
    }
    
    console.log(`Assigning tasks to ${users.length} user(s)`);

    // Create tasks for each user
    const allTasks = [];
    for (const user of users) {
      console.log(`Assigning 50 tasks to user: ${user.email} (${user.experienceLevel})`);
      
      // Create exactly 50 tasks with even priority distribution per user
      for (let i = 0; i < 50; i++) {
        let priority;
        if (i < 17) {
          priority = 'high'; // High priority tasks first (1-17)
        } else if (i < 34) {
          priority = 'medium'; // Medium priority tasks (18-34)
        } else {
          priority = 'low'; // Low priority tasks (35-50)
        }

        allTasks.push({
          title: `Task ${i + 1}`,
          priority: priority,
          category: 'bug', // Using bug as default category
          completed: false,
          userId: user.id,
          difficultyLevel: Math.floor(i / 10) + 1 // 1-5 difficulty levels
        });
      }
    }

    // Create all tasks
    const result = await prisma.task.createMany({
      data: allTasks,
      skipDuplicates: false
    });

    console.log(`Seeded ${result.count} tasks successfully`);
    console.log('Task distribution:');
    console.log(`  High priority: 17 tasks (1-17)`);
    console.log(`  Medium priority: 17 tasks (18-34)`);
    console.log(`  Low priority: 16 tasks (35-50)`);

  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
