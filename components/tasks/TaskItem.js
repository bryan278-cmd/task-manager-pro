import React, { memo } from "react";

const TaskCard = memo(function TaskCard({ task, isCompleted, onComplete }) {
  // Determine badge style based on priority
  const getPriorityBadgeClass = (priority) => {
    if (priority === 'HIGH' || priority === 'CRITICAL') {
      return 'badge badge-gold';
    }
    return 'badge';
  };

  return (
    <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--surface)] hover:bg-[var(--elev)]/60 transition p-4 mb-3">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="mt-1">
          <div className={`checkbox ${isCompleted ? "checkbox--checked" : ""}`}>
            <input 
              type="checkbox" 
              checked={isCompleted}
              onChange={() => onComplete()}
              aria-label={isCompleted ? "Marcar como no completada" : "Marcar como completada"}
            />
          </div>
        </div>
        
        <div className="flex-1">
          {/* Title */}
          <div className={`font-semibold text-[var(--text)] mb-2 ${isCompleted ? 'opacity-70 line-through' : ''}`}>
            {task.title}
          </div>
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
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
        
        {/* Buttons */}
        <div className="flex gap-2">
          {!isCompleted && (
            <button
              onClick={() => onComplete()}
              aria-label="Marcar como completada"
              className="btn btn-ghost text-sm px-3 py-1"
            >
              Mark as done
            </button>
          )}
          
          {isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(false);
              }}
              aria-label="Marcar como no completada"
              className="btn btn-ghost text-sm px-3 py-1"
            >
              Undo
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export { TaskCard };
