import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth].js";

let prisma;
if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}
prisma = global.__prisma;

/**
 * POST /api/tasks/[id]/complete
 * Toggles completion status for a task
 * Returns the updated task
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Get current user session
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;
    const taskId = Array.isArray(id) ? id[0] : id;
    
    // Validate UUID format for string IDs
    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({ error: 'Invalid task id' });
    }

    // DEBUGGING: Log task ID and user ID for troubleshooting
    console.log("Updating task with ID:", taskId, "for user:", session.user.id);

    // Verify task belongs to current user
    const existing = await prisma.task.findUnique({
      where: {
        id: taskId,
        userId: session.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    const nextCompleted = !existing.completed;
    const nextCompletedAt = nextCompleted ? new Date() : null;

    const updated = await prisma.task.update({
      where: { id: taskId, userId: session.user.id },
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
