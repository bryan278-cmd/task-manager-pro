import prisma from "../../../../lib/prisma.js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth].js";

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { id: taskId } = req.query; // It's a string!
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: session.user.id },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { completed: !task.completed }, // The TOGGLE logic
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error toggling task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
