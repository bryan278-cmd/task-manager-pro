import { useState, useCallback, useEffect } from "react";

// Get priority color for UI
function getPriorityColor(priority) {
  const colors = {
    CRITICAL: '#ff1744',
    HIGH: '#ff9800',
    MEDIUM: '#00d9ff',
    LOW: '#9e9e9e'
  };
  return colors[priority] || '#00d9ff';
}

// Get category color
function getCategoryColor(category) {
  const colors = {
    Backend: '#667eea',
    Frontend: '#764ba2',
    DevOps: '#f093fb',
    Database: '#4facfe',
    Security: '#ff6b6b',
    Testing: '#95e1d3'
  };
  return colors[category] || '#a0a0a0';
}

const styles = {
  taskCard: {
    backdropFilter: "blur(20px) saturate(180%)",
    backgroundClip: "padding-box",
    position: "relative",
    borderRadius: 16,
    padding: 20,
    margin: "20px 0",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  
  button: {
    cursor: "pointer",
    border: "none",
    borderRadius: 8,
    padding: "12px 24px",
    color: "#fff",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "1rem",
    fontWeight: "600",
    width: "100%",
    transform: "scale(1)",
    position: "relative",
    overflow: "hidden",
  },
  
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#fff',
    letterSpacing: '0.5px',
  },
};

export default function TaskCard({ task, isCompleted, onComplete, index, isDark, colors, prefersReducedMotion }) {
  const [isHovered, setIsHovered] = useState(false);
  const [buttonScale, setButtonScale] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = useCallback(() => {
    if (!isCompleted) {
      setIsAnimating(true);
      onComplete();
      // Reset animation state after duration
      setTimeout(() => setIsAnimating(false), 400);
    }
  }, [isCompleted, onComplete]);

  const handleMouseDown = useCallback(() => {
    setButtonScale(0.95);
  }, []);

  const handleMouseUp = useCallback(() => {
    setButtonScale(1);
  }, []);

  const currentColors = isDark ? colors.dark : colors.light;

  return (
    <div
      style={{
        ...styles.taskCard,
        background: currentColors.cardBg,
        border: `1px solid ${currentColors.cardBorder}`,
        boxShadow: currentColors.cardShadow,
        borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
        animation: prefersReducedMotion ? 'fadeInUp 0.5s ease-out 0s backwards' : `fadeInUp 0.5s ease-out ${index * 0.05}s backwards`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with badges */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{
          ...styles.badge,
          background: getPriorityColor(task.priority),
        }}>
          {task.priority}
        </span>
        <span style={{
          ...styles.badge,
          background: getCategoryColor(task.category),
        }}>
          {task.category}
        </span>
        {task.deadline && (
          <span style={{
            ...styles.badge,
            background: 'rgba(255,255,255,0.2)',
          }}>
            📅 {new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
      
      {/* Title */}
      <h3 style={{ 
        margin: '0.5rem 0', 
        fontSize: '1.25rem', 
        fontWeight: '600',
        color: currentColors.text,
        lineHeight: "1.3",
      }}>
        {task.title}
      </h3>
      
      {/* Description */}
      {task.description && (
        <p style={{ 
          fontSize: '0.9rem', 
          color: isDark ? 'rgba(229, 231, 235, 0.7)' : 'rgba(17, 17, 17, 0.7)',
          marginBottom: '0.75rem',
          marginTop: '0.5rem',
        }}>
          {task.description}
        </p>
      )}
      
      {/* Metadata */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        fontSize: '0.85rem', 
        color: isDark ? 'rgba(229, 231, 235, 0.6)' : 'rgba(17, 17, 17, 0.6)',
        marginBottom: '1rem' 
      }}>
        {task.estimatedHours && <span>⏱️ {task.estimatedHours}h</span>}
        {task.complexity && <span>🎯 {task.complexity}</span>}
        {task.dependencies && task.dependencies.length > 0 && (
          <span>🔗 {task.dependencies.length} deps</span>
        )}
      </div>
      
      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1rem', 
          flexWrap: 'wrap' 
        }}>
          {task.tags.map(tag => (
            <span key={tag} style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              color: currentColors.text,
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Buttons */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          aria-label={isCompleted ? "Marcar tarea como no completada" : "Marcar tarea como completada"}
          style={{
            ...styles.button,
            background: isCompleted 
              ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" 
              : (isDark ? "#4B5EAA" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"),
            boxShadow: isCompleted 
              ? "0 4px 15px rgba(56, 239, 125, 0.4)" 
              : (isDark ? "0 4px 15px rgba(75, 94, 170, 0.4)" : "0 4px 15px rgba(102, 126, 234, 0.4)"),
            transform: `scale(${buttonScale})`,
            color: "white",
            flex: 1,
          }}
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isCompleted ? (
            <span style={{ 
              animation: isAnimating ? "checkmarkScale 0.4s ease" : "none",
              display: "inline-block"
            }}>
              Completed ✅
            </span>
          ) : "Mark as done"}
        </button>
        
        {isCompleted && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Mark as undone - call the onComplete function with false to toggle state
              onComplete(false);
            }}
            aria-label="Deshacer tarea completada"
            style={{
              ...styles.button,
              background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              color: currentColors.text,
              width: "auto",
              padding: "12px 16px",
            }}
            className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
}
