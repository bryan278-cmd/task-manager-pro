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
  // Example item; REPLACE with the real 54 entries from your app:
  // {
  //   id: 1,
  //   title: "Example task",
  //   description: "Details...",
  //   category: "Backend",
  //   priority: "HIGH",
  //   complexity: "medium",
  //   deadline: "2025-10-20T12:00:00.000Z",
  //   tags: ["example"],
  //   estimatedHours: 3,
  //   dependencies: [2, 3],
  //   completed: false,
  //   completedAt: null,
  //   createdAt: "2025-10-15T10:00:00.000Z"
  // },
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
