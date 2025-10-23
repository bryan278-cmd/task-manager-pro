import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      
      if (res?.ok) {
        router.push("/");
      } else {
        setError(res?.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-wrap">
      <div className="page-container">
        <div className="lux-card">
          <h1 className="section-title mb-4">Login</h1>
          <form onSubmit={handleSubmit}>
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
                aria-describedby={error ? "login-error" : undefined}
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
                autoComplete="current-password"
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
                disabled={loading}
              />
            </div>
            {error && (
              <p id="login-error" className="text-red-500 text-sm mb-4" role="alert">
                {error}
              </p>
            )}
            <button 
              type="submit" 
              className="btn btn-gold w-full mt-4 lux-focus"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="hairline mt-4 mb-3"></div>
          <a href="/register" className="btn btn-ghost w-full lux-focus">
            Don't have an account? Register
          </a>
        </div>
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="login-status"></div>
    </main>
  );
}
