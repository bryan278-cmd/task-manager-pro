import { PrismaClient } from '@prisma/client';

let prisma;
if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}
prisma = global.__prisma;

/**
 * POST /api/tasks/[id]/complete
 * Toggles completion:
 *  - If completed=false -> true, sets completedAt to now
 *  - If completed=true  -> false, sets completedAt to null
 * Returns the updated task
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { id } = req.query;
    const taskId = Number(Array.isArray(id) ? id[0] : id);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ error: 'Invalid task id' });
    }

    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const nextCompleted = !existing.completed;
    const nextCompletedAt = nextCompleted ? new Date() : null;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        completed: nextCompleted,
        completedAt: nextCompletedAt,
      },
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error('POST /api/tasks/[id]/complete error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
