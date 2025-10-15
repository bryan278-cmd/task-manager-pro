export const styles = {
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
