import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Allowed values for validation
const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_CATEGORIES = new Set(["bug", "feature", "chore"]);

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = session.user.id;

  if (req.method === "GET") {
    // Pagination (defaults)
    const page = Math.max(parseInt(req.query.page ?? "1", 10) || 1, 1);
    const pageSize = Math.max(parseInt(req.query.pageSize ?? "10", 10) || 10, 1);
    const take = Math.min(pageSize, 50);
    const skip = (page - 1) * take;

    // NOTE: Keep ordering simple and stable. (Priority ordering can be added later if needed.)
    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where: { userId },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      prisma.task.count({ where: { userId } }),
    ]);

    return res.status(200).json({
      page,
      pageSize: take,
      total,
      items,
    });
  }

  if (req.method === "POST") {
    const { title, priority, category } = req.body || {};

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!ALLOWED_PRIORITIES.has(priority)) {
      return res.status(400).json({ error: "Invalid priority" });
    }
    if (!ALLOWED_CATEGORIES.has(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const created = await prisma.task.create({
      data: {
        title,
        priority,
        category,
        userId,
      },
    });

    return res.status(201).json(created);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}
