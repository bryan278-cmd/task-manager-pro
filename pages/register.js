import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, experienceLevel }),
      });

      if (res.ok) {
        // Auto-login after successful registration
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        
        if (loginRes?.ok) {
          router.push("/");
        } else {
          // If auto-login fails, redirect to login page
          router.push("/login");
        }
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-wrap">
      <div className="page-container">
        <div className="lux-card">
          <h1 className="section-title mb-4">Register</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="label">Name (optional)</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Enter your name"
                autoComplete="name"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="Enter your email"
                autoComplete="email"
                aria-invalid={!!error}
                aria-describedby={error ? "register-error" : undefined}
                disabled={loading}
              />
            </div>
<div className="mb-4">
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="Enter your password"
                autoComplete="new-password"
                aria-invalid={!!error}
                aria-describedby={error ? "register-error" : undefined}
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="experienceLevel" className="label">Experience Level</label>
              <select
                id="experienceLevel"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                required
                className="input"
                disabled={loading}
              >
                <option value="">Select your experience level</option>
                <option value="junior">Junior Developer</option>
                <option value="mid">Mid-level Developer</option>
                <option value="senior">Senior Developer</option>
              </select>
            </div>
            {error && (
              <p id="register-error" className="text-red-500 text-sm mb-4" role="alert">
                {error}
              </p>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-gold w-full mt-4 lux-focus"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
          <div className="hairline mt-4 mb-3"></div>
          <a href="/login" className="btn btn-ghost w-full lux-focus">
            Already have an account? Login
          </a>
        </div>
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="register-status"></div>
    </main>
  );
}
