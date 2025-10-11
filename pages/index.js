import { useState } from "react";

function TaskCard({ title, onComplete = () => {} }) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleClick = () => {
    setIsCompleted(true);
    onComplete();
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        padding: 16,
        margin: 16,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.02)";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      }}
    >
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <button
        onClick={handleClick}
        style={{
          cursor: "pointer",
          border: "none",
          borderRadius: 5,
          padding: "12px 24px",
          color: "#fff",
          backgroundColor: isCompleted ? "#10b981" : "#0070f3",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          if (!isCompleted) e.currentTarget.style.backgroundColor = "#4B5EAA";
        }}
        onMouseLeave={(e) => {
          if (!isCompleted) e.currentTarget.style.backgroundColor = "#0070f3";
        }}
      >
        {isCompleted ? "Completed ✅" : "Mark as done"}
      </button>
    </div>
  );
}

export default function Home() {
  const tasks = [
    "Learn Git branches and commits",
    "Practice useState and props in React",
    "Read Cline rules and guidelines",
    "Create a Pull Request on GitHub",
  ];

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "40px auto",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <h1>Task Manager Pro — Local Practice</h1>
      {tasks.map((t, i) => (
        <TaskCard
          key={i}
          title={t}
          onComplete={() => console.log(`${t} completed!`)}
        />
      ))}
    </main>
  );
}
