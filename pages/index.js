import { useState, useEffect } from "react";

function TaskCard({ title, isCompleted, onComplete }) {
  const handleClick = () => {
    if (!isCompleted) {
      onComplete();
    }
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
  const allTasks = [
    "Learn Git branches and commits",
    "Practice useState and props in React",
    "Read Cline rules and guidelines",
    "Create a Pull Request on GitHub",
    "Master CSS Grid and Flexbox",
    "Build a responsive website",
    "Learn about React hooks",
    "Create a custom hook",
    "Understand async/await in JavaScript",
    "Practice array methods",
    "Learn TypeScript basics",
    "Implement form validation",
    "Study accessibility guidelines",
    "Create unit tests",
    "Deploy to Vercel",
    "Optimize performance",
    "Learn about state management",
    "Practice debugging techniques",
    "Understand REST APIs",
    "Build a todo list app"
  ];

  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const getRandomTasks = (array, count) => {
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    
    // Load completed tasks from localStorage
    const savedCompletedTasks = localStorage.getItem('completedTasks');
    if (savedCompletedTasks) {
      setCompletedTasks(JSON.parse(savedCompletedTasks));
    }
    
    setTasks(getRandomTasks(allTasks, 4));
    setMounted(true);
  }, []);

  useEffect(() => {
    // Save completed tasks to localStorage
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  if (!mounted) {
    return (
      <main
        style={{
          maxWidth: 720,
          margin: "40px auto",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        }}
      >
        <h1>Task Manager Pro — Local Practice</h1>
        <div>Loading tasks...</div>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "40px auto",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <h1>Task Manager Pro — Local Practice</h1>
      <button 
        onClick={() => {
          localStorage.removeItem('completedTasks');
          setCompletedTasks({});
        }}
        style={{
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 5,
          padding: "8px 16px",
          cursor: "pointer",
          marginBottom: 20,
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#4B5EAA";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#0070f3";
        }}
      >
        Reset All Tasks
      </button>
      {tasks.map((t, i) => (
        <TaskCard
          key={i}
          title={t}
          isCompleted={completedTasks[t] || false}
          onComplete={() => {
            console.log(`${t} completed!`);
            setCompletedTasks(prev => ({ ...prev, [t]: true }));
          }}
        />
      ))}
    </main>
  );
}
