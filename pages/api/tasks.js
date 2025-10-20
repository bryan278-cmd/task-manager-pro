import { PrismaClient } from '@prisma/client';

let prisma;
if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}
prisma = global.__prisma;

/**
 * GET /api/tasks?page=1&limit=10
 * Returns paginated tasks ordered by priority (CRITICAL > HIGH > MEDIUM > LOW), then createdAt DESC.
 * Response:
 * {
 *   items: Task[],
 *   pagination: { total, totalPages, page, limit, hasMore }
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
    const limitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;

    const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
    const limitRaw = Math.max(1, parseInt(limitParam ?? '10', 10) || 10);
    const limit = Math.min(limitRaw, 50); // hard cap
    const skip = (page - 1) * limit;

    const total = await prisma.task.count();

    // Fetch ALL tasks first
    const [allItems, totalTasks] = await Promise.all([
      prisma.task.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.task.count()
    ]);

    // Sort by priority hierarchy
    const priorityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
    const sortedItems = allItems.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Apply pagination AFTER sorting
    const items = sortedItems.slice(skip, skip + limit);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const hasMore = page < totalPages;

    return res.status(200).json({
      items,
      pagination: { total, totalPages, page, limit, hasMore },
    });
  } catch (err) {
    console.error('GET /api/tasks error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
