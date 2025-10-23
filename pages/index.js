import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Pagination } from "../components/Pagination";
import { TaskCard } from "../components/tasks/TaskItem";

export default function Home() {
  const { data: session } = useSession();
  
  const [tasks, setTasks] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(50); // Fixed to 50 per user as per requirements
  const [completedTaskCount, setCompletedTaskCount] = useState(0);
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
        const response = await fetch(`/api/tasks?page=${page}&priority=${priorityFilter}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }
        
        const data = await response.json();
        setTasks(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalTasks(data.pagination?.totalUserTasks || 50); // Use total user tasks count
        setCompletedTaskCount(data.pagination?.completedTasks || 0);
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

  // Handle task completion toggle with proper completion stats update
  const handleTaskToggle = async (taskId, completionStats = null) => {
    try {
      // If completionStats is provided (from CompleteButton), update the global counters
      if (completionStats) {
        setCompletedTaskCount(completionStats.completedTasks);
        setTotalTasks(completionStats.totalTasks);
        return;
      }
      
      // Otherwise, make the API call directly
      const response = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to toggle task: ${response.status}`);
      }

      const data = await response.json();
      
      // Update tasks state with the updated task
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === data.task.id ? data.task : task
        )
      );
      
      // Update completion statistics
      setCompletedTaskCount(data.completionStats.completedTasks);
      setTotalTasks(data.completionStats.totalTasks);
    } catch (err) {
      console.error('Error toggling task:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Handle priority filter change
  const handlePriorityFilterChange = (priority) => {
    setPriorityFilter(priority);
    setPage(1); // Reset to first page when filter changes
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Calculate completion percentage based on all user tasks
  const completionPercentage = totalTasks > 0 ? Math.round((completedTaskCount / totalTasks) * 100) : 0;

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
          <div className="vstack" style={{ gap: '12px' }}>
            <div className="hstack" style={{ justifyContent: 'space-between', fontWeight: 600 }}>
              <span>Progress</span>
              <span>{completedTaskCount} of {totalTasks} tasks completed</span>
            </div>
            <div className="progress">
              <div 
                className="progress__fill" 
                style={{ 
                  width: `${completionPercentage}%`,
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
            <div className="subhead" style={{ color: 'var(--muted)' }}>
              {completionPercentage}% complete
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="card mb-4" style={{ color: 'var(--danger)' }}>
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
                isCompleted={task.completed || false}
                onComplete={handleTaskToggle}
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
