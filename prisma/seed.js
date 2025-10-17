/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * IMPORTANT:
 * - Paste the 54-task array from pages/index.js (the current localStorage dataset) into EXTENDED_TASKS below.
 * - Do NOT import from Next.js files; keep the seed self-contained.
 * - Default-date policy A:
 *   createdAt => now(UTC) if missing/invalid
 *   deadline  => createdAt + 14 days if missing/invalid
 *   completedAt => null unless completed===true and a valid date is provided
 */

// >>>>>>> BEGIN: PASTE YOUR 54 TASKS HERE (1:1 from pages/index.js) <<<<<<<
const EXTENDED_TASKS = [
  // BACKEND (12 tasks)
  { 
    id: 1, 
    title: 'Implement REST API authentication with JWT', 
    category: 'Backend',
    priority: 'CRITICAL',
    complexity: 'high',
    deadline: '2025-10-20',
    dependencies: [],
    tags: ['API', 'Auth', 'Security', 'JWT'],
    estimatedHours: 8,
    description: 'Setup JWT-based authentication with refresh tokens'
  },
  { 
    id: 2, 
    title: 'Optimize database queries with indexing', 
    category: 'Backend',
    priority: 'HIGH',
    complexity: 'medium',
    deadline: '2025-10-25',
    dependencies: [],
    tags: ['Database', 'Performance', 'SQL'],
    estimatedHours: 6,
    description: 'Add indexes to frequently queried columns'
  },
  { 
    id: 3, 
    title: 'Create GraphQL schema for user management', 
    category: 'Backend',
    priority: 'MEDIUM',
    complexity: 'medium',
    deadline: '2025-10-25',
    dependencies: [1],
    tags: ['GraphQL', 'API', 'Schema'],
    estimatedHours: 5,
    description: 'Design GraphQL types and resolvers'
  },
  { 
    id: 4, 
    title: 'Setup Redis caching layer', 
    category: 'Backend',
    priority: 'HIGH',
    complexity: 'medium',
    tags: ['Cache', 'Performance', 'Redis'],
    estimatedHours: 4,
    description: 'Implement Redis for session and query caching'
  },
  { 
    id: 5, 
    title: 'Implement rate limiting middleware', 
    category: 'Backend',
    priority: 'HIGH',
    complexity: 'low',
    tags: ['Security', 'Middleware', 'Express'],
    estimatedHours: 3,
    description: 'Add rate limiting to prevent abuse'
  },
  { 
    id: 6, 
    title: 'Setup WebSocket server for real-time updates', 
    category: 'Backend',
    priority: 'MEDIUM',
    complexity: 'high',
    tags: ['WebSocket', 'Real-time', 'Socket.io'],
    estimatedHours: 7,
    description: 'Enable real-time task updates'
  },
  { 
    id: 7, 
    title: 'Create API documentation with Swagger', 
    category: 'Backend',
    priority: 'LOW',
    complexity: 'low',
    tags: ['Documentation', 'API', 'Swagger'],
    estimatedHours: 4,
    description: 'Auto-generate API docs'
  },
  { 
    id: 8, 
    title: 'Implement file upload with S3', 
    category: 'Backend',
    priority: 'MEDIUM',
    complexity: 'medium',
    tags: ['Storage', 'AWS', 'Upload'],
    estimatedHours: 5,
    description: 'Add file attachment support'
  },
  { 
    id: 9, 
    title: 'Setup error tracking with Sentry', 
    category: 'Backend',
    priority: 'HIGH',
    complexity: 'low',
    deadline: '2025-10-18',
    tags: ['Monitoring', 'Errors', 'Sentry'],
    estimatedHours: 2,
    description: 'Track and alert on server errors'
  },
  { 
    id: 10, 
    title: 'Create database migration system', 
    category: 'Backend',
    priority: 'HIGH',
    complexity: 'medium',
    tags: ['Database', 'Migration', 'Version Control'],
    estimatedHours: 5,
    description: 'Setup Knex.js migrations'
  },
  { 
    id: 11, 
    title: 'Implement background job queue', 
    category: 'Backend',
    priority: 'MEDIUM',
    complexity: 'high',
    tags: ['Queue', 'Bull', 'Jobs'],
    estimatedHours: 6,
    description: 'Setup Bull for async tasks'
  },
  { 
    id: 12, 
    title: 'Add API versioning strategy', 
    category: 'Backend',
    priority: 'LOW',
    complexity: 'low',
    tags: ['API', 'Versioning', 'REST'],
    estimatedHours: 3,
    description: 'Implement /v1/, /v2/ routing'
  },
  
  // FRONTEND (15 tasks)
  { 
    id: 13, 
    title: 'Build responsive navigation with mobile menu', 
    category: 'Frontend',
    priority: 'HIGH',
    complexity: 'medium',
    deadline: '2025-10-18',
    tags: ['React', 'UI', 'Responsive'],
    estimatedHours: 5,
    description: 'Create hamburger menu for mobile'
  },
  { 
    id: 14, 
    title: 'Implement dark mode with system preference', 
    category: 'Frontend',
    priority: 'HIGH',
    complexity: 'low',
    deadline: '2025-10-16',
    tags: ['UI', 'Accessibility', 'Theme'],
    estimatedHours: 3,
    description: 'Toggle between light/dark themes'
  },
  { 
    id: 15, 
    title: 'Create reusable form validation hooks', 
    category: 'Frontend',
    priority: 'MEDIUM',
    complexity: 'medium',
    tags: ['React', 'Hooks', 'Forms'],
    estimatedHours: 4,
    description: 'Custom useForm hook with validation'
  },
  { 
    id: 16, 
    title: 'Optimize bundle size with code splitting', 
    category: 'Frontend',
    priority: 'HIGH',
    complexity: 'high',
    tags: ['Performance', 'Webpack', 'Optimization'],
    estimatedHours: 6,
    description: 'Dynamic imports and lazy loading'
  },
  { 
    id: 17, 
    title: 'Add skeleton loading states', 
    category: 'Frontend',
    priority: 'LOW',
    complexity: 'low',
    tags: ['UI', 'UX', 'Loading'],
    estimatedHours: 2,
    description: 'Shimmer placeholders while loading'
  },
  { 
    id: 18, 
    title: 'Implement infinite scroll with virtualization', 
    category: 'Frontend',
    priority: 'CRITICAL',
    complexity: 'high',
    deadline: '2025-10-17',
    tags: ['Performance', 'UX', 'Scroll'],
    estimatedHours: 7,
    description: 'Virtual scrolling for 1000+ items'
  },
  { 
    id: 19, 
    title: 'Create toast notification system', 
    category: 'Frontend',
    priority: 'MEDIUM',
    complexity: 'low',
    tags: ['UI', 'Notifications', 'UX'],
    estimatedHours: 3,
    description: 'Success/error/warning toasts'
  },
  { 
    id: 20, 
    title: 'Add drag-and-drop task reordering', 
    category: 'Frontend',
    priority: 'LOW',
    complexity: 'high',
    tags: ['UI', 'Interaction', 'DnD'],
    estimatedHours: 8,
    description: 'Drag tasks to change priority'
  },
  { 
    id: 21, 
    title: 'Implement search with debouncing', 
    category: 'Frontend',
    priority: 'MEDIUM',
    complexity: 'low',
    tags: ['Search', 'UX', 'Performance'],
    estimatedHours: 3,
    description: 'Filter tasks by keyword'
  },
  { 
    id: 22, 
    title: 'Create animated progress bars', 
    category: 'Frontend',
    priority: 'LOW',
    complexity: 'low',
    tags: ['Animation', 'UI', 'Progress'],
    estimatedHours: 2,
    description: 'Visual task completion indicators'
  },
  { 
    id: 23, 
    title: 'Add keyboard shortcuts', 
    category: 'Frontend',
    priority: 'MEDIUM',
    complexity: 'medium',
    tags: ['Accessibility', 'UX', 'Keyboard'],
    estimatedHours: 4,
    description: 'Hotkeys for common actions'
  },
  { 
    id: 24, 
    title: 'Implement error boundaries', 
    category: 'Frontend',
    priority: 'HIGH',
    complexity: 'low',
    tags: ['Error', 'React', 'Stability'],
    estimatedHours: 2,
    description: 'Graceful error handling'
  },
  { 
    id: 25, 
    title: 'Create multi-select with bulk actions', 
    category: 'Frontend',
    priority: 'MEDIUM',
    complexity: 'medium',
    tags: ['UI', 'UX', 'Bulk'],
    estimatedHours: 5,
    description: 'Select multiple tasks for batch operations'
  },
  { 
    id: 26, 
    title: 'Add data export to CSV/JSON', 
    category: 'Frontend',
    priority: 'LOW',
    complexity: 'low',
    tags: ['Export', 'Data', 'Download'],
    estimatedHours: 3,
    description: 'Download tasks as file'
  },
  { 
    id: 27, 
    title: 'Implement accessibility audit fixes', 
    category: 'Frontend',
    priority: 'HIGH',
    complexity: 'medium',
    deadline: '2025-10-19',
    tags: ['Accessibility', 'WCAG', 'A11y'],
    estimatedHours: 6,
    description: 'WCAG 2.1 AA compliance'
  },
  
  // DEVOPS (12 tasks)
  { 
    id: 28, 
    title: 'Setup CI/CD pipeline with GitHub Actions', 
    category: 'DevOps',
    priority: 'CRITICAL',
    complexity: 'high',
    deadline: '2025-10-19',
    tags: ['CI/CD', 'Automation', 'GitHub'],
    estimatedHours: 8,
    description: 'Automated testing and deployment'
  },
  { 
    id: 29, 
    title: 'Configure Docker multi-stage builds', 
    category: 'DevOps',
    priority: 'HIGH',
    complexity: 'medium',
    tags: ['Docker', 'Optimization', 'Container'],
    estimatedHours: 4,
    description: 'Reduce image size by 70%'
  },
  { 
    id: 30, 
    title: 'Implement blue-green deployment', 
    category: 'DevOps',
    priority: 'MEDIUM',
    complexity: 'high',
    dependencies: [28],
    tags: ['Deployment', 'Kubernetes', 'Zero-downtime'],
    estimatedHours: 10,
    description: 'Zero-downtime deployments'
  },
  { 
    id: 31, 
    title: 'Setup monitoring with Prometheus + Grafana', 
    category: 'DevOps',
    priority: 'HIGH',
    complexity: 'medium',
    tags: ['Monitoring', 'Observability', 'Metrics'],
    estimatedHours: 5,
    description: 'Real-time metrics dashboards'
  },
  { 
    id: 32, 
    title: 'Configure auto-scaling policies', 
    category: 'DevOps',
    priority: 'MEDIUM',
    complexity: 'medium',
    tags: ['Scalability', 'Cloud', 'Auto-scale'],
    estimatedHours: 4,
    description: 'Scale based on CPU/memory'
  },
  { 
    id: 33, 
    title: 'Implement log aggregation with ELK', 
    category: 'DevOps',
    priority: 'MEDIUM',
    complexity: 'high',
    tags: ['Logging', 'ELK', 'Debugging'],
    estimatedHours: 7,
    description: 'Centralized log management'
  },
  { 
    id: 34, 
    title: 'Setup infrastructure as code with Terraform', 
    category: 'DevOps',
    priority: 'LOW',
    complexity: 'high',
    tags: ['IaC', 'Terraform', 'Automation'],
    estimatedHours: 9,
    description: 'Version-controlled infrastructure'
  },
  { 
    id: 35, 
    title: 'Create disaster recovery plan', 
    category: 'DevOps',
    priority: 'HIGH',
    complexity: 'medium',
    deadline: '2025-10-21',
    tags: ['DR', 'Backup', 'Resilience'],
    estimatedHours: 6,
    description: 'Backup and recovery procedures'
  },
  { 
    id: 36, 
    title: 'Implement secret management with Vault', 
    category: 'DevOps',
    priority: 'HIGH',
    complexity: 'medium',
    tags: ['Security', 'Secrets', 'Vault'],
    estimatedHours: 5,
    description: 'Secure credential storage'
  },
  { 
    id: 37, 
    title: 'Setup performance testing with k6', 
    category: 'DevOps',
    priority: 'MEDIUM',
    complexity: 'low',
    tags: ['Testing', 'Performance', 'Load'],
    estimatedHours: 3,
    description: 'Automated load testing'
  },
  { 
    id: 38, 
    title: 'Configure CDN with CloudFlare', 
    category: 'DevOps',
    priority: 'MEDIUM',
    complexity: 'low',
    tags: ['CDN', 'Performance', 'CloudFlare'],
    estimatedHours: 3,
    description: 'Global content delivery'
  },
  { 
    id: 39, 
    title: 'Implement health checks and readiness probes', 
    category: 'DevOps',
    priority: 'HIGH',
    complexity: 'low',
    tags: ['Health', 'Monitoring', 'K8s'],
    estimatedHours: 2,
    description: 'Service health monitoring'
  },
  
  // DATABASE (8 tasks)
  { 
    id: 40, 
    title: 'Design database normalization strategy', 
    category: 'Database',
    priority: 'HIGH',
    complexity: 'high',
    tags: ['Schema', 'Optimization', 'Design'],
    estimatedHours: 6,
    description: '3NF normalization for efficiency'
  },
  { 
    id: 41, 
    title: 'Implement database backup automation', 
    category: 'Database',
    priority: 'CRITICAL',
    complexity: 'medium',
    deadline: '2025-10-21',
    tags: ['Backup', 'DR', 'Automation'],
    estimatedHours: 5,
    description: 'Hourly incremental backups'
  },
  { 
    id: 42, 
    title: 'Setup database replication (master-slave)', 
    category: 'Database',
    priority: 'HIGH',
    complexity: 'high',
    tags: ['HA', 'Replication', 'Redundancy'],
    estimatedHours: 8,
    description: 'High availability setup'
  },
  { 
    id: 43, 
    title: 'Create migration scripts for schema changes', 
    category: 'Database',
    priority: 'MEDIUM',
    complexity: 'low',
    tags: ['Migration', 'Version Control', 'Schema'],
    estimatedHours: 3,
    description: 'Safe schema evolution'
  },
  { 
    id: 44, 
    title: 'Optimize slow queries with EXPLAIN ANALYZE', 
    category: 'Database',
    priority: 'HIGH',
    complexity: 'medium',
    tags: ['Performance', 'Tuning', 'SQL'],
    estimatedHours: 4,
    description: 'Identify and fix bottlenecks'
  },
  { 
    id: 45, 
    title: 'Implement database connection pooling', 
    category: 'Database',
    priority: 'HIGH',
    complexity: 'low',
    tags: ['Performance', 'Connections', 'Pooling'],
    estimatedHours: 2,
    description: 'Reuse connections efficiently'
  },
  { 
    id: 46, 
    title: 'Setup database monitoring and alerts', 
    category: 'Database',
    priority: 'MEDIUM',
    complexity: 'medium',
    tags: ['Monitoring', 'Alerts', 'Observability'],
    estimatedHours: 4,
    description: 'Track performance metrics'
  },
  { 
    id: 47, 
    title: 'Create database seeding scripts', 
    category: 'Database',
    priority: 'LOW',
    complexity: 'low',
    tags: ['Testing', 'Seed', 'Development'],
    estimatedHours: 2,
    description: 'Populate test data'
  },
  
  // SECURITY (7 tasks)
  { 
    id: 48, 
    title: 'Implement OAuth 2.0 with Google/GitHub', 
    category: 'Security',
    priority: 'CRITICAL',
    complexity: 'high',
    deadline: '2025-10-23',
    tags: ['Auth', 'OAuth', 'SSO'],
    estimatedHours: 10,
    description: 'Social login integration'
  },
  { 
    id: 49, 
    title: 'Add CSRF protection middleware', 
    category: 'Security',
    priority: 'HIGH',
    complexity: 'low',
    tags: ['Security', 'Web', 'CSRF'],
    estimatedHours: 2,
    description: 'Prevent cross-site attacks'
  },
  { 
    id: 50, 
    title: 'Conduct security audit and penetration testing', 
    category: 'Security',
    priority: 'HIGH',
    complexity: 'high',
    deadline: '2025-10-26',
    tags: ['Audit', 'Testing', 'PenTest'],
    estimatedHours: 12,
    description: 'Find and fix vulnerabilities'
  },
  { 
    id: 51, 
    title: 'Implement input sanitization for XSS prevention', 
    category: 'Security',
    priority: 'CRITICAL',
    complexity: 'medium',
    tags: ['XSS', 'Validation', 'Sanitization'],
    estimatedHours: 4,
    description: 'Sanitize all user inputs'
  },
  { 
    id: 52, 
    title: 'Setup SSL/TLS with auto-renewal', 
    category: 'Security',
    priority: 'HIGH',
    complexity: 'low',
    deadline: '2025-10-17',
    tags: ['SSL', 'Encryption', 'Certificates'],
    estimatedHours: 2,
    description: "Let's Encrypt automation"
  },
  { 
    id: 53, 
    title: 'Implement Content Security Policy headers', 
    category: 'Security',
    priority: 'MEDIUM',
    complexity: 'low',
    tags: ['CSP', 'Headers', 'Security'],
    estimatedHours: 3,
    description: 'Prevent XSS and injection attacks'
  },
  { 
    id: 54, 
    title: 'Add two-factor authentication (2FA)', 
    category: 'Security',
    priority: 'MEDIUM',
    complexity: 'high',
    tags: ['2FA', 'Auth', 'Security'],
    estimatedHours: 8,
    description: 'TOTP-based 2FA'
  },
];
// >>>>>>> END: PASTE HERE <<<<<<<

function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return isValidDate(d) ? d : null;
}

// Default-date policy A
function defaultDates(task) {
  const now = new Date(); // UTC
  const created = toDateOrNull(task.createdAt) ?? now;
  const fallbackDeadline = new Date(created.getTime() + 14 * 24 * 60 * 60 * 1000);
  const deadline = toDateOrNull(task.deadline) ?? fallbackDeadline;

  const completedAt =
    task.completed === true && task.completedAt
      ? toDateOrNull(task.completedAt)
      : null;

  return { created, deadline, completedAt };
}

function sanitizeTask(t) {
  if (!t || typeof t !== 'object') throw new Error('Invalid task object');
  if (!Number.isFinite(t.id)) throw new Error(`Invalid or missing id for task "${t.title}"`);

  const { created, deadline, completedAt } = defaultDates(t);

  return {
    id: t.id,
    title: String(t.title ?? '').trim(),
    description: t.description ? String(t.description) : null,
    category: String(t.category ?? '').trim(),
    priority: String(t.priority ?? '').trim(),
    complexity: String(t.complexity ?? '').trim(),
    deadline,
    tags: Array.isArray(t.tags) ? t.tags.map(String) : [],
    estimatedHours: Number.isFinite(t.estimatedHours) ? t.estimatedHours : 0,
    dependencies: Array.isArray(t.dependencies) ? t.dependencies.filter(n => Number.isFinite(n)).map(Number) : [],
    completed: Boolean(t.completed),
    completedAt,
    createdAt: created,
  };
}

async function main() {
  if (!Array.isArray(EXTENDED_TASKS) || EXTENDED_TASKS.length === 0) {
    throw new Error('EXTENDED_TASKS is empty. Paste the 54 tasks from pages/index.js (1:1).');
  }

  // Validate and constrain dependency refs
  const validIds = new Set(EXTENDED_TASKS.map(t => t.id).filter(Number.isFinite));
  const prepared = EXTENDED_TASKS.map(raw => {
    const s = sanitizeTask(raw);
    s.dependencies = s.dependencies.filter(id => validIds.has(id));
    return s;
  });

  // Idempotent upsert preserving IDs
  for (const task of prepared) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        complexity: task.complexity,
        deadline: task.deadline,
        tags: task.tags,
        estimatedHours: task.estimatedHours,
        dependencies: task.dependencies,
        completed: task.completed,
        completedAt: task.completedAt,
      },
      create: {
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        complexity: task.complexity,
        deadline: task.deadline,
        tags: task.tags,
        estimatedHours: task.estimatedHours,
        dependencies: task.dependencies,
        completed: task.completed,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
      },
    });
  }

  // Resequence serial to MAX(id) to avoid future collisions
  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"Task"', 'id'),
      COALESCE((SELECT MAX(id) FROM "Task"), 1)
    );
  `);

  console.log('✅ Seeded ' + prepared.length + ' tasks (idempotent).');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
