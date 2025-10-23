// File: /components/CompleteButton.js

import React, { useState } from 'react';
import styles from './CompleteButton.module.css'; // Use CSS modules

const CompleteButton = ({ task, onComplete }) => {
  const [isCompleted, setIsCompleted] = useState(task.completed || false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tasks/${task.id}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update local state
      setIsCompleted(data.task.completed);
      
      // Call onComplete callback with updated completion statistics
      if (onComplete) {
        onComplete(data.task, data.completionStats);
      }
    } catch (err) {
      console.error('Error completing task:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        className={isCompleted ? styles['button-completed'] : styles['button-incomplete']}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? 'Updating...' : (isCompleted ? 'Done' : 'Mark as Done')}
      </button>
      {error && <div className="error">Error: {error}</div>}
    </div>
  );
};

export default CompleteButton;
