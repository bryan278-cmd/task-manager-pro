// Priority scoring system
const PRIORITY_WEIGHTS = {
  CRITICAL: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25
};

const CATEGORY_WEIGHTS = {
  'Backend': 10,
  'Frontend': 8,
  'DevOps': 9,
  'Database': 7,
  'Security': 10,
  'Testing': 6
};

export function calculateTaskPriority(task) {
  let score = 0;
  
  // Base priority weight
  score += PRIORITY_WEIGHTS[task.priority] || 50;
  
  // Category importance
  score += CATEGORY_WEIGHTS[task.category] || 5;
  
  // Deadline urgency (exponential decay)
  if (task.deadline) {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) score += 50; // Overdue
    else if (daysUntil <= 1) score += 40;
    else if (daysUntil <= 3) score += 30;
    else if (daysUntil <= 7) score += 20;
    else if (daysUntil <= 14) score += 10;
  }
  
  // Complexity factor
  const complexityScores = { high: 15, medium: 10, low: 5 };
  score += complexityScores[task.complexity] || 0;
  
  // Dependencies boost
  score += (task.dependencies?.length || 0) * 5;
  
  // Estimated hours (longer tasks = higher priority to start early)
  if (task.estimatedHours > 8) score += 10;
  else if (task.estimatedHours > 4) score += 5;
  
  return score;
}

export function sortTasksByPriority(tasks) {
  return tasks
    .map(task => ({
      ...task,
      priorityScore: calculateTaskPriority(task)
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

// Apply filters to tasks
export function applyFilters(tasks, {status, category, priority}, completedMap) {
  return tasks.filter(task => {
    // Status filter
    if (status === 'Active' && completedMap[task.id]) return false;
    if (status === 'Completed' && !completedMap[task.id]) return false;
    
    // Category filter
    if (category !== 'All' && task.category !== category) return false;
    
    // Priority filter
    if (priority !== 'All' && task.priority !== priority) return false;
    
    return true;
  });
}
