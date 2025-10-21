import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Generate exactly 48 tasks with specified distribution
  const tasks = [
    // High Priority (15 tasks)
    // High Priority - Bug (5 tasks)
    { title: "Fix critical authentication bypass vulnerability in login flow", priority: "high", category: "bug", completed: false },
    { title: "Resolve memory leak in task creation API endpoint under heavy load", priority: "high", category: "bug", completed: false },
    { title: "Patch SQL injection vulnerability in task search functionality", priority: "high", category: "bug", completed: true },
    { title: "Fix data corruption issue when bulk importing tasks from CSV", priority: "high", category: "bug", completed: false },
    { title: "Address race condition causing duplicate task IDs in concurrent requests", priority: "high", category: "bug", completed: false },
    
    // High Priority - Feature (5 tasks)
    { title: "Implement real-time task synchronization across multiple browser tabs", priority: "high", category: "feature", completed: false },
    { title: "Add advanced filtering capabilities for task priority and category combinations", priority: "high", category: "feature", completed: false },
    { title: "Create task dependency tracking system with visual relationship mapping", priority: "high", category: "feature", completed: true },
    { title: "Develop offline task management with automatic sync when connection restored", priority: "high", category: "feature", completed: false },
    { title: "Build comprehensive task analytics dashboard with performance metrics", priority: "high", category: "feature", completed: false },
    
    // High Priority - Chore (5 tasks)
    { title: "Refactor task validation logic to improve code maintainability and readability", priority: "high", category: "chore", completed: true },
    { title: "Update project dependencies to latest stable versions with security patches", priority: "high", category: "chore", completed: false },
    { title: "Optimize database queries for faster task retrieval and reduced latency", priority: "high", category: "chore", completed: false },
    { title: "Configure automated backup system for critical task management data", priority: "high", category: "chore", completed: false },
    { title: "Implement comprehensive logging for all task-related API operations", priority: "high", category: "chore", completed: false },

    // Medium Priority (20 tasks)
    // Medium Priority - Bug (6 tasks)
    { title: "Fix task sorting algorithm producing incorrect order for priority categories", priority: "medium", category: "bug", completed: false },
    { title: "Resolve notification system not triggering for medium priority task updates", priority: "medium", category: "bug", completed: false },
    { title: "Correct timezone conversion errors in task deadline display calculations", priority: "medium", category: "bug", completed: false },
    { title: "Fix task export functionality missing category information in generated files", priority: "medium", category: "bug", completed: false },
    { title: "Address UI rendering issues with task descriptions containing special characters", priority: "medium", category: "bug", completed: false },
    { title: "Patch intermittent task deletion failures due to database connection timeouts", priority: "medium", category: "bug", completed: false },
    
    // Medium Priority - Feature (7 tasks)
    { title: "Add task reminder system with customizable notification intervals and alerts", priority: "medium", category: "feature", completed: false },
    { title: "Implement task sharing functionality between team members and collaborators", priority: "medium", category: "feature", completed: false },
    { title: "Create task template system for recurring project workflows and patterns", priority: "medium", category: "feature", completed: true },
    { title: "Develop task history tracking to monitor all status changes and edits", priority: "medium", category: "feature", completed: false },
    { title: "Add task tagging system with color-coded labels for better organization", priority: "medium", category: "feature", completed: false },
    { title: "Build task collaboration comments section with real-time updates", priority: "medium", category: "feature", completed: false },
    { title: "Implement task scheduling calendar view with drag-and-drop capabilities", priority: "medium", category: "feature", completed: false },
    
    // Medium Priority - Chore (7 tasks)
    { title: "Refactor task component structure to improve code reusability and modularity", priority: "medium", category: "chore", completed: true },
    { title: "Update documentation for task API endpoints and integration examples", priority: "medium", category: "chore", completed: false },
    { title: "Configure ESLint rules for consistent task management code formatting", priority: "medium", category: "chore", completed: false },
    { title: "Optimize task list rendering performance with virtual scrolling implementation", priority: "medium", category: "chore", completed: false },
    { title: "Set up continuous integration pipeline for automated task testing", priority: "medium", category: "chore", completed: true },
    { title: "Implement comprehensive unit tests for task business logic functions", priority: "medium", category: "chore", completed: false },
    { title: "Add performance monitoring for task creation and update operations", priority: "medium", category: "chore", completed: false },

    // Low Priority (13 tasks)
    // Low Priority - Bug (5 tasks)
    { title: "Fix minor UI alignment issues in task card layout on mobile devices", priority: "low", category: "bug", completed: false },
    { title: "Resolve task counter display showing incorrect numbers after filtering", priority: "low", category: "bug", completed: true },
    { title: "Correct spelling errors in task validation error messages and tooltips", priority: "low", category: "bug", completed: false },
    { title: "Fix task print stylesheet causing formatting issues in exported PDFs", priority: "low", category: "bug", completed: false },
    { title: "Address minor accessibility contrast issues in task status indicators", priority: "low", category: "bug", completed: true },
    
    // Low Priority - Feature (4 tasks)
    { title: "Add keyboard shortcuts for common task management operations and navigation", priority: "low", category: "feature", completed: false },
    { title: "Implement task list view customization options for column arrangements", priority: "low", category: "feature", completed: false },
    { title: "Create task import wizard for seamless migration from other tools", priority: "low", category: "feature", completed: true },
    { title: "Develop task export wizard with multiple format options and filters", priority: "low", category: "feature", completed: false },
    
    // Low Priority - Chore (4 tasks)
    { title: "Update README with comprehensive task management feature documentation", priority: "low", category: "chore", completed: true },
    { title: "Refactor task utility functions into separate modules for better organization", priority: "low", category: "chore", completed: false },
    { title: "Clean up unused CSS styles and optimize task component styling files", priority: "low", category: "chore", completed: false },
    { title: "Remove deprecated task API endpoints and update integration guides", priority: "low", category: "chore", completed: false }
  ];

  // Validate distribution requirements
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;

  const bugTasks = tasks.filter(task => task.category === 'bug').length;
  const featureTasks = tasks.filter(task => task.category === 'feature').length;
  const choreTasks = tasks.filter(task => task.category === 'chore').length;

  const completedTasks = tasks.filter(task => task.completed === true).length;
  const incompleteTasks = tasks.filter(task => task.completed === false).length;

  console.log(`Task Distribution Validation:`);
  console.log(`  Priority - High: ${highPriorityTasks}, Medium: ${mediumPriorityTasks}, Low: ${lowPriorityTasks}`);
  console.log(`  Category - Bug: ${bugTasks}, Feature: ${featureTasks}, Chore: ${choreTasks}`);
  console.log(`  Status - Completed: ${completedTasks}, Incomplete: ${incompleteTasks}`);

  // Create all tasks using createMany for better performance
  const result = await prisma.task.createMany({
    data: tasks,
    skipDuplicates: true // Prevent duplicate creation if seed runs multiple times
  });

  console.log(`Seeded ${result.count} tasks successfully`);
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
