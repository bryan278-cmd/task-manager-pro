import React from 'react';
import CompleteButton from '../CompleteButton'; // Import your new button

const TaskCard = ({ task }) => { // Assuming it receives a 'task' prop
  // Determine badge style based on priority
  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'badge badge-high';
      case 'medium': return 'badge badge-medium';
      case 'low': return 'badge badge-low';
      default: return 'badge';
    }
  };

  return (
    <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition p-6 mb-4">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="mt-1">
          <div className="checkbox">
            <input 
              type="checkbox" 
              aria-label="Marcar como completada"
            />
          </div>
        </div>
        
        <div className="flex-1">
          {/* Title */}
          <div className="font-semibold text-[var(--text)] mb-3">
            {task.title}
          </div>
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <span className="badge">Level {task.difficultyLevel}</span>
            <span className={getPriorityClass(task.priority)}>{task.priority.toUpperCase()}</span>
            <span className="badge">{task.category}</span>
            {task.deadline && (
              <span className="badge">📅 {new Date(task.deadline).toLocaleDateString()}</span>
            )}
            {task.complexity && (
              <span className="badge">⚙️ {task.complexity}</span>
            )}
            {task.estimatedHours && (
              <span className="badge">⏱️ {task.estimatedHours}h</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Positioned below the main content to avoid obscuring other elements */}
      <div className="mt-3">
        <CompleteButton />
      </div>
    </div>
  );
};

export { TaskCard };
