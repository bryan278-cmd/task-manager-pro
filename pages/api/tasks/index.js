import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth].js";
import prisma from '../../../lib/prisma';

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
    
    // Build where clause for filtered tasks
    const whereClause = {
      userId: session.user.id
    };
    
    // Add priority filter if not 'ALL'
    if (priorityFilter !== 'ALL') {
      whereClause.priority = priorityFilter.toLowerCase();
    }

    // Get total task count for this user (always 50 per requirements)
    const totalTaskCount = await prisma.task.count({
      where: { userId: session.user.id }
    });

// Fetch tasks with filtering and pagination, ordered by ID for consistency
    const [tasks, filteredTaskCount, completedFilteredTasks] = await Promise.all([
      prisma.task.findMany({
        where: whereClause,
        orderBy: [
          { id: 'asc' } // Consistent ordering by ID to prevent React reconciliation issues
        ],
        skip: skip,
        take: limit
      }),
      prisma.task.count({
        where: whereClause
      }),
      prisma.task.count({
        where: {
          userId: session.user.id,
          completed: true
        }
      })
    ]);

    // Calculate total pages (maximum 5 pages)
    const totalPages = Math.min(Math.ceil(filteredTaskCount / limit), 5);
    
    // Ensure current page doesn't exceed total pages
    const currentPage = Math.min(page, totalPages);

    // Calculate completion percentage for progress bar (based on ALL tasks, not just filtered)
    const completionPercentage = totalTaskCount > 0 ? Math.round((completedFilteredTasks / totalTaskCount) * 100) : 0;

    return res.status(200).json({
      data: tasks,
      pagination: {
        currentPage: currentPage,
        totalPages,
        totalTasks: filteredTaskCount,
        completedTasks: completedFilteredTasks,
        totalUserTasks: totalTaskCount, // Total tasks for this user
        completionPercentage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
