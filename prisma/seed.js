import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to calculate task impact/value score
function calculateTaskImpact(priority, category, difficultyLevel) {
  // Base impact scores
  const priorityScores = { high: 100, medium: 60, low: 30 };
  const categoryScores = { feature: 80, bug: 60, chore: 40 };
  
  // Calculate impact score (0-100)
  const priorityScore = priorityScores[priority] || 50;
  const categoryScore = categoryScores[category] || 50;
  const difficultyModifier = difficultyLevel * 5; // 5-20 points for difficulty
  
  // Weighted calculation: 40% priority, 30% category, 30% difficulty
  let impactScore = (priorityScore * 0.4) + (categoryScore * 0.3) + (difficultyModifier * 0.3);
  
  // Ensure score is between 1-100
  return Math.max(1, Math.min(100, Math.round(impactScore)));
}

// Function to assign tasks based on developer experience level
function assignTasksByExperienceLevel(tasks, experienceLevel) {
  // Filter tasks by impact score range based on experience level
  switch (experienceLevel) {
    case 'junior':
      return tasks.filter(task => task.impactScore >= 1 && task.impactScore <= 30);
    case 'mid':
      return tasks.filter(task => task.impactScore > 30 && task.impactScore <= 60);
    case 'senior':
      return tasks.filter(task => task.impactScore > 60 && task.impactScore <= 100);
    default:
      return tasks.slice(0, 50); // Default assignment
  }
}

async function main() {
  console.log('Starting intelligent seed...');

  try {
    // First, delete all existing tasks to ensure a clean slate
    await prisma.task.deleteMany({});
    console.log('Cleared existing tasks');

    // Get all existing users
    const users = await prisma.user.findMany();
    
    // Ensure we have users with different experience levels
    if (users.length === 0) {
      // Create sample users with different experience levels
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
    } else {
      // Update existing users to ensure they have experience levels
      for (let i = 0; i < users.length; i++) {
        if (!users[i].experienceLevel) {
          const experienceLevels = ['junior', 'mid', 'senior'];
          const updatedUser = await prisma.user.update({
            where: { id: users[i].id },
            data: { experienceLevel: experienceLevels[i % 3] }
          });
          users[i] = updatedUser;
        }
      }
    }
    
    console.log(`Assigning tasks to ${users.length} user(s)`);

    // Create a pool of 200 tasks with varying impact scores
    const taskPool = [];
    const categories = ['bug', 'feature', 'chore'];
    const priorities = ['high', 'medium', 'low'];
    
    // Generate 200 tasks with different combinations
    for (let i = 0; i < 200; i++) {
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const difficultyLevel = Math.floor(Math.random() * 4) + 1; // 1-4
      
      const impactScore = calculateTaskImpact(priority, category, difficultyLevel);
      
      taskPool.push({
        title: `Task ${i + 1}: ${category} - ${priority} priority`,
        priority: priority,
        category: category,
        completed: false,
        difficultyLevel: difficultyLevel,
        impactScore: impactScore
      });
    }
    
    // Sort task pool by impact score (highest first)
    taskPool.sort((a, b) => b.impactScore - a.impactScore);
    
    console.log('Generated task pool with impact scores:');
    console.log(`  High impact (61-100): ${taskPool.filter(t => t.impactScore > 60).length} tasks`);
    console.log(`  Medium impact (31-60): ${taskPool.filter(t => t.impactScore > 30 && t.impactScore <= 60).length} tasks`);
    console.log(`  Low impact (1-30): ${taskPool.filter(t => t.impactScore <= 30).length} tasks`);

    // Create all tasks in the database, distributing them by experience level
    const createdTasks = [];
    
    // Assign tasks to junior developers (impact 1-40)
    const juniorUsers = users.filter(user => user.experienceLevel === 'junior');
    const juniorTasks = taskPool.filter(task => task.impactScore <= 40).slice(0, 50);
    console.log(`\nAssigning ${juniorTasks.length} low-impact tasks to ${juniorUsers.length} junior user(s)`);
    
    for (const user of juniorUsers) {
      for (const task of juniorTasks) {
        try {
          const createdTask = await prisma.task.create({
            data: {
              ...task,
              userId: user.id
            }
          });
          createdTasks.push(createdTask);
        } catch (error) {
          console.error(`Error creating task "${task.title}" for user ${user.email}:`, error);
        }
      }
    }
    
    // Assign tasks to mid-level developers (impact 41-70)
    const midUsers = users.filter(user => user.experienceLevel === 'mid');
    const midTasks = taskPool.filter(task => task.impactScore > 40 && task.impactScore <= 70).slice(0, 50);
    console.log(`\nAssigning ${midTasks.length} medium-impact tasks to ${midUsers.length} mid-level user(s)`);
    
    for (const user of midUsers) {
      for (const task of midTasks) {
        try {
          const createdTask = await prisma.task.create({
            data: {
              ...task,
              userId: user.id
            }
          });
          createdTasks.push(createdTask);
        } catch (error) {
          console.error(`Error creating task "${task.title}" for user ${user.email}:`, error);
        }
      }
    }
    
    // Assign tasks to senior developers (impact 71-100)
    const seniorUsers = users.filter(user => user.experienceLevel === 'senior');
    const seniorTasks = taskPool.filter(task => task.impactScore > 70).slice(0, 50);
    console.log(`\nAssigning ${seniorTasks.length} high-impact tasks to ${seniorUsers.length} senior user(s)`);
    
    for (const user of seniorUsers) {
      for (const task of seniorTasks) {
        try {
          const createdTask = await prisma.task.create({
            data: {
              ...task,
              userId: user.id
            }
          });
          createdTasks.push(createdTask);
        } catch (error) {
          console.error(`Error creating task "${task.title}" for user ${user.email}:`, error);
        }
      }
    }

    console.log(`\nSeeded ${createdTasks.length} tasks successfully`);
    console.log('Task distribution by experience level:');
    
    // Show distribution summary
    const experienceLevels = ['junior', 'mid', 'senior'];
    experienceLevels.forEach(level => {
      const levelTasks = createdTasks.filter(task => 
        users.find(user => user.id === task.userId)?.experienceLevel === level
      );
      if (levelTasks.length > 0) {
        const impactScores = levelTasks.map(task => task.impactScore || 0);
        const minScore = impactScores.length > 0 ? Math.min(...impactScores.filter(score => score > 0)) : 0;
        const maxScore = impactScores.length > 0 ? Math.max(...impactScores) : 0;
        console.log(`  ${level.charAt(0).toUpperCase() + level.slice(1)} level: ${levelTasks.length} tasks (impact ${minScore}-${maxScore})`);
      }
    });

  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
