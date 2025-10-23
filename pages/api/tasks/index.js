import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth].js";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Fixed limit of 10 tasks per page
    const skip = (page - 1) * limit;
    
    // Get priority filter from query parameters
    const priorityFilter = req.query.priority || 'ALL';
    
    // Build where clause
    const whereClause = {
      userId: session.user.id
    };
    
    // Add priority filter if not 'ALL'
    if (priorityFilter !== 'ALL') {
      whereClause.priority = priorityFilter.toLowerCase();
    }

    // Fetch tasks with filtering and pagination
    const [tasks, totalTasks] = await Promise.all([
      prisma.task.findMany({
        where: whereClause,
        orderBy: [
          { priority: 'desc' }, // HIGH → MEDIUM → LOW ordering
          { createdAt: 'desc' } // Secondary ordering by creation date
        ],
        skip: skip,
        take: limit
      }),
      prisma.task.count({
        where: whereClause
      })
    ]);

    // Calculate total pages (maximum 5 pages)
    const totalPages = Math.min(Math.ceil(totalTasks / limit), 5);
    
    // Ensure current page doesn't exceed total pages
    const currentPage = Math.min(page, totalPages);

    return res.status(200).json({
      data: tasks,
      pagination: {
        currentPage: currentPage,
        totalPages,
        totalTasks,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
