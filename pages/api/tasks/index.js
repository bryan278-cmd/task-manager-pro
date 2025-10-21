import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Fetch ALL tasks first
      const [allTasks, totalTasks] = await Promise.all([
        prisma.task.findMany({
          orderBy: { createdAt: 'desc' }
        }),
        prisma.task.count()
      ]);

      // Sort by priority hierarchy
      const priorityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
      const sortedTasks = allTasks.sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      // Apply pagination AFTER sorting
      const tasks = sortedTasks.slice(skip, skip + limit);

      const totalPages = Math.ceil(totalTasks / limit);

      return res.status(200).json({
        data: tasks,
        pagination: {
          currentPage: page,
          totalPages,
          totalTasks,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      });
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
