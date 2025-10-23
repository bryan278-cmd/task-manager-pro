import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth].js";
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session || !session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // First, get the current task to check its status and ownership
      const task = await prisma.task.findUnique({
        where: { id: id }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Verify task belongs to the current user
      if (task.userId !== session.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Toggle the completed status
      const updatedTask = await prisma.task.update({
        where: { id: id },
        data: { completed: !task.completed }
      });

      // Get updated completion statistics for this user
      const [totalTasks, completedTasks] = await Promise.all([
        prisma.task.count({
          where: { userId: session.user.id }
        }),
        prisma.task.count({
          where: { 
            userId: session.user.id,
            completed: true
          }
        })
      ]);

      res.status(200).json({
        task: updatedTask,
        completionStats: {
          totalTasks,
          completedTasks,
          completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        }
      });
    } catch (error) {
      console.error('Error toggling task:', error);
      res.status(500).json({ error: 'Failed to toggle task' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
