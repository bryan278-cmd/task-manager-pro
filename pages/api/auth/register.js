import prisma from "../../../lib/prisma.js";
import { hash } from "bcryptjs";

// Build exactly 50 tasks organized by difficulty levels for the user's experience level
// Each experience level gets 5 pages of 10 tasks with increasing difficulty
// Priority: 15 "high", 20 "medium", 15 "low"  
// Category: 17 "bug", 17 "feature", 16 "chore"
// Status: 10 completed = true, 40 completed = false
function buildSeedTasks(userId, experienceLevel) {
  // Define task templates organized by difficulty levels
  const difficultyLevels = {
    junior: [
      // Level 1 - Basic tasks (10 tasks)
      [
        { title: 'Setup local development environment', category: 'chore', priority: 'high' },
        { title: 'Create responsive navigation bar', category: 'feature', priority: 'high' },
        { title: 'Implement form validation with basic rules', category: 'feature', priority: 'medium' },
        { title: 'Setup database connection with Prisma', category: 'chore', priority: 'medium' },
        { title: 'Add loading states to UI components', category: 'feature', priority: 'low' },
        { title: 'Create user registration form', category: 'feature', priority: 'high' },
        { title: 'Implement basic authentication flow', category: 'feature', priority: 'high' },
        { title: 'Add error handling to API calls', category: 'bug', priority: 'medium' },
        { title: 'Create task list display component', category: 'feature', priority: 'high' },
        { title: 'Setup basic project structure', category: 'chore', priority: 'medium' }
      ],
      // Level 2 - Intermediate tasks (10 tasks)
      [
        { title: 'Implement REST API with CRUD operations', category: 'feature', priority: 'high' },
        { title: 'Add search functionality with filtering', category: 'feature', priority: 'medium' },
        { title: 'Create database migration scripts', category: 'chore', priority: 'medium' },
        { title: 'Implement user profile management', category: 'feature', priority: 'high' },
        { title: 'Add pagination to task lists', category: 'feature', priority: 'medium' },
        { title: 'Setup automated testing framework', category: 'chore', priority: 'medium' },
        { title: 'Implement data caching strategy', category: 'feature', priority: 'medium' },
        { title: 'Create task creation form with validation', category: 'feature', priority: 'high' },
        { title: 'Add real-time updates with WebSockets', category: 'feature', priority: 'medium' },
        { title: 'Implement file upload functionality', category: 'feature', priority: 'medium' }
      ],
      // Level 3 - Advanced tasks (10 tasks)
      [
        { title: 'Implement OAuth 2.0 authentication', category: 'feature', priority: 'high' },
        { title: 'Setup CI/CD pipeline with GitHub Actions', category: 'chore', priority: 'high' },
        { title: 'Create advanced filtering and sorting', category: 'feature', priority: 'high' },
        { title: 'Implement database backup automation', category: 'chore', priority: 'high' },
        { title: 'Add performance monitoring and metrics', category: 'chore', priority: 'medium' },
        { title: 'Create custom hooks for data management', category: 'feature', priority: 'medium' },
        { title: 'Implement rate limiting and security measures', category: 'bug', priority: 'high' },
        { title: 'Setup containerization with Docker', category: 'chore', priority: 'medium' },
        { title: 'Add comprehensive error tracking', category: 'bug', priority: 'medium' },
        { title: 'Implement data export functionality', category: 'feature', priority: 'low' }
      ],
      // Level 4 - Expert tasks (10 tasks)
      [
        { title: 'Design and implement microservices architecture', category: 'feature', priority: 'high' },
        { title: 'Create advanced analytics dashboard', category: 'feature', priority: 'high' },
        { title: 'Implement advanced security measures', category: 'bug', priority: 'high' },
        { title: 'Setup database replication and clustering', category: 'chore', priority: 'high' },
        { title: 'Create automated deployment orchestration', category: 'chore', priority: 'high' },
        { title: 'Implement real-time collaboration features', category: 'feature', priority: 'medium' },
        { title: 'Add machine learning task recommendations', category: 'feature', priority: 'medium' },
        { title: 'Create advanced performance optimization', category: 'chore', priority: 'medium' },
        { title: 'Implement disaster recovery procedures', category: 'chore', priority: 'high' },
        { title: 'Setup comprehensive monitoring stack', category: 'chore', priority: 'high' }
      ],
      // Level 5 - Master tasks (10 tasks)
      [
        { title: 'Design and implement distributed system architecture', category: 'feature', priority: 'high' },
        { title: 'Implement advanced machine learning pipelines', category: 'feature', priority: 'high' },
        { title: 'Create enterprise-level security infrastructure', category: 'bug', priority: 'high' },
        { title: 'Setup advanced cloud infrastructure automation', category: 'chore', priority: 'high' },
        { title: 'Design and implement real-time data processing systems', category: 'feature', priority: 'high' },
        { title: 'Create advanced performance monitoring dashboards', category: 'chore', priority: 'medium' },
        { title: 'Implement advanced caching and CDN strategies', category: 'feature', priority: 'medium' },
        { title: 'Design and implement API management platforms', category: 'feature', priority: 'medium' },
        { title: 'Create advanced testing automation frameworks', category: 'chore', priority: 'medium' },
        { title: 'Implement advanced deployment and release strategies', category: 'chore', priority: 'high' }
      ]
    ],
    mid: [
      // Level 1 - Intermediate tasks (10 tasks)
      [
        { title: 'Implement REST API with CRUD operations', category: 'feature', priority: 'high' },
        { title: 'Add search functionality with filtering', category: 'feature', priority: 'medium' },
        { title: 'Create database migration scripts', category: 'chore', priority: 'medium' },
        { title: 'Implement user profile management', category: 'feature', priority: 'high' },
        { title: 'Add pagination to task lists', category: 'feature', priority: 'medium' },
        { title: 'Setup automated testing framework', category: 'chore', priority: 'medium' },
        { title: 'Implement data caching strategy', category: 'feature', priority: 'medium' },
        { title: 'Create task creation form with validation', category: 'feature', priority: 'high' },
        { title: 'Add real-time updates with WebSockets', category: 'feature', priority: 'medium' },
        { title: 'Implement file upload functionality', category: 'feature', priority: 'medium' }
      ],
      // Level 2 - Advanced tasks (10 tasks)
      [
        { title: 'Implement OAuth 2.0 authentication', category: 'feature', priority: 'high' },
        { title: 'Setup CI/CD pipeline with GitHub Actions', category: 'chore', priority: 'high' },
        { title: 'Create advanced filtering and sorting', category: 'feature', priority: 'high' },
        { title: 'Implement database backup automation', category: 'chore', priority: 'high' },
        { title: 'Add performance monitoring and metrics', category: 'chore', priority: 'medium' },
        { title: 'Create custom hooks for data management', category: 'feature', priority: 'medium' },
        { title: 'Implement rate limiting and security measures', category: 'bug', priority: 'high' },
        { title: 'Setup containerization with Docker', category: 'chore', priority: 'medium' },
        { title: 'Add comprehensive error tracking', category: 'bug', priority: 'medium' },
        { title: 'Implement data export functionality', category: 'feature', priority: 'low' }
      ],
      // Level 3 - Expert tasks (10 tasks)
      [
        { title: 'Design and implement microservices architecture', category: 'feature', priority: 'high' },
        { title: 'Create advanced analytics dashboard', category: 'feature', priority: 'high' },
        { title: 'Implement advanced security measures', category: 'bug', priority: 'high' },
        { title: 'Setup database replication and clustering', category: 'chore', priority: 'high' },
        { title: 'Create automated deployment orchestration', category: 'chore', priority: 'high' },
        { title: 'Implement real-time collaboration features', category: 'feature', priority: 'medium' },
        { title: 'Add machine learning task recommendations', category: 'feature', priority: 'medium' },
        { title: 'Create advanced performance optimization', category: 'chore', priority: 'medium' },
        { title: 'Implement disaster recovery procedures', category: 'chore', priority: 'high' },
        { title: 'Setup comprehensive monitoring stack', category: 'chore', priority: 'high' }
      ],
      // Level 4 - Senior tasks (10 tasks)
      [
        { title: 'Implement distributed system design patterns', category: 'feature', priority: 'high' },
        { title: 'Create enterprise-level security framework', category: 'bug', priority: 'high' },
        { title: 'Design and implement event-driven architecture', category: 'feature', priority: 'high' },
        { title: 'Setup advanced database optimization strategies', category: 'chore', priority: 'high' },
        { title: 'Implement advanced DevOps automation', category: 'chore', priority: 'high' },
        { title: 'Create advanced machine learning pipelines', category: 'feature', priority: 'medium' },
        { title: 'Implement advanced caching strategies', category: 'feature', priority: 'medium' },
        { title: 'Design and implement API gateway patterns', category: 'feature', priority: 'medium' },
        { title: 'Create advanced monitoring and alerting', category: 'chore', priority: 'medium' },
        { title: 'Implement advanced testing strategies', category: 'chore', priority: 'medium' }
      ],
      // Level 5 - Master tasks (10 tasks)
      [
        { title: 'Design and implement distributed system architecture', category: 'feature', priority: 'high' },
        { title: 'Implement advanced machine learning pipelines', category: 'feature', priority: 'high' },
        { title: 'Create enterprise-level security infrastructure', category: 'bug', priority: 'high' },
        { title: 'Setup advanced cloud infrastructure automation', category: 'chore', priority: 'high' },
        { title: 'Design and implement real-time data processing systems', category: 'feature', priority: 'high' },
        { title: 'Create advanced performance monitoring dashboards', category: 'chore', priority: 'medium' },
        { title: 'Implement advanced caching and CDN strategies', category: 'feature', priority: 'medium' },
        { title: 'Design and implement API management platforms', category: 'feature', priority: 'medium' },
        { title: 'Create advanced testing automation frameworks', category: 'chore', priority: 'medium' },
        { title: 'Implement advanced deployment and release strategies', category: 'chore', priority: 'high' }
      ]
    ],
    senior: [
      // Level 1 - Advanced tasks (10 tasks)
      [
        { title: 'Implement OAuth 2.0 authentication', category: 'feature', priority: 'high' },
        { title: 'Setup CI/CD pipeline with GitHub Actions', category: 'chore', priority: 'high' },
        { title: 'Create advanced filtering and sorting', category: 'feature', priority: 'high' },
        { title: 'Implement database backup automation', category: 'chore', priority: 'high' },
        { title: 'Add performance monitoring and metrics', category: 'chore', priority: 'medium' },
        { title: 'Create custom hooks for data management', category: 'feature', priority: 'medium' },
        { title: 'Implement rate limiting and security measures', category: 'bug', priority: 'high' },
        { title: 'Setup containerization with Docker', category: 'chore', priority: 'medium' },
        { title: 'Add comprehensive error tracking', category: 'bug', priority: 'medium' },
        { title: 'Implement data export functionality', category: 'feature', priority: 'low' }
      ],
      // Level 2 - Expert tasks (10 tasks)
      [
        { title: 'Design and implement microservices architecture', category: 'feature', priority: 'high' },
        { title: 'Create advanced analytics dashboard', category: 'feature', priority: 'high' },
        { title: 'Implement advanced security measures', category: 'bug', priority: 'high' },
        { title: 'Setup database replication and clustering', category: 'chore', priority: 'high' },
        { title: 'Create automated deployment orchestration', category: 'chore', priority: 'high' },
        { title: 'Implement real-time collaboration features', category: 'feature', priority: 'medium' },
        { title: 'Add machine learning task recommendations', category: 'feature', priority: 'medium' },
        { title: 'Create advanced performance optimization', category: 'chore', priority: 'medium' },
        { title: 'Implement disaster recovery procedures', category: 'chore', priority: 'high' },
        { title: 'Setup comprehensive monitoring stack', category: 'chore', priority: 'high' }
      ],
      // Level 3 - Senior tasks (10 tasks)
      [
        { title: 'Implement distributed system design patterns', category: 'feature', priority: 'high' },
        { title: 'Create enterprise-level security framework', category: 'bug', priority: 'high' },
        { title: 'Design and implement event-driven architecture', category: 'feature', priority: 'high' },
        { title: 'Setup advanced database optimization strategies', category: 'chore', priority: 'high' },
        { title: 'Implement advanced DevOps automation', category: 'chore', priority: 'high' },
        { title: 'Create advanced machine learning pipelines', category: 'feature', priority: 'medium' },
        { title: 'Implement advanced caching strategies', category: 'feature', priority: 'medium' },
        { title: 'Design and implement API gateway patterns', category: 'feature', priority: 'medium' },
        { title: 'Create advanced monitoring and alerting', category: 'chore', priority: 'medium' },
        { title: 'Implement advanced testing strategies', category: 'chore', priority: 'medium' }
      ],
      // Level 4 - Leadership tasks (10 tasks)
      [
        { title: 'Design and implement enterprise architecture', category: 'feature', priority: 'high' },
        { title: 'Create comprehensive security compliance framework', category: 'bug', priority: 'high' },
        { title: 'Implement advanced DevOps governance', category: 'chore', priority: 'high' },
        { title: 'Design and implement data governance strategies', category: 'chore', priority: 'high' },
        { title: 'Create advanced team collaboration workflows', category: 'chore', priority: 'medium' },
        { title: 'Implement advanced performance analytics', category: 'chore', priority: 'medium' },
        { title: 'Design and implement disaster recovery planning', category: 'chore', priority: 'high' },
        { title: 'Create advanced monitoring and incident response', category: 'chore', priority: 'high' },
        { title: 'Implement advanced quality assurance processes', category: 'chore', priority: 'medium' },
        { title: 'Design and implement technology roadmap', category: 'chore', priority: 'medium' }
      ],
      // Level 5 - Master tasks (10 tasks)
      [
        { title: 'Design and implement distributed system architecture', category: 'feature', priority: 'high' },
        { title: 'Implement advanced machine learning pipelines', category: 'feature', priority: 'high' },
        { title: 'Create enterprise-level security infrastructure', category: 'bug', priority: 'high' },
        { title: 'Setup advanced cloud infrastructure automation', category: 'chore', priority: 'high' },
        { title: 'Design and implement real-time data processing systems', category: 'feature', priority: 'high' },
        { title: 'Create advanced performance monitoring dashboards', category: 'chore', priority: 'medium' },
        { title: 'Implement advanced caching and CDN strategies', category: 'feature', priority: 'medium' },
        { title: 'Design and implement API management platforms', category: 'feature', priority: 'medium' },
        { title: 'Create advanced testing automation frameworks', category: 'chore', priority: 'medium' },
        { title: 'Implement advanced deployment and release strategies', category: 'chore', priority: 'high' }
      ]
    ]
  };

  // Get tasks for the user's experience level
  const userTasks = difficultyLevels[experienceLevel] || difficultyLevels.junior;
  
  // Flatten all tasks and add difficulty levels
  const allTasks = [];
  userTasks.forEach((levelTasks, levelIndex) => {
    levelTasks.forEach(task => {
      allTasks.push({
        ...task,
        completed: Math.random() < 0.2, // 20% completed initially
        difficultyLevel: levelIndex + 1,
        userId,
      });
    });
  });

  return allTasks;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password, name, experienceLevel } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }
  if (!experienceLevel || !['junior', 'mid', 'senior'].includes(experienceLevel)) {
    return res.status(400).json({ error: "Valid experience level (junior, mid, senior) is required" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashed = await hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { email, password: hashed, name: name || null, experienceLevel },
      });

      const tasks = buildSeedTasks(created.id, experienceLevel);
      await tx.task.createMany({ data: tasks });

      return created;
    });

    return res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    console.error("Registration error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
