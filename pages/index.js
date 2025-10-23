import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Pagination } from "../components/Pagination";
import { TaskCard } from "../components/tasks/TaskItem";

export default function Home() {
  const { data: session } = useSession();
  
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Fetch tasks from API with pagination and filtering
  useEffect(() => {
    async function fetchTasks() {
      if (!mounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/tasks?page=${page}&take=10&priority=${priorityFilter}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }
        
        const data = await response.json();
        setTasks(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [page, priorityFilter, mounted]);

  // Load completed tasks from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('completed_tasks_v1');
        if (saved) {
          setCompletedTasks(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error loading completed tasks:', err);
        setCompletedTasks({});
      }
    }
    setMounted(true);
  }, []);

  // Save completed tasks to localStorage
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      try {
        localStorage.setItem('completed_tasks_v1', JSON.stringify(completedTasks));
      } catch (err) {
        console.error('Error saving completed tasks:', err);
      }
    }
  }, [completedTasks, mounted]);

  // Handle task completion toggle
  const handleTaskToggle = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to toggle task: ${response.status}`);
      }

      const updatedTask = await response.json();
      
      // Update completed tasks state
      if (updatedTask.completed) {
        setCompletedTasks(prev => ({ ...prev, [taskId]: true }));
      } else {
        setCompletedTasks(prev => {
          const newCompleted = { ...prev };
          delete newCompleted[taskId];
          return newCompleted;
        });
      }
    } catch (err) {
      console.error('Error toggling task:', err);
      // Show error to user (could be enhanced with toast notifications)
      alert(`Error: ${err.message}`);
    }
  };

  // Handle priority filter change
  const handlePriorityFilterChange = (priority) => {
    setPriorityFilter(priority);
    setPage(1); // Reset to first page when filter changes
  };

  if (!mounted) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <div className="app-title">Task Manager Pro</div>
          <div className="app-user">
            <span className="chip">{session?.user?.email || "User"}</span>
          </div>
        </header>
        <main className="app-main">
          <div style={{ textAlign: "center", padding: "2rem", color: 'var(--text)' }}>Loading tasks...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">Task Manager Pro</div>
        <div className="app-user">
          <span className="chip">{session?.user?.email || "User"}</span>
          <button className="btn btn-ghost" onClick={() => signOut({ callbackUrl: "/login" })} aria-label="Logout">Logout</button>
        </div>
      </header>
      <main id="main-content" role="main" className="app-main">
        <h1 className="sr-only">Tasks — Page {page} of {totalPages}</h1>
        
        {/* Priority Filter Buttons */}
        <div className="card mb-4">
          <div className="flex flex-wrap gap-2">
            <button 
              className={`btn ${priorityFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handlePriorityFilterChange('ALL')}
            >
              All Tasks
            </button>
            <button 
              className={`btn ${priorityFilter === 'LOW' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handlePriorityFilterChange('LOW')}
            >
              Low Priority
            </button>
            <button 
              className={`btn ${priorityFilter === 'MEDIUM' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handlePriorityFilterChange('MEDIUM')}
            >
              Medium Priority
            </button>
            <button 
              className={`btn ${priorityFilter === 'HIGH' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handlePriorityFilterChange('HIGH')}
            >
              High Priority
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="card mb-4">
          <div className="hstack">
            <div style={{ fontWeight: 600 }}>
              {Object.keys(completedTasks).filter(taskId => completedTasks[taskId]).length} of {tasks.length} tasks completed
            </div>
            <div className="progress">
              <div 
                className="progress__fill" 
                style={{ width: `${tasks.length > 0 ? (Object.keys(completedTasks).filter(taskId => completedTasks[taskId]).length / tasks.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="card mb-4" style={{ color: 'var(--error)' }}>
            Error loading tasks: {error}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="card mb-4" style={{ textAlign: "center", padding: "2rem", color: 'var(--text)' }}>
            Loading tasks...
          </div>
        )}

        {/* Task list */}
        {!loading && tasks.length === 0 && !error && (
          <div className="empty">
            No tasks available
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <div className="card stack">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted={completedTasks[task.id] || false}
                onComplete={() => handleTaskToggle(task.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <Pagination 
            page={page} 
            totalPages={totalPages} 
            onChange={setPage}
          />
        )}
      </main>
    </div>
  );
}
