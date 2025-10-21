import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { Pagination } from "../components/Pagination";

// === Persistencia: utilidades ===
function safeParse(json, fallback) {
  try { return JSON.parse(json); } catch { return fallback; }
}
function loadFromStorage(key, defaultValue) {
  if (typeof window === 'undefined') return defaultValue;
  const raw = window.localStorage.getItem(key);
  return raw == null ? defaultValue : safeParse(raw, defaultValue);
}
function saveToStorage(key, value) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

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

function calculateTaskPriority(task) {
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

function sortTasksByPriority(tasks) {
  return tasks
    .map(task => ({
      ...task,
      priorityScore: calculateTaskPriority(task)
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

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

// Apply filters to tasks
function applyFilters(tasks, {status, category, priority}, completedMap) {
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


const EXTENDED_TASKS = [
  // BACKEND (12 tasks)
  { 
    id: 1, 
    title: 'Implement REST API authentication with JWT', 
    category: 'Backend',
    priority: 'CRITICAL',
    complexity: 'high',
    deadline: '2025-10-20',
    dependencies: [],
    tags: ['API', 'Auth', 'Security', 'JWT'],
    estimatedHours: 8,
    description: 'Setup JWT-based authentication with refresh tokens'
  },
  { 
    id: 2, 
    title: 'Optimize database queries with indexing', 
    category: 'Backend',
    priority: 'HIGH',
    complexity: 'medium',
    deadline: '2025-10-25',
    dependencies: [],
    tags: ['Database', 'Performance', 'SQL'],
    estimatedHours: 6,
    description: 'Add indexes to frequently queried columns'
  },
  { 
    id: 3, 
    title: 'Create GraphQL schema for user management', 
    category: 'Backend',
    priority: 'MEDIUM',
    complexity: 'medium',
    deadline: '2025-10-25',
    dependencies: [1],
    tags: ['GraphQL', 'API', 'Schema'],
    estimatedHours: 5,
    description: 'Design GraphQL types and resolvers'
  },
  { 
    id: 4, 
    title: 'Setup Redis caching layer', 
    category: 'Backend',
    priority: 'HIGH',
    complexity: 'medium',
    deadline: '2025-10-22',
    tags: ['Cache', 'Performance', 'Redis'],
    estimatedHours: 4,
    description: 'Implement Redis for session and query caching'
  },
  { 
    id: 5, 
    title: 'Implement rate limiting middleware', 
    category: 'Backend',
    priority: 'HIGH',
    complexity: 'low',
    tags: ['Security', 'Middleware', 'Express'],
    estimatedHours: 3,
    description: 'Add rate limiting to prevent abuse'
  },
  { 
    id: 6, 
    title: 'Setup WebSocket server for real-time updates', 
    category: 'Backend',
    priority: 'MEDIUM',
    complexity: 'high',
    tags: ['WebSocket', 'Real-time', 'Socket.io'],
    estimatedHours: 7,
    description: 'Enable real-time task updates'
  },
  { 
    id: 7, 
    title: 'Create API documentation with Swagger', 
    category: 'Backend',
    priority: 'LOW',
    complexity: 'low',
    tags: ['Documentation', 'API', 'Swagger'],
    estimatedHours: 4,
    description: 'Auto-generate API docs'
  },
  { 
    id: 8, 
    title: 'Implement file upload with S3', 
    category: 'Backend',
    priority: 'MEDIUM',
    complexity: 'medium',
    tags: ['Storage', 'AWS', 'Upload'],
    estimatedHours: 5,
    description: 'Add file attachment support'
  },
  { 
    id: 9, 
    title: 'Setup error tracking with Sentry', 
    category: 'Backend',
    priority: 'HIGH',
    complexity: 'low',
    deadline: '2025-10-18',
    tags: ['Monitoring', 'Errors', 'Sentry'],
    estimatedHours: 2,
    description: 'Track and alert on server errors'
  },
  { 
    id: 10, 
    title: 'Create database migration system', 
    category: 'Backend',
    priority: 'HIGH',
    complexity: 'medium',
    tags: ['Database', 'Migration', 'Version Control'],
    estimatedHours: 5,
    description: 'Setup Knex.js migrations'
  },
  { 
    id: 11, 
    title: 'Implement background job queue', 
    category: 'Backend',
    priority: 'MEDIUM',
    complexity: 'high',
    tags: ['Queue', 'Bull', 'Jobs'],
    estimatedHours: 6,
    description: 'Setup Bull for async tasks'
  },
  { 
    id: 12, 
    title: 'Add API versioning strategy', 
    category: 'Backend',
    priority: 'LOW',
    complexity: 'low',
    tags: ['API', 'Versioning', 'REST'],
    estimatedHours: 3,
    description: 'Implement /v1/, /v2/ routing'
  },
  
  // FRONTEND (15 tasks)
  { 
    id: 13, 
    title: 'Build responsive navigation with mobile menu', 
    category: 'Frontend',
    priority: 'HIGH',
    complexity: 'medium',
    deadline: '2025-10-18',
    tags: ['React', 'UI', 'Responsive'],
    estimatedHours: 5,
    description: 'Create hamburger menu for mobile'
  },
  { 
    id: 14, 
    title: 'Implement dark mode with system preference', 
    category: 'Frontend',
    priority: 'HIGH',
    complexity: 'low',
    deadline: '2025-10-16',
    tags: ['UI', 'Accessibility', 'Theme'],
    estimatedHours: 3,
    description: 'Toggle between light/dark themes'
  },
  { 
    id: 15, 
    title: 'Create reusable form validation hooks', 
    category: 'Frontend',
    priority: 'MEDIUM',
    complexity: 'medium',
    tags: ['React', 'Hooks', 'Forms'],
    estimatedHours: 4,
    description: 'Custom useForm hook with validation'
  },
  { 
    id: 16, 
    title: 'Optimize bundle size with code splitting', 
    category: 'Frontend',
    priority: 'HIGH',
    complexity: 'high',
    tags: ['Performance', 'Webpack', 'Optimization'],
    estimatedHours: 6,
    description: 'Dynamic imports and lazy loading'
  },
  { 
    id: 17, 
    title: 'Add skeleton loading states', 
    category: 'Frontend',
    priority: 'LOW',
    complexity: 'low',
    tags: ['UI', 'UX', 'Loading'],
    estimatedHours: 2,
    description: 'Shimmer placeholders while loading'
  },
  { 
    id: 18, 
    title: 'Implement infinite scroll with virtualization', 
    category: 'Frontend',
    priority: 'CRITICAL',
    complexity: 'high',
    deadline: '2025-10-17',
    tags: ['Performance', 'UX', 'Scroll'],
    estimatedHours: 7,
    description: 'Virtual scrolling for 1000+ items'
  },
  { 
    id: 19, 
    title: 'Create toast notification system', 
    category: 'Frontend',
    priority: 'MEDIUM',
    complexity: 'low',
    tags: ['UI', 'Notifications', 'UX'],
    estimatedHours: 3,
    description: 'Success/error/warning toasts'
  },
  { 
    id: 20, 
    title: 'Add drag-and-drop task reordering', 
    category: 'Frontend',
    priority: 'LOW',
    complexity: 'high',
    tags: ['UI', 'Interaction', 'DnD'],
    estimatedHours: 8,
    description: 'Drag tasks to change priority'
  },
  { 
    id: 21, 
    title: 'Implement search with debouncing', 
    category: 'Frontend',
    priority: 'MEDIUM',
    complexity: 'low',
    tags: ['Search', 'UX', 'Performance'],
    estimatedHours: 3,
    description: 'Filter tasks by keyword'
  },
  { 
    id: 22, 
    title: 'Create animated progress bars', 
    category: 'Frontend',
    priority: 'LOW',
    complexity: 'low',
    tags: ['Animation', 'UI', 'Progress'],
    estimatedHours: 2,
    description: 'Visual task completion indicators'
  },
  { 
    id: 23, 
    title: 'Add keyboard shortcuts', 
    category: 'Frontend',
    priority: 'MEDIUM',
    complexity: 'medium',
    tags: ['Accessibility', 'UX', 'Keyboard'],
    estimatedHours: 4,
    description: 'Hotkeys for common actions'
  },
  { 
    id: 24, 
    title: 'Implement error boundaries', 
    category: 'Frontend',
    priority: 'HIGH',
    complexity: 'low',
    tags: ['Error', 'React', 'Stability'],
    estimatedHours: 2,
    description: 'Graceful error handling'
  },
  { 
    id: 25, 
    title: 'Create multi-select with bulk actions', 
    category: 'Frontend',
    priority: 'MEDIUM',
    complexity: 'medium',
    tags: ['UI', 'UX', 'Bulk'],
    estimatedHours: 5,
    description: 'Select multiple tasks for batch operations'
  },
  { 
    id: 26, 
    title: 'Add data export to CSV/JSON', 
    category: 'Frontend',
    priority: 'LOW',
    complexity: 'low',
    tags: ['Export', 'Data', 'Download'],
    estimatedHours: 3,
    description: 'Download tasks as file'
  },
  { 
    id: 27, 
    title: 'Implement accessibility audit fixes', 
    category: 'Frontend',
    priority: 'HIGH',
    complexity: 'medium',
    deadline: '2025-10-19',
    tags: ['Accessibility', 'WCAG', 'A11y'],
    estimatedHours: 6,
    description: 'WCAG 2.1 AA compliance'
  },
  
  // DEVOPS (12 tasks)
  { 
    id: 28, 
    title: 'Setup CI/CD pipeline with GitHub Actions', 
    category: 'DevOps',
    priority: 'CRITICAL',
    complexity: 'high',
    deadline: '2025-10-19',
    tags: ['CI/CD', 'Automation', 'GitHub'],
    estimatedHours: 8,
    description: 'Automated testing and deployment'
  },
  { 
    id: 29, 
    title: 'Configure Docker multi-stage builds', 
    category: 'DevOps',
    priority: 'HIGH',
    complexity: 'medium',
    tags: ['Docker', 'Optimization', 'Container'],
    estimatedHours: 4,
    description: 'Reduce image size by 70%'
  },
  { 
    id: 30, 
    title: 'Implement blue-green deployment', 
    category: 'DevOps',
    priority: 'MEDIUM',
    complexity: 'high',
    dependencies: [28],
    tags: ['Deployment', 'Kubernetes', 'Zero-downtime'],
    estimatedHours: 10,
    description: 'Zero-downtime deployments'
  },
  { 
    id: 31, 
    title: 'Setup monitoring with Prometheus + Grafana', 
    category: 'DevOps',
    priority: 'HIGH',
    complexity: 'medium',
    tags: ['Monitoring', 'Observability', 'Metrics'],
    estimatedHours: 5,
    description: 'Real-time metrics dashboards'
  },
  { 
    id: 32, 
    title: 'Configure auto-scaling policies', 
    category: 'DevOps',
    priority: 'MEDIUM',
    complexity: 'medium',
    tags: ['Scalability', 'Cloud', 'Auto-scale'],
    estimatedHours: 4,
    description: 'Scale based on CPU/memory'
  },
  { 
    id: 33, 
    title: 'Implement log aggregation with ELK', 
    category: 'DevOps',
    priority: 'MEDIUM',
    complexity: 'high',
    tags: ['Logging', 'ELK', 'Debugging'],
    estimatedHours: 7,
    description: 'Centralized log management'
  },
  { 
    id: 34, 
    title: 'Setup infrastructure as code with Terraform', 
    category: 'DevOps',
    priority: 'LOW',
    complexity: 'high',
    tags: ['IaC', 'Terraform', 'Automation'],
    estimatedHours: 9,
    description: 'Version-controlled infrastructure'
  },
  { 
    id: 35, 
    title: 'Create disaster recovery plan', 
    category: 'DevOps',
    priority: 'HIGH',
    complexity: 'medium',
    deadline: '2025-10-21',
    tags: ['DR', 'Backup', 'Resilience'],
    estimatedHours: 6,
    description: 'Backup and recovery procedures'
  },
  { 
    id: 36, 
    title: 'Implement secret management with Vault', 
    category: 'DevOps',
    priority: 'HIGH',
    complexity: 'medium',
    tags: ['Security', 'Secrets', 'Vault'],
    estimatedHours: 5,
    description: 'Secure credential storage'
  },
  { 
    id: 37, 
    title: 'Setup performance testing with k6', 
    category: 'DevOps',
    priority: 'MEDIUM',
    complexity: 'low',
    tags: ['Testing', 'Performance', 'Load'],
    estimatedHours: 3,
    description: 'Automated load testing'
  },
  { 
    id: 38, 
    title: 'Configure CDN with CloudFlare', 
    category: 'DevOps',
    priority: 'MEDIUM',
    complexity: 'low',
    tags: ['CDN', 'Performance', 'CloudFlare'],
    estimatedHours: 3,
    description: 'Global content delivery'
  },
  { 
    id: 39, 
    title: 'Implement health checks and readiness probes', 
    category: 'DevOps',
    priority: 'HIGH',
    complexity: 'low',
    tags: ['Health', 'Monitoring', 'K8s'],
    estimatedHours: 2,
    description: 'Service health monitoring'
  },
  
  // DATABASE (8 tasks)
  { 
    id: 40, 
    title: 'Design database normalization strategy', 
    category: 'Database',
    priority: 'HIGH',
    complexity: 'high',
    tags: ['Schema', 'Optimization', 'Design'],
    estimatedHours: 6,
    description: '3NF normalization for efficiency'
  },
  { 
    id: 41, 
    title: 'Implement database backup automation', 
    category: 'Database',
    priority: 'CRITICAL',
    complexity: 'medium',
    deadline: '2025-10-21',
    tags: ['Backup', 'DR', 'Automation'],
    estimatedHours: 5,
    description: 'Hourly incremental backups'
  },
  { 
    id: 42, 
    title: 'Setup database replication (master-slave)', 
    category: 'Database',
    priority: 'HIGH',
    complexity: 'high',
    tags: ['HA', 'Replication', 'Redundancy'],
    estimatedHours: 8,
    description: 'High availability setup'
  },
  { 
    id: 43, 
    title: 'Create migration scripts for schema changes', 
    category: 'Database',
    priority: 'MEDIUM',
    complexity: 'low',
    tags: ['Migration', 'Version Control', 'Schema'],
    estimatedHours: 3,
    description: 'Safe schema evolution'
  },
  { 
    id: 44, 
    title: 'Optimize slow queries with EXPLAIN ANALYZE', 
    category: 'Database',
    priority: 'HIGH',
    complexity: 'medium',
    tags: ['Performance', 'Tuning', 'SQL'],
    estimatedHours: 4,
    description: 'Identify and fix bottlenecks'
  },
  { 
    id: 45, 
    title: 'Implement database connection pooling', 
    category: 'Database',
    priority: 'HIGH',
    complexity: 'low',
    tags: ['Performance', 'Connections', 'Pooling'],
    estimatedHours: 2,
    description: 'Reuse connections efficiently'
  },
  { 
    id: 46, 
    title: 'Setup database monitoring and alerts', 
    category: 'Database',
    priority: 'MEDIUM',
    complexity: 'medium',
    tags: ['Monitoring', 'Alerts', 'Observability'],
    estimatedHours: 4,
    description: 'Track performance metrics'
  },
  { 
    id: 47, 
    title: 'Create database seeding scripts', 
    category: 'Database',
    priority: 'LOW',
    complexity: 'low',
    tags: ['Testing', 'Seed', 'Development'],
    estimatedHours: 2,
    description: 'Populate test data'
  },
  
  // SECURITY (7 tasks)
  { 
    id: 48, 
    title: 'Implement OAuth 2.0 with Google/GitHub', 
    category: 'Security',
    priority: 'CRITICAL',
    complexity: 'high',
    deadline: '2025-10-23',
    tags: ['Auth', 'OAuth', 'SSO'],
    estimatedHours: 10,
    description: 'Social login integration'
  },
  { 
    id: 49, 
    title: 'Add CSRF protection middleware', 
    category: 'Security',
    priority: 'HIGH',
    complexity: 'low',
    tags: ['Security', 'Web', 'CSRF'],
    estimatedHours: 2,
    description: 'Prevent cross-site attacks'
  },
  { 
    id: 50, 
    title: 'Conduct security audit and penetration testing', 
    category: 'Security',
    priority: 'HIGH',
    complexity: 'high',
    deadline: '2025-10-26',
    tags: ['Audit', 'Testing', 'PenTest'],
    estimatedHours: 12,
    description: 'Find and fix vulnerabilities'
  },
  { 
    id: 51, 
    title: 'Implement input sanitization for XSS prevention', 
    category: 'Security',
    priority: 'CRITICAL',
    complexity: 'medium',
    tags: ['XSS', 'Validation', 'Sanitization'],
    estimatedHours: 4,
    description: 'Sanitize all user inputs'
  },
  { 
    id: 52, 
    title: 'Setup SSL/TLS with auto-renewal', 
    category: 'Security',
    priority: 'HIGH',
    complexity: 'low',
    deadline: '2025-10-17',
    tags: ['SSL', 'Encryption', 'Certificates'],
    estimatedHours: 2,
    description: "Let's Encrypt automation"
  },
  { 
    id: 53, 
    title: 'Implement Content Security Policy headers', 
    category: 'Security',
    priority: 'MEDIUM',
    complexity: 'low',
    tags: ['CSP', 'Headers', 'Security'],
    estimatedHours: 3,
    description: 'Prevent XSS and injection attacks'
  },
  { 
    id: 54, 
    title: 'Add two-factor authentication (2FA)', 
    category: 'Security',
    priority: 'MEDIUM',
    complexity: 'high',
    tags: ['2FA', 'Auth', 'Security'],
    estimatedHours: 8,
    description: 'TOTP-based 2FA'
  },
];

function TaskCard({ task, isCompleted, onComplete }) {
  return (
    <div className="card" style={{ marginBottom: 'var(--gap-sm)' }}>
      {/* Header with badges */}
      <div className="row">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span className="btn" style={{
            padding: '4px 8px',
            fontSize: '0.7rem',
            fontWeight: 600,
            background: getPriorityColor(task.priority),
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
          }}>
            {task.priority}
          </span>
          <span className="btn" style={{
            padding: '4px 8px',
            fontSize: '0.7rem',
            fontWeight: 600,
            background: getCategoryColor(task.category),
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
          }}>
            {task.category}
          </span>
          {task.deadline && (
            <span className="btn" style={{
              padding: '4px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
            }}>
              📅 {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="row-title" style={{ margin: '0.5rem 0' }}>
          {task.title}
        </h3>
        
        {/* Description */}
        {task.description && (
          <p className="row-meta" style={{ marginBottom: '0.75rem' }}>
            {task.description}
          </p>
        )}
        
        {/* Metadata */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          fontSize: '0.85rem', 
          color: 'var(--muted)',
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
              <span key={tag} className="btn" style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button
            onClick={() => onComplete()}
            aria-label={isCompleted ? "Marcar como no completada" : "Marcar como completada"}
            aria-pressed={isCompleted}
            disabled={isCompleted}
            className="btn"
            style={{
              background: isCompleted 
                ? "#11998e" 
                : "var(--btn)",
              flex: 1,
            }}
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
              className="btn"
              style={{
                background: 'var(--surface-2)',
                width: "auto",
                padding: "6px 10px",
              }}
            >
              Undo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  
  const [allTasksList, setAllTasksList] = useState([]);
  const [displayedTasks, setDisplayedTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const categoryFilterRef = useRef(null);
  const statusFilterRef = useRef(null);
  const priorityFilterRef = useRef(null);
  const pageTitleRef = useRef(null);
  const lastStateRef = useRef({ page: 0, total: 0 });
  const inflightRef = useRef(null);
  
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Scroll to top and focus on page change
  function scrollToTopAndFocus() {
    try { document.activeElement?.blur?.(); } catch {}

    const prefersReduce = typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Choose behavior
    const behavior = prefersReduce ? "auto" : "smooth";

    // Scroll to top
    try {
      window.scrollTo({ top: 0, left: 0, behavior });
    } catch {
      // Older browsers: instant fallback
      window.scrollTo(0, 0);
    }

    // Focus after scroll to avoid browser auto-scrolling mid-layout
    const focusTitle = () => {
      const el = pageTitleRef?.current;
      if (el) {
        try { el.focus(); } catch {}
      }
    };

    // Use 'scrollend' if available; otherwise fallback timeout
    let supported = false;
    try {
      const opts = { once: true };
      const listener = () => { supported = true; focusTitle(); };
      window.addEventListener("scrollend", listener, opts);
      // If not fired in ~350ms, run fallback
      setTimeout(() => { if (!supported) focusTitle(); }, prefersReduce ? 0 : 350);
    } catch {
      setTimeout(focusTitle, prefersReduce ? 0 : 300);
    }
  }

  // Called whenever 'page' changes
  useEffect(() => {
    scrollToTopAndFocus();
  }, [page]);

  useEffect(() => {
    // Load completed tasks from localStorage using safe utilities
    const savedCompletedTasks = loadFromStorage('tmp_completed_v1', {});
    setCompletedTasks(savedCompletedTasks);
    
    // Load filters from localStorage using safe utilities
    const savedFilters = loadFromStorage('tmp_filters_v1', {});
    setStatusFilter(savedFilters.statusFilter || 'All');
    setCategoryFilter(savedFilters.categoryFilter || 'All');
    setPriorityFilter(savedFilters.priorityFilter || 'All');
    
    // Sort tasks by priority
    const sortedTasks = sortTasksByPriority(EXTENDED_TASKS);
    
    // Store all tasks
    setAllTasksList(sortedTasks);
    
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

  // Update displayed tasks when page or filters change
  useEffect(() => {
    if (!mounted) return;
    
    const filteredTasks = applyFilters(allTasksList, {
      status: statusFilter,
      category: categoryFilter,
      priority: priorityFilter
    }, completedTasks);
    
    // Update total and display current page of filtered tasks
    setTotal(filteredTasks.length);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedTasks(filteredTasks.slice(startIndex, endIndex));
  }, [page, pageSize, statusFilter, categoryFilter, priorityFilter, completedTasks, mounted, allTasksList]);

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

  // Helper para filtrar tareas en el render
  const getFilteredTasks = (tasks) => {
    if (!tasks) return [];
    let filtered = tasks;
    if (categoryFilter && categoryFilter !== 'All') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    if (priorityFilter && priorityFilter !== 'All') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    return filtered;
  };

  const filteredDisplayedTasks = useMemo(
    () => getFilteredTasks(displayedTasks),
    [displayedTasks, categoryFilter, priorityFilter]
  );

  if (!mounted) {
  return (
    <div style={{
      background: 'var(--bg)',
      minHeight: "100vh",
    }}>
      <main className="main">
        <header className="app-header">
          <div className="app-title">Task Manager Pro</div>
          <div className="app-user">
            <span>{session?.user?.email || "User"}</span>
          </div>
        </header>
        <div style={{ textAlign: "center", padding: "2rem", color: 'var(--text)' }}>Loading tasks...</div>
      </main>
    </div>
  );
  }

  return (
    <div style={{
      background: 'var(--bg)',
      minHeight: "100vh",
    }}>
      <header className="app-header">
        <div className="app-title">Task Manager Pro</div>
        <div className="app-user">
          <span>{session?.user?.email || "User"}</span>
          <button className="btn" onClick={() => signOut({ callbackUrl: "/login" })} aria-label="Logout">Logout</button>
        </div>
      </header>
      <main id="main-content" role="main" className="main">
        <h1 id="pageTitle" ref={pageTitleRef} tabIndex={-1} className="sr-only">
          Tasks — Page {page} of {totalPages}
        </h1>
        <div className="card" style={{ marginBottom: 'var(--gap-lg)' }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--gap-md)",
            padding: "var(--gap-md) var(--gap-lg)",
          }}>
            <div style={{ fontWeight: 600 }}>
              {Object.keys(completedTasks).filter(taskId => completedTasks[taskId]).length} of {displayedTasks.length} tasks completed
            </div>
            <div style={{
              width: "100px",
              height: "6px",
              background: "var(--surface-2)",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${(Object.keys(completedTasks).filter(taskId => completedTasks[taskId]).length / displayedTasks.length) * 100}%`,
                background: "var(--btn-hover)",
                borderRadius: "var(--radius-sm)",
              }}></div>
            </div>
          </div>
        </div>
        <button 
          className="btn"
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
            // Reset pagination to first page
            setPage(1);
            // Move focus to category filter select after reset
            categoryFilterRef.current?.focus();
          }}
          style={{
            background: 'var(--btn)',
            color: 'var(--text)',
            fontWeight: "600",
            padding: "12px 24px",
            cursor: "pointer",
            marginBottom: "1rem",
            fontSize: "1rem",
          }}
        >
          Reset All Tasks
        </button>
        <nav role="navigation" aria-label="Main navigation">
          {/* Filter bar */}
          <div className="card" style={{
            padding: "var(--gap-md)",
            display: "flex",
            gap: "var(--gap-md)",
            marginBottom: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ 
              color: 'var(--text)',
              fontSize: "0.9rem", 
              fontWeight: "600",
              opacity: 1 
            }}>
              Status
            </label>
            <select
              ref={statusFilterRef}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                // Reset pagination to first page when filters change
                setPage(1);
              }}
              aria-label="Filter tasks by status"
              className="btn"
              style={{
                background: 'var(--btn)',
                color: 'var(--text)',
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                fontWeight: "500",
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
              color: 'var(--text)',
              fontSize: "0.9rem", 
              fontWeight: "600",
              opacity: 1 
            }}>
              Category
            </label>
            <select
              ref={categoryFilterRef}
              aria-label="Filtrar por categoría"
              className="btn"
              style={{
                background: 'var(--btn)',
                color: 'var(--text)',
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                fontWeight: "500",
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
              color: 'var(--text)',
              fontSize: "0.9rem", 
              fontWeight: "600",
              opacity: 1 
            }}>
              Priority
            </label>
            <select
              ref={priorityFilterRef}
              aria-label="Filtrar por prioridad"
              className="btn"
              style={{
                background: 'var(--btn)',
                color: 'var(--text)',
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                fontWeight: "500",
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
            className="btn"
            aria-label="Restablecer filtros"
            style={{
              background: 'var(--btn)',
              color: 'var(--text)',
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
            onClick={() => {
              setCategoryFilter('All');
              setPriorityFilter('All');
              // Move focus to category filter select after reset
              categoryFilterRef.current?.focus();
            }}
          >
            Restablecer filtros
          </button>
          </div>
        </div>
        </nav>
        {filteredDisplayedTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--muted)',
            fontSize: '1.1rem',
            fontStyle: 'italic'
          }}>
            No tasks match your current filters
          </div>
        ) : (
          <div className="card">
            {filteredDisplayedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted={completedTasks[task.id] || false}
                onComplete={(undo = true) => {
                  if (undo) {
                    // Mark as done
                    setCompletedTasks(prev => ({ ...prev, [task.id]: true }));
                    // Announce completion via aria-live region
                    const region = document.getElementById('a11y-status');
                    if (region) {
                      region.textContent = `Task "${task.title}" marked as completed`;
                    }
                  } else {
                    // Mark as undone
                    setCompletedTasks(prev => {
                      const newCompletedTasks = { ...prev };
                      delete newCompletedTasks[task.id];
                      return newCompletedTasks;
                    });
                    // Announce un-completion via aria-live region
                    const region = document.getElementById('a11y-status');
                    if (region) {
                      region.textContent = `Task "${task.title}" marked as not completed`;
                    }
                  }
                }}
              />
            ))}
          </div>
        )}
        {/* aria-live region for accessibility announcements */}
        <div aria-live="polite" aria-atomic="true" id="a11y-status" style={{
          position: 'absolute',
          left: '-10000px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}></div>
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <Pagination 
            page={page} 
            totalPages={totalPages} 
            onChange={useCallback((n) => {
              if (n === page) return;
              setPage(n);
            }, [page])}
          />
        )}
      </main>
    </div>
  );
}
