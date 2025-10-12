import { useState, useEffect } from "react";

function TaskCard({ title, isCompleted, onComplete }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [buttonScale, setButtonScale] = useState(1);

  const handleClick = () => {
    if (!isCompleted) {
      setIsAnimating(true);
      onComplete();
      // Reset animation state after duration
      setTimeout(() => setIsAnimating(false), 400);
    }
  };

  const handleMouseDown = () => {
    setButtonScale(0.95);
  };

  const handleMouseUp = () => {
    setButtonScale(1);
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px) saturate(180%)",
        border: "2px solid transparent",
        backgroundClip: "padding-box",
        position: "relative",
        borderRadius: 16,
        padding: 20,
        margin: "20px 0",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: "float 6s ease-in-out infinite",
        boxShadow: `
          inset 0 1px 0 0 rgba(255,255,255,0.2),
          0 20px 60px rgba(0,0,0,0.3),
          0 0 40px rgba(102,126,234,0.2)
        `,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow = `
          inset 0 1px 0 0 rgba(255,255,255,0.2),
          0 20px 60px rgba(0,0,0,0.3),
          0 0 60px rgba(102,126,234,0.6)
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = `
          inset 0 1px 0 0 rgba(255,255,255,0.2),
          0 20px 60px rgba(0,0,0,0.3),
          0 0 40px rgba(102,126,234,0.2)
        `;
      }}
    >
      <h2 style={{ 
        marginTop: 0, 
        color: "#ffffff",
        fontSize: "1.5rem",
        fontWeight: "600",
        marginBottom: "15px",
        lineHeight: "1.3",
        textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
      }}>
        📝 {title}
      </h2>
        <button
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: "pointer",
            border: "none",
            borderRadius: 8,
            padding: "12px 24px",
            color: "#fff",
            background: isCompleted 
              ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" 
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: "1rem",
            fontWeight: "600",
            boxShadow: isCompleted 
              ? "0 4px 15px rgba(56, 239, 125, 0.4)" 
              : "0 4px 15px rgba(102, 126, 234, 0.4)",
            width: "100%",
            transform: `scale(${buttonScale})`,
            position: "relative",
            overflow: "hidden",
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

  const getRandomTasks = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  useEffect(() => {
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

  useEffect(() => {
    // Trigger confetti when all tasks are completed
    if (Object.keys(completedTasks).length === tasks.length && tasks.length > 0) {
      // Check if all current tasks are completed
      const allCompleted = tasks.every(task => completedTasks[task]);
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
  }, [completedTasks, tasks]);

  if (!mounted) {
    return (
      <div style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
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
          <div style={{ color: "#fff", textAlign: "center", fontSize: "1.2rem" }}>Loading tasks...</div>
        </main>
      </div>
    );
  }

  return (
    <div style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
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
      `}</style>
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
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          marginBottom: "2rem",
          display: "inline-block",
          animation: "float 6s ease-in-out infinite",
        }}>
          <h1 style={{ 
            color: "#ffffff",
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
          background: "rgba(255,255,255,0.15)",
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
          <div style={{ color: "white", fontWeight: "600" }}>
            {Object.keys(completedTasks).filter(task => completedTasks[task]).length} of 4 tasks completed
          </div>
          <div style={{
            width: "120px",
            height: "8px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "4px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${(Object.keys(completedTasks).filter(task => completedTasks[task]).length / 4) * 100}%`,
              background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
              borderRadius: "4px",
              transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 0 10px rgba(102,126,234,0.3)",
            }}></div>
          </div>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('completedTasks');
            setCompletedTasks({});
            setTasks(getRandomTasks(allTasks, 4));
          }}
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
            backdropFilter: "blur(20px)",
            border: "2px solid rgba(255,255,255,0.3)",
            color: "white",
            fontWeight: "600",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
            borderRadius: 12,
            padding: "16px 32px",
            cursor: "pointer",
            marginBottom: 30,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: "1rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)";
          }}
        >
          Reset All Tasks
        </button>
        {tasks.map((t, i) => (
          <div key={i} style={{ animation: "fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards", opacity: 0, animationDelay: `${i * 0.1}s` }}>
            <TaskCard
              title={t}
              isCompleted={completedTasks[t] || false}
              onComplete={() => {
                console.log(`${t} completed!`);
                setCompletedTasks(prev => ({ ...prev, [t]: true }));
              }}
            />
          </div>
        ))}
      </main>
    </div>
  );
}
