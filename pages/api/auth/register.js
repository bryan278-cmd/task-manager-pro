import prisma from "../../../lib/prisma";
import { hash } from "bcryptjs";

// Build exactly 50 tasks with the required distributions:
// Priority: 15 "high", 20 "medium", 15 "low"
// Category: 16 "bug", 17 "feature", 17 "chore" (≈ distribution requested)
// Status: 10 completed = true, 40 completed = false
function buildSeedTasks(userId) {
  const priorities = [
    ...Array(15).fill("high"),
    ...Array(20).fill("medium"),
    ...Array(15).fill("low"),
  ];
  const categories = [
    ...Array(16).fill("bug"),
    ...Array(17).fill("feature"),
    ...Array(17).fill("chore"),
  ];
  const completedFlags = [
    ...Array(10).fill(true),
    ...Array(40).fill(false),
  ];

  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  shuffle(priorities);
  shuffle(categories);
  shuffle(completedFlags);

  const tasks = [];
  for (let i = 0; i < 50; i++) {
    tasks.push({
      title: `Task ${i + 1} - ${categories[i]} (${priorities[i]})`,
      priority: priorities[i],
      category: categories[i],
      completed: completedFlags[i],
      userId,
    });
  }
  return tasks;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password, name } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashed = await hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { email, password: hashed, name: name || null },
      });

      const tasks = buildSeedTasks(created.id);
      await tx.task.createMany({ data: tasks });

      return created;
    });

    return res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    console.error("Registration error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
