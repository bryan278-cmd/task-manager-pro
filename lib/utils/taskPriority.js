import { PRIORITY_WEIGHTS } from '../constants/priorities.js';
import { CATEGORY_WEIGHTS } from '../constants/categories.js';

/**
 * Calculate a composite priority score for a task.
 * Higher is more important.
 */
export function calculateTaskPriority(task) {
  const priority = task?.priority ?? 'LOW';
  const category = task?.category ?? 'Backend';
  const createdAt = task?.createdAt ? new Date(task.createdAt) : null;

  const priorityWeight = PRIORITY_WEIGHTS[priority] ?? PRIORITY_WEIGHTS.LOW;   // ×10
  const categoryWeight = CATEGORY_WEIGHTS[category] ?? CATEGORY_WEIGHTS.Backend; // ×2

  // Recency bonus: tasks created within last 7 days get up to +10 (linear)
  let recencyBonus = 0;
  if (createdAt && !Number.isNaN(createdAt.getTime())) {
    const msInDay = 24 * 60 * 60 * 1000;
    const days = (Date.now() - createdAt.getTime()) / msInDay;
    if (days <= 7 && days >= 0) {
      // newer task → bigger bonus; 0 days => +10, 7 days => ~0
      recencyBonus = Math.max(0, 10 - (days * (10 / 7)));
    }
  }

  // Completed penalty
  const completedPenalty = task?.completed ? 100 : 0;

  const score = (priorityWeight * 10) + (categoryWeight * 2) + recencyBonus - completedPenalty;
  return Number.isFinite(score) ? score : 0;
}

/**
 * Sort tasks by score desc, then by createdAt desc as tiebreaker.
 */
export function sortTasksByPriority(tasks = []) {
  return [...tasks].sort((a, b) => {
    const sa = calculateTaskPriority(a);
    const sb = calculateTaskPriority(b);
    if (sb !== sa) return sb - sa;

    const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}
