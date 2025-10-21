import React, { memo } from "react";

const TaskCard = memo(function TaskCard({ task, isCompleted, onComplete }) {
  return (
    <div className="row">
      {/* Badges */}
      <div>
        <div className={`checkbox ${isCompleted ? "checkbox--checked" : ""}`}>
          <input 
            type="checkbox" 
            checked={isCompleted}
            onChange={() => onComplete()}
            aria-label={isCompleted ? "Marcar como no completada" : "Marcar como completada"}
          />
        </div>
      </div>
      
      <div>
        {/* Title */}
        <div className="row-title">{task.title}</div>
        
        {/* Metadata */}
        <div className="row-meta">
          <span className={`badge badge--${task.priority.toLowerCase()}`}>{task.priority}</span>
          <span className={`badge badge--${task.category.toLowerCase()}`}>{task.category}</span>
          {task.deadline && (
            <span className="badge">📅 {new Date(task.deadline).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      
      {/* Buttons */}
      <div className="right">
        <button
          onClick={() => onComplete()}
          aria-label={isCompleted ? "Marcar como no completada" : "Marcar como completada"}
          aria-pressed={isCompleted}
          disabled={isCompleted}
          className="btn btn-outline"
          style={{ marginRight: '0.5rem' }}
        >
          {isCompleted ? "Completed ✅" : "Mark as done"}
        </button>
        
        {isCompleted && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(false);
            }}
            aria-label="Marcar como no completada"
            aria-pressed={true}
            className="btn btn-ghost"
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
});

export { TaskCard };
