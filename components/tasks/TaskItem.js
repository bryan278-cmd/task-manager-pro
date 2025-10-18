export default function TaskItem({ task, onToggle }) {
  if (!task) return null;

  const {
    id,
    title,
    category,
    priority,
    completed,
    createdAt,
  } = task;

  const created =
    createdAt ? new Date(createdAt).toLocaleDateString() : '';

  return (
    <div
      role="listitem"
      aria-label={`task-${id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr auto',
        gap: '12px',
        alignItems: 'center',
        padding: '12px 14px',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(6px)',
        marginBottom: 10,
      }}
    >
      <input
        type="checkbox"
        checked={!!completed}
        aria-label={`toggle-complete-${id}`}
        onChange={() => onToggle?.(task)}
        style={{ width: 18, height: 18 }}
      />

      <div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          {title}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, opacity: 0.85 }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            {category}
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            {priority}
          </span>
          {created && (
            <span
              title="Created at"
              style={{
                padding: '2px 8px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              {created}
            </span>
          )}
          {completed ? (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 12,
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              Completed
            </span>
          ) : null}
        </div>
      </div>

      <button
        onClick={() => onToggle?.(task)}
        style={{
          padding: '6px 10px',
          borderRadius: 10,
          border: '1px solid rgba(0,0,0,0.15)',
          background: completed ? '#f3f4f6' : '#111',
          color: completed ? '#111' : '#fff',
          cursor: 'pointer',
        }}
      >
        {completed ? 'Mark as pending' : 'Mark as done'}
      </button>
    </div>
  );
}
