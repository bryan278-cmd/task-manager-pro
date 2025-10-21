import { useState, useEffect, useContext, useRef, useMemo } from "react";
import { ThemeContext } from "./_app";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { signOut } from "next-auth/react";

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

const styles = {
  taskCard: {
    backdropFilter: "blur(20px) saturate(180%)",
    backgroundClip: "padding-box",
    position: "relative",
    borderRadius: 16,
    padding: 20,
    margin: "20px 0",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: "float 6s ease-in-out infinite",
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

function TaskCard({ task, isCompleted, onComplete, index, isDark, colors }) {
  const [isHovered, setIsHovered] = useState(false);
  const [buttonScale, setButtonScale] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef(null);

  const handleClick = () => {
    if (!isCompleted) {
      setIsAnimating(true);
      onComplete();
      // Reset animation state after duration
      setTimeout(() => {
        setIsAnimating(false);
        // Restore focus to the button after state change
        buttonRef.current?.focus();
      }, 400);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent double toggle behavior
      if (!isCompleted) {
        setIsAnimating(true);
        onComplete();
        // Reset animation state after duration
        setTimeout(() => {
          setIsAnimating(false);
          // Restore focus to the button after state change
          buttonRef.current?.focus();
        }, 400);
      }
    }
  };

  const handleMouseDown = () => {
    setButtonScale(0.95);
  };

  const handleMouseUp = () => {
    setButtonScale(1);
  };

  const currentColors = isDark ? colors.dark : colors.light;

  return (
    <div
      style={{
        ...styles.taskCard,
        background: currentColors.cardBg,
        border: `1px solid ${currentColors.cardBorder}`,
        boxShadow: currentColors.cardShadow,
        borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s backwards`,
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
          color: isDark ? 'rgba(229, 231, 235, 0.8)' : 'rgba(17, 17, 17, 0.8)',
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
        color: isDark ? 'rgba(229, 231, 235, 0.8)' : 'rgba(17, 17, 17, 0.8)',
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
              background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
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
          ref={buttonRef}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          aria-label={isCompleted ? "Marcar como no completada" : "Marcar como completada"}
          aria-pressed={isCompleted}
          tabIndex={0}
          style={{
            ...styles.button,
            background: isCompleted 
              ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" 
              : (isDark ? "#4B5EAA" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"),
            boxShadow: isCompleted 
              ? "0 4px 15px rgba(56, 239, 125, 0.4)" 
              : (isDark ? "0 4px 155, 0.4)" : "0 4px 15px rgba(102, 126, 234, 0.4)"),
            transform: `scale(${buttonScale})`,
            color: "white",
            flex: 1,
          }}
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onComplete(false);
              }
            }}
            aria-label="Marcar como no completada"
            aria-pressed={true}
            tabIndex={0}
            style={{
              ...styles.button,
              background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              color: currentColors.text,
              width: "auto",
              padding: "12px 16px",
            }}
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  return { props: { session } };
}

export default function Home({ session }) {
  // Windowing constants for performance hardening
  const WINDOW_SIZE = 120; // max items to keep rendered/in memory
  const TRIM_TO = 100;     // when exceeding WINDOW_SIZE, trim down to this
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
  const categoryFilterRef = useRef(null);
  const statusFilterRef = useRef(null);
  const priorityFilterRef = useRef(null);
  const loadingRef = useRef(false);
  const inflightRef = useRef(null);
  const TASKS_PER_PAGE = 10;

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

  // Apply filters when filters or completed tasks change
  useEffect(() => {
    if (!mounted) return;
    
    const filteredTasks = applyFilters(allTasksList, {
      status: statusFilter,
      category: categoryFilter,
      priority: priorityFilter
    }, completedTasks);
    
    // Reset pagination and display first page of filtered tasks
    setCurrentPage(1);
    setDisplayedTasks(filteredTasks.slice(0, TASKS_PER_PAGE));
    setHasMore(filteredTasks.length > TASKS_PER_PAGE);
  }, [statusFilter, categoryFilter, priorityFilter, completedTasks, mounted, allTasksList]);

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

  // Setup IntersectionObserver for infinite scroll with throttling
  useEffect(() => {
    // Don't observe if not mounted or no more tasks
    if (!mounted || !hasMore || isLoadingMore) return;

    function throttle(fn, wait) {
      let last = 0, timeout = null, lastArgs = null;
      return function throttled(...args) {
        const now = Date.now();
        lastArgs = args;
        const invoke = () => { last = now; timeout = null; fn(...lastArgs); };
        if (!last || (now - last) >= wait) {
          invoke();
        } else if (!timeout) {
          timeout = setTimeout(invoke, wait - (now - last));
        }
      };
    }

    const throttledLoadMore = throttle(() => {
      loadMoreTasks();
    }, 120);

    const observer = new IntersectionObserver(
      (entries) => {
        // When sentinel enters viewport, load more (throttled)
        if (entries[0].isIntersecting) {
          throttledLoadMore();
        }
      },
      {
        root: null, // viewport
        rootMargin: '200px', // trigger 200px before reaching sentinel
        threshold: 0.1
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [mounted, hasMore, isLoadingMore, currentPage]);

  // Load more tasks function with AbortController
  const loadMoreTasks = () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoadingMore(true);
    
    // Apply current filters to get filtered task list
    const filteredTasks = applyFilters(allTasksList, {
      status: statusFilter,
      category: categoryFilter,
      priority: priorityFilter
    }, completedTasks);
    
    // Create AbortController for cancellation
    const controller = new AbortController();
    inflightRef.current = controller;
    
    // Simulate async load (remove timeout in production if using real API)
    setTimeout(() => {
      // Check if request was aborted
      if (controller.signal.aborted) {
        loadingRef.current = false;
        setIsLoadingMore(false);
        return;
      }
      
      const startIndex = currentPage * TASKS_PER_PAGE;
      const endIndex = startIndex + TASKS_PER_PAGE;
      const nextPageTasks = filteredTasks.slice(startIndex, endIndex);
      
      if (nextPageTasks.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedTasks(prev => {
          let next = prev.concat(nextPageTasks);
          if (next.length > WINDOW_SIZE) {
            // Keep only the most recent TRIM_TO items to bound DOM + memory
            next = next.slice(next.length - TRIM_TO);
          }
          return next;
        });
        setCurrentPage(prev => prev + 1);
      }
      
      loadingRef.current = false;
      setIsLoadingMore(false);
      inflightRef.current = null;
    }, 300); // <100ms in production
  };

  // Cleanup effect to abort in-flight requests
  useEffect(() => {
    return () => {
      try { inflightRef.current?.abort(); } catch {}
    };
  }, []);

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
      background: currentColors.background,
      minHeight: "100vh",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          zIndex: '50',
          background: isDark ? '#ffffff' : '#000000',
          color: isDark ? '#000000' : '#ffffff',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          textDecoration: 'none',
          fontWeight: '600',
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
          height: '1px',
          overflow: 'hidden',
          position: 'absolute',
          whiteSpace: 'nowrap',
          width: '1px',
        }}
        onFocus={(e) => {
          e.target.style.clip = 'auto';
          e.target.style.clipPath = 'none';
          e.target.style.height = 'auto';
          e.target.style.overflow = 'visible';
          e.target.style.position = 'fixed';
          e.target.style.whiteSpace = 'normal';
          e.target.style.width = 'auto';
        }}
        onBlur={(e) => {
          e.target.style.clip = 'rect(0 0 0 0)';
          e.target.style.clipPath = 'inset(50%)';
          e.target.style.height = '1px';
          e.target.style.overflow = 'hidden';
          e.target.style.position = 'absolute';
          e.target.style.whiteSpace = 'nowrap';
          e.target.style.width = '1px';
        }}
        onMouseEnter={(e) => {
          e.target.style.clip = 'auto';
          e.target.style.clipPath = 'none';
          e.target.style.height = 'auto';
          e.target.style.overflow = 'visible';
          e.target.style.position = 'absolute';
          e.target.style.whiteSpace = 'normal';
          e.target.style.width = 'auto';
        }}
      >
        Skip to main content
      </a>
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
      `}</style>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        /* Focus-visible styling for accessibility - WCAG 2.1 AA compliant */
        button:focus-visible {
          outline: 2px solid #4B5EAA;
          outline-offset: 2px;
        }
        select:focus-visible {
          outline: 2px solid #4B5EAA;
          outline-offset: 2px;
        }
        a:focus-visible {
          outline: 2px solid #4B5EAA;
          outline-offset: 2px;
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
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 10,
        }}
      >
        <div>
          <strong>Task Manager Pro</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, color: "#374151" }}>
            {session?.user?.email || "User"}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              padding: "6px 10px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              background: "#f9fafb",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <header role="banner">
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
      </header>
      <main id="main-content" role="main" style={{
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        position: "relative",
        zIndex: 1,
      }}>
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
            // Move focus to category filter select after reset
            categoryFilterRef.current?.focus();
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
        <nav role="navigation" aria-label="Main navigation">
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
              opacity: 1 
            }}>
              Status
            </label>
            <select
              ref={statusFilterRef}
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
              opacity: 1 
            }}>
              Category
            </label>
            <select
              ref={categoryFilterRef}
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
              opacity: 1 
            }}>
              Priority
            </label>
            <select
              ref={priorityFilterRef}
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
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1.1rem',
            fontStyle: 'italic'
          }}>
            No tasks match your current filters
          </div>
        ) : (
          <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filteredDisplayedTasks.map((task, i) => (
              <li key={task.id} role="listitem" style={{ animation: "fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards", opacity: 0, animationDelay: `${i * 0.1}s` }}>
                <TaskCard
                  task={task}
                  isCompleted={completedTasks[task.id] || false}
                  onComplete={(undo = true) => {
                    if (undo) {
                      // Mark as done
                      console.log(`${task.title} completed!`);
                      setCompletedTasks(prev => ({ ...prev, [task.id]: true }));
                      // Announce completion via aria-live region
                      const region = document.getElementById('a11y-status');
                      if (region) {
                        region.textContent = `Task "${task.title}" marked as completed`;
                      }
                    } else {
                      // Mark as undone
                      console.log(`${task.title} undone!`);
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
                  index={i}
                  isDark={isDark}
                  colors={colors}
                />
              </li>
            ))}
          </ul>
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
