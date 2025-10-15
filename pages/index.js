import { useState, useEffect, useContext, useRef, useMemo, memo, useCallback, useDeferredValue, useTransition } from "react";
import { ThemeContext } from "./_app";
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { sortTasksByPriority, applyFilters } from '../utils/taskUtils';

// Helper to defer non-urgent computations
function runIdle(fn) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(fn);
  }
  return setTimeout(fn, 0);
}



import dynamic from 'next/dynamic';

const TaskCard = dynamic(() => import('../components/TaskCard'), {
  ssr: false,
  loading: () => (
    <div style={{
      backdropFilter: "blur(20px) saturate(180%)",
      backgroundClip: "padding-box",
      position: "relative",
      borderRadius: 16,
      padding: 20,
      margin: "20px 0",
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      minHeight: '150px',
    }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ width: '60px', height: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}></div>
        <div style={{ width: '80px', height: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}></div>
      </div>
      <div style={{ width: '80%', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }}></div>
      <div style={{ width: '60%', height: '18px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '16px' }}></div>
      <div style={{ width: '100%', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}></div>
    </div>
  )
});

export default function Home() {
  const { theme, toggle } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  const [allTasksList, setAllTasksList] = useState([]);
  const [displayedTasks, setDisplayedTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const sentinelRef = useRef(null);
  const TASKS_PER_PAGE = 10;

  // Create deferred value for smoother filtering
  const deferredDisplayedTasks = useDeferredValue(displayedTasks);

  // Create transition for heavy updates
  const [isPending, startTransition] = useTransition();

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handler = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  useEffect(() => {
    // Load completed tasks from localStorage using safe utilities
    const savedCompletedTasks = loadFromStorage('tmp_completed_v1', {});
    setCompletedTasks(savedCompletedTasks);
    
    // Load filters from localStorage using safe utilities
    const savedFilters = loadFromStorage('tmp_filters_v1', {});
    setStatusFilter(savedFilters.statusFilter || 'All');
    setCategoryFilter(savedFilters.categoryFilter || 'All');
    setPriorityFilter(savedFilters.priorityFilter || 'All');
    
    // Load tasks dynamically
    import('../data/tasks.json').then((module) => {
      const tasks = module.default || module;
      // Defer heavy sorting operation
      runIdle(() => {
        // Sort tasks by priority
        const sortedTasks = sortTasksByPriority(tasks);
        
        // Store all tasks
        setAllTasksList(sortedTasks);
      });
    }).catch((error) => {
      console.error('Failed to load tasks:', error);
      // Fallback to empty array
      setAllTasksList([]);
    });
    
    setMounted(true);
  }, []);

  useEffect(() => {
    // Save completed tasks to localStorage using safe utility
    saveToStorage('tmp_completed_v1', completedTasks);
  }, [completedTasks]);

  useEffect(() => {
    // Save filters to localStorage using safe utility
    const filters = {
      statusFilter,
      categoryFilter,
      priorityFilter
    };
    saveToStorage('tmp_filters_v1', filters);
  }, [statusFilter, categoryFilter, priorityFilter]);

  // Create stable applyFilters function
  const stableApplyFilters = useCallback((tasks, filters, completedMap) => {
    return applyFilters(tasks, filters, completedMap);
  }, []);

  // Apply filters when filters or completed tasks change
  useEffect(() => {
    if (!mounted) return;
    
    const filteredTasks = stableApplyFilters(allTasksList, {
      status: statusFilter,
      category: categoryFilter,
      priority: priorityFilter
    }, completedTasks);
    
    // Reset pagination and display first page of filtered tasks
    setCurrentPage(1);
    setDisplayedTasks(filteredTasks.slice(0, TASKS_PER_PAGE));
    setHasMore(filteredTasks.length > TASKS_PER_PAGE);
  }, [statusFilter, categoryFilter, priorityFilter, completedTasks, mounted, allTasksList, stableApplyFilters]);

  useEffect(() => {
    // Trigger confetti when all tasks are completed
    if (Object.keys(completedTasks).length === displayedTasks.length && displayedTasks.length > 0) {
      // Check if all current tasks are completed
      const allCompleted = displayedTasks.every(task => completedTasks[task.id]);
      if (allCompleted) {
        // Trigger confetti
        if (typeof window !== 'undefined' && window.confetti) {
          window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    }
  }, [completedTasks, displayedTasks]);

  // Setup IntersectionObserver for infinite scroll
  useEffect(() => {
    // Don't observe if not mounted or no more tasks
    if (!mounted || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver((entries) => {
      // When sentinel enters viewport, load more
      if (entries[0].isIntersecting) {
        loadMoreTasks();
      }
    }, {
      root: null, // viewport
      rootMargin: '200px', // trigger 200px before reaching sentinel
      threshold: 0.1
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [mounted, hasMore, isLoadingMore, currentPage, loadMoreTasks]);

  // Load more tasks function
  const loadMoreTasks = useCallback(() => {
    setIsLoadingMore(true);
    
    // Apply current filters to get filtered task list
    const filteredTasks = stableApplyFilters(allTasksList, {
      status: statusFilter,
      category: categoryFilter,
      priority: priorityFilter
    }, completedTasks);
    
    // Simulate async load (remove timeout in production if using real API)
    setTimeout(() => {
      const startIndex = currentPage * TASKS_PER_PAGE;
      const endIndex = startIndex + TASKS_PER_PAGE;
      const nextPageTasks = filteredTasks.slice(startIndex, endIndex);
      
      if (nextPageTasks.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedTasks(prev => [...prev, ...nextPageTasks]);
        setCurrentPage(prev => prev + 1);
      }
      
      setIsLoadingMore(false);
    }, 300); // <100ms in production
  }, [allTasksList, statusFilter, categoryFilter, priorityFilter, completedTasks, currentPage, stableApplyFilters]);

  const colors = {
    light: {
      background: '#f5f5f5',
      text: '#111',
      cardBg: '#ffffff',
      cardBorder: '#e0e0e0',
      cardShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      progressBg: 'rgba(255,255,255,0.1)',
      progressBar: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
      resetButtonBg: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
      resetButtonBorder: '2px solid rgba(255,255,255,0.3)',
      resetButtonText: '#111',
    },
    dark: {
      background: '#0f1115',
      text: '#e5e7eb',
      cardBg: '#111827',
      cardBorder: '#1f2937',
      cardShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      progressBg: 'rgba(255,255,255,0.1)',
      progressBar: 'linear-gradient(90deg, #4B5EAA, #667eea, #764ba2)',
      resetButtonBg: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      resetButtonBorder: '2px solid rgba(255,255,255,0.2)',
      resetButtonText: '#e5e7eb',
    }
  };

  const currentColors = isDark ? colors.dark : colors.light;

  // Helper para filtrar tareas en el render
  const getFilteredTasks = useCallback((tasks) => {
    if (!tasks) return [];
    let filtered = tasks;
    if (categoryFilter && categoryFilter !== 'All') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    if (priorityFilter && priorityFilter !== 'All') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    return filtered;
  }, [categoryFilter, priorityFilter]);

  const filteredDisplayedTasks = useMemo(
    () => getFilteredTasks(deferredDisplayedTasks),
    [deferredDisplayedTasks, getFilteredTasks]
  );

  // Create stable onComplete handler to prevent re-renders
  const handleTaskComplete = useCallback((taskId, undo = true) => {
    startTransition(() => {
      if (undo) {
        // Mark as done
        const task = allTasksList.find(t => t.id === taskId);
        console.log(`${task?.title || 'Task'} completed!`);
        setCompletedTasks(prev => ({ ...prev, [taskId]: true }));
      } else {
        // Mark as undone
        const task = allTasksList.find(t => t.id === taskId);
        console.log(`${task?.title || 'Task'} undone!`);
        setCompletedTasks(prev => {
          const newCompletedTasks = { ...prev };
          delete newCompletedTasks[taskId];
          return newCompletedTasks;
        });
      }
    });
  }, [allTasksList, setCompletedTasks, startTransition]);

  if (!mounted) {
    return (
      <div style={{
        background: currentColors.background,
        minHeight: "100vh",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.3)",
          zIndex: 0,
        }}></div>
        {/* Floating shapes layer */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}>
          <div style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: "300px",
            height: "300px",
            background: "rgba(102, 126, 234, 0.3)",
            borderRadius: "50%",
            filter: "blur(100px)",
            animation: "float 20s ease-in-out infinite",
          }}></div>
          <div style={{
            position: "absolute",
            top: "60%",
            right: "10%",
            width: "250px",
            height: "250px",
            background: "rgba(236, 72, 153, 0.3)",
            borderRadius: "50%",
            filter: "blur(100px)",
            animation: "float 22s ease-in-out infinite reverse",
          }}></div>
          <div style={{
            position: "absolute",
            bottom: "15%",
            left: "15%",
            width: "200px",
            height: "200px",
            background: "rgba(167, 139, 250, 0.3)",
            borderRadius: "50%",
            filter: "blur(100px)",
            animation: "float 18s ease-in-out infinite",
          }}></div>
        </div>
        {/* Grid pattern overlay */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          pointerEvents: "none",
          zIndex: 0,
        }}></div>
        <main
          style={{
            maxWidth: 720,
            margin: "0 auto",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(30px)",
            padding: "2.5rem 4rem",
            borderRadius: "24px",
            border: "2px solid rgba(255,255,255,0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            width: "fit-content",
            margin: "0 auto",
            marginBottom: "2rem",
          }}>
            <h1 style={{ 
              fontSize: "3rem",
              fontWeight: "800",
              background: "linear-gradient(135deg, #fff 0%, #a78bfa 50%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
              textAlign: "center",
              margin: 0,
              width: "100%",
            }}>
              Welcome to Task Manager Pro
            </h1>
            <div style={{
              fontSize: "1.1rem",
              color: "rgba(255,255,255,0.8)",
              marginTop: "0.5rem",
              textAlign: "center",
            }}>
              Organize your learning journey
            </div>
          </div>
          <div style={{ color: currentColors.text, textAlign: "center", fontSize: "1.2rem" }}>Loading tasks...</div>
        </main>
      </div>
    );
  }

  return (
    <div style={{
      background: currentColors.background,
      minHeight: "100vh",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.3)",
        zIndex: 0,
      }}></div>
      {/* Floating shapes layer */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}>
        <div style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          background: "rgba(102, 126, 234, 0.3)",
          borderRadius: "50%",
          filter: "blur(100px)",
          animation: "float 20s ease-in-out infinite",
        }}></div>
        <div style={{
          position: "absolute",
          top: "60%",
          right: "10%",
          width: "250px",
          height: "250px",
          background: "rgba(236, 72, 153, 0.3)",
          borderRadius: "50%",
          filter: "blur(100px)",
          animation: "float 22s ease-in-out infinite reverse",
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "15%",
          left: "15%",
          width: "200px",
          height: "200px",
          background: "rgba(167, 139, 250, 0.3)",
          borderRadius: "50%",
          filter: "blur(100px)",
          animation: "float 18s ease-in-out infinite",
        }}></div>
      </div>
      {/* Grid pattern overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        pointerEvents: "none",
        zIndex: 0,
      }}></div>
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media (prefers-reduced-motion: no-preference) {
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes checkmarkScale {
            0% { transform: scale(0.5); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes checkmarkScale {
            0% { transform: scale(1); }
            100% { transform: scale(1); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }
      `}</style>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <button
        onClick={toggle}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          background: isDark 
            ? "linear-gradient(135deg, #4B5EAA 0%, #667eea 100%)" 
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          cursor: "pointer",
          zIndex: 1000,
          transition: "all 0.3s ease",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isDark
            ? "0 4px 15px rgba(75, 94, 170, 0.4)"
            : "0 4px 15px rgba(102, 126, 234, 0.4)",
        }}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          position: "relative",
          zIndex: 1,
        }}
      >
      <div style={{
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        padding: "2rem 3rem",
        borderRadius: 20,
        boxShadow: isDark ? "0 8px 32px 0 rgba(0, 0, 0, 0.37)" : "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        marginBottom: "2rem",
        display: "inline-block",
        animation: "float 6s ease-in-out infinite",
      }}>
          <h1 style={{ 
            color: currentColors.text,
            textAlign: "center", 
            fontSize: "3.5rem", 
            fontWeight: "800",
            textShadow: "0 2px 20px rgba(0, 0, 0, 0.3)",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0,
          }}>
            Welcome to Task Manager Pro
          </h1>
        </div>
        <div style={{
          background: currentColors.progressBg,
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255,255,255,0.3)",
          padding: "1rem 2rem",
          borderRadius: "50px",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        }}>
          <div style={{ color: currentColors.text, fontWeight: "600" }}>
            {Object.keys(completedTasks).filter(taskId => completedTasks[taskId]).length} of {displayedTasks.length} tasks completed
          </div>
          <div style={{
            width: "120px",
            height: "8px",
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderRadius: "4px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${(Object.keys(completedTasks).filter(taskId => completedTasks[taskId]).length / displayedTasks.length) * 100}%`,
              background: currentColors.progressBar,
              borderRadius: "4px",
              transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: isDark ? "0 0 10px rgba(75, 94, 170, 0.3)" : "0 0 10px rgba(102,126,234,0.3)",
            }}></div>
          </div>
        </div>
        <button 
          onClick={() => {
            // Reset completed tasks and save empty object
            setCompletedTasks({});
            saveToStorage('tmp_completed_v1', {});
            // Reset filters to default and save default filter values
            setStatusFilter('All');
            setCategoryFilter('All');
            setPriorityFilter('All');
            saveToStorage('tmp_filters_v1', {
              statusFilter: 'All',
              categoryFilter: 'All',
              priorityFilter: 'All'
            });
            // Apply filters and reset pagination
            const filteredTasks = applyFilters(allTasksList, {
              status: 'All',
              category: 'All',
              priority: 'All'
            }, {});
            setCurrentPage(1);
            setDisplayedTasks(filteredTasks.slice(0, TASKS_PER_PAGE));
            setHasMore(filteredTasks.length > TASKS_PER_PAGE);
          }}
          style={{
            background: currentColors.resetButtonBg,
            backdropFilter: "blur(20px)",
            border: currentColors.resetButtonBorder,
            color: currentColors.resetButtonText,
            fontWeight: "600",
            boxShadow: isDark 
              ? "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" 
              : "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
            borderRadius: 12,
            padding: "16px 32px",
            cursor: "pointer",
            marginBottom: 30,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: "1rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = isDark 
              ? "0 0 30px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)" 
              : "0 0 30px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = isDark 
              ? "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" 
              : "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)";
          }}
        >
          Reset All Tasks
        </button>
        {/* Filter bar */}
        <div style={{
          background: currentColors.progressBg,
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255,255,255,0.3)",
          padding: "1rem",
          borderRadius: "12px",
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ 
              color: currentColors.text, 
              fontSize: "0.9rem", 
              fontWeight: "600",
              opacity: 0.8 
            }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                // Reset pagination and apply new filters
                const filteredTasks = applyFilters(allTasksList, {
                  status: e.target.value,
                  category: categoryFilter,
                  priority: priorityFilter
                }, completedTasks);
                setCurrentPage(1);
                setDisplayedTasks(filteredTasks.slice(0, TASKS_PER_PAGE));
                setHasMore(filteredTasks.length > TASKS_PER_PAGE);
              }}
              aria-label="Filter tasks by status"
              style={{
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "8px",
                padding: "0.5rem 1rem",
                color: currentColors.text,
                fontSize: "0.9rem",
                fontWeight: "500",
                backdropFilter: "blur(10px)",
              }}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          {/* === Filtros === */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
            <label style={{ 
              color: currentColors.text, 
              fontSize: "0.9rem", 
              fontWeight: "600",
              opacity: 0.8 
            }}>
              Category
            </label>
            <select
              aria-label="Filtrar por categoría"
              style={{
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "1rem",
                padding: "0.5rem 1rem",
                color: currentColors.text,
                fontSize: "0.9rem",
                fontWeight: "500",
                backdropFilter: "blur(10px)",
              }}
              value={categoryFilter === 'All' ? '' : categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value || 'All')
              }
            >
              <option value="">Todas las categorías</option>
              <option value="Backend">Backend</option>
              <option value="Frontend">Frontend</option>
              <option value="DevOps">DevOps</option>
              <option value="Database">Database</option>
              <option value="Security">Security</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
            <label style={{ 
              color: currentColors.text, 
              fontSize: "0.9rem", 
              fontWeight: "600",
              opacity: 0.8 
            }}>
              Priority
            </label>
            <select
              aria-label="Filtrar por prioridad"
              style={{
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "1rem",
                padding: "0.5rem 1rem",
                color: currentColors.text,
                fontSize: "0.9rem",
                fontWeight: "500",
                backdropFilter: "blur(10px)",
              }}
              value={priorityFilter === 'All' ? '' : priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value || 'All')
              }
            >
              <option value="">Todas las prioridades</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              aria-label="Restablecer filtros"
              style={{
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "1rem",
                padding: "0.5rem 1rem",
                color: currentColors.text,
                fontSize: "0.9rem",
                fontWeight: "600",
                backdropFilter: "blur(10px)",
                cursor: "pointer",
              }}
              onClick={() => {
                setCategoryFilter('All');
                setPriorityFilter('All');
                // Defer the filtering operation
                runIdle(() => {
                  // Apply filters after reset
                  const filteredTasks = applyFilters(allTasksList, {
                    status: statusFilter,
                    category: 'All',
                    priority: 'All'
                  }, completedTasks);
                  setCurrentPage(1);
                  setDisplayedTasks(filteredTasks.slice(0, TASKS_PER_PAGE));
                  setHasMore(filteredTasks.length > TASKS_PER_PAGE);
                });
              }}
            >
              Restablecer filtros
            </button>
          </div>
        </div>
        {filteredDisplayedTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1.1rem',
            fontStyle: 'italic'
          }}>
            No tasks match your current filters
          </div>
        ) : (
          <div role="list">
            {filteredDisplayedTasks.map((task, i) => (
              <div key={task.id} role="listitem" style={{ animation: "fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards", opacity: 0, animationDelay: `${i * 0.1}s` }}>
                <TaskCard
                  task={task}
                  isCompleted={completedTasks[task.id] || false}
                  onComplete={(undo = true) => handleTaskComplete(task.id, undo)}
                  index={i}
                  isDark={isDark}
                  colors={colors}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </div>
            ))}
          </div>
        )}
        {/* Loading spinner */}
        {isLoadingMore && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '2rem',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255,255,255,0.2)',
              borderTop: '3px solid #00d9ff',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}></div>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              Loading more tasks...
            </span>
          </div>
        )}

        {/* Intersection observer sentinel */}
        <div 
          ref={sentinelRef} 
          style={{ height: '20px', margin: '1rem 0' }}
        />

        {/* End message */}
        {!hasMore && displayedTasks.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem'
          }}>
            ✓ All {displayedTasks.length} tasks loaded
          </div>
        )}
      </main>
    </div>
  );
}
