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

      const task = await prisma.task.findUnique({
        where: { id: id } // id is a string, not integer
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Verify task belongs to the current user
      if (task.userId !== session.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updatedTask = await prisma.task.update({
        where: { id: id },
        data: { completed: true }
      });

      res.status(200).json(updatedTask);
    } catch (error) {
      console.error('Error completing task:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
